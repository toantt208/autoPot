/**
 * XRP Hedge Strategy
 *
 * When event starts:
 * 1. Place limit buy orders for UP and DOWN at 98 cents, $5 each
 * 2. Monitor until both are filled
 * 3. Place limit sell orders at 99 cents
 *
 * Usage: DOTENV_CONFIG_PATH=.env.xrp node dist/xrp-hedge.js
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { getConfig } from './config/index.js';
import type { Config } from './config/index.js';
import { MarketClient } from './clients/market-client.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import { getEventConfig } from './config/events.js';
import {
  calculateMarketWindow,
  getNextMarketWindow,
  generateSlug,
} from './services/market-timing.js';
import type { TokenIds } from './types/index.js';

const CLOB_HOST = 'https://clob.polymarket.com';
const POLYGON_CHAIN_ID = 137;

const BUY_PRICE = 0.98;   // 98 cents
const SELL_PRICE = 0.99;  // 99 cents
const BET_AMOUNT = 5;     // $5 per side

interface OrderState {
  orderId: string;
  tokenId: string;
  side: 'UP' | 'DOWN';
  filled: boolean;
  tokensReceived: number;
}

/**
 * Create CLOB client
 */
function createClobClient(config: Config): ClobClient {
  const wallet = new Wallet(config.MASTER_PRIVATE_KEY);
  const creds: ApiKeyCreds = {
    key: config.CLOB_API_KEY,
    secret: config.CLOB_SECRET,
    passphrase: config.CLOB_PASSPHRASE,
  };

  return new ClobClient(
    CLOB_HOST,
    POLYGON_CHAIN_ID,
    wallet,
    creds,
    SignatureType.POLY_GNOSIS_SAFE,
    config.GNOSIS_SAFE_ADDRESS
  );
}

/**
 * Place a limit buy order
 */
async function placeLimitBuy(
  clobClient: ClobClient,
  tokenId: string,
  amount: number,
  price: number,
  negRisk: boolean,
  tickSize: string,
  side: 'UP' | 'DOWN',
  slug: string
): Promise<string | null> {
  // Calculate tokens: amount / price
  const tokens = Math.floor((amount / price) * 100) / 100;

  logger.info(
    { side, price: `${(price * 100).toFixed(0)}%`, amount, tokens, slug },
    'Placing limit buy order...'
  );

  try {
    const buyOrder = await clobClient.createOrder(
      {
        tokenID: tokenId,
        price: price,
        size: tokens,
        side: Side.BUY,
        expiration: 0,
      },
      {
        negRisk,
        tickSize: tickSize as TickSize,
      }
    );

    const result = await clobClient.postOrder(buyOrder, OrderType.GTC);

    if ((result as any).orderID) {
      logger.info(
        { orderId: (result as any).orderID, side, price: `${(price * 100).toFixed(0)}%`, tokens, slug },
        'Limit buy order placed'
      );
      return (result as any).orderID;
    } else {
      const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';
      logger.error({ error: errorMsg, side, slug }, 'Failed to place limit buy order');
      return null;
    }
  } catch (error: any) {
    logger.error({ error: error.message, side, slug }, 'Error placing limit buy order');
    return null;
  }
}

/**
 * Place a limit sell order
 */
async function placeLimitSell(
  clobClient: ClobClient,
  tokenId: string,
  tokens: number,
  price: number,
  negRisk: boolean,
  tickSize: string,
  side: 'UP' | 'DOWN',
  slug: string
): Promise<string | null> {
  // Round down tokens to avoid dust issues
  const tokensToSell = Math.floor(tokens * 100) / 100;

  if (tokensToSell <= 0) {
    logger.warn({ tokens, side, slug }, 'No tokens to sell');
    return null;
  }

  logger.info(
    { side, price: `${(price * 100).toFixed(0)}%`, tokens: tokensToSell, slug },
    'Placing limit sell order...'
  );

  try {
    const sellOrder = await clobClient.createOrder(
      {
        tokenID: tokenId,
        price: price,
        size: tokensToSell,
        side: Side.SELL,
        expiration: 0,
      },
      {
        negRisk,
        tickSize: tickSize as TickSize,
      }
    );

    const result = await clobClient.postOrder(sellOrder, OrderType.GTC);

    if ((result as any).orderID) {
      logger.info(
        { orderId: (result as any).orderID, side, price: `${(price * 100).toFixed(0)}%`, tokens: tokensToSell, slug },
        'Limit sell order placed'
      );
      return (result as any).orderID;
    } else {
      const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';
      logger.error({ error: errorMsg, side, slug }, 'Failed to place limit sell order');
      return null;
    }
  } catch (error: any) {
    logger.error({ error: error.message, side, slug }, 'Error placing limit sell order');
    return null;
  }
}

/**
 * Check order status
 */
async function checkOrderFilled(
  clobClient: ClobClient,
  orderId: string
): Promise<{ filled: boolean; tokensReceived: number }> {
  try {
    const order = await clobClient.getOrder(orderId);

    if (!order) {
      return { filled: false, tokensReceived: 0 };
    }

    const sizeFilled = parseFloat((order as any).size_matched || '0');
    const originalSize = parseFloat((order as any).original_size || '0');

    // Consider filled if 95%+ matched (to handle dust)
    const filled = originalSize > 0 && sizeFilled >= originalSize * 0.95;

    return { filled, tokensReceived: sizeFilled };
  } catch (error: any) {
    logger.debug({ error: error.message, orderId }, 'Error checking order status');
    return { filled: false, tokensReceived: 0 };
  }
}

/**
 * Wait for next event start (aligned to 15-minute intervals)
 */
async function waitForNextEvent(): Promise<{ slug: string; startTime: number }> {
  const eventConfig = getEventConfig('xrp_15m');
  const now = Math.floor(Date.now() / 1000);

  // Calculate next 15-minute boundary
  const intervalSeconds = 15 * 60;
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  const nextStart = currentStart + intervalSeconds;

  const waitTime = nextStart - now;
  const slug = generateSlug('xrp', '15m', nextStart);

  logger.info(
    { slug, waitSeconds: waitTime, startsAt: new Date(nextStart * 1000).toISOString() },
    'Waiting for next event...'
  );

  if (waitTime > 0) {
    await sleep(waitTime * 1000);
  }

  return { slug, startTime: nextStart };
}

/**
 * Main trading loop for one event
 */
async function tradeEvent(
  clobClient: ClobClient,
  marketClient: MarketClient,
  slug: string,
  tokenIds: TokenIds
): Promise<void> {
  logger.info({ slug }, 'Starting hedge strategy');

  // Place limit buy orders for both sides
  const upOrderId = await placeLimitBuy(
    clobClient,
    tokenIds.up,
    BET_AMOUNT,
    BUY_PRICE,
    tokenIds.negRisk,
    tokenIds.tickSize,
    'UP',
    slug
  );

  const downOrderId = await placeLimitBuy(
    clobClient,
    tokenIds.down,
    BET_AMOUNT,
    BUY_PRICE,
    tokenIds.negRisk,
    tokenIds.tickSize,
    'DOWN',
    slug
  );

  if (!upOrderId || !downOrderId) {
    logger.error({ slug }, 'Failed to place one or both buy orders');
    return;
  }

  // Track order states
  const orders: OrderState[] = [
    { orderId: upOrderId, tokenId: tokenIds.up, side: 'UP', filled: false, tokensReceived: 0 },
    { orderId: downOrderId, tokenId: tokenIds.down, side: 'DOWN', filled: false, tokensReceived: 0 },
  ];

  // Monitor until both filled or timeout (14 minutes)
  const timeout = 14 * 60 * 1000; // 14 minutes
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    let allFilled = true;

    for (const order of orders) {
      if (order.filled) continue;

      const status = await checkOrderFilled(clobClient, order.orderId);
      if (status.filled) {
        order.filled = true;
        order.tokensReceived = status.tokensReceived;
        logger.info(
          { side: order.side, tokens: status.tokensReceived, slug },
          'Buy order filled!'
        );

        // Place sell order immediately
        await placeLimitSell(
          clobClient,
          order.tokenId,
          status.tokensReceived,
          SELL_PRICE,
          tokenIds.negRisk,
          tokenIds.tickSize,
          order.side,
          slug
        );
      } else {
        allFilled = false;
      }
    }

    if (allFilled) {
      logger.info({ slug }, 'Both orders filled and sell orders placed!');
      return;
    }

    await sleep(2000); // Check every 2 seconds
  }

  // Timeout - cancel unfilled orders
  for (const order of orders) {
    if (!order.filled) {
      logger.warn({ side: order.side, orderId: order.orderId, slug }, 'Order not filled, canceling...');
      try {
        await clobClient.cancelOrder({ orderID: order.orderId });
      } catch (error: any) {
        logger.debug({ error: error.message }, 'Error canceling order');
      }
    }
  }
}

/**
 * Main loop
 */
async function main(): Promise<void> {
  const config = getConfig();
  const clobClient = createClobClient(config);
  const marketClient = new MarketClient();

  logger.info('XRP Hedge Strategy started');
  logger.info({ buyPrice: `${BUY_PRICE * 100}%`, sellPrice: `${SELL_PRICE * 100}%`, amount: `$${BET_AMOUNT}` }, 'Strategy parameters');

  while (true) {
    try {
      // Wait for next event
      const { slug, startTime } = await waitForNextEvent();

      // Wait a bit for market to be created (5 seconds after start)
      await sleep(5000);

      // Get market data
      const marketData = await marketClient.getMarketTokenIds(slug);

      if (!marketData) {
        logger.warn({ slug }, 'Market not found, skipping');
        continue;
      }

      // Execute strategy
      await tradeEvent(clobClient, marketClient, slug, marketData.tokenIds);

    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(5000);
    }
  }
}

// Run
main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});

/**
 * Limit 98-99 Strategy
 *
 * For each 15m window:
 * 1. Place limit buy orders for UP and DOWN at 98 cents
 * 2. When either fills, place limit sell at 99 cents
 * 3. Cancel unfilled orders before window closes
 *
 * Profit per win: 1.02% ($0.102 per $10 bet)
 * Based on Dec 22 analysis: 99.2% win rate
 *
 * Usage: DOTENV_CONFIG_PATH=.env.xxx node dist/limit-98-99.js [crypto]
 * Example: DOTENV_CONFIG_PATH=.env.btc node dist/limit-98-99.js btc
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
import { generateSlug } from './services/market-timing.js';
import type { TokenIds } from './types/index.js';

const CLOB_HOST = 'https://clob.polymarket.com';
const POLYGON_CHAIN_ID = 137;

const BUY_PRICE = 0.98;   // 98 cents
const SELL_PRICE = 0.99;  // 99 cents
const BET_AMOUNT = parseFloat(process.env.BET_AMOUNT || '10'); // Default $10

interface OrderState {
  orderId: string;
  tokenId: string;
  side: 'UP' | 'DOWN';
  filled: boolean;
  tokensReceived: number;
  sellOrderPlaced: boolean;
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
 * Place a limit buy order at 98%
 */
async function placeLimitBuy(
  clobClient: ClobClient,
  tokenId: string,
  amount: number,
  negRisk: boolean,
  tickSize: string,
  side: 'UP' | 'DOWN',
  slug: string
): Promise<string | null> {
  // Calculate tokens: amount / price
  const tokens = Math.floor((amount / BUY_PRICE) * 100) / 100;

  logger.info(
    { side, price: `${BUY_PRICE * 100}%`, amount, tokens, slug },
    'Placing limit buy order at 98%...'
  );

  try {
    const buyOrder = await clobClient.createOrder(
      {
        tokenID: tokenId,
        price: BUY_PRICE,
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
        { orderId: (result as any).orderID, side, tokens, slug },
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
 * Place a limit sell order at 99%
 */
async function placeLimitSell(
  clobClient: ClobClient,
  tokenId: string,
  tokens: number,
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
    { side, price: `${SELL_PRICE * 100}%`, tokens: tokensToSell, slug },
    'Placing limit sell order at 99%...'
  );

  // Retry up to 3 times
  for (let retry = 0; retry < 3; retry++) {
    try {
      const sellOrder = await clobClient.createOrder(
        {
          tokenID: tokenId,
          price: SELL_PRICE,
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
          { orderId: (result as any).orderID, side, tokens: tokensToSell, slug },
          'Limit sell order placed at 99%'
        );
        return (result as any).orderID;
      } else {
        const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';
        if (errorMsg.includes('does not exist')) {
          logger.warn({ slug }, 'Orderbook closed, cannot place sell order');
          return null;
        }
        logger.warn({ error: errorMsg, retry: retry + 1, slug }, 'Sell order failed, retrying...');
        await sleep(1000);
      }
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        logger.warn({ slug }, 'Orderbook closed, cannot place sell order');
        return null;
      }
      logger.warn({ error: error.message, retry: retry + 1, slug }, 'Sell order error, retrying...');
      await sleep(1000);
    }
  }

  logger.error({ side, slug }, 'Failed to place sell order after retries');
  return null;
}

/**
 * Check order fill status
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
 * Cancel an order
 */
async function cancelOrder(clobClient: ClobClient, orderId: string): Promise<void> {
  try {
    await clobClient.cancelOrder({ orderID: orderId });
    logger.info({ orderId }, 'Order cancelled');
  } catch (error: any) {
    logger.debug({ error: error.message, orderId }, 'Error cancelling order (may already be filled/cancelled)');
  }
}

/**
 * Calculate next window start time
 */
function getNextWindowStart(): { startTime: number; slug: string; crypto: string } {
  const crypto = process.argv[2]?.toLowerCase() || 'btc';
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 15 * 60;

  // Next 15-minute boundary
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  const nextStart = currentStart + intervalSeconds;
  const slug = generateSlug(crypto, '15m', nextStart);

  return { startTime: nextStart, slug, crypto };
}

/**
 * Trade a single window
 */
async function tradeWindow(
  clobClient: ClobClient,
  marketClient: MarketClient,
  slug: string,
  tokenIds: TokenIds,
  windowEndTime: number
): Promise<void> {
  logger.info({ slug, betAmount: BET_AMOUNT }, '=== Starting window trade ===');

  // Place limit buy orders for both sides at 98%
  const upOrderId = await placeLimitBuy(
    clobClient,
    tokenIds.up,
    BET_AMOUNT,
    tokenIds.negRisk,
    tokenIds.tickSize,
    'UP',
    slug
  );

  const downOrderId = await placeLimitBuy(
    clobClient,
    tokenIds.down,
    BET_AMOUNT,
    tokenIds.negRisk,
    tokenIds.tickSize,
    'DOWN',
    slug
  );

  if (!upOrderId && !downOrderId) {
    logger.error({ slug }, 'Failed to place any buy orders');
    return;
  }

  // Track order states
  const orders: OrderState[] = [];
  if (upOrderId) {
    orders.push({ orderId: upOrderId, tokenId: tokenIds.up, side: 'UP', filled: false, tokensReceived: 0, sellOrderPlaced: false });
  }
  if (downOrderId) {
    orders.push({ orderId: downOrderId, tokenId: tokenIds.down, side: 'DOWN', filled: false, tokensReceived: 0, sellOrderPlaced: false });
  }

  // Monitor until window ends (with 30 second buffer after close)
  const monitorUntil = windowEndTime + 30;

  while (Math.floor(Date.now() / 1000) < monitorUntil) {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = windowEndTime - now;

    for (const order of orders) {
      if (order.filled && order.sellOrderPlaced) continue;

      // Check if buy order filled
      if (!order.filled) {
        const status = await checkOrderFilled(clobClient, order.orderId);
        if (status.filled) {
          order.filled = true;
          order.tokensReceived = status.tokensReceived;
          logger.info(
            { side: order.side, tokens: status.tokensReceived, timeLeft: `${timeLeft}s`, slug },
            'Buy order FILLED at 98%!'
          );

          // Place sell order at 99%
          const sellOrderId = await placeLimitSell(
            clobClient,
            order.tokenId,
            status.tokensReceived,
            tokenIds.negRisk,
            tokenIds.tickSize,
            order.side,
            slug
          );
          order.sellOrderPlaced = !!sellOrderId;
        }
      }
    }

    // Log status every 30 seconds
    if (Math.floor(Date.now() / 1000) % 30 === 0) {
      const filledCount = orders.filter(o => o.filled).length;
      logger.info(
        { slug, filled: filledCount, total: orders.length, timeLeft: `${timeLeft}s` },
        'Monitoring orders...'
      );
    }

    await sleep(2000); // Check every 2 seconds
  }

  // Cancel any unfilled buy orders
  for (const order of orders) {
    if (!order.filled) {
      logger.info({ side: order.side, slug }, 'Cancelling unfilled buy order');
      await cancelOrder(clobClient, order.orderId);
    }
  }

  // Summary
  const filledOrders = orders.filter(o => o.filled);
  if (filledOrders.length > 0) {
    logger.info(
      {
        slug,
        filled: filledOrders.map(o => o.side).join(', '),
        tokens: filledOrders.map(o => o.tokensReceived.toFixed(2)).join(', ')
      },
      '=== Window complete - Orders filled ==='
    );
  } else {
    logger.info({ slug }, '=== Window complete - No fills ===');
  }
}

/**
 * Main loop
 */
async function main(): Promise<void> {
  const config = getConfig();
  const clobClient = createClobClient(config);
  const marketClient = new MarketClient();

  const crypto = process.argv[2]?.toLowerCase() || 'btc';

  logger.info({
    crypto,
    buyPrice: `${BUY_PRICE * 100}%`,
    sellPrice: `${SELL_PRICE * 100}%`,
    betAmount: `$${BET_AMOUNT}`,
    profitPerWin: `$${(BET_AMOUNT * 0.0102).toFixed(2)} (1.02%)`
  }, 'Limit 98-99 Strategy started');

  while (true) {
    try {
      // Get next window
      const { startTime, slug } = getNextWindowStart();
      const now = Math.floor(Date.now() / 1000);
      const waitTime = startTime - now;

      logger.info(
        { slug, waitSeconds: waitTime, startsAt: new Date(startTime * 1000).toISOString() },
        'Waiting for next window...'
      );

      // Wait until window starts
      if (waitTime > 0) {
        await sleep(waitTime * 1000);
      }

      // Wait 5 seconds for market to be created
      await sleep(5000);

      // Get market data
      const marketData = await marketClient.getMarketTokenIds(slug);
      if (!marketData) {
        logger.warn({ slug }, 'Market not found, skipping');
        continue;
      }

      // Window end time = start + 15 minutes
      const windowEndTime = startTime + 15 * 60;

      // Trade this window
      await tradeWindow(clobClient, marketClient, slug, marketData.tokenIds, windowEndTime);

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

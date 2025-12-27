/**
 * 90-98% Price Strategy
 *
 * Flow (example: BTC 13:00 - 13:15):
 * In last 88 seconds: If any side is over 90% but under 99%, buy it
 * After buying, place limit sell at actual fill price + 1 cent
 *
 * Skip buying if price hits 99% (no profit margin)
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { logger } from '../utils/logger.js';
import { fetchPrices } from '../services/price-monitor.js';
import { sleep } from '../utils/retry.js';
import { TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  isInTradingWindow,
  getSecondsUntilClose,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';
import { markTradeLock, checkTradeLock } from '../db/redis.js';

const MIN_ENTRY_PRICE = 0.90;    // Minimum 90% to buy
const MAX_ENTRY_PRICE = 0.98;    // Maximum 98% to buy (skip 99%)
const CLOB_HOST = 'https://clob.polymarket.com';
const POLYGON_CHAIN_ID = 137;

/**
 * Create CLOB client for limit orders
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
 * Check if we're within the market window
 */
function isInMarketWindow(window: MarketWindow, now: number): boolean {
  return now >= window.startTime && now < window.endTime;
}

export interface StrategyResult {
  /** Market slug */
  marketSlug: string;
  /** Whether a trade was executed */
  traded: boolean;
  /** Trade result if traded */
  tradeResult?: TradeResult;
  /** Reason for skipping if not traded */
  skipReason?: string;
}

/**
 * Try to place a buy order, retry immediately on error
 * Returns true if order was matched, false otherwise
 */
async function tryBuy(
  tradingClient: TradingClient,
  tokenId: string,
  amount: number,
  negRisk: boolean,
  tickSize: string,
  side: string,
  slug: string
): Promise<{ matched: boolean; orderId?: string; txHash?: string; error?: string; tokensReceived?: number; fillPrice?: number }> {
  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk,
      tickSize,
    });

    logger.info(result, 'Buy order result');
    const txHash = result?.transactionsHashes?.[0];
    logger.info(
      { orderId: result.orderID, status: result.status, txHash, side, slug },
      'Order placed'
    );

    // Success if we have a transaction hash
    if (txHash) {
      // Calculate actual fill price: USDC spent / tokens received
      const tokensReceived = parseFloat((result as any).takingAmount || '0');
      const usdcSpent = parseFloat((result as any).makingAmount || String(amount));
      // Round down fill price to 2 decimal places (e.g., 0.98)
      const fillPrice = tokensReceived > 0 ? Math.floor((usdcSpent / tokensReceived) * 100) / 100 : 0;

      logger.info(
        { orderId: result.orderID, txHash, side, slug, tokensReceived, fillPrice: `${(fillPrice * 100).toFixed(0)}%` },
        'Buy success (has txHash)!'
      );
      return { matched: true, orderId: result.orderID, txHash, tokensReceived, fillPrice };
    }

    // Also consider DRY_RUN as success
    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID, tokensReceived: amount / 0.98, fillPrice: 0.98 };
    }

    return { matched: false, orderId: result.orderID };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error, will retry');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Place a limit sell order at 1 cent higher than buy price
 */
async function placeLimitSellOneCentHigher(
  clobClient: ClobClient,
  tokenId: string,
  tokensOwned: number,
  negRisk: boolean,
  tickSize: string,
  slug: string,
  buyPrice: number
): Promise<string | null> {
  // Sell at 1 cent higher than buy price (e.g., bought at 96%, sell at 97%)
  const sellPrice = Math.round((buyPrice + 0.01) * 100) / 100;
  // Round down tokens to avoid dust issues
  const tokensToSell = Math.floor(tokensOwned * 100) / 100;

  if (tokensToSell <= 0) {
    logger.warn({ tokensOwned, slug }, 'No tokens to sell');
    return null;
  }

  if (sellPrice > 0.99) {
    logger.info({ buyPrice, sellPrice, slug }, 'Sell price would be > 99%, skipping limit order');
    return null;
  }

  logger.info(
    { tokens: tokensToSell, buyPrice: `${(buyPrice * 100).toFixed(0)}%`, sellPrice: `${(sellPrice * 100).toFixed(0)}%`, slug },
    'Placing limit sell order at +1 cent...'
  );

  // Retry with max attempts
  const MAX_RETRIES = 5;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const sellOrder = await clobClient.createOrder(
        {
          tokenID: tokenId,
          price: sellPrice,
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
          { orderId: (result as any).orderID, buyPrice: `${(buyPrice * 100).toFixed(0)}%`, sellPrice: `${(sellPrice * 100).toFixed(0)}%`, tokens: tokensToSell, slug },
          'Limit sell order placed'
        );
        return (result as any).orderID;
      } else {
        const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';

        // Stop retrying if orderbook doesn't exist (market closed)
        if (errorMsg.includes('does not exist')) {
          logger.warn({ error: errorMsg, slug }, 'Orderbook closed, giving up on limit sell');
          return null;
        }

        retryCount++;
        logger.warn(
          { error: errorMsg, retry: retryCount, maxRetries: MAX_RETRIES, slug },
          'Limit sell order failed, retrying in 2s...'
        );
        await sleep(2000);
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);

      // Stop retrying if orderbook doesn't exist (market closed)
      if (errorMsg.includes('does not exist')) {
        logger.warn({ error: errorMsg, slug }, 'Orderbook closed, giving up on limit sell');
        return null;
      }

      retryCount++;
      logger.warn(
        { error: errorMsg, retry: retryCount, maxRetries: MAX_RETRIES, slug },
        'Limit sell order error, retrying in 2s...'
      );
      await sleep(2000);
    }
  }

  logger.error({ slug, retries: retryCount }, 'Limit sell order failed after max retries');
  return null;
}

/**
 * Execute the 99% strategy for a single market window
 */
export async function executeStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config,
  crypto: string = 'UNKNOWN'
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);

  // Create CLOB client for limit sell orders
  const clobClient = createClobClient(config);

  logger.info(
    { window: formatWindowInfo(window, now), minPrice: `${MIN_ENTRY_PRICE * 100}%`, maxPrice: `${MAX_ENTRY_PRICE * 100}%`, crypto },
    'Executing strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Only trade in the final N seconds (last 88 seconds)
  if (!isInTradingWindow(window, now)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Not in trading window',
    };
  }

  logger.info(
    { slug: window.slug, secondsLeft: getSecondsUntilClose(window, now) },
    'Entering trading window (last 88 seconds)'
  );

  // ============================================
  // Poll for 90-98% price (skip if 99%)
  // ============================================
  while (Math.floor(Date.now() / 1000) < window.endTime) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const { upPrice, downPrice } = snapshot;
      const timeLeft = window.marketCloseTime - Math.floor(Date.now() / 1000);

      logger.info(
        {
          slug: window.slug,
          up: `${(upPrice * 100).toFixed(2)}%`,
          down: `${(downPrice * 100).toFixed(2)}%`,
          range: `${MIN_ENTRY_PRICE * 100}%-${MAX_ENTRY_PRICE * 100}%`,
          timeLeft: `${timeLeft}s`,
        },
        'Price check'
      );

      // Check if either side is in valid range (90-98%, skip 99%)
      let targetSide: 'UP' | 'DOWN' | null = null;
      let targetTokenId: string | null = null;
      let targetPrice = 0;

      // Check UP side: >= 90% AND <= 98%
      if (upPrice >= MIN_ENTRY_PRICE && upPrice <= MAX_ENTRY_PRICE) {
        targetSide = 'UP';
        targetTokenId = tokenIds.up;
        targetPrice = upPrice;
      }
      // Check DOWN side: >= 90% AND <= 98%
      else if (downPrice >= MIN_ENTRY_PRICE && downPrice <= MAX_ENTRY_PRICE) {
        targetSide = 'DOWN';
        targetTokenId = tokenIds.down;
        targetPrice = downPrice;
      }
      // If 99% hit, skip entire window (no profit margin)
      else if (upPrice >= 0.99 || downPrice >= 0.99) {
        logger.info(
          { up: `${(upPrice * 100).toFixed(2)}%`, down: `${(downPrice * 100).toFixed(2)}%`, slug: window.slug },
          'Price at 99%, skipping window (no profit margin)'
        );
        tradeTracker.markSkipped(window.slug);
        return {
          marketSlug: window.slug,
          traded: false,
          skipReason: 'Price at 99%, no profit margin',
        };
      }

      if (targetSide && targetTokenId) {
        // Check if another bot already bought for this window
        const existingLock = await checkTradeLock(window.slug);
        if (existingLock && existingLock !== crypto) {
          logger.info(
            { crypto, existingLock, slug: window.slug },
            'Another bot already bought, skipping'
          );
          tradeTracker.markSkipped(window.slug);
          return {
            marketSlug: window.slug,
            traded: false,
            skipReason: `Already bought by ${existingLock}`,
          };
        }

        logger.info(
          { side: targetSide, price: `${(targetPrice * 100).toFixed(2)}%`, slug: window.slug, crypto },
          'Price in range (90-98%)! Buying...'
        );

        // Try to buy
        const result = await tryBuy(
          tradingClient,
          targetTokenId,
          config.BET_AMOUNT_USDC,
          tokenIds.negRisk,
          tokenIds.tickSize,
          targetSide,
          window.slug
        );

        if (result.matched) {
          // Mark trade lock so other bots skip this window
          await markTradeLock(window.slug, crypto);

          const tradeResult: TradeResult = {
            success: true,
            orderId: result.orderId,
            marketSlug: window.slug,
            side: targetSide,
          };
          tradeTracker.markTraded(window.slug, tradeResult);

          // Always place limit sell at fill price + 1 cent
          if (result.fillPrice && result.tokensReceived && !config.DRY_RUN) {
            logger.info(
              { fillPrice: `${(result.fillPrice * 100).toFixed(0)}%`, tokens: result.tokensReceived, slug: window.slug },
              'Placing limit sell at fill price + 1 cent'
            );
            await placeLimitSellOneCentHigher(
              clobClient,
              targetTokenId,
              result.tokensReceived,
              tokenIds.negRisk,
              tokenIds.tickSize,
              window.slug,
              result.fillPrice
            );
          }

          return { marketSlug: window.slug, traded: true, tradeResult };
        }
        // No match - continue polling
        if (config.IS_SERVER) await sleep(500);
      } else {
        // Price not in range - wait and check again
        if (config.IS_SERVER) await sleep(500);
      }
    } catch (error) {
      logger.warn({ error, slug: window.slug }, 'Error in trading window, continuing...');
      if (config.IS_SERVER) await sleep(500);
    }
  }

  // Window ended without trade
  logger.info({ slug: window.slug }, 'Trading window ended, no trade made');
  tradeTracker.markSkipped(window.slug);

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'No valid price in window',
  };
}

/**
 * Process a single market event
 */
export async function processMarket(
  eventConfig: EventConfig,
  tradingClient: TradingClient,
  marketClient: MarketClient,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  // Skip if not within the market window
  if (!isInMarketWindow(window, now)) {
    return null;
  }

  // Skip if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return null;
  }

  // Fetch market data
  const marketData = await marketClient.getMarketTokenIds(window.slug);
  if (!marketData) {
    logger.warn({ slug: window.slug }, 'Could not fetch market data');
    return null;
  }

  // Check if market is still open
  if (!marketClient.isMarketOpen(marketData.market)) {
    logger.debug({ slug: window.slug }, 'Market is closed');
    tradeTracker.markSkipped(window.slug);
    return null;
  }

  // Only trade in the last 2 minutes
  if (!isInTradingWindow(window, now)) {
    return null;
  }

  // Execute trading strategy
  return executeStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config,
    eventConfig.crypto
  );
}

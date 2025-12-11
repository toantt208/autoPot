/**
 * Auto Fallback Strategy
 *
 * Flow (example: BTC 13:00 - 13:15):
 * 1. Trading Window: Enter in the final window
 * 2. Auto Fallback: Buy higher side, retry on FAK error only
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
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

const RETRY_AFTER_CLOSE_SECS = 5; // 5 seconds after market close

/**
 * Check if we're within the market window
 */
function isInMarketWindow(window: MarketWindow, now: number): boolean {
  return now >= window.startTime && now < window.endTime;
}

/**
 * Check if error is retryable (no liquidity errors)
 */
function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('no orders found to match with fak order') ||
    lowerError === 'no match'
  );
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
): Promise<{ matched: boolean; orderId?: string; txHash?: string; error?: string }> {
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
      logger.info({ orderId: result.orderID, txHash, side, slug }, 'Buy success (has txHash)! Stopping.');
      return { matched: true, orderId: result.orderID, txHash };
    }

    // Also consider DRY_RUN as success
    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID };
    }

    return { matched: false, orderId: result.orderID };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error, will retry');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Execute the auto fallback strategy for a single market window
 * Buys the higher side, retries only on FAK error (no liquidity)
 */
export async function executeAutoFallbackStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);
  const retryDeadline = window.marketCloseTime + RETRY_AFTER_CLOSE_SECS;

  logger.info(
    { window: formatWindowInfo(window, now), strategy: 'auto-fallback' },
    'Executing auto fallback strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Only trade in the final N seconds
  if (!isInTradingWindow(window, now)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Not in trading window',
    };
  }

  logger.info(
    { slug: window.slug, secondsLeft: getSecondsUntilClose(window, now) },
    'Entering trading window (auto-fallback)'
  );

  // ============================================
  // Auto Fallback: Buy higher side, retry on FAK only
  // ============================================
  logger.info({ slug: window.slug }, 'Auto fallback mode - buying higher side');

  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const { upPrice, downPrice } = snapshot;

      const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';
      const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;
      const higherPrice = Math.max(upPrice, downPrice);

      const currentTime = Math.floor(Date.now() / 1000);
      const isAfterClose = currentTime >= window.marketCloseTime;
      const timeInfo = isAfterClose
        ? `+${currentTime - window.marketCloseTime}s after close`
        : `${window.marketCloseTime - currentTime}s left`;

      logger.info(
        {
          slug: window.slug,
          up: `${(upPrice * 100).toFixed(2)}%`,
          down: `${(downPrice * 100).toFixed(2)}%`,
          chosen: higherSide,
          time: timeInfo,
        },
        'Buying higher side'
      );

      const result = await tryBuy(
        tradingClient,
        higherTokenId,
        config.BET_AMOUNT_USDC,
        tokenIds.negRisk,
        tokenIds.tickSize,
        higherSide,
        window.slug
      );

      // Success - matched
      if (result.matched) {
        const tradeResult: TradeResult = {
          success: true,
          orderId: result.orderId,
          marketSlug: window.slug,
          side: higherSide,
        };
        tradeTracker.markTraded(window.slug, tradeResult);
        logger.info(
          { orderId: result.orderId, txHash: result.txHash, side: higherSide, slug: window.slug },
          'Trade matched! Done.'
        );
        return { marketSlug: window.slug, traded: true, tradeResult };
      }

      // No liquidity error - retry
      if (isRetryableError(result.error)) {
        logger.warn({ slug: window.slug, error: result.error }, 'No match, retrying...');
        if (config.IS_SERVER) await sleep(500);
        continue;
      }

      console.log(result)
      // Other error (balance, etc.) - stop and next window
      logger.error({ slug: window.slug, error: result.error }, 'Error, moving to next window');
      const failedResult: TradeResult = {
        success: false,
        orderId: result.orderId,
        error: result.error,
        marketSlug: window.slug,
        side: higherSide,
      };
      tradeTracker.markTraded(window.slug, failedResult);
      return {
        marketSlug: window.slug,
        traded: false,
        skipReason: result.error || 'Trade failed',
      };
    } catch (error) {
      logger.error({ error, slug: window.slug }, 'Error in auto-fallback, stopping');
      const failedResult: TradeResult = {
        success: false,
        error: String(error),
        marketSlug: window.slug,
        side: 'UP',
      };
      tradeTracker.markTraded(window.slug, failedResult);
      return {
        marketSlug: window.slug,
        traded: false,
        skipReason: String(error),
      };
    }
  }

  // Retry deadline reached
  logger.error({ slug: window.slug }, 'Retry deadline reached (5s after close)');
  const failedResult: TradeResult = {
    success: false,
    error: 'Retry deadline reached',
    marketSlug: window.slug,
    side: 'UP',
  };
  tradeTracker.markTraded(window.slug, failedResult);

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'Retry deadline reached',
  };
}

/**
 * Process a single market event with auto fallback strategy
 */
export async function processMarketAutoFallback(
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

  // Execute auto fallback strategy
  return executeAutoFallbackStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config
  );
}

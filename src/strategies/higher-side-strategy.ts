/**
 * Higher Side Strategy
 *
 * Strategy: Buy the higher side immediately when entering the 5-minute window
 * - Entry: At T-300s (5 minutes before close)
 * - Condition: Higher side must be >= 60%
 * - Exit: Only buys ONCE per window (no retries after successful match)
 *
 * Based on simulated trade analysis showing 85-90% win rate
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { fetchPrices } from '../services/price-monitor.js';
import { sleep } from '../utils/retry.js';
import { TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

// Strategy parameters
const STATS_WINDOW_SECS = 300; // 5 minutes before close (same as stats collector)
const MIN_HIGHER_SIDE_PRICE = 0.60; // Minimum 60% to enter
const RETRY_AFTER_CLOSE_SECS = 5; // Retry period after close if no match

export interface StrategyResult {
  marketSlug: string;
  traded: boolean;
  tradeResult?: TradeResult;
  skipReason?: string;
}

/**
 * Check if we're in the stats/trading window (last 5 minutes before close + retry period)
 */
function isInStatsWindow(window: MarketWindow, now: number): boolean {
  const statsWindowStart = window.marketCloseTime - STATS_WINDOW_SECS;
  const retryDeadline = window.marketCloseTime + RETRY_AFTER_CLOSE_SECS;
  return now >= statsWindowStart && now < retryDeadline;
}

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

/**
 * Try to place a buy order
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

    if (txHash) {
      logger.info({ orderId: result.orderID, txHash, side, slug }, 'Buy success! Stopping.');
      return { matched: true, orderId: result.orderID, txHash };
    }

    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID };
    }

    return { matched: false, orderId: result.orderID };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Execute the higher side strategy for a single market window
 * Buys the higher side at the START of the 5-minute window if >= 60%
 */
export async function executeHigherSideStrategy(
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
    { window: formatWindowInfo(window, now), strategy: 'higher-side' },
    'Executing higher side strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Get initial prices to decide
  const snapshot = await fetchPrices(tradingClient, tokenIds);
  const { upPrice, downPrice } = snapshot;
  const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';
  const higherPrice = Math.max(upPrice, downPrice);

  logger.info(
    {
      slug: window.slug,
      up: `${(upPrice * 100).toFixed(2)}%`,
      down: `${(downPrice * 100).toFixed(2)}%`,
      higherSide,
      higherPrice: `${(higherPrice * 100).toFixed(2)}%`,
      minRequired: `${(MIN_HIGHER_SIDE_PRICE * 100).toFixed(0)}%`,
    },
    'Checking entry conditions'
  );

  // Skip if higher side is below threshold
  if (higherPrice < MIN_HIGHER_SIDE_PRICE) {
    logger.info(
      { slug: window.slug, higherPrice: `${(higherPrice * 100).toFixed(2)}%` },
      'Higher side below 60% threshold, skipping'
    );
    tradeTracker.markSkipped(window.slug);
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: `Higher side (${(higherPrice * 100).toFixed(0)}%) below 60% threshold`,
    };
  }

  // Buy higher side immediately
  const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;

  logger.info(
    {
      slug: window.slug,
      side: higherSide,
      price: `${(higherPrice * 100).toFixed(2)}%`,
      amount: config.BET_AMOUNT_USDC,
    },
    'Buying higher side (higher-side strategy)'
  );

  // Try to buy with retries until deadline
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    const currentTime = Math.floor(Date.now() / 1000);
    const isAfterClose = currentTime >= window.marketCloseTime;
    const timeInfo = isAfterClose
      ? `+${currentTime - window.marketCloseTime}s after close`
      : `${window.marketCloseTime - currentTime}s left`;

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
        {
          orderId: result.orderId,
          txHash: result.txHash,
          side: higherSide,
          entryPrice: `${(higherPrice * 100).toFixed(2)}%`,
          slug: window.slug,
          time: timeInfo,
        },
        'Higher side trade matched! Done.'
      );
      return { marketSlug: window.slug, traded: true, tradeResult };
    }

    // No liquidity error - retry
    if (isRetryableError(result.error)) {
      logger.warn({ slug: window.slug, error: result.error, time: timeInfo }, 'No match, retrying...');
      await sleep(500);
      continue;
    }

    // Other error - stop
    logger.error({ slug: window.slug, error: result.error }, 'Error, stopping');
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
  }

  // Retry deadline reached
  logger.error({ slug: window.slug }, 'Retry deadline reached');
  const failedResult: TradeResult = {
    success: false,
    error: 'Retry deadline reached',
    marketSlug: window.slug,
    side: higherSide,
  };
  tradeTracker.markTraded(window.slug, failedResult);

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'Retry deadline reached',
  };
}

/**
 * Process a single market event with higher side strategy
 */
export async function processMarketHigherSide(
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

  // Only trade in the stats window (last 5 minutes before close)
  if (!isInStatsWindow(window, now)) {
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

  // Execute higher side strategy
  return executeHigherSideStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config
  );
}

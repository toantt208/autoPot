/**
 * Price Monitor Service
 *
 * Monitors prices during decision windows and emits signals when threshold is met.
 */

import { TradingClient } from '../clients/trading-client.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import { savePrices } from './price-cache.js';
import type { TokenIds, PriceSnapshot, TradingSignal, MarketWindow } from '../types/index.js';

const POLL_INTERVAL_NORMAL_MS = 1000; // Poll every 1 second normally
const POLL_INTERVAL_FAST_MS = 500;    // Poll every 500ms in final seconds
const FAST_POLL_THRESHOLD_SECS = 3;   // Switch to fast polling when <= 3 seconds left

export interface PriceCheckResult {
  found: boolean;
  signal: TradingSignal | null;
  snapshot: PriceSnapshot;
}

/**
 * Fetch current prices for both Up and Down outcomes
 * Uses batch API to avoid rate limiting
 * Saves to Redis for post-buy fallback
 */
export async function fetchPrices(
  tradingClient: TradingClient,
  tokenIds: TokenIds
): Promise<PriceSnapshot> {
  const { upPrice, downPrice } = await tradingClient.getBatchPrices(tokenIds.up, tokenIds.down);

  // Cache prices to Redis if tokenIds provided and prices are valid
  if (upPrice > 0 || downPrice > 0) {
    savePrices(tokenIds.up, upPrice, tokenIds.down, downPrice).catch(() => {});
  }

  return {
    timestamp: Date.now(),
    upPrice,
    downPrice,
  };
}

/**
 * Check if prices meet the threshold and return a trading signal
 */
export function checkPriceThreshold(
  snapshot: PriceSnapshot,
  tokenIds: TokenIds,
  marketSlug: string,
  threshold: number,
  windowEndTime: number
): PriceCheckResult {
  // Check Up side first
  if (snapshot.upPrice >= threshold) {
    return {
      found: true,
      signal: {
        side: 'UP',
        price: snapshot.upPrice,
        tokenId: tokenIds.up,
        marketSlug,
        negRisk: tokenIds.negRisk,
        tickSize: tokenIds.tickSize,
        windowEndTime,
      },
      snapshot,
    };
  }

  // Check Down side
  if (snapshot.downPrice >= threshold) {
    return {
      found: true,
      signal: {
        side: 'DOWN',
        price: snapshot.downPrice,
        tokenId: tokenIds.down,
        marketSlug,
        negRisk: tokenIds.negRisk,
        tickSize: tokenIds.tickSize,
        windowEndTime,
      },
      snapshot,
    };
  }

  return {
    found: false,
    signal: null,
    snapshot,
  };
}

/**
 * Monitor prices during the decision window (T-60s to T-5s)
 * Returns a signal if threshold is met, null otherwise
 */
export async function monitorPricesUntilSignal(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  window: MarketWindow,
  threshold: number,
  untilTimestamp: number
): Promise<TradingSignal | null> {
  logger.info(
    { slug: window.slug, threshold, untilTimestamp },
    'Starting price monitoring'
  );

  while (Math.floor(Date.now() / 1000) < untilTimestamp) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const result = checkPriceThreshold(snapshot, tokenIds, window.slug, threshold, window.endTime);

      const timeLeft = untilTimestamp - Math.floor(Date.now() / 1000);
      logger.info(
        {
          slug: window.slug,
          yes: `${(snapshot.upPrice * 100).toFixed(2)}%`,
          no: `${(snapshot.downPrice * 100).toFixed(2)}%`,
          threshold: `${(threshold * 100).toFixed(0)}%`,
          timeLeft: `${timeLeft}s`,
        },
        'Price check'
      );

      if (result.found && result.signal) {
        logger.info(
          { signal: result.signal },
          'Trading signal found!'
        );
        return result.signal;
      }

      // Use faster polling in final seconds
      const pollInterval = timeLeft <= FAST_POLL_THRESHOLD_SECS
        ? POLL_INTERVAL_FAST_MS
        : POLL_INTERVAL_NORMAL_MS;
      await sleep(pollInterval);
    } catch (error) {
      logger.warn({ error, slug: window.slug }, 'Error fetching prices, retrying...');
      const timeLeft = untilTimestamp - Math.floor(Date.now() / 1000);
      const pollInterval = timeLeft <= FAST_POLL_THRESHOLD_SECS
        ? POLL_INTERVAL_FAST_MS
        : POLL_INTERVAL_NORMAL_MS;
      await sleep(pollInterval);
    }
  }

  logger.info({ slug: window.slug }, 'Monitoring ended without finding signal');
  return null;
}

/**
 * Single price check (used in fallback window)
 */
export async function checkPricesOnce(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  marketSlug: string,
  threshold: number,
  windowEndTime: number
): Promise<PriceCheckResult> {
  const snapshot = await fetchPrices(tradingClient, tokenIds);
  return checkPriceThreshold(snapshot, tokenIds, marketSlug, threshold, windowEndTime);
}

/**
 * Log prices without trading (for monitoring entire 15-min window)
 * Returns when untilTimestamp is reached
 */
export async function logPricesOnly(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  window: MarketWindow,
  untilTimestamp: number,
  tradingWindowSeconds: number,
  threshold: number
): Promise<void> {
  logger.info(
    {
      slug: window.slug,
      untilTimestamp,
      yesTokenId: tokenIds.up,
      noTokenId: tokenIds.down,
    },
    'Starting price logging (observation only)'
  );

  while (Math.floor(Date.now() / 1000) < untilTimestamp) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const now = Math.floor(Date.now() / 1000);
      const timeToEnd = window.endTime - now;
      const timeToAction = window.tradingWindowStart - now;

      logger.info(
        {
          slug: window.slug,
          yes: `${(snapshot.upPrice * 100).toFixed(2)}%`,
          no: `${(snapshot.downPrice * 100).toFixed(2)}%`,
          timeToEnd: `${timeToEnd}s`,
          actionIn: `${timeToAction}s`,
          actionWindow: `${tradingWindowSeconds}s`,
          threshold: `${(threshold * 100).toFixed(0)}%`,
        },
        'Price'
      );

      await sleep(POLL_INTERVAL_NORMAL_MS);
    } catch (error) {
      logger.warn({ error, slug: window.slug }, 'Error fetching prices');
      await sleep(POLL_INTERVAL_NORMAL_MS);
    }
  }
}

/**
 * Price Diff Strategy
 *
 * Strategy: Buy when price diff reaches threshold (default 0.002)
 * - If price_diff >= threshold → buy UP
 * - If price_diff <= -threshold → buy DOWN
 *
 * Uses Redis for fast price lookups.
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
import {
  getLatestPrice,
  saveBeatPrice,
  getBeatPrice,
} from '../services/redis-price-service.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

// Strategy parameters
const POLL_INTERVAL_MS = 200; // Check every 200ms for fast entry
const RETRY_AFTER_CLOSE_SECS = 5;

// Tiered thresholds based on time remaining (safer = needs bigger diff)
// Format: { maxTimeLeft: seconds, threshold: price diff }
export interface TieredThreshold {
  maxTimeLeft: number;
  threshold: number;
}

export const DEFAULT_TIERED_THRESHOLDS: TieredThreshold[] = [
  { maxTimeLeft: 5, threshold: 0.0004 },    // Last 5s: 0.0004
  { maxTimeLeft: 10, threshold: 0.0005 },   // Last 10s: 0.0005
  { maxTimeLeft: 50, threshold: 0.001 },    // Last 50s: 0.001
  { maxTimeLeft: 100, threshold: 0.0015 },  // Last 100s: 0.0015
  { maxTimeLeft: 150, threshold: 0.002 },   // Last 150s: 0.002
  { maxTimeLeft: 300, threshold: 0.004 },   // Last 5min: 0.004
  { maxTimeLeft: 600, threshold: 0.01 },    // Last 10min: 0.01
];

// Minimum entry price based on time remaining
export const DEFAULT_MIN_ENTRY_PRICE = 0.65; // 65% for normal entries
export const LATE_MIN_ENTRY_PRICE = 0.55; // 55% for last 30s
export const LATE_ENTRY_TIME_THRESHOLD = 30; // Switch to lower min price at 30s

export interface PriceDiffStrategyConfig {
  symbol: string; // e.g., 'XRP'
  tieredThresholds?: TieredThreshold[]; // Optional, defaults to DEFAULT_TIERED_THRESHOLDS
  minEntryPrice?: number; // Optional, defaults to DEFAULT_MIN_ENTRY_PRICE (0.80)
  priceDiffThreshold?: number; // Deprecated: use tieredThresholds instead
}

/**
 * Get threshold for given time remaining
 * Returns null if outside all tiers (no entry allowed)
 */
function getThresholdForTime(timeLeft: number, thresholds: TieredThreshold[]): number | null {
  for (const tier of thresholds) {
    if (timeLeft <= tier.maxTimeLeft) {
      return tier.threshold;
    }
  }
  return null; // No entry if outside all tiers
}

export interface StrategyResult {
  marketSlug: string;
  traded: boolean;
  tradeResult?: TradeResult;
  skipReason?: string;
}

/**
 * Fetch beat price from Polymarket API with retry
 */
async function fetchBeatPrice(
  startTime: number,
  marketCloseTime: number,
  symbol: string
): Promise<number | null> {
  const eventStartTime = new Date(startTime * 1000).toISOString().replace('.000Z', 'Z');
  const endDate = new Date(marketCloseTime * 1000).toISOString().replace('.000Z', 'Z');
  const url = `https://polymarket.com/api/crypto/crypto-price?symbol=${symbol}&eventStartTime=${eventStartTime}&variant=fifteen&endDate=${endDate}`;

  const maxRetries = 120;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.debug({ status: response.status, attempt }, 'crypto-price API failed');
        await sleep(retryDelay);
        continue;
      }

      const data = (await response.json()) as { openPrice?: number | null };

      if (data?.openPrice != null) {
        logger.info({ openPrice: data.openPrice, attempt, symbol }, 'Beat price fetched');
        return data.openPrice;
      }

      logger.debug({ attempt }, 'openPrice is null, retrying...');
      await sleep(retryDelay);
    } catch (err: any) {
      logger.debug({ error: err.message, attempt }, 'crypto-price API error');
      await sleep(retryDelay);
    }
  }

  logger.error({ maxRetries, symbol }, 'Failed to fetch beat price after max retries');
  return null;
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

    const txHash = result?.transactionsHashes?.[0];
    logger.info(
      { orderId: result.orderID, status: result.status, txHash, side, slug },
      'Order placed'
    );

    if (txHash) {
      return { matched: true, orderId: result.orderID, txHash };
    }

    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID };
    }

    return { matched: false, orderId: result.orderID, error: result.error };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('no orders found to match with fak order') ||
    lowerError.includes('could not run the execution') ||
    lowerError.includes('request interrupted by user') ||
    lowerError === 'no match'
  );
}

/**
 * Execute price diff strategy for a single market window
 */
export async function executePriceDiffStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config,
  strategyConfig: PriceDiffStrategyConfig
): Promise<StrategyResult> {
  const {
    symbol,
    tieredThresholds = DEFAULT_TIERED_THRESHOLDS,
    minEntryPrice = DEFAULT_MIN_ENTRY_PRICE,
  } = strategyConfig;
  const retryDeadline = window.marketCloseTime + RETRY_AFTER_CLOSE_SECS;

  // Get max time window for logging
  const maxTimeWindow = Math.max(...tieredThresholds.map(t => t.maxTimeLeft));

  logger.info(
    {
      window: formatWindowInfo(window, Math.floor(Date.now() / 1000)),
      thresholds: tieredThresholds.map(t => `T-${t.maxTimeLeft}s: ${t.threshold}`),
      minEntryPrice: `${(minEntryPrice * 100).toFixed(0)}%`,
      symbol,
      strategy: 'price-diff-tiered',
    },
    'Executing tiered price diff strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Fetch and cache beat price
  let beatData = await getBeatPrice(window.slug);
  if (!beatData) {
    const beatPrice = await fetchBeatPrice(window.startTime, window.marketCloseTime, symbol);
    if (!beatPrice) {
      logger.warn({ slug: window.slug }, 'Could not fetch beat price');
      return {
        marketSlug: window.slug,
        traded: false,
        skipReason: 'Failed to fetch beat price',
      };
    }
    await saveBeatPrice(window.slug, beatPrice, window.startTime, window.marketCloseTime);
    beatData = { windowSlug: window.slug, beatPrice, startTime: window.startTime, marketCloseTime: window.marketCloseTime, timestamp: Date.now() };
  }

  const beatPrice = beatData.beatPrice;
  logger.info({ beatPrice: beatPrice.toFixed(4), slug: window.slug }, 'Using beat price');

  // Monitor price diff until threshold reached or deadline
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = window.marketCloseTime - currentTime;
    const timeInfo = timeLeft >= 0 ? `T-${timeLeft}s` : `T+${Math.abs(timeLeft)}s`;

    // Get latest price from Redis
    const priceData = await getLatestPrice(symbol);
    if (!priceData) {
      logger.debug({ symbol }, 'No price data in Redis, waiting...');
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const currentPrice = priceData.price;
    const priceDiff = currentPrice - beatPrice;
    const priceDiffPct = (priceDiff / beatPrice) * 100;

    // Get threshold based on time remaining
    const currentThreshold = getThresholdForTime(timeLeft, tieredThresholds);

    // Skip if outside all tiers (e.g., more than 10 minutes left)
    if (currentThreshold === null) {
      // Log periodically (every ~5 seconds)
      if (Math.random() < 0.04) {
        logger.debug(
          {
            slug: window.slug,
            time: timeInfo,
            maxTimeWindow,
          },
          'Outside entry window, waiting...'
        );
      }
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    // Check if threshold reached for current tier
    let entrySide: 'UP' | 'DOWN' | null = null;
    if (priceDiff >= currentThreshold) {
      entrySide = 'UP';
    } else if (priceDiff <= -currentThreshold) {
      entrySide = 'DOWN';
    }

    if (!entrySide) {
      // Log periodically (every ~1 second)
      if (Math.random() < 0.2) {
        logger.debug(
          {
            slug: window.slug,
            beat: beatPrice.toFixed(4),
            current: currentPrice.toFixed(4),
            diff: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(4)}`,
            threshold: currentThreshold,
            time: timeInfo,
          },
          'Waiting for threshold...'
        );
      }
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    // Threshold reached! Get market prices first to check entry price
    const snapshot = await fetchPrices(tradingClient, tokenIds);
    const entryPrice = entrySide === 'UP' ? snapshot.upPrice : snapshot.downPrice;
    const entryTokenId = entrySide === 'UP' ? tokenIds.up : tokenIds.down;

    // Check if entry price meets minimum requirement (dynamic based on time)
    const effectiveMinPrice = timeLeft < LATE_ENTRY_TIME_THRESHOLD ? LATE_MIN_ENTRY_PRICE : minEntryPrice;
    if (entryPrice < effectiveMinPrice) {
      // Log periodically
      if (Math.random() < 0.2) {
        logger.debug(
          {
            slug: window.slug,
            side: entrySide,
            entryPrice: `${(entryPrice * 100).toFixed(1)}%`,
            minRequired: `${(effectiveMinPrice * 100).toFixed(0)}%`,
            priceDiff: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(4)}`,
            time: timeInfo,
          },
          'Threshold met but entry price too low, waiting...'
        );
      }
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    // Entry price OK, proceed with buy
    logger.info(
      {
        slug: window.slug,
        side: entrySide,
        priceDiff: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(4)}`,
        priceDiffPct: `${priceDiffPct.toFixed(3)}%`,
        threshold: currentThreshold,
        entryPrice: `${(entryPrice * 100).toFixed(1)}%`,
        beat: beatPrice.toFixed(4),
        current: currentPrice.toFixed(4),
        time: timeInfo,
      },
      'Tiered threshold reached! Buying...'
    );

    logger.info(
      {
        slug: window.slug,
        side: entrySide,
        entryPrice: `${(entryPrice * 100).toFixed(1)}%`,
        amount: config.BET_AMOUNT_USDC,
      },
      'Placing buy order'
    );

    const result = await tryBuy(
      tradingClient,
      entryTokenId,
      config.BET_AMOUNT_USDC,
      tokenIds.negRisk,
      tokenIds.tickSize,
      entrySide,
      window.slug
    );

    if (result.matched) {
      const tradeResult: TradeResult = {
        success: true,
        orderId: result.orderId,
        marketSlug: window.slug,
        side: entrySide,
      };
      tradeTracker.markTraded(window.slug, tradeResult);
      logger.info(
        {
          orderId: result.orderId,
          txHash: result.txHash,
          side: entrySide,
          entryPrice: `${(entryPrice * 100).toFixed(1)}%`,
          priceDiff: priceDiff.toFixed(4),
          slug: window.slug,
        },
        'Trade matched!'
      );
      return { marketSlug: window.slug, traded: true, tradeResult };
    }

    // Retry if retryable error
    if (isRetryableError(result.error)) {
      logger.warn({ slug: window.slug, error: result.error }, 'No match, retrying...');
      await sleep(500);
      continue;
    }

    // Non-retryable error
    logger.error({ slug: window.slug, error: result.error }, 'Trade failed');
    const failedResult: TradeResult = {
      success: false,
      orderId: result.orderId,
      error: result.error,
      marketSlug: window.slug,
      side: entrySide,
    };
    tradeTracker.markTraded(window.slug, failedResult);
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: result.error || 'Trade failed',
    };
  }

  // Deadline reached without triggering
  logger.info({ slug: window.slug, thresholds: tieredThresholds }, 'Window ended, tiered thresholds never reached');
  tradeTracker.markSkipped(window.slug);

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'Price diff never reached tiered thresholds',
  };
}

/**
 * Process a single market event with price diff strategy
 */
export async function processMarketPriceDiff(
  eventConfig: EventConfig,
  tradingClient: TradingClient,
  marketClient: MarketClient,
  tradeTracker: TradeTracker,
  config: Config,
  strategyConfig: PriceDiffStrategyConfig
): Promise<StrategyResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  // Skip if not within the market window
  if (now < window.startTime || now >= window.endTime) {
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

  // Execute price diff strategy
  return executePriceDiffStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config,
    strategyConfig
  );
}

/**
 * 99% Price Strategy
 *
 * Monitors markets in the final seconds (configurable, default 10s) and:
 * 1. Buy immediately when either side reaches 99% threshold
 * 2. If no 99% found by end of window, buy whichever side is higher
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { monitorPricesUntilSignal, checkPricesOnce } from '../services/price-monitor.js';
import { executeTrade, TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  isInTradingWindow,
  getSecondsUntilClose,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

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
 * Execute the 99% strategy for a single market window
 * Only takes action in the final N seconds (configured via tradingWindowSeconds)
 */
export async function executeStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);

  logger.info(
    { window: formatWindowInfo(window, now), threshold: config.MIN_PRICE_THRESHOLD },
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
    'Entering trading window'
  );

  // Monitor prices until we find 99% threshold or reach end of window
  const signal = await monitorPricesUntilSignal(
    tradingClient,
    tokenIds,
    window,
    config.MIN_PRICE_THRESHOLD,
    window.endTime // Monitor until market closes
  );

  if (signal) {
    const tradeResult = await executeTrade(tradingClient, signal, config);
    tradeTracker.markTraded(window.slug, tradeResult);

    return {
      marketSlug: window.slug,
      traded: true,
      tradeResult,
    };
  }

  // No 99% threshold found - buy whichever side is higher
  const nowAfterMonitor = Math.floor(Date.now() / 1000);
  if (nowAfterMonitor < window.endTime && !tradeTracker.hasProcessed(window.slug)) {
    const result = await checkPricesOnce(
      tradingClient,
      tokenIds,
      window.slug,
      config.MIN_PRICE_THRESHOLD,
      window.endTime
    );

    const { upPrice, downPrice } = result.snapshot;
    const higherSide = upPrice >= downPrice ? 'UP' : 'DOWN';
    const higherPrice = Math.max(upPrice, downPrice);
    const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;

    logger.info(
      {
        slug: window.slug,
        yes: `${(upPrice * 100).toFixed(2)}%`,
        no: `${(downPrice * 100).toFixed(2)}%`,
        chosen: higherSide,
      },
      'No 99% found - buying higher side'
    );

    const fallbackSignal = {
      side: higherSide as 'UP' | 'DOWN',
      price: higherPrice,
      tokenId: higherTokenId,
      marketSlug: window.slug,
      negRisk: tokenIds.negRisk,
      tickSize: tokenIds.tickSize,
      windowEndTime: window.endTime,
    };

    const tradeResult = await executeTrade(tradingClient, fallbackSignal, config);
    tradeTracker.markTraded(window.slug, tradeResult);

    return {
      marketSlug: window.slug,
      traded: true,
      tradeResult,
    };
  }

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'Window ended before trade',
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
    config
  );
}

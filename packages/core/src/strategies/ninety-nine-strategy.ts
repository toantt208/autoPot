/**
 * 99% Price Strategy
 *
 * Monitors markets in the final seconds (configurable) and:
 * 1. Buy immediately when either side reaches threshold (e.g., 99%)
 * 2. If no threshold found by end of window, buy whichever side is higher
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { monitorPricesUntilSignal, checkPricesOnce, logPricesOnly } from '../services/price-monitor.js';
import { executeTrade, TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  isInTradingWindow,
  getSecondsUntilClose,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult, EventConfig, TradingCredentials } from '../types/index.js';

/**
 * Check if we're within the market's 15-minute window
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

export interface StrategyOptions {
  /** Price threshold (e.g., 0.99 for 99%) */
  threshold: number;
  /** Bet amount in USDC */
  betAmountUsdc: number;
  /** Whether to run in dry run mode */
  dryRun?: boolean;
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
  options: StrategyOptions
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);

  logger.info(
    { window: formatWindowInfo(window, now), threshold: options.threshold },
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

  // Monitor prices until we find threshold or reach end of window
  const signal = await monitorPricesUntilSignal(
    tradingClient,
    tokenIds,
    window,
    options.threshold,
    window.endTime // Monitor until market closes
  );

  if (signal) {
    const tradeResult = await executeTrade(tradingClient, signal, {
      betAmountUsdc: options.betAmountUsdc,
      dryRun: options.dryRun,
    });
    tradeTracker.markTraded(window.slug, tradeResult);

    return {
      marketSlug: window.slug,
      traded: true,
      tradeResult,
    };
  }

  // No threshold found - buy whichever side is higher
  const nowAfterMonitor = Math.floor(Date.now() / 1000);
  if (nowAfterMonitor < window.endTime && !tradeTracker.hasProcessed(window.slug)) {
    const result = await checkPricesOnce(
      tradingClient,
      tokenIds,
      window.slug,
      options.threshold,
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
      'No threshold found - buying higher side'
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

    const tradeResult = await executeTrade(tradingClient, fallbackSignal, {
      betAmountUsdc: options.betAmountUsdc,
      dryRun: options.dryRun,
    });
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
 * Process a single crypto market - used by worker
 * This is the main entry point for the BullMQ worker
 */
export async function processMarketJob(
  credentials: TradingCredentials,
  eventConfig: EventConfig,
  marketSlug: string,
  windowStart: number,
  windowEnd: number
): Promise<StrategyResult> {
  const tradingClient = new TradingClient(credentials);
  const marketClient = new MarketClient();
  const tradeTracker = new TradeTracker();

  const window: MarketWindow = {
    slug: marketSlug,
    crypto: eventConfig.crypto.toLowerCase(),
    startTime: windowStart,
    endTime: windowEnd,
    tradingWindowStart: windowEnd - eventConfig.tradingWindowSeconds,
  };

  // Fetch market data
  const marketData = await marketClient.getMarketTokenIds(marketSlug);
  if (!marketData) {
    logger.warn({ slug: marketSlug }, 'Could not fetch market data');
    return {
      marketSlug,
      traded: false,
      skipReason: 'Could not fetch market data',
    };
  }

  // Check if market is still open
  if (!marketClient.isMarketOpen(marketData.market)) {
    logger.debug({ slug: marketSlug }, 'Market is closed');
    return {
      marketSlug,
      traded: false,
      skipReason: 'Market is closed',
    };
  }

  // Execute trading strategy
  return executeStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    {
      threshold: eventConfig.threshold,
      betAmountUsdc: eventConfig.betAmountUsdc,
      dryRun: credentials.dryRun,
    }
  );
}

/**
 * Process a single crypto market - monitors entire 15-min window
 * Used by legacy bot runner
 */
export async function processMarket(
  crypto: string,
  tradingClient: TradingClient,
  marketClient: MarketClient,
  tradeTracker: TradeTracker,
  options: StrategyOptions & { tradingWindowSeconds: number }
): Promise<StrategyResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(crypto, options.tradingWindowSeconds, now);

  // Skip if not within the 15-minute market window
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

  // Observation phase (before trading window) - just log prices
  if (!isInTradingWindow(window, now)) {
    await logPricesOnly(
      tradingClient,
      marketData.tokenIds,
      window,
      window.tradingWindowStart, // Log until trading window starts
      options.tradingWindowSeconds,
      options.threshold
    );
  }

  // Execute trading strategy (final N seconds)
  return executeStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    options
  );
}

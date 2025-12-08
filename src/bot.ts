/**
 * Polymarket Auto-Trading Bot - Core Runner
 *
 * Shared bot logic that can be run for a single crypto or multiple.
 */

import { getConfig } from './config/index.js';
import type { EventConfig } from './config/events.js';
import { TradingClient } from './clients/trading-client.js';
import { MarketClient } from './clients/market-client.js';
import { TradeTracker } from './services/trade-executor.js';
import { processMarketAutoFallback } from './strategies/auto-fallback-strategy.js';
import { processMarket } from './strategies/ninety-nine-strategy.js';

export type StrategyType = 'fallback' | 'ninetynine';
import {
  calculateMarketWindow,
  getSecondsUntilTradingWindow,
  formatWindowInfo,
} from './services/market-timing.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import type { Config } from './config/index.js';

const MAIN_LOOP_INTERVAL_MS = 1000; // Check every second
const CLEANUP_INTERVAL_MS = 3600 * 1000; // Cleanup every hour

export interface BotOptions {
  /** Event configuration */
  eventConfig: EventConfig;
  /** Strategy to use (default: fallback) */
  strategy?: StrategyType;
}

/**
 * Run the trading bot for a single event
 */
export async function runBot(options: BotOptions): Promise<void> {
  const { eventConfig, strategy = 'fallback' } = options;
  const cryptoUpper = eventConfig.crypto.toUpperCase();

  const strategyName = strategy === 'ninetynine' ? '99% Strategy' : 'Auto Fallback';
  logger.info({ crypto: cryptoUpper, interval: eventConfig.interval, strategy: strategyName }, `Starting Polymarket ${cryptoUpper} Trading Bot`);

  // Load and validate configuration
  let config: Config;
  try {
    config = getConfig();
  } catch (error) {
    logger.fatal({ error }, 'Configuration error');
    process.exit(1);
  }

  // Prominently log DRY_RUN status
  if (config.DRY_RUN) {
    logger.warn('=== DRY RUN MODE ENABLED - NO REAL TRADES WILL BE EXECUTED ===');
  } else {
    logger.info('=== LIVE MODE - REAL TRADES WILL BE EXECUTED ===');
  }

  logger.info(
    {
      crypto: cryptoUpper,
      interval: `${eventConfig.interval}m`,
      betAmount: config.BET_AMOUNT_USDC,
      threshold: config.MIN_PRICE_THRESHOLD,
      tradingWindowSeconds: eventConfig.tradingWindowSeconds,
      dryRun: config.DRY_RUN,
    },
    'Configuration loaded'
  );

  // Initialize clients
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();
  const tradeTracker = new TradeTracker();

  // Check allowances
  logger.info('Checking token allowances...');
  const hasAllowances = await tradingClient.hasAllowances();
  if (!hasAllowances) {
    logger.warn(
      'Token allowances not set. Please ensure your Safe wallet has approved the required tokens.'
    );
  } else {
    logger.info('Token allowances verified');
  }

  // Set up cleanup interval
  setInterval(() => {
    tradeTracker.cleanup(24);
    const stats = tradeTracker.getStats();
    logger.info(stats, 'Trade tracker stats');
  }, CLEANUP_INTERVAL_MS);

  // Set up graceful shutdown
  let isShuttingDown = false;

  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    const stats = tradeTracker.getStats();
    logger.info(stats, 'Shutting down, final stats');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Log next window
  const window = calculateMarketWindow(eventConfig);
  const untilTrading = getSecondsUntilTradingWindow(window);
  logger.info(
    { crypto: cryptoUpper, window: formatWindowInfo(window), tradingWindowSeconds: eventConfig.tradingWindowSeconds, untilTrading },
    `Next trading opportunity in ${untilTrading}s (${eventConfig.tradingWindowSeconds}s window)`
  );

  // Main loop
  logger.info('Entering main loop...');

  while (!isShuttingDown) {
    try {
      // Use selected strategy
      const processStrategy = strategy === 'ninetynine' ? processMarket : processMarketAutoFallback;
      const result = await processStrategy(
        eventConfig,
        tradingClient,
        marketClient,
        tradeTracker,
        config
      );

      if (result) {
        if (result.traded && result.tradeResult) {
          logger.info(
            {
              market: result.marketSlug,
              success: result.tradeResult.success,
              side: result.tradeResult.side,
              orderId: result.tradeResult.orderId,
            },
            'Trade completed'
          );
        } else if (result.skipReason) {
          logger.debug(
            { market: result.marketSlug, reason: result.skipReason },
            'Market skipped'
          );
        }
      } else {
        // Log next window when nothing to process
        const nextWindow = calculateMarketWindow(eventConfig);
        const untilTrading = getSecondsUntilTradingWindow(nextWindow);
        if (untilTrading > 0) {
          logger.info(
            { crypto: cryptoUpper, window: formatWindowInfo(nextWindow), untilTrading },
            `Waiting for next trading window in ${untilTrading}s`
          );
        }
      }

      await sleep(MAIN_LOOP_INTERVAL_MS);
    } catch (error) {
      logger.error({ error }, 'Error in main loop');
      await sleep(MAIN_LOOP_INTERVAL_MS * 5); // Longer delay on error
    }
  }
}

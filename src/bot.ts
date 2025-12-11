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
import {
  processMarketMartingale,
  createMartingaleState,
  getOrCreateMartingaleState,
  type MartingaleState,
} from './strategies/martingale-strategy.js';
import { processMarketHigherSide } from './strategies/higher-side-strategy.js';

export type StrategyType = 'fallback' | 'ninetynine' | 'martingale' | 'higherside';
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
  /** Martingale options */
  martingale?: {
    baseBet: number;
    targetSide: 'UP' | 'DOWN';
  };
}

/**
 * Run the trading bot for a single event
 */
export async function runBot(options: BotOptions): Promise<void> {
  const { eventConfig, strategy = 'fallback', martingale } = options;
  const cryptoUpper = eventConfig.crypto.toUpperCase();

  const strategyNames: Record<StrategyType, string> = {
    fallback: 'Auto Fallback',
    ninetynine: '99% Strategy',
    martingale: 'Martingale',
    higherside: 'Higher Side (60%+)',
  };
  const strategyName = strategyNames[strategy];
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

  // Initialize Martingale state if using martingale strategy
  let martingaleState: MartingaleState | null = null;
  if (strategy === 'martingale') {
    if (!martingale) {
      logger.fatal('Martingale strategy requires martingale options (baseBet, targetSide)');
      process.exit(1);
    }
    // Load state from database (or create if new)
    martingaleState = await getOrCreateMartingaleState(
      eventConfig.crypto,
      `${eventConfig.interval}m`,
      martingale.targetSide,
      martingale.baseBet
    );
    logger.info(
      {
        baseBet: martingaleState.baseBet,
        targetSide: martingaleState.targetSide,
        currentBet: martingaleState.currentBet,
        totalProfit: martingaleState.totalProfit,
        wins: martingaleState.wins,
        losses: martingaleState.losses,
        currentStreak: martingaleState.currentStreak,
      },
      'Martingale state loaded from database'
    );
  }

  // Main loop
  logger.info('Entering main loop...');

  while (!isShuttingDown) {
    try {
      let result;

      if (strategy === 'martingale' && martingaleState) {
        result = await processMarketMartingale(
          eventConfig,
          tradingClient,
          marketClient,
          tradeTracker,
          config,
          martingaleState
        );
      } else if (strategy === 'higherside') {
        result = await processMarketHigherSide(
          eventConfig,
          tradingClient,
          marketClient,
          tradeTracker,
          config
        );
      } else {
        const processStrategy = strategy === 'ninetynine' ? processMarket : processMarketAutoFallback;
        result = await processStrategy(
          eventConfig,
          tradingClient,
          marketClient,
          tradeTracker,
          config
        );
      }

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

          // For martingale, we need to track results and update state
          // This would require waiting for market resolution...
          // For now, log the state
          if (martingaleState) {
            logger.info(
              {
                currentBet: martingaleState.currentBet,
                totalProfit: martingaleState.totalProfit,
                streak: martingaleState.currentStreak,
              },
              'Martingale state (bet placed, awaiting resolution)'
            );
          }
        } else if (result.skipReason) {
          logger.debug(
            { market: result.marketSlug, reason: result.skipReason },
            'Market skipped'
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

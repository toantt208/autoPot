/**
 * Tiered Price Diff Trader
 *
 * Trades XRP based on tiered price diff thresholds.
 * Uses stricter thresholds when more time remains (safer entries).
 *
 * Tiered thresholds (default):
 * - Last 10min (600s): threshold 0.006
 * - Last 5min (300s): threshold 0.004
 * - Last 150s: threshold 0.002
 *
 * Usage: node dist/price-diff-trader.js
 *
 * Requires:
 * - price-tracker running (for Redis prices)
 * - Redis running
 */

import { getEventConfig } from './config/events.js';
import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';
import { MarketClient } from './clients/market-client.js';
import { TradeTracker } from './services/trade-executor.js';
import {
  processMarketPriceDiff,
  DEFAULT_TIERED_THRESHOLDS,
  type PriceDiffStrategyConfig,
  type TieredThreshold,
} from './strategies/price-diff-strategy.js';
import { disconnectRedis } from './db/redis.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';

// Configuration
const SYMBOL = 'XRP';
const EVENT_TYPE = 'xrp_15m';

// Default tiered thresholds (can be overridden via CLI)
// Last 150s: 0.002, Last 5min: 0.004, Last 10min: 0.006
const TIERED_THRESHOLDS: TieredThreshold[] = DEFAULT_TIERED_THRESHOLDS;

// Polling interval
const POLL_INTERVAL_MS = 1000;

async function main(): Promise<void> {
  const config = getConfig();
  const eventConfig = getEventConfig(EVENT_TYPE);

  logger.info(
    {
      tieredThresholds: TIERED_THRESHOLDS.map(t => `T-${t.maxTimeLeft}s: ${t.threshold}`),
      symbol: SYMBOL,
      eventType: EVENT_TYPE,
      betAmount: config.BET_AMOUNT_USDC,
      dryRun: config.DRY_RUN,
    },
    'Starting Tiered Price Diff Trader'
  );

  // Initialize clients
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();
  const tradeTracker = new TradeTracker();

  const strategyConfig: PriceDiffStrategyConfig = {
    symbol: SYMBOL,
    tieredThresholds: TIERED_THRESHOLDS,
  };

  let isShuttingDown = false;

  // Graceful shutdown
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info('Shutting down Price Diff Trader...');
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Main loop
  logger.info('Price Diff Trader running. Press Ctrl+C to stop.');

  while (!isShuttingDown) {
    try {
      const result = await processMarketPriceDiff(
        eventConfig,
        tradingClient,
        marketClient,
        tradeTracker,
        config,
        strategyConfig
      );

      if (result?.traded) {
        logger.info(
          {
            slug: result.marketSlug,
            side: result.tradeResult?.side,
            orderId: result.tradeResult?.orderId,
          },
          'Trade executed!'
        );
      }

      await sleep(POLL_INTERVAL_MS);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(POLL_INTERVAL_MS * 5);
    }
  }
}

main().catch((error) => {
  logger.error({ error: error.message }, 'Price Diff Trader failed');
  process.exit(1);
});

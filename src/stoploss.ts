/**
 * Stop-Loss Monitor Entry Point
 *
 * Runs as a separate pm2 process to monitor positions and trigger stop-loss sells.
 * Usage: node dist/stoploss.js [position_prefix]
 * Default prefix: 'xrp'
 */

import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';
import { runStopLossMonitor } from './services/stop-loss-service.js';
import { logger } from './utils/logger.js';

const positionPrefix = process.argv[2] || 'xrp';

async function main() {
  logger.info({ prefix: positionPrefix }, 'Starting Stop-Loss Monitor');

  // Load and validate configuration
  let config;
  try {
    config = getConfig();
  } catch (error) {
    logger.fatal({ error }, 'Configuration error');
    process.exit(1);
  }

  logger.info(
    {
      safeAddress: config.GNOSIS_SAFE_ADDRESS,
      dryRun: config.DRY_RUN,
      prefix: positionPrefix,
    },
    'Configuration loaded'
  );

  // Log mode
  if (config.DRY_RUN) {
    logger.warn('=== DRY RUN MODE - SELLS WILL BE SIMULATED ===');
  } else {
    logger.info('=== LIVE MODE - REAL SELLS WILL BE EXECUTED ===');
  }

  // Initialize trading client
  const tradingClient = new TradingClient(config);

  // Check allowances (needed for selling)
  logger.info('Checking token allowances...');
  try {
    const hasAllowances = await tradingClient.hasAllowances();
    if (!hasAllowances) {
      logger.warn('Token allowances may not be set for selling. Ensure approvals are in place.');
    } else {
      logger.info('Token allowances verified');
    }
  } catch (error: any) {
    logger.warn({ error: error?.message }, 'Could not check allowances');
  }

  // Set up graceful shutdown
  let isShuttingDown = false;

  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info('Stop-loss monitor shutting down...');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Run the stop-loss monitor (infinite loop)
  await runStopLossMonitor(tradingClient, config, positionPrefix);
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error in stop-loss monitor');
  process.exit(1);
});

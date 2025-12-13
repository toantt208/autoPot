/**
 * Auto-Redeem Service
 *
 * Automatically redeems won positions from resolved markets.
 * Runs every minute continuously.
 */

import { getConfig } from './config/index.js';
import { getRedeemablePositions } from './clients/data-api-client.js';
import { RedeemService } from './services/redeem-service.js';
import { logger } from './utils/logger.js';

const REDEEM_INTERVAL_MS = 60 * 1000; // Run every 1 minute
const RUN_ONCE = process.env.RUN_ONCE === 'true'; // Run once and exit (for cron)

async function runRedeemCycle(redeemService: RedeemService, safeAddress: string, dryRun: boolean) {
  try {
    // Fetch redeemable positions
    const allPositions = await getRedeemablePositions(safeAddress);

    if (allPositions.length === 0) {
      logger.debug('No redeemable positions found');
      return;
    }

    // Filter out positions with zero value
    const positions = allPositions.filter((p) => p.currentValue > 0);

    if (positions.length === 0) {
      logger.debug('No redeemable positions with value > 0');
      return;
    }

    logger.info(
      {
        count: positions.length,
        positions: positions.map((p) => ({
          title: p.title,
          outcome: p.outcome,
          size: p.size,
          value: p.currentValue,
        })),
      },
      'Found redeemable positions'
    );

    // Calculate total value
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    logger.info({ totalValue: `$${totalValue.toFixed(2)}` }, 'Total redeemable value');

    // Redeem all positions
    const results = await redeemService.redeemAll(positions);

    // Print summary
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    logger.info(
      {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      'Redeem cycle completed'
    );

    // Log failed redemptions
    if (failed.length > 0) {
      logger.warn(
        {
          failedConditionIds: failed.map((r) => r.conditionId.slice(0, 20) + '...'),
          errors: failed.map((r) => r.error),
        },
        'Some redemptions failed'
      );
    }

    // Log successful transaction hashes
    if (successful.length > 0 && !dryRun) {
      logger.info(
        {
          transactions: successful.map((r) => r.transactionHash).filter(Boolean),
        },
        'Successful redemption transactions'
      );
    }
  } catch (error) {
    logger.error({ error }, 'Error in redeem cycle');
  }
}

async function main() {
  logger.info('Starting auto-redeem service');

  // Load and validate config
  const config = getConfig();

  logger.info(
    {
      safeAddress: config.GNOSIS_SAFE_ADDRESS,
      dryRun: config.DRY_RUN,
      intervalMs: REDEEM_INTERVAL_MS,
    },
    'Configuration loaded'
  );

  if (config.DRY_RUN) {
    logger.warn('DRY RUN MODE - No real redemptions will be executed');
  }

  // Initialize redeem service
  const redeemService = new RedeemService(config);

  // Set up graceful shutdown
  let isShuttingDown = false;

  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info('Shutting down redeem service');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Run first cycle immediately
  await runRedeemCycle(redeemService, config.GNOSIS_SAFE_ADDRESS, config.DRY_RUN);

  // If RUN_ONCE mode, exit after first cycle
  if (RUN_ONCE) {
    logger.info('RUN_ONCE mode - exiting after first cycle');
    process.exit(0);
  }

  // Main loop - run every minute
  logger.info('Entering main loop (checking every 60s)...');

  while (!isShuttingDown) {
    await new Promise((resolve) => setTimeout(resolve, REDEEM_INTERVAL_MS));
    if (!isShuttingDown) {
      await runRedeemCycle(redeemService, config.GNOSIS_SAFE_ADDRESS, config.DRY_RUN);
    }
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error in auto-redeem service');
  process.exit(1);
});

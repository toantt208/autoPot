/**
 * Stop-Loss Service
 *
 * Monitors open positions and triggers sells when stop-loss conditions are met.
 * Condition: sell price of bought token < 45% (position is losing)
 */

import { TradingClient } from '../clients/trading-client.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import {
  getActivePositions,
  deletePosition,
  type StoredPosition,
} from './position-store.js';
import type { Config } from '../config/index.js';

// Stop-loss configuration
const STOP_LOSS_CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
const STOP_LOSS_THRESHOLD = 0.45; // Sell if bought token's sell price < 45%
const TX_CONFIRM_TIMEOUT_MS = 30000;
const TX_POLL_INTERVAL_MS = 2000;

export interface StopLossResult {
  positionKey: string;
  sold: boolean;
  sellPrice?: number;
  txHash?: string;
  error?: string;
  reason?: string; // 'threshold_triggered' | 'window_expired' | 'error'
}

/**
 * Check if position is within valid monitoring window
 * Only monitor from position creation until market close
 */
function isWithinMonitoringWindow(position: StoredPosition): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now < position.marketCloseTime;
}

/**
 * Confirm sell transaction on-chain
 */
async function confirmSellTx(
  tradingClient: TradingClient,
  txHash: string
): Promise<boolean> {
  const provider = tradingClient.getProvider();
  const startTime = Date.now();

  logger.info({ txHash, timeout: `${TX_CONFIRM_TIMEOUT_MS / 1000}s` }, 'Confirming sell tx on-chain...');

  while (Date.now() - startTime < TX_CONFIRM_TIMEOUT_MS) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt && receipt.blockNumber) {
        if (receipt.status === 1) {
          logger.info({ txHash, blockNumber: receipt.blockNumber }, 'Sell TX confirmed on-chain!');
          return true;
        } else {
          logger.warn({ txHash, status: receipt.status }, 'Sell TX failed on-chain');
          return false;
        }
      }
    } catch (error: any) {
      // Continue polling on error
    }
    await sleep(TX_POLL_INTERVAL_MS);
  }

  logger.warn({ txHash, elapsed: `${(Date.now() - startTime) / 1000}s` }, 'Sell TX confirmation timeout');
  return false;
}

/**
 * Execute sell for a position
 */
async function executeSell(
  tradingClient: TradingClient,
  position: StoredPosition,
  config: Config
): Promise<StopLossResult> {
  try {
    logger.info(
      {
        key: position.key,
        side: position.sideBought,
        tokenId: position.tokenIdBought.slice(0, 20) + '...',
        amount: position.amount,
      },
      'Executing stop-loss sell'
    );

    // Calculate token amount to sell
    // amount is USDC spent, tokens = USDC / price
    const tokensToSell = position.amount / position.entryPrice;

    const result = await tradingClient.marketSell({
      tokenId: position.tokenIdBought,
      amount: tokensToSell,
      negRisk: position.negRisk,
      tickSize: position.tickSize,
    });

    logger.info(result, 'Sell order result');
    const txHash = result?.transactionsHashes?.[0];

    if (txHash) {
      const confirmed = await confirmSellTx(tradingClient, txHash);
      if (confirmed) {
        // Delete position from Redis after successful sell
        await deletePosition(position.key);
        return {
          positionKey: position.key,
          sold: true,
          txHash,
          reason: 'threshold_triggered',
        };
      }
    }

    if (result.status === 'DRY_RUN') {
      await deletePosition(position.key);
      return {
        positionKey: position.key,
        sold: true,
        reason: 'threshold_triggered',
      };
    }

    // Check for API error
    if (result.error) {
      return {
        positionKey: position.key,
        sold: false,
        error: result.error,
      };
    }

    return {
      positionKey: position.key,
      sold: false,
      error: 'Sell order not matched',
    };
  } catch (error: any) {
    return {
      positionKey: position.key,
      sold: false,
      error: error?.message || String(error),
    };
  }
}

/**
 * Check a single position for stop-loss trigger
 */
async function checkPosition(
  tradingClient: TradingClient,
  position: StoredPosition,
  config: Config
): Promise<StopLossResult | null> {
  // Skip if outside monitoring window
  if (!isWithinMonitoringWindow(position)) {
    logger.debug({ key: position.key }, 'Position outside monitoring window, cleaning up');
    // Clean up expired positions
    await deletePosition(position.key);
    return {
      positionKey: position.key,
      sold: false,
      reason: 'window_expired',
    };
  }

  // Get SELL prices for both tokens
  const { upSellPrice, downSellPrice } = await tradingClient.getBatchSellPrices(
    position.upTokenId,
    position.downTokenId
  );

  // Get the sell price of the token we bought
  const boughtTokenSellPrice = position.sideBought === 'UP' ? upSellPrice : downSellPrice;
  const timeToClose = position.marketCloseTime - Math.floor(Date.now() / 1000);

  logger.info(
    {
      key: position.key,
      side: position.sideBought,
      boughtSellPrice: `${(boughtTokenSellPrice * 100).toFixed(2)}%`,
      upSellPrice: `${(upSellPrice * 100).toFixed(2)}%`,
      downSellPrice: `${(downSellPrice * 100).toFixed(2)}%`,
      threshold: `<${(STOP_LOSS_THRESHOLD * 100).toFixed(0)}%`,
      timeToClose: `${timeToClose}s`,
    },
    'Stop-loss price check'
  );

  // Check stop-loss condition: bought token sell price < 45%
  if (boughtTokenSellPrice < STOP_LOSS_THRESHOLD) {
    logger.info(
      {
        key: position.key,
        side: position.sideBought,
        boughtSellPrice: `${(boughtTokenSellPrice * 100).toFixed(2)}%`,
        threshold: `<${(STOP_LOSS_THRESHOLD * 100).toFixed(0)}%`,
      },
      'Stop-loss TRIGGERED! Position losing (SELL DISABLED FOR TESTING)'
    );

    // TODO: Uncomment to enable actual selling
    // return await executeSell(tradingClient, position, config);
    return null; // Testing mode - just log, don't sell
  }

  return null; // No action needed
}

/**
 * Main stop-loss monitoring loop
 * Runs continuously, checking positions every 5 seconds
 */
export async function runStopLossMonitor(
  tradingClient: TradingClient,
  config: Config,
  positionPrefix: string = 'xrp'
): Promise<void> {
  logger.info(
    {
      prefix: positionPrefix,
      interval: `${STOP_LOSS_CHECK_INTERVAL_MS / 1000}s`,
      threshold: `<${(STOP_LOSS_THRESHOLD * 100).toFixed(0)}%`,
    },
    'Starting stop-loss monitor (sell if bought token price drops below threshold)'
  );

  while (true) {
    try {
      // Get all active positions
      const positions = await getActivePositions(positionPrefix);

      if (positions.length === 0) {
        logger.debug('No active positions to monitor');
      } else {
        logger.debug({ count: positions.length }, 'Checking active positions');

        // Check each position
        for (const position of positions) {
          const result = await checkPosition(tradingClient, position, config);

          if (result?.sold) {
            logger.info(
              {
                key: result.positionKey,
                txHash: result.txHash,
                reason: result.reason,
              },
              'Position sold via stop-loss!'
            );
          } else if (result?.error) {
            logger.warn(
              {
                key: result.positionKey,
                error: result.error,
              },
              'Stop-loss sell failed'
            );
          } else if (result?.reason === 'window_expired') {
            logger.info(
              { key: result.positionKey },
              'Position window expired, removed'
            );
          }
        }
      }
    } catch (error: any) {
      logger.error({ error: error?.message }, 'Error in stop-loss monitor loop');
    }

    await sleep(STOP_LOSS_CHECK_INTERVAL_MS);
  }
}

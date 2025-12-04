/**
 * Trade Executor Service
 *
 * Executes trades with retry logic, order status polling, and RPC transaction confirmation.
 * Uses Promise.race between CLOB order polling and RPC receipt checking (like polygun-bot).
 */

import { TradingClient } from '../clients/trading-client.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { TradingSignal, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';

const RETRY_DELAY_MS = 0;
const ORDER_POLL_INTERVAL_MS = 500;
const RPC_POLL_INTERVAL_MS = 1000;
const MAX_CONFIRMATION_TIMEOUT_MS = 15000; // Max 15 seconds per confirmation attempt
const RETRY_AFTER_END_SECONDS = 10; // Continue retrying for 15 seconds after market closes

interface ConfirmationResult {
  confirmed: boolean;
  status: string;
  transactionHash?: string;
}

/**
 * Poll order status and get transaction hash when filled
 */
async function pollOrderStatus(
  tradingClient: TradingClient,
  orderId: string,
  isAborted: () => boolean
): Promise<ConfirmationResult> {
  const client = tradingClient.getClobClient();

  while (!isAborted()) {
    try {
      const order = await client.getOrder(orderId);
      const status = order?.status || 'UNKNOWN';

      logger.debug({ orderId, status, associateTrades: order?.associate_trades }, 'Order status check');

      // Check for filled - get transaction hash from trades
      if (status === 'MATCHED' || status === 'FILLED') {
        let txHash: string | undefined;

        // Get transaction hash from associated trades
        if (order?.associate_trades?.length > 0) {
          try {
            const trades = await client.getTrades({ id: order.associate_trades[0] });
            if (trades?.length > 0 && trades[0].transaction_hash) {
              txHash = trades[0].transaction_hash;
              logger.info({ orderId, txHash }, 'Got transaction hash from trade');
            }
          } catch (e) {
            logger.debug({ orderId, error: e }, 'Could not fetch trade details');
          }
        }

        return { confirmed: true, status, transactionHash: txHash };
      }

      // Check for terminal failure states
      if (status === 'CANCELED' || status === 'EXPIRED' || status === 'REJECTED') {
        return { confirmed: false, status };
      }

      await sleep(ORDER_POLL_INTERVAL_MS);
    } catch (error) {
      logger.debug({ orderId, error }, 'Error checking order status');
      await sleep(ORDER_POLL_INTERVAL_MS);
    }
  }

  return { confirmed: false, status: 'ABORTED' };
}

/**
 * Poll RPC for transaction receipt confirmation
 */
async function pollRpcReceipt(
  tradingClient: TradingClient,
  txHash: string,
  isAborted: () => boolean
): Promise<ConfirmationResult> {
  const provider = tradingClient.getProvider();

  while (!isAborted()) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (receipt && receipt.blockNumber) {
        // Check transaction status (1 = success, 0 = reverted)
        if (receipt.status === 0) {
          logger.warn({ txHash }, 'Transaction reverted on-chain');
          return { confirmed: false, status: 'REVERTED', transactionHash: txHash };
        }

        logger.info(
          { txHash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed?.toString() },
          'Transaction confirmed on-chain'
        );
        return { confirmed: true, status: 'CONFIRMED', transactionHash: txHash };
      }
    } catch (error) {
      logger.debug({ txHash, error }, 'Error checking RPC receipt');
    }

    await sleep(RPC_POLL_INTERVAL_MS);
  }

  return { confirmed: false, status: 'ABORTED', transactionHash: txHash };
}

/**
 * Wait for order confirmation using Promise.race between CLOB polling and RPC
 */
async function waitForConfirmation(
  tradingClient: TradingClient,
  orderId: string,
  timeoutMs: number
): Promise<ConfirmationResult> {
  let aborted = false;
  const isAborted = () => aborted;

  // Start order polling
  const orderPollPromise = pollOrderStatus(tradingClient, orderId, isAborted);

  // Timeout promise
  const timeoutPromise = sleep(timeoutMs).then(() => ({
    confirmed: false,
    status: 'TIMEOUT',
  }));

  // First, race between order polling and timeout to get initial status
  const initialResult = await Promise.race([
    orderPollPromise.then(async (result) => {
      // If we got a tx hash, start RPC polling too
      if (result.confirmed && result.transactionHash) {
        const rpcPromise = pollRpcReceipt(tradingClient, result.transactionHash, isAborted);

        // Race between order confirmation and RPC confirmation
        const rpcResult = await Promise.race([
          rpcPromise,
          sleep(10000).then(() => result), // Give RPC 10s max, fallback to order result
        ]);

        aborted = true;
        return rpcResult.confirmed ? rpcResult : result;
      }
      return result;
    }),
    timeoutPromise,
  ]);

  aborted = true;
  return initialResult;
}

/**
 * Execute trade with retry until window ends + grace period
 * Keeps retrying until 15 seconds after market closes
 */
export async function executeTrade(
  tradingClient: TradingClient,
  signal: TradingSignal,
  config: Config
): Promise<TradeResult> {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = signal.windowEndTime - now;
  const retryDeadline = signal.windowEndTime + RETRY_AFTER_END_SECONDS;

  logger.info(
    {
      side: signal.side,
      tokenId: signal.tokenId.slice(0, 20) + '...',
      price: signal.price,
      amount: config.BET_AMOUNT_USDC,
      marketSlug: signal.marketSlug,
      windowEndTime: signal.windowEndTime,
      retryDeadline,
      timeLeft: `${timeLeft}s`,
    },
    'Executing trade'
  );

  let lastError: string | undefined;
  let lastOrderId: string | undefined;
  let lastTxHash: string | undefined;
  let attempt = 0;

  // Keep retrying until 15 seconds after window ends
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    attempt++;
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = retryDeadline - currentTime;
    const isAfterClose = currentTime >= signal.windowEndTime;

    try {
      logger.info(
        { attempt, remainingTime: `${remainingTime}s`, afterClose: isAfterClose },
        isAfterClose ? 'Trade attempt (grace period)' : 'Trade attempt'
      );

      // Place the order
      const orderResult = await tradingClient.marketBuy({
        tokenId: signal.tokenId,
        amount: config.BET_AMOUNT_USDC,
        negRisk: signal.negRisk,
        tickSize: signal.tickSize,
      });

      const orderId = orderResult.orderID;
      lastOrderId = orderId;

      logger.info(
        {
          orderId,
          status: orderResult.status,
          attempt,
        },
        'Order placed'
      );

      // If dry run, return immediately
      if (orderResult.status === 'DRY_RUN') {
        return {
          success: true,
          orderId,
          marketSlug: signal.marketSlug,
          side: signal.side,
        };
      }

      // Check immediate status
      if (orderResult.status === 'MATCHED' || orderResult.status === 'FILLED') {
        logger.info({ orderId, status: orderResult.status }, 'Order filled immediately');

        // Calculate confirmation timeout based on remaining time until retry deadline (max 15s)
        const confirmationTimeout = Math.min(
          MAX_CONFIRMATION_TIMEOUT_MS,
          (retryDeadline - Math.floor(Date.now() / 1000)) * 1000
        );

        // Still wait for RPC confirmation
        const confirmation = await waitForConfirmation(tradingClient, orderId, confirmationTimeout);
        lastTxHash = confirmation.transactionHash;

        return {
          success: true,
          orderId,
          transactionHash: confirmation.transactionHash,
          marketSlug: signal.marketSlug,
          side: signal.side,
        };
      }

      if (orderResult.status === 'REJECTED' || orderResult.status === 'CANCELED') {
        lastError = `Order ${orderResult.status}`;
        logger.warn(
          { orderId, status: orderResult.status, attempt, remainingTime: `${remainingTime}s`, afterClose: isAfterClose },
          'Order rejected, retrying...'
        );
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      // For LIVE or PENDING status, wait for confirmation
      if (orderId) {
        logger.info({ orderId }, 'Waiting for order confirmation (CLOB + RPC)...');

        // Calculate confirmation timeout based on remaining time until retry deadline (max 15s)
        const confirmationTimeout = Math.min(
          MAX_CONFIRMATION_TIMEOUT_MS,
          (retryDeadline - Math.floor(Date.now() / 1000)) * 1000
        );

        const confirmation = await waitForConfirmation(tradingClient, orderId, confirmationTimeout);
        lastTxHash = confirmation.transactionHash;

        if (confirmation.confirmed) {
          logger.info(
            {
              orderId,
              status: confirmation.status,
              transactionHash: confirmation.transactionHash,
              marketSlug: signal.marketSlug,
              side: signal.side,
            },
            'Trade confirmed!'
          );
          return {
            success: true,
            orderId,
            transactionHash: confirmation.transactionHash,
            marketSlug: signal.marketSlug,
            side: signal.side,
          };
        }

        lastError = `Order status: ${confirmation.status}`;
        logger.warn(
          { orderId, status: confirmation.status, txHash: confirmation.transactionHash, attempt, remainingTime: `${remainingTime}s`, afterClose: isAfterClose },
          'Order not confirmed, retrying...'
        );
      }

      await sleep(RETRY_DELAY_MS);
    } catch (error: any) {
      lastError = error?.message || String(error);
      const remainingTimeNow = retryDeadline - Math.floor(Date.now() / 1000);
      const isAfterCloseNow = Math.floor(Date.now() / 1000) >= signal.windowEndTime;
      logger.warn({ error: lastError, attempt, remainingTime: `${remainingTimeNow}s`, afterClose: isAfterCloseNow }, 'Trade attempt failed');
      await sleep(RETRY_DELAY_MS);
    }
  }

  // Retry deadline reached
  logger.error(
    {
      marketSlug: signal.marketSlug,
      side: signal.side,
      lastOrderId,
      lastTxHash,
      lastError,
      attempts: attempt,
    },
    'Trade failed - retry deadline reached'
  );

  return {
    success: false,
    orderId: lastOrderId,
    transactionHash: lastTxHash,
    error: lastError || 'Window ended without successful trade',
    marketSlug: signal.marketSlug,
    side: signal.side,
  };
}

/**
 * Trade tracker to prevent duplicate trades on the same market
 */
export class TradeTracker {
  private tradedMarkets: Map<string, TradeResult> = new Map();
  private skippedMarkets: Set<string> = new Set();

  /**
   * Check if we've already traded this market
   */
  hasTraded(marketSlug: string): boolean {
    return this.tradedMarkets.has(marketSlug);
  }

  /**
   * Check if we've skipped this market
   */
  hasSkipped(marketSlug: string): boolean {
    return this.skippedMarkets.has(marketSlug);
  }

  /**
   * Check if we've processed this market (traded or skipped)
   */
  hasProcessed(marketSlug: string): boolean {
    return this.hasTraded(marketSlug) || this.hasSkipped(marketSlug);
  }

  /**
   * Mark a market as traded
   */
  markTraded(marketSlug: string, result: TradeResult): void {
    this.tradedMarkets.set(marketSlug, result);
    logger.debug({ marketSlug, result }, 'Market marked as traded');
  }

  /**
   * Mark a market as skipped (no qualifying price found)
   */
  markSkipped(marketSlug: string): void {
    this.skippedMarkets.add(marketSlug);
    logger.debug({ marketSlug }, 'Market marked as skipped');
  }

  /**
   * Get trade result for a market
   */
  getTradeResult(marketSlug: string): TradeResult | undefined {
    return this.tradedMarkets.get(marketSlug);
  }

  /**
   * Get all traded markets
   */
  getAllTrades(): Map<string, TradeResult> {
    return new Map(this.tradedMarkets);
  }

  /**
   * Clean up old entries (markets older than specified hours)
   */
  cleanup(maxAgeHours: number = 24): void {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - maxAgeHours * 3600;

    // Clean traded markets
    for (const [slug] of this.tradedMarkets) {
      // Extract timestamp from slug (e.g., btc-updown-15m-1764690300)
      const parts = slug.split('-');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (timestamp < cutoffTimestamp) {
        this.tradedMarkets.delete(slug);
      }
    }

    // Clean skipped markets
    for (const slug of this.skippedMarkets) {
      const parts = slug.split('-');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (timestamp < cutoffTimestamp) {
        this.skippedMarkets.delete(slug);
      }
    }

    logger.debug(
      { tradedCount: this.tradedMarkets.size, skippedCount: this.skippedMarkets.size },
      'Trade tracker cleaned up'
    );
  }

  /**
   * Get statistics
   */
  getStats(): { tradedCount: number; skippedCount: number; successCount: number } {
    let successCount = 0;
    for (const result of this.tradedMarkets.values()) {
      if (result.success) successCount++;
    }

    return {
      tradedCount: this.tradedMarkets.size,
      skippedCount: this.skippedMarkets.size,
      successCount,
    };
  }
}

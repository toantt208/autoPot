/**
 * Iceberg Order Executor Service
 *
 * Splits large orders into smaller chunks to minimize market impact.
 * Used by AVWA strategy for anti-slippage execution.
 */

import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { TradingClient } from '../clients/trading-client.js';
import type { TokenIds } from '../types/index.js';
import { analyzeOrderbookDepth } from './orderbook-analyzer.js';

export interface IcebergConfig {
  /** Total amount in USDC to buy */
  totalAmount: number;
  /** Size of each chunk in USDC */
  chunkSize: number;
  /** Maximum slippage tolerance per chunk (0.005 = 0.5%) */
  maxSlippage: number;
  /** Delay between chunks in ms */
  delayBetweenChunksMs: number;
  /** Maximum number of retries per chunk */
  maxRetriesPerChunk: number;
  /** Whether to abort if a chunk fails */
  abortOnFailure: boolean;
}

export interface ChunkResult {
  chunkIndex: number;
  success: boolean;
  tokens: number;
  spent: number;
  price: number;
  slippage: number;
  orderId?: string;
  error?: string;
}

export interface IcebergResult {
  success: boolean;
  totalTokens: number;
  totalSpent: number;
  avgPrice: number;
  chunksExecuted: number;
  chunksTotal: number;
  slippageIncurred: number;
  chunks: ChunkResult[];
  aborted: boolean;
  abortReason?: string;
}

const DEFAULT_CONFIG: IcebergConfig = {
  totalAmount: 100,
  chunkSize: 50,
  maxSlippage: 0.005,
  delayBetweenChunksMs: 200,
  maxRetriesPerChunk: 2,
  abortOnFailure: false,
};

/**
 * Execute an iceberg order (split large order into chunks)
 */
export async function executeIcebergOrder(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  side: 'UP' | 'DOWN',
  config: Partial<IcebergConfig>
): Promise<IcebergResult> {
  const cfg: IcebergConfig = { ...DEFAULT_CONFIG, ...config };
  const tokenId = side === 'UP' ? tokenIds.up : tokenIds.down;

  const numChunks = Math.ceil(cfg.totalAmount / cfg.chunkSize);
  const chunks: ChunkResult[] = [];

  let totalTokens = 0;
  let totalSpent = 0;
  let chunksExecuted = 0;
  let aborted = false;
  let abortReason: string | undefined;

  logger.info(
    {
      side,
      totalAmount: '$' + cfg.totalAmount.toFixed(2),
      chunkSize: '$' + cfg.chunkSize.toFixed(2),
      numChunks,
      maxSlippage: (cfg.maxSlippage * 100).toFixed(2) + '%',
    },
    'Starting iceberg execution'
  );

  for (let i = 0; i < numChunks && !aborted; i++) {
    const remainingAmount = cfg.totalAmount - totalSpent;
    const chunkAmount = Math.min(cfg.chunkSize, remainingAmount);

    if (chunkAmount < 1) {
      logger.debug({ chunkIndex: i, remainingAmount }, 'Remaining amount too small, stopping');
      break;
    }

    // Analyze depth before each chunk
    const depth = await analyzeOrderbookDepth(tradingClient, tokenId, chunkAmount, 'BUY', cfg.maxSlippage);

    // Check slippage
    if (depth.expectedSlippage > cfg.maxSlippage) {
      logger.warn(
        {
          chunkIndex: i,
          expectedSlippage: (depth.expectedSlippage * 100).toFixed(3) + '%',
          maxSlippage: (cfg.maxSlippage * 100).toFixed(2) + '%',
        },
        'Slippage too high, waiting...'
      );

      // Wait and retry once
      await sleep(500);
      const retryDepth = await analyzeOrderbookDepth(tradingClient, tokenId, chunkAmount, 'BUY', cfg.maxSlippage);

      if (retryDepth.expectedSlippage > cfg.maxSlippage) {
        chunks.push({
          chunkIndex: i,
          success: false,
          tokens: 0,
          spent: 0,
          price: 0,
          slippage: retryDepth.expectedSlippage,
          error: `Slippage ${(retryDepth.expectedSlippage * 100).toFixed(2)}% exceeds max ${(cfg.maxSlippage * 100).toFixed(2)}%`,
        });

        if (cfg.abortOnFailure) {
          aborted = true;
          abortReason = 'Slippage too high';
        }
        continue;
      }
    }

    // Execute the chunk
    let chunkResult: ChunkResult | null = null;
    let retries = 0;

    while (retries < cfg.maxRetriesPerChunk && !chunkResult?.success) {
      try {
        const result = await tradingClient.marketBuy({
          tokenId,
          amount: chunkAmount,
          negRisk: tokenIds.negRisk,
          tickSize: tokenIds.tickSize,
          orderType: 'FAK', // Fill And Kill for partial fills
        });

        const txHash = result?.transactionsHashes?.[0];
        const tokensReceived = parseFloat((result as any).takingAmount || '0');
        const usdcSpent = parseFloat((result as any).makingAmount || String(chunkAmount));
        const actualPrice = tokensReceived > 0 ? usdcSpent / tokensReceived : depth.bestPrice;
        const actualSlippage = tokensReceived > 0 ? (actualPrice - depth.bestPrice) / depth.bestPrice : 0;

        if (txHash && tokensReceived > 0) {
          chunkResult = {
            chunkIndex: i,
            success: true,
            tokens: tokensReceived,
            spent: usdcSpent,
            price: actualPrice,
            slippage: actualSlippage,
            orderId: result.orderID,
          };

          totalTokens += tokensReceived;
          totalSpent += usdcSpent;
          chunksExecuted++;

          logger.debug(
            {
              chunkIndex: i + 1,
              of: numChunks,
              spent: '$' + usdcSpent.toFixed(2),
              tokens: tokensReceived.toFixed(4),
              slippage: (actualSlippage * 100).toFixed(3) + '%',
            },
            'Chunk executed'
          );
        } else {
          throw new Error('No transaction hash or tokens received');
        }
      } catch (error: any) {
        retries++;
        logger.warn(
          { chunkIndex: i, retry: retries, error: error.message },
          'Chunk execution failed, retrying...'
        );

        if (retries < cfg.maxRetriesPerChunk) {
          await sleep(200);
        }
      }
    }

    if (!chunkResult?.success) {
      chunkResult = {
        chunkIndex: i,
        success: false,
        tokens: 0,
        spent: 0,
        price: 0,
        slippage: 0,
        error: 'Failed after retries',
      };

      if (cfg.abortOnFailure) {
        aborted = true;
        abortReason = 'Chunk execution failed';
      }
    }

    chunks.push(chunkResult);

    // Delay between chunks (except for last)
    if (i < numChunks - 1 && !aborted) {
      await sleep(cfg.delayBetweenChunksMs);
    }
  }

  const avgPrice = totalSpent > 0 ? totalSpent / totalTokens : 0;
  const overallSlippage = chunks.filter((c) => c.success).reduce((sum, c) => sum + c.slippage * c.spent, 0);
  const weightedSlippage = totalSpent > 0 ? overallSlippage / totalSpent : 0;

  const result: IcebergResult = {
    success: totalSpent > 0,
    totalTokens,
    totalSpent,
    avgPrice,
    chunksExecuted,
    chunksTotal: numChunks,
    slippageIncurred: weightedSlippage,
    chunks,
    aborted,
    abortReason,
  };

  logger.info(
    {
      success: result.success,
      chunksExecuted: `${chunksExecuted}/${numChunks}`,
      totalSpent: '$' + totalSpent.toFixed(2),
      totalTokens: totalTokens.toFixed(4),
      avgPrice: (avgPrice * 100).toFixed(2) + '%',
      slippage: (weightedSlippage * 100).toFixed(3) + '%',
      aborted,
    },
    'Iceberg execution complete'
  );

  return result;
}

/**
 * Execute a buy with anti-slippage measures
 *
 * Decides whether to use direct execution or iceberg based on order size and depth
 */
export async function executeBuyWithAntiSlippage(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  side: 'UP' | 'DOWN',
  amount: number,
  currentPrice: number,
  maxSlippage: number = 0.005,
  icebergThreshold: number = 100,
  icebergChunkSize: number = 50
): Promise<{ success: boolean; tokens: number; spent: number; slippage: number; isIceberg: boolean }> {
  const tokenId = side === 'UP' ? tokenIds.up : tokenIds.down;

  // Analyze orderbook depth
  const depth = await analyzeOrderbookDepth(tradingClient, tokenId, amount, 'BUY', maxSlippage);

  // Decide execution strategy
  const useIceberg = amount > icebergThreshold || !depth.hasAdequateDepth;

  if (useIceberg) {
    logger.info(
      {
        amount: '$' + amount.toFixed(2),
        reason: amount > icebergThreshold ? 'Large order' : 'Thin orderbook',
        expectedSlippage: (depth.expectedSlippage * 100).toFixed(2) + '%',
      },
      'Using iceberg execution'
    );

    const result = await executeIcebergOrder(tradingClient, tokenIds, side, {
      totalAmount: amount,
      chunkSize: icebergChunkSize,
      maxSlippage,
      delayBetweenChunksMs: 200,
      maxRetriesPerChunk: 2,
      abortOnFailure: false,
    });

    return {
      success: result.success,
      tokens: result.totalTokens,
      spent: result.totalSpent,
      slippage: result.slippageIncurred,
      isIceberg: true,
    };
  }

  // Direct execution
  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk: tokenIds.negRisk,
      tickSize: tokenIds.tickSize,
      orderType: 'FAK',
    });

    const txHash = result?.transactionsHashes?.[0];
    const tokensReceived = parseFloat((result as any).takingAmount || '0');
    const usdcSpent = parseFloat((result as any).makingAmount || String(amount));
    const actualSlippage = tokensReceived > 0 ? (usdcSpent / tokensReceived - currentPrice) / currentPrice : 0;

    if (txHash && tokensReceived > 0) {
      logger.debug(
        {
          side,
          spent: '$' + usdcSpent.toFixed(2),
          tokens: tokensReceived.toFixed(4),
          slippage: (actualSlippage * 100).toFixed(3) + '%',
        },
        'Direct execution complete'
      );

      return {
        success: true,
        tokens: tokensReceived,
        spent: usdcSpent,
        slippage: actualSlippage,
        isIceberg: false,
      };
    }

    return { success: false, tokens: 0, spent: 0, slippage: 0, isIceberg: false };
  } catch (error: any) {
    logger.error({ error: error.message, side, amount }, 'Direct execution failed');
    return { success: false, tokens: 0, spent: 0, slippage: 0, isIceberg: false };
  }
}

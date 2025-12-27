/**
 * Orderbook Analyzer Service
 *
 * Analyzes orderbook depth to prevent slippage on large orders.
 * Used by AVWA strategy for intelligent order execution.
 */

import { logger } from '../utils/logger.js';
import type { TradingClient } from '../clients/trading-client.js';

export interface OrderbookLevel {
  price: number;
  size: number;
}

export interface OrderbookDepth {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  totalBidDepth: number;
  totalAskDepth: number;
}

export interface DepthAnalysis {
  /** Whether orderbook has adequate liquidity for the order */
  hasAdequateDepth: boolean;
  /** Expected slippage as decimal (0.005 = 0.5%) */
  expectedSlippage: number;
  /** Recommended number of chunks for iceberg execution */
  recommendedChunks: number;
  /** Maximum order size that can be filled with minimal slippage */
  maxSafeOrderSize: number;
  /** Expected average fill price */
  expectedFillPrice: number;
  /** Best available price (top of book) */
  bestPrice: number;
  /** Total liquidity available up to max slippage threshold */
  availableLiquidity: number;
}

/**
 * Parse raw orderbook response from CLOB
 */
function parseOrderbook(orderbook: any): OrderbookDepth {
  const bids: OrderbookLevel[] = [];
  const asks: OrderbookLevel[] = [];

  // Parse bids (buy orders - people wanting to buy from us)
  if (orderbook?.bids && Array.isArray(orderbook.bids)) {
    for (const level of orderbook.bids) {
      bids.push({
        price: parseFloat(level.price || level[0] || '0'),
        size: parseFloat(level.size || level[1] || '0'),
      });
    }
  }

  // Parse asks (sell orders - people wanting to sell to us)
  if (orderbook?.asks && Array.isArray(orderbook.asks)) {
    for (const level of orderbook.asks) {
      asks.push({
        price: parseFloat(level.price || level[0] || '0'),
        size: parseFloat(level.size || level[1] || '0'),
      });
    }
  }

  // Sort: bids descending (highest first), asks ascending (lowest first)
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  const totalBidDepth = bids.reduce((sum, l) => sum + l.size * l.price, 0);
  const totalAskDepth = asks.reduce((sum, l) => sum + l.size * l.price, 0);

  return { bids, asks, totalBidDepth, totalAskDepth };
}

/**
 * Analyze orderbook depth for a potential order
 *
 * @param tradingClient - Trading client instance
 * @param tokenId - Token ID to analyze
 * @param orderAmount - Order amount in USDC
 * @param side - BUY or SELL
 * @param maxSlippage - Maximum acceptable slippage (default 0.5%)
 */
export async function analyzeOrderbookDepth(
  tradingClient: TradingClient,
  tokenId: string,
  orderAmount: number,
  side: 'BUY' | 'SELL',
  maxSlippage: number = 0.005
): Promise<DepthAnalysis> {
  try {
    // Fetch orderbook from CLOB
    const rawOrderbook = await (tradingClient as any).client.getOrderBook(tokenId);

    if (!rawOrderbook) {
      logger.warn({ tokenId }, 'No orderbook available');
      return createEmptyAnalysis(maxSlippage);
    }

    const orderbook = parseOrderbook(rawOrderbook);

    // For BUY orders, we hit the asks (people selling to us)
    // For SELL orders, we hit the bids (people buying from us)
    const relevantSide = side === 'BUY' ? orderbook.asks : orderbook.bids;

    if (relevantSide.length === 0) {
      logger.warn({ tokenId, side }, 'No liquidity on relevant side');
      return createEmptyAnalysis(maxSlippage);
    }

    const bestPrice = relevantSide[0].price;

    // Simulate filling the order and calculate slippage
    let remainingAmount = orderAmount;
    let totalTokens = 0;
    let totalCost = 0;
    let availableLiquidity = 0;

    for (const level of relevantSide) {
      const levelCost = level.price * level.size;

      // Calculate how much is within acceptable slippage
      const priceSlippage = (level.price - bestPrice) / bestPrice;
      if (Math.abs(priceSlippage) <= maxSlippage) {
        availableLiquidity += levelCost;
      }

      if (remainingAmount <= 0) continue;

      if (levelCost >= remainingAmount) {
        // This level can fill the rest
        const tokensFromLevel = remainingAmount / level.price;
        totalTokens += tokensFromLevel;
        totalCost += remainingAmount;
        remainingAmount = 0;
      } else {
        // Take all from this level
        totalTokens += level.size;
        totalCost += levelCost;
        remainingAmount -= levelCost;
      }
    }

    // Calculate metrics
    const expectedFillPrice = totalTokens > 0 ? totalCost / totalTokens : bestPrice;
    const expectedSlippage = totalTokens > 0 ? (expectedFillPrice - bestPrice) / bestPrice : 0;
    const hasAdequateDepth = expectedSlippage <= maxSlippage && remainingAmount === 0;

    // Recommend chunking based on order size vs first level
    const firstLevelSize = relevantSide[0].size * relevantSide[0].price;
    const recommendedChunks = Math.min(
      Math.ceil(orderAmount / (firstLevelSize * 0.3)), // Max 30% of first level per chunk
      10 // Cap at 10 chunks
    );

    // Max safe order is 30% of first level
    const maxSafeOrderSize = firstLevelSize * 0.3;

    const analysis: DepthAnalysis = {
      hasAdequateDepth,
      expectedSlippage: Math.abs(expectedSlippage),
      recommendedChunks: Math.max(1, recommendedChunks),
      maxSafeOrderSize,
      expectedFillPrice,
      bestPrice,
      availableLiquidity,
    };

    logger.debug(
      {
        tokenId,
        orderAmount: '$' + orderAmount.toFixed(2),
        side,
        bestPrice: (bestPrice * 100).toFixed(2) + '%',
        expectedSlippage: (analysis.expectedSlippage * 100).toFixed(3) + '%',
        hasAdequateDepth,
        recommendedChunks: analysis.recommendedChunks,
        availableLiquidity: '$' + availableLiquidity.toFixed(2),
      },
      'Orderbook depth analysis'
    );

    return analysis;
  } catch (error: any) {
    logger.error({ error: error.message, tokenId }, 'Failed to analyze orderbook');
    return createEmptyAnalysis(maxSlippage);
  }
}

/**
 * Create empty analysis for when orderbook is unavailable
 */
function createEmptyAnalysis(maxSlippage: number): DepthAnalysis {
  return {
    hasAdequateDepth: false,
    expectedSlippage: maxSlippage + 0.01, // Exceed threshold
    recommendedChunks: 10,
    maxSafeOrderSize: 0,
    expectedFillPrice: 0,
    bestPrice: 0,
    availableLiquidity: 0,
  };
}

/**
 * Check if orderbook has enough liquidity for an order
 */
export async function hasEnoughLiquidity(
  tradingClient: TradingClient,
  tokenId: string,
  orderAmount: number,
  side: 'BUY' | 'SELL',
  maxSlippage: number = 0.005
): Promise<boolean> {
  const analysis = await analyzeOrderbookDepth(tradingClient, tokenId, orderAmount, side, maxSlippage);
  return analysis.hasAdequateDepth;
}

/**
 * Get recommended execution strategy for an order
 */
export async function getExecutionStrategy(
  tradingClient: TradingClient,
  tokenId: string,
  orderAmount: number,
  side: 'BUY' | 'SELL',
  maxSlippage: number = 0.005,
  icebergThreshold: number = 100
): Promise<{
  strategy: 'DIRECT' | 'ICEBERG' | 'WAIT';
  chunks: number;
  chunkSize: number;
  reason: string;
}> {
  const analysis = await analyzeOrderbookDepth(tradingClient, tokenId, orderAmount, side, maxSlippage);

  // No liquidity - wait
  if (analysis.availableLiquidity < orderAmount * 0.5) {
    return {
      strategy: 'WAIT',
      chunks: 0,
      chunkSize: 0,
      reason: `Insufficient liquidity: $${analysis.availableLiquidity.toFixed(2)} vs $${orderAmount.toFixed(2)} needed`,
    };
  }

  // Small order with adequate depth - direct execution
  if (orderAmount <= icebergThreshold && analysis.hasAdequateDepth) {
    return {
      strategy: 'DIRECT',
      chunks: 1,
      chunkSize: orderAmount,
      reason: `Direct execution: order $${orderAmount.toFixed(2)} <= threshold $${icebergThreshold}`,
    };
  }

  // Large order or thin orderbook - use iceberg
  const chunkSize = Math.min(
    icebergThreshold * 0.5, // Half of threshold
    analysis.maxSafeOrderSize,
    orderAmount / 2 // At least 2 chunks
  );
  const chunks = Math.ceil(orderAmount / chunkSize);

  return {
    strategy: 'ICEBERG',
    chunks,
    chunkSize,
    reason: analysis.hasAdequateDepth
      ? `Large order: splitting into ${chunks} chunks of $${chunkSize.toFixed(2)}`
      : `Thin orderbook: slippage ${(analysis.expectedSlippage * 100).toFixed(2)}% > ${(maxSlippage * 100).toFixed(2)}%`,
  };
}

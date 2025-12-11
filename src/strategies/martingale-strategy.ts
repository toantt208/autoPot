/**
 * Martingale Strategy
 *
 * Always bet on ONE side (configurable: UP or DOWN)
 * Entry at market open (50% price)
 * Double bet on loss, reset to base on win
 *
 * State is persisted to database for crash recovery
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import { TradeTracker } from '../services/trade-executor.js';
import { prisma } from '../db/index.js';
import {
  calculateMarketWindow,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

const RETRY_AFTER_CLOSE_SECS = 5;
const ENTRY_WINDOW_SECS = 60; // Enter within first 60 seconds of market open

export interface MartingaleState {
  id: bigint;
  currentBet: number;
  baseBet: number;
  targetSide: 'UP' | 'DOWN';
  totalProfit: number;
  wins: number;
  losses: number;
  currentStreak: number;
  maxStreak: number;
}

export interface StrategyResult {
  marketSlug: string;
  traded: boolean;
  tradeResult?: TradeResult;
  skipReason?: string;
}

/**
 * Check if we're within the entry window (first N seconds after market open)
 */
function isInEntryWindow(window: MarketWindow, now: number): boolean {
  const entryDeadline = window.startTime + ENTRY_WINDOW_SECS;
  return now >= window.startTime && now < entryDeadline;
}

/**
 * Check if we're within the market window
 */
function isInMarketWindow(window: MarketWindow, now: number): boolean {
  return now >= window.startTime && now < window.endTime;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('no orders found to match with fak order') ||
    lowerError === 'no match'
  );
}

/**
 * Get or create Martingale state from database
 */
export async function getOrCreateMartingaleState(
  crypto: string,
  interval: string,
  targetSide: 'UP' | 'DOWN',
  baseBet: number
): Promise<MartingaleState> {
  const existing = await prisma.martingaleState.findUnique({
    where: {
      crypto_interval_targetSide: {
        crypto: crypto.toUpperCase(),
        interval,
        targetSide,
      },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      currentBet: Number(existing.currentBet),
      baseBet: Number(existing.baseBet),
      targetSide: existing.targetSide as 'UP' | 'DOWN',
      totalProfit: Number(existing.totalProfit),
      wins: existing.wins,
      losses: existing.losses,
      currentStreak: existing.currentStreak,
      maxStreak: existing.maxStreak,
    };
  }

  // Create new state
  const created = await prisma.martingaleState.create({
    data: {
      crypto: crypto.toUpperCase(),
      interval,
      targetSide,
      baseBet,
      currentBet: baseBet,
      totalProfit: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      maxStreak: 0,
    },
  });

  return {
    id: created.id,
    currentBet: Number(created.currentBet),
    baseBet: Number(created.baseBet),
    targetSide: created.targetSide as 'UP' | 'DOWN',
    totalProfit: Number(created.totalProfit),
    wins: created.wins,
    losses: created.losses,
    currentStreak: created.currentStreak,
    maxStreak: created.maxStreak,
  };
}

/**
 * Save trade to database
 */
async function saveMartingaleTrade(
  stateId: bigint,
  marketSlug: string,
  crypto: string,
  targetSide: 'UP' | 'DOWN',
  betAmount: number,
  entryPrice: number,
  orderId?: string
): Promise<void> {
  await prisma.martingaleTrade.create({
    data: {
      stateId,
      marketSlug,
      crypto: crypto.toUpperCase(),
      targetSide,
      betAmount,
      entryPrice,
      orderId,
      resolved: false,
    },
  });
}

/**
 * Resolve pending trades by checking StatsWindow for final results
 */
export async function resolvePendingTrades(state: MartingaleState): Promise<void> {
  const pendingTrades = await prisma.martingaleTrade.findMany({
    where: {
      stateId: state.id,
      resolved: false,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (pendingTrades.length === 0) {
    return;
  }

  logger.info({ count: pendingTrades.length }, 'Checking pending Martingale trades');

  for (const trade of pendingTrades) {
    // Look up the final result from StatsWindow
    const statsWindow = await prisma.statsWindow.findUnique({
      where: { marketSlug: trade.marketSlug },
    });

    if (!statsWindow || !statsWindow.finalSide) {
      // Not resolved yet
      logger.debug({ marketSlug: trade.marketSlug }, 'Trade not resolved yet');
      continue;
    }

    const won = statsWindow.finalSide === trade.targetSide;
    const betAmount = Number(trade.betAmount);
    const profitUsd = won ? betAmount : -betAmount;

    // Update trade record
    await prisma.martingaleTrade.update({
      where: { id: trade.id },
      data: {
        finalSide: statsWindow.finalSide,
        won,
        profitUsd,
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    // Update state
    if (won) {
      state.totalProfit += betAmount;
      state.wins++;
      state.currentStreak = 0;
      state.currentBet = state.baseBet;
      logger.info(
        {
          marketSlug: trade.marketSlug,
          result: 'WIN',
          profit: betAmount,
          totalProfit: state.totalProfit,
          nextBet: state.baseBet,
        },
        'Martingale: Won! Resetting bet'
      );
    } else {
      state.totalProfit -= betAmount;
      state.losses++;
      state.currentStreak++;
      if (state.currentStreak > state.maxStreak) {
        state.maxStreak = state.currentStreak;
      }
      state.currentBet = betAmount * 2;
      logger.info(
        {
          marketSlug: trade.marketSlug,
          result: 'LOSE',
          loss: betAmount,
          totalProfit: state.totalProfit,
          streak: state.currentStreak,
          nextBet: state.currentBet,
        },
        'Martingale: Lost! Doubling bet'
      );
    }

    // Persist state to database
    await prisma.martingaleState.update({
      where: { id: state.id },
      data: {
        currentBet: state.currentBet,
        totalProfit: state.totalProfit,
        wins: state.wins,
        losses: state.losses,
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
      },
    });
  }
}

/**
 * Try to place a buy order
 */
async function tryBuy(
  tradingClient: TradingClient,
  tokenId: string,
  amount: number,
  negRisk: boolean,
  tickSize: string,
  side: string,
  slug: string
): Promise<{ matched: boolean; orderId?: string; txHash?: string; error?: string }> {
  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk,
      tickSize,
    });

    logger.info(result, 'Buy order result');
    const txHash = result?.transactionsHashes?.[0];
    logger.info(
      { orderId: result.orderID, status: result.status, txHash, side, slug },
      'Order placed'
    );

    if (txHash) {
      logger.info({ orderId: result.orderID, txHash, side, slug }, 'Buy success!');
      return { matched: true, orderId: result.orderID, txHash };
    }

    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID };
    }

    return { matched: false, orderId: result.orderID };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Execute Martingale strategy for a single market window
 */
export async function executeMartingaleStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config,
  state: MartingaleState,
  crypto: string
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);
  const retryDeadline = window.startTime + ENTRY_WINDOW_SECS + RETRY_AFTER_CLOSE_SECS;

  logger.info(
    {
      window: formatWindowInfo(window, now),
      strategy: 'martingale',
      targetSide: state.targetSide,
      currentBet: state.currentBet,
      totalProfit: state.totalProfit,
      streak: state.currentStreak,
    },
    'Executing Martingale strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Check if trade already exists in DB
  const existingTrade = await prisma.martingaleTrade.findUnique({
    where: { marketSlug: window.slug },
  });
  if (existingTrade) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Trade already exists in DB',
    };
  }

  // Only enter in the entry window
  if (!isInEntryWindow(window, now)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Not in entry window',
    };
  }

  const targetTokenId = state.targetSide === 'UP' ? tokenIds.up : tokenIds.down;

  logger.info(
    {
      slug: window.slug,
      side: state.targetSide,
      bet: `$${state.currentBet}`,
      streak: state.currentStreak > 0 ? `L${state.currentStreak}` : 'fresh',
    },
    'Martingale: Placing bet'
  );

  // Try to buy
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    const result = await tryBuy(
      tradingClient,
      targetTokenId,
      state.currentBet,
      tokenIds.negRisk,
      tokenIds.tickSize,
      state.targetSide,
      window.slug
    );

    if (result.matched) {
      // Save trade to database (entry price ~0.50 at market open)
      await saveMartingaleTrade(
        state.id,
        window.slug,
        crypto,
        state.targetSide,
        state.currentBet,
        0.50,
        result.orderId
      );

      const tradeResult: TradeResult = {
        success: true,
        orderId: result.orderId,
        marketSlug: window.slug,
        side: state.targetSide,
      };
      tradeTracker.markTraded(window.slug, tradeResult);
      logger.info(
        {
          orderId: result.orderId,
          txHash: result.txHash,
          side: state.targetSide,
          bet: state.currentBet,
          slug: window.slug,
        },
        'Martingale bet placed!'
      );
      return { marketSlug: window.slug, traded: true, tradeResult };
    }

    if (isRetryableError(result.error)) {
      logger.warn({ slug: window.slug, error: result.error }, 'No match, retrying...');
      if (config.IS_SERVER) await sleep(500);
      continue;
    }

    // Non-retryable error
    logger.error({ slug: window.slug, error: result.error }, 'Martingale: Error, stopping');
    const failedResult: TradeResult = {
      success: false,
      orderId: result.orderId,
      error: result.error,
      marketSlug: window.slug,
      side: state.targetSide,
    };
    tradeTracker.markTraded(window.slug, failedResult);
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: result.error || 'Trade failed',
    };
  }

  // Retry deadline reached
  logger.error({ slug: window.slug }, 'Martingale: Entry window expired');
  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'Entry window expired',
  };
}

/**
 * Process market with Martingale strategy
 */
export async function processMarketMartingale(
  eventConfig: EventConfig,
  tradingClient: TradingClient,
  marketClient: MarketClient,
  tradeTracker: TradeTracker,
  config: Config,
  state: MartingaleState
): Promise<StrategyResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  // First, resolve any pending trades
  await resolvePendingTrades(state);

  // Skip if not within market window
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

  // Check if market is open
  if (!marketClient.isMarketOpen(marketData.market)) {
    logger.debug({ slug: window.slug }, 'Market is closed');
    tradeTracker.markSkipped(window.slug);
    return null;
  }

  // Only enter in entry window
  if (!isInEntryWindow(window, now)) {
    return null;
  }

  return executeMartingaleStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config,
    state,
    eventConfig.crypto
  );
}

/**
 * Create initial Martingale state (for in-memory only, use getOrCreateMartingaleState for DB)
 */
export function createMartingaleState(
  baseBet: number,
  targetSide: 'UP' | 'DOWN'
): MartingaleState {
  return {
    id: BigInt(0),
    currentBet: baseBet,
    baseBet,
    targetSide,
    totalProfit: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
  };
}

/**
 * Update Martingale state after market resolution (for in-memory use)
 */
export function updateMartingaleState(
  state: MartingaleState,
  finalSide: 'UP' | 'DOWN'
): void {
  const won = finalSide === state.targetSide;

  if (won) {
    state.totalProfit += state.currentBet;
    state.wins++;
    state.currentStreak = 0;
    state.currentBet = state.baseBet;
  } else {
    state.totalProfit -= state.currentBet;
    state.losses++;
    state.currentStreak++;
    if (state.currentStreak > state.maxStreak) {
      state.maxStreak = state.currentStreak;
    }
    state.currentBet = state.currentBet * 2;
  }
}

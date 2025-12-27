/**
 * AVWA State Manager Service
 *
 * Handles state persistence for AVWA strategy using both Redis (cache) and PostgreSQL (primary).
 * Provides crash recovery and fast state access.
 */

import { logger } from '../utils/logger.js';
import { getRedis } from '../db/redis.js';
import { prisma } from '../db/index.js';
import type { AvwaPosition, AvwaTrade, Prisma } from '@prisma/client';

// Redis key prefixes and TTLs
const AVWA_STATE_PREFIX = 'avwa:state:';
const AVWA_STATE_TTL = 1800; // 30 minutes

// Phase types
export type AvwaPhase = 'WAITING' | 'ENTRY' | 'DCA' | 'SNIPER_READY' | 'LOCKING' | 'LOCKED' | 'RESOLVED';
export type AvwaStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

// State interface (in-memory representation)
export interface AvwaState {
  marketSlug: string;
  crypto: string;
  phase: AvwaPhase;
  status: AvwaStatus;

  // Capital pools (remaining amounts)
  initialPoolRemaining: number;
  dcaPoolRemaining: number;
  sniperPoolRemaining: number;

  // Primary position
  primarySide: 'UP' | 'DOWN';
  primaryTokens: number;
  primarySpent: number;
  primaryAvgPrice: number;

  // Hedge position
  hedgeTokens: number;
  hedgeSpent: number;
  hedgeAvgPrice: number;

  // DCA tracking
  dcaLevel: number; // 0-5
  dcaTriggerPrices: number[]; // Price levels that trigger DCA

  // Arbitrage
  arbitrageLocked: boolean;
  guaranteedTokens: number;
  expectedProfit: number;
}

// Trade record for logging
export interface AvwaTradeRecord {
  side: 'UP' | 'DOWN';
  pool: 'INITIAL' | 'DCA' | 'SNIPER';
  amount: number;
  tokens: number;
  price: number;
  isIceberg: boolean;
  icebergChunks?: number;
  orderType: 'MARKET' | 'LIMIT' | 'ICEBERG';
  slippage?: number;
  dcaLevel?: number;
}

// AVWA configuration
export interface AvwaConfig {
  crypto: string;
  totalCapital: number;
  initialPoolPct: number; // 0.20 = 20%
  dcaPoolPct: number; // 0.50 = 50%
  sniperPoolPct: number; // 0.30 = 30%
  dcaLevels: number; // 5 levels
  dcaTriggerPct: number; // 0.04 = 4% drop
  arbitrageThreshold: number; // 0.985 = 1.5% profit
  maxSlippagePct: number; // 0.005 = 0.5%
  icebergThreshold: number; // $100
  icebergChunkSize: number; // $50
  sniperWindowSeconds: number; // 180 = 3 minutes
}

/**
 * Initialize a new AVWA state for a market window
 */
export function initializeState(marketSlug: string, config: AvwaConfig): AvwaState {
  const initialPool = config.totalCapital * config.initialPoolPct;
  const dcaPool = config.totalCapital * config.dcaPoolPct;
  const sniperPool = config.totalCapital * config.sniperPoolPct;

  return {
    marketSlug,
    crypto: config.crypto.toUpperCase(),
    phase: 'WAITING',
    status: 'ACTIVE',

    // Start with full pools
    initialPoolRemaining: initialPool,
    dcaPoolRemaining: dcaPool,
    sniperPoolRemaining: sniperPool,

    // No position yet
    primarySide: 'UP', // Will be set at entry
    primaryTokens: 0,
    primarySpent: 0,
    primaryAvgPrice: 0,

    hedgeTokens: 0,
    hedgeSpent: 0,
    hedgeAvgPrice: 0,

    // DCA tracking
    dcaLevel: 0,
    dcaTriggerPrices: [],

    // Arbitrage
    arbitrageLocked: false,
    guaranteedTokens: 0,
    expectedProfit: 0,
  };
}

/**
 * Calculate DCA trigger prices based on average cost
 */
export function calculateDcaTriggers(avgCost: number, dcaTriggerPct: number, dcaLevels: number): number[] {
  const triggers: number[] = [];
  for (let i = 1; i <= dcaLevels; i++) {
    // Each level triggers at 4% * i drop from avgCost
    triggers.push(avgCost * (1 - dcaTriggerPct * i));
  }
  return triggers;
}

/**
 * Load state from Redis (fast path) or PostgreSQL (fallback)
 */
export async function loadState(marketSlug: string): Promise<AvwaState | null> {
  try {
    // Try Redis first (fast path)
    const redis = getRedis();
    const cached = await redis.get(`${AVWA_STATE_PREFIX}${marketSlug}`);

    if (cached) {
      logger.debug({ marketSlug }, 'Loaded AVWA state from Redis');
      return JSON.parse(cached) as AvwaState;
    }

    // Fall back to PostgreSQL
    const dbState = await prisma.avwaPosition.findUnique({
      where: { marketSlug },
    });

    if (dbState) {
      const state = dbToState(dbState);

      // Cache in Redis for next access
      await redis.set(`${AVWA_STATE_PREFIX}${marketSlug}`, JSON.stringify(state), 'EX', AVWA_STATE_TTL);

      logger.debug({ marketSlug }, 'Loaded AVWA state from PostgreSQL');
      return state;
    }

    return null;
  } catch (error: any) {
    logger.error({ error: error.message, marketSlug }, 'Failed to load AVWA state');
    return null;
  }
}

/**
 * Save state to both Redis (cache) and PostgreSQL (primary)
 */
export async function saveState(state: AvwaState): Promise<void> {
  try {
    const redis = getRedis();

    // Save to Redis (async, fire and forget for speed)
    redis
      .set(`${AVWA_STATE_PREFIX}${state.marketSlug}`, JSON.stringify(state), 'EX', AVWA_STATE_TTL)
      .catch((err) => logger.warn({ error: err.message }, 'Redis save failed'));

    // Save to PostgreSQL (primary, await for consistency)
    const dbData = stateToDb(state);

    await prisma.avwaPosition.upsert({
      where: { marketSlug: state.marketSlug },
      create: dbData as any,
      update: dbData as any,
    });

    logger.debug({ marketSlug: state.marketSlug, phase: state.phase }, 'Saved AVWA state');
  } catch (error: any) {
    logger.error({ error: error.message, marketSlug: state.marketSlug }, 'Failed to save AVWA state');
  }
}

/**
 * Record a trade in the database
 */
export async function recordTrade(state: AvwaState, trade: AvwaTradeRecord): Promise<void> {
  try {
    // Find position ID
    const position = await prisma.avwaPosition.findUnique({
      where: { marketSlug: state.marketSlug },
      select: { id: true },
    });

    if (!position) {
      logger.warn({ marketSlug: state.marketSlug }, 'Cannot record trade: position not found');
      return;
    }

    await prisma.avwaTrade.create({
      data: {
        positionId: position.id,
        side: trade.side,
        pool: trade.pool,
        amount: trade.amount,
        tokens: trade.tokens,
        price: trade.price,
        isIceberg: trade.isIceberg,
        icebergChunks: trade.icebergChunks,
        orderType: trade.orderType,
        slippage: trade.slippage,
        dcaLevel: trade.dcaLevel,
      },
    });

    logger.debug(
      {
        side: trade.side,
        pool: trade.pool,
        amount: '$' + trade.amount.toFixed(2),
        tokens: trade.tokens.toFixed(4),
      },
      'Recorded AVWA trade'
    );
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to record AVWA trade');
  }
}

/**
 * Update or create session stats
 */
export async function updateSession(crypto: string, config: AvwaConfig, profit: number): Promise<number> {
  try {
    let session = await prisma.avwaSession.findFirst({
      where: { crypto: crypto.toUpperCase(), active: true },
    });

    if (!session) {
      session = await prisma.avwaSession.create({
        data: {
          crypto: crypto.toUpperCase(),
          startedAt: new Date(),
          totalCapital: config.totalCapital,
          initialPool: config.totalCapital * config.initialPoolPct,
          dcaPool: config.totalCapital * config.dcaPoolPct,
          sniperPool: config.totalCapital * config.sniperPoolPct,
          active: true,
        },
      });
    }

    const newProfit = Number(session.cumulativeProfit) + profit;

    await prisma.avwaSession.update({
      where: { id: session.id },
      data: {
        totalTrades: { increment: 1 },
        arbitrageLocks: profit > 0 ? { increment: 1 } : undefined,
        totalSpent: { increment: Math.abs(profit) },
        cumulativeProfit: newProfit,
      },
    });

    return newProfit;
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to update AVWA session');
    return 0;
  }
}

/**
 * Mark position as resolved
 */
export async function resolvePosition(state: AvwaState, profit: number): Promise<void> {
  state.phase = 'RESOLVED';
  state.status = 'COMPLETED';
  state.expectedProfit = profit;

  await saveState(state);

  // Update resolved timestamp in DB
  try {
    await prisma.avwaPosition.update({
      where: { marketSlug: state.marketSlug },
      data: {
        resolvedAt: new Date(),
        status: 'COMPLETED',
        phase: 'RESOLVED',
        expectedProfit: profit,
      },
    });
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to update resolved timestamp');
  }
}

/**
 * Clear state from Redis (used when position is resolved)
 */
export async function clearRedisState(marketSlug: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(`${AVWA_STATE_PREFIX}${marketSlug}`);
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to clear Redis state');
  }
}

// ============================================
// Helper functions for DB conversion
// ============================================

function dbToState(db: AvwaPosition): AvwaState {
  return {
    marketSlug: db.marketSlug,
    crypto: db.crypto,
    phase: db.phase as AvwaPhase,
    status: db.status as AvwaStatus,

    // Calculate remaining from used
    initialPoolRemaining: 0, // Will be recalculated from config
    dcaPoolRemaining: 0,
    sniperPoolRemaining: 0,

    primarySide: db.primarySide as 'UP' | 'DOWN',
    primaryTokens: Number(db.primaryTokens),
    primarySpent: Number(db.primarySpent),
    primaryAvgPrice: db.primaryAvgPrice ? Number(db.primaryAvgPrice) : 0,

    hedgeTokens: Number(db.hedgeTokens),
    hedgeSpent: Number(db.hedgeSpent),
    hedgeAvgPrice: db.hedgeAvgPrice ? Number(db.hedgeAvgPrice) : 0,

    dcaLevel: db.dcaLevel,
    dcaTriggerPrices: (db.dcaTriggerPrices as number[]) || [],

    arbitrageLocked: db.arbitrageLocked,
    guaranteedTokens: Number(db.guaranteedTokens),
    expectedProfit: db.expectedProfit ? Number(db.expectedProfit) : 0,
  };
}

function stateToDb(state: AvwaState): Omit<Prisma.AvwaPositionCreateInput, 'trades'> {
  return {
    marketSlug: state.marketSlug,
    crypto: state.crypto,
    phase: state.phase,
    status: state.status,

    // Store used amounts (total - remaining)
    initialPoolUsed: 0, // Will be calculated on read
    dcaPoolUsed: 0,
    sniperPoolUsed: 0,

    primarySide: state.primarySide,
    primaryTokens: state.primaryTokens,
    primarySpent: state.primarySpent,
    primaryAvgPrice: state.primaryAvgPrice > 0 ? state.primaryAvgPrice : null,

    hedgeTokens: state.hedgeTokens,
    hedgeSpent: state.hedgeSpent,
    hedgeAvgPrice: state.hedgeAvgPrice > 0 ? state.hedgeAvgPrice : null,

    dcaLevel: state.dcaLevel,
    dcaTriggerPrices: state.dcaTriggerPrices,
    lastDcaPrice: state.dcaTriggerPrices[state.dcaLevel - 1] || null,

    arbitrageLocked: state.arbitrageLocked,
    guaranteedTokens: state.guaranteedTokens,
    expectedProfit: state.expectedProfit > 0 ? state.expectedProfit : null,
  };
}

/**
 * Get metrics for current state
 */
export function getStateMetrics(state: AvwaState) {
  const totalSpent = state.primarySpent + state.hedgeSpent;
  const guaranteed = Math.min(state.primaryTokens, state.hedgeTokens);
  const profit = guaranteed - totalSpent;
  const profitPct = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
  const imbalance = state.primaryTokens - state.hedgeTokens;

  return {
    totalSpent,
    guaranteed,
    profit,
    profitPct,
    imbalance,
    isBalanced: Math.abs(imbalance) < 0.1,
    canLockArbitrage: state.primaryTokens > 0 && state.hedgeTokens > 0,
  };
}

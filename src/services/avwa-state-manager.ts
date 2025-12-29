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

// Phase types - V2: INITIAL buys both sides, DCA rebalances, RESERVE for final lock
export type AvwaPhase = 'WAITING' | 'INITIAL' | 'DCA' | 'RESERVE' | 'LOCKED' | 'RESOLVED';
export type AvwaStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

// State interface (in-memory representation) - V2: Track both sides equally
export interface AvwaState {
  marketSlug: string;
  crypto: string;
  phase: AvwaPhase;
  status: AvwaStatus;

  // Capital pools (remaining amounts) - V2: 40/40/20 allocation
  initialPoolRemaining: number;
  dcaPoolRemaining: number;
  reservePoolRemaining: number; // Renamed from sniperPoolRemaining

  // V2: Track BOTH sides equally (no primary/hedge distinction)
  upTokens: number;
  upSpent: number;
  downTokens: number;
  downSpent: number;

  // Legacy fields for DB compatibility (mapped from up/down)
  primarySide: 'UP' | 'DOWN'; // Set to side with more tokens
  primaryTokens: number;
  primarySpent: number;
  primaryAvgPrice: number;
  hedgeTokens: number;
  hedgeSpent: number;
  hedgeAvgPrice: number;

  // DCA tracking - V2: tracks rebalance count instead of levels
  dcaLevel: number; // Number of rebalance operations
  dcaTriggerPrices: number[]; // Not used in V2, kept for compatibility

  // Arbitrage
  arbitrageLocked: boolean;
  guaranteedTokens: number;
  expectedProfit: number;
}

// Trade record for logging - V2: RESERVE replaces SNIPER
export interface AvwaTradeRecord {
  side: 'UP' | 'DOWN';
  pool: 'INITIAL' | 'DCA' | 'RESERVE'; // V2: RESERVE instead of SNIPER
  amount: number;
  tokens: number;
  price: number;
  isIceberg: boolean;
  icebergChunks?: number;
  orderType: 'MARKET' | 'LIMIT' | 'ICEBERG';
  slippage?: number;
  dcaLevel?: number;
}

// AVWA configuration - V2: 40/40/20 allocation, rebalance-based DCA
export interface AvwaConfig {
  crypto: string;
  totalCapital: number;
  initialPoolPct: number; // V2: 0.40 = 40% - buy BOTH sides
  dcaPoolPct: number; // V2: 0.40 = 40% - rebalance imbalance
  reservePoolPct: number; // V2: 0.20 = 20% - emergency/final lock (renamed from sniperPoolPct)

  // V2: Entry conditions
  minProfitPct: number; // 0.01 = 1% min profit to enter (totalPrice < 0.99)
  maxTotalPrice: number; // 0.99 = max totalPrice to enter

  // V2: DCA/Rebalance triggers
  imbalanceThreshold: number; // 0.05 = 5% imbalance triggers rebalance
  dcaAmount: number; // $200 per rebalance operation

  // Reserve trigger
  reserveWindowSeconds: number; // 120 = last 2 minutes

  // Anti-slippage (unchanged)
  maxSlippagePct: number; // 0.005 = 0.5%
  icebergThreshold: number; // $100
  icebergChunkSize: number; // $50
}

/**
 * Initialize a new AVWA state for a market window - V2
 */
export function initializeState(marketSlug: string, config: AvwaConfig): AvwaState {
  const initialPool = config.totalCapital * config.initialPoolPct;
  const dcaPool = config.totalCapital * config.dcaPoolPct;
  const reservePool = config.totalCapital * config.reservePoolPct;

  return {
    marketSlug,
    crypto: config.crypto.toUpperCase(),
    phase: 'WAITING',
    status: 'ACTIVE',

    // V2: Start with full pools (40/40/20)
    initialPoolRemaining: initialPool,
    dcaPoolRemaining: dcaPool,
    reservePoolRemaining: reservePool,

    // V2: Track both sides equally
    upTokens: 0,
    upSpent: 0,
    downTokens: 0,
    downSpent: 0,

    // Legacy fields for DB compatibility
    primarySide: 'UP',
    primaryTokens: 0,
    primarySpent: 0,
    primaryAvgPrice: 0,
    hedgeTokens: 0,
    hedgeSpent: 0,
    hedgeAvgPrice: 0,

    // DCA tracking (rebalance count in V2)
    dcaLevel: 0,
    dcaTriggerPrices: [],

    // Arbitrage
    arbitrageLocked: false,
    guaranteedTokens: 0,
    expectedProfit: 0,
  };
}

/**
 * Sync legacy fields from V2 up/down tracking (for DB compatibility)
 */
export function syncLegacyFields(state: AvwaState): void {
  // Primary side is the one with more tokens
  if (state.upTokens >= state.downTokens) {
    state.primarySide = 'UP';
    state.primaryTokens = state.upTokens;
    state.primarySpent = state.upSpent;
    state.primaryAvgPrice = state.upTokens > 0 ? state.upSpent / state.upTokens : 0;
    state.hedgeTokens = state.downTokens;
    state.hedgeSpent = state.downSpent;
    state.hedgeAvgPrice = state.downTokens > 0 ? state.downSpent / state.downTokens : 0;
  } else {
    state.primarySide = 'DOWN';
    state.primaryTokens = state.downTokens;
    state.primarySpent = state.downSpent;
    state.primaryAvgPrice = state.downTokens > 0 ? state.downSpent / state.downTokens : 0;
    state.hedgeTokens = state.upTokens;
    state.hedgeSpent = state.upSpent;
    state.hedgeAvgPrice = state.upTokens > 0 ? state.upSpent / state.upTokens : 0;
  }

  // Calculate guaranteed tokens and profit
  state.guaranteedTokens = Math.min(state.upTokens, state.downTokens);
  const totalSpent = state.upSpent + state.downSpent;
  state.expectedProfit = state.guaranteedTokens - totalSpent;
  state.arbitrageLocked = state.expectedProfit > 0;
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
  const primarySide = db.primarySide as 'UP' | 'DOWN';
  const primaryTokens = Number(db.primaryTokens);
  const primarySpent = Number(db.primarySpent);
  const hedgeTokens = Number(db.hedgeTokens);
  const hedgeSpent = Number(db.hedgeSpent);

  // V2: Reconstruct up/down from primary/hedge
  const upTokens = primarySide === 'UP' ? primaryTokens : hedgeTokens;
  const upSpent = primarySide === 'UP' ? primarySpent : hedgeSpent;
  const downTokens = primarySide === 'DOWN' ? primaryTokens : hedgeTokens;
  const downSpent = primarySide === 'DOWN' ? primarySpent : hedgeSpent;

  return {
    marketSlug: db.marketSlug,
    crypto: db.crypto,
    phase: db.phase as AvwaPhase,
    status: db.status as AvwaStatus,

    // Calculate remaining from used (will be recalculated from config)
    initialPoolRemaining: 0,
    dcaPoolRemaining: 0,
    reservePoolRemaining: 0,

    // V2: Track both sides
    upTokens,
    upSpent,
    downTokens,
    downSpent,

    // Legacy fields
    primarySide,
    primaryTokens,
    primarySpent,
    primaryAvgPrice: db.primaryAvgPrice ? Number(db.primaryAvgPrice) : 0,
    hedgeTokens,
    hedgeSpent,
    hedgeAvgPrice: db.hedgeAvgPrice ? Number(db.hedgeAvgPrice) : 0,

    dcaLevel: db.dcaLevel,
    dcaTriggerPrices: (db.dcaTriggerPrices as number[]) || [],

    arbitrageLocked: db.arbitrageLocked,
    guaranteedTokens: Number(db.guaranteedTokens),
    expectedProfit: db.expectedProfit ? Number(db.expectedProfit) : 0,
  };
}

function stateToDb(state: AvwaState): Omit<Prisma.AvwaPositionCreateInput, 'trades'> {
  // V2: Sync legacy fields before saving
  syncLegacyFields(state);

  return {
    marketSlug: state.marketSlug,
    crypto: state.crypto,
    phase: state.phase,
    status: state.status,

    // Store used amounts
    initialPoolUsed: 0,
    dcaPoolUsed: 0,
    sniperPoolUsed: 0,

    // Legacy fields (synced from up/down)
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
 * Get metrics for current state - V2: Uses up/down tracking
 */
export function getStateMetrics(state: AvwaState) {
  const totalSpent = state.upSpent + state.downSpent;
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const profit = guaranteed - totalSpent;
  const profitPct = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
  const imbalance = state.upTokens - state.downTokens;
  const imbalancePct =
    Math.max(state.upTokens, state.downTokens) > 0
      ? Math.abs(imbalance) / Math.max(state.upTokens, state.downTokens)
      : 0;

  return {
    totalSpent,
    guaranteed,
    profit,
    profitPct,
    imbalance,
    imbalancePct,
    isBalanced: imbalancePct < 0.05,
    canLockArbitrage: state.upTokens > 0 && state.downTokens > 0,
    upTokens: state.upTokens,
    downTokens: state.downTokens,
    upSpent: state.upSpent,
    downSpent: state.downSpent,
  };
}

/**
 * Check if rebalance is needed - V2
 */
export function shouldRebalance(state: AvwaState, threshold: number = 0.05): { needed: boolean; side: 'UP' | 'DOWN'; tokensNeeded: number } {
  const imbalance = state.upTokens - state.downTokens;
  const maxTokens = Math.max(state.upTokens, state.downTokens);

  if (maxTokens === 0) {
    return { needed: false, side: 'UP', tokensNeeded: 0 };
  }

  const imbalancePct = Math.abs(imbalance) / maxTokens;

  if (imbalancePct < threshold) {
    return { needed: false, side: 'UP', tokensNeeded: 0 };
  }

  // Buy the side with fewer tokens
  const side: 'UP' | 'DOWN' = imbalance > 0 ? 'DOWN' : 'UP';
  const tokensNeeded = Math.abs(imbalance);

  return { needed: true, side, tokensNeeded };
}

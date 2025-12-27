/**
 * AVWA (Adaptive Volume-Weighted Arbitrage) Strategy
 *
 * Institutional-grade algorithm for $5,000+ capital on Polymarket BTC up/down markets.
 *
 * Capital Allocation:
 *   Tier 1 (Initial): 20% = $1,000 - Base position on higher probability side
 *   Tier 2 (DCA Pool): 50% = $2,500 - 5 levels x $500, triggered at 4% drops
 *   Tier 3 (Sniper): 30% = $1,500 - Lock arbitrage when avgPrice + hedgePrice < 0.985
 *
 * Key Features:
 *   - Anti-slippage: Iceberg orders for amounts > $100
 *   - Orderbook depth checking before trades
 *   - DCA with recalculated trigger prices
 *   - 1.5% guaranteed profit target
 *   - Dual persistence (Redis + PostgreSQL)
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.avwa node dist/avwa.js
 */

import { getConfig } from './config/index.js';
import { MarketClient } from './clients/market-client.js';
import { TradingClient } from './clients/trading-client.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import { generateSlug } from './services/market-timing.js';
import { executeBuyWithAntiSlippage } from './services/iceberg-executor.js';
import {
  initializeState,
  loadState,
  saveState,
  recordTrade,
  updateSession,
  resolvePosition,
  calculateDcaTriggers,
  getStateMetrics,
  type AvwaState,
  type AvwaConfig,
  type AvwaTradeRecord,
} from './services/avwa-state-manager.js';
import type { TokenIds } from './types/index.js';

// Parse config from environment
const config: AvwaConfig = {
  crypto: process.argv[2]?.toLowerCase() || 'btc',
  totalCapital: parseFloat(process.env.TOTAL_CAPITAL || '5000'),
  initialPoolPct: parseFloat(process.env.INITIAL_POOL_PCT || '0.20'),
  dcaPoolPct: parseFloat(process.env.DCA_POOL_PCT || '0.50'),
  sniperPoolPct: parseFloat(process.env.SNIPER_POOL_PCT || '0.30'),
  dcaLevels: parseInt(process.env.DCA_LEVELS || '5'),
  dcaTriggerPct: parseFloat(process.env.DCA_TRIGGER_PCT || '0.04'),
  arbitrageThreshold: parseFloat(process.env.ARBITRAGE_THRESHOLD || '0.985'),
  maxSlippagePct: parseFloat(process.env.MAX_SLIPPAGE_PCT || '0.005'),
  icebergThreshold: parseFloat(process.env.ICEBERG_THRESHOLD || '100'),
  icebergChunkSize: parseFloat(process.env.ICEBERG_CHUNK_SIZE || '50'),
  sniperWindowSeconds: parseInt(process.env.SNIPER_WINDOW_SECONDS || '180'),
};

const ENTRY_MIN = parseFloat(process.env.ENTRY_MIN || '0.05');
const ENTRY_MAX = parseFloat(process.env.ENTRY_MAX || '0.80');
const DRY_RUN = process.env.DRY_RUN !== 'false';

// Calculated pool amounts
const INITIAL_POOL = config.totalCapital * config.initialPoolPct;
const DCA_POOL = config.totalCapital * config.dcaPoolPct;
const SNIPER_POOL = config.totalCapital * config.sniperPoolPct;
const DCA_PER_LEVEL = DCA_POOL / config.dcaLevels;

/**
 * Get time left in current 15-minute window
 */
function getTimeLeft(): number {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 15 * 60;
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  return currentStart + intervalSeconds - now;
}

/**
 * Get current window slug
 */
function getCurrentWindowSlug(): string {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 15 * 60;
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  return generateSlug(config.crypto, '15m', currentStart);
}

/**
 * Execute a buy (dry run or live)
 */
async function executeBuy(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  state: AvwaState,
  side: 'UP' | 'DOWN',
  amount: number,
  pool: 'INITIAL' | 'DCA' | 'SNIPER',
  currentPrice: number
): Promise<{ success: boolean; tokens: number; spent: number }> {
  if (DRY_RUN) {
    // Simulate with current price
    const tokens = amount / currentPrice;

    logger.info(
      {
        pool,
        side,
        amount: '$' + amount.toFixed(2),
        tokens: tokens.toFixed(4),
        price: (currentPrice * 100).toFixed(2) + '%',
      },
      `[DRY RUN] Would buy ${side}`
    );

    // Record simulated trade
    const tradeRecord: AvwaTradeRecord = {
      side,
      pool,
      amount,
      tokens,
      price: currentPrice,
      isIceberg: amount > config.icebergThreshold,
      orderType: amount > config.icebergThreshold ? 'ICEBERG' : 'MARKET',
      dcaLevel: pool === 'DCA' ? state.dcaLevel + 1 : undefined,
    };
    await recordTrade(state, tradeRecord);

    return { success: true, tokens, spent: amount };
  }

  // Live execution with anti-slippage
  const result = await executeBuyWithAntiSlippage(
    tradingClient,
    tokenIds,
    side,
    amount,
    currentPrice,
    config.maxSlippagePct,
    config.icebergThreshold,
    config.icebergChunkSize
  );

  if (result.success) {
    // Record trade
    const tradeRecord: AvwaTradeRecord = {
      side,
      pool,
      amount: result.spent,
      tokens: result.tokens,
      price: result.spent / result.tokens,
      isIceberg: result.isIceberg,
      orderType: result.isIceberg ? 'ICEBERG' : 'MARKET',
      slippage: result.slippage,
      dcaLevel: pool === 'DCA' ? state.dcaLevel + 1 : undefined,
    };
    await recordTrade(state, tradeRecord);

    logger.info(
      {
        pool,
        side,
        spent: '$' + result.spent.toFixed(2),
        tokens: result.tokens.toFixed(4),
        slippage: (result.slippage * 100).toFixed(3) + '%',
        isIceberg: result.isIceberg,
      },
      `${pool} buy executed`
    );
  }

  return result;
}

/**
 * Handle WAITING phase - wait for suitable entry conditions
 */
async function handleWaitingPhase(
  state: AvwaState,
  upPrice: number,
  downPrice: number
): Promise<AvwaState> {
  const higherPrice = Math.max(upPrice, downPrice);

  // Check if price is in entry range
  if (higherPrice >= ENTRY_MIN && higherPrice <= ENTRY_MAX) {
    state.phase = 'ENTRY';
    state.primarySide = upPrice > downPrice ? 'UP' : 'DOWN';
    logger.info(
      { higherPrice: (higherPrice * 100).toFixed(1) + '%', side: state.primarySide },
      'Entry conditions met, transitioning to ENTRY phase'
    );
  }

  return state;
}

/**
 * Handle ENTRY phase - execute initial $1,000 buy
 */
async function handleEntryPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number
): Promise<AvwaState> {
  const currentPrice = state.primarySide === 'UP' ? upPrice : downPrice;

  // Verify still in entry range
  if (currentPrice < ENTRY_MIN || currentPrice > ENTRY_MAX) {
    logger.info({ currentPrice: (currentPrice * 100).toFixed(1) + '%' }, 'Price out of range, waiting...');
    state.phase = 'WAITING';
    return state;
  }

  // Execute initial buy
  const result = await executeBuy(
    tradingClient,
    tokenIds,
    state,
    state.primarySide,
    INITIAL_POOL,
    'INITIAL',
    currentPrice
  );

  if (result.success) {
    state.primaryTokens += result.tokens;
    state.primarySpent += result.spent;
    state.initialPoolRemaining = 0;

    // Calculate average cost and DCA triggers
    state.primaryAvgPrice = state.primarySpent / state.primaryTokens;
    state.dcaTriggerPrices = calculateDcaTriggers(state.primaryAvgPrice, config.dcaTriggerPct, config.dcaLevels);

    state.phase = 'DCA';

    logger.info(
      {
        side: state.primarySide,
        tokens: state.primaryTokens.toFixed(4),
        spent: '$' + state.primarySpent.toFixed(2),
        avgPrice: (state.primaryAvgPrice * 100).toFixed(2) + '%',
        dcaTriggers: state.dcaTriggerPrices.map((p) => (p * 100).toFixed(2) + '%'),
      },
      'Entry complete, transitioning to DCA phase'
    );
  }

  return state;
}

/**
 * Handle DCA phase - monitor for 4% drops and execute DCA buys
 */
async function handleDcaPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number,
  timeLeft: number
): Promise<AvwaState> {
  const currentPrice = state.primarySide === 'UP' ? upPrice : downPrice;
  const hedgePrice = state.primarySide === 'UP' ? downPrice : upPrice;

  // Check for arbitrage opportunity
  const avgTotal = state.primaryAvgPrice + hedgePrice;
  if (avgTotal < config.arbitrageThreshold) {
    const profitPct = ((1 - avgTotal) / avgTotal) * 100;
    logger.info(
      {
        avgCost: (state.primaryAvgPrice * 100).toFixed(2) + '%',
        hedgePrice: (hedgePrice * 100).toFixed(2) + '%',
        avgTotal: (avgTotal * 100).toFixed(2) + '%',
        profitPct: profitPct.toFixed(2) + '%',
      },
      'ARBITRAGE OPPORTUNITY DETECTED!'
    );
    state.phase = 'SNIPER_READY';
    return state;
  }

  // Check for DCA trigger
  const nextDcaLevel = state.dcaLevel + 1;
  if (nextDcaLevel > config.dcaLevels || state.dcaPoolRemaining <= 0) {
    // All DCA levels exhausted, transition to sniper ready when time is right
    if (timeLeft <= config.sniperWindowSeconds) {
      state.phase = 'SNIPER_READY';
      logger.info({ timeLeft: timeLeft + 's' }, 'DCA exhausted, transitioning to SNIPER_READY');
    }
    return state;
  }

  const triggerPrice = state.dcaTriggerPrices[nextDcaLevel - 1];

  if (currentPrice <= triggerPrice) {
    // DCA triggered!
    const dcaAmount = Math.min(DCA_PER_LEVEL, state.dcaPoolRemaining);

    logger.info(
      {
        dcaLevel: nextDcaLevel,
        triggerPrice: (triggerPrice * 100).toFixed(2) + '%',
        currentPrice: (currentPrice * 100).toFixed(2) + '%',
        dcaAmount: '$' + dcaAmount.toFixed(2),
      },
      'DCA trigger hit!'
    );

    const result = await executeBuy(
      tradingClient,
      tokenIds,
      state,
      state.primarySide,
      dcaAmount,
      'DCA',
      currentPrice
    );

    if (result.success) {
      state.primaryTokens += result.tokens;
      state.primarySpent += result.spent;
      state.dcaPoolRemaining -= result.spent;
      state.dcaLevel = nextDcaLevel;

      // Recalculate average cost and trigger prices
      state.primaryAvgPrice = state.primarySpent / state.primaryTokens;
      state.dcaTriggerPrices = calculateDcaTriggers(state.primaryAvgPrice, config.dcaTriggerPct, config.dcaLevels);

      logger.info(
        {
          dcaLevel: state.dcaLevel,
          newAvgPrice: (state.primaryAvgPrice * 100).toFixed(2) + '%',
          totalTokens: state.primaryTokens.toFixed(4),
          totalSpent: '$' + state.primarySpent.toFixed(2),
          dcaRemaining: '$' + state.dcaPoolRemaining.toFixed(2),
        },
        'DCA executed, recalculated triggers'
      );
    }
  }

  // Transition to sniper if time is running out
  if (timeLeft <= config.sniperWindowSeconds) {
    state.phase = 'SNIPER_READY';
    logger.info({ timeLeft: timeLeft + 's' }, 'Transitioning to SNIPER_READY phase');
  }

  return state;
}

/**
 * Handle SNIPER_READY phase - watch for arbitrage opportunity in final minutes
 */
async function handleSniperPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number,
  timeLeft: number
): Promise<AvwaState> {
  const hedgePrice = state.primarySide === 'UP' ? downPrice : upPrice;

  // Check for arbitrage opportunity
  const avgTotal = state.primaryAvgPrice + hedgePrice;

  if (avgTotal < config.arbitrageThreshold) {
    const profitPct = ((1 - avgTotal) / avgTotal) * 100;

    logger.info(
      {
        avgCost: (state.primaryAvgPrice * 100).toFixed(2) + '%',
        hedgePrice: (hedgePrice * 100).toFixed(2) + '%',
        avgTotal: (avgTotal * 100).toFixed(2) + '%',
        profitPct: profitPct.toFixed(2) + '%',
        timeLeft: timeLeft + 's',
      },
      'LOCKING ARBITRAGE!'
    );

    state.phase = 'LOCKING';
  } else if (timeLeft <= 60) {
    // Emergency lock if we have position and time is critical
    if (state.primaryTokens > 0 && state.sniperPoolRemaining > 0) {
      logger.warn({ timeLeft: timeLeft + 's', avgTotal: (avgTotal * 100).toFixed(2) + '%' }, 'EMERGENCY: Time critical, attempting lock');
      state.phase = 'LOCKING';
    }
  }

  return state;
}

/**
 * Handle LOCKING phase - execute sniper pool to lock arbitrage
 */
async function handleLockingPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number
): Promise<AvwaState> {
  const hedgeSide = state.primarySide === 'UP' ? 'DOWN' : 'UP';
  const hedgePrice = hedgeSide === 'UP' ? upPrice : downPrice;

  // Calculate tokens needed to balance
  const tokensNeeded = state.primaryTokens - state.hedgeTokens;
  const costToBalance = tokensNeeded * hedgePrice;

  // Use sniper pool (capped at available funds)
  const sniperAmount = Math.min(costToBalance, state.sniperPoolRemaining);

  if (sniperAmount < 1) {
    logger.warn({ sniperRemaining: '$' + state.sniperPoolRemaining.toFixed(2) }, 'Insufficient sniper funds');
    state.phase = 'LOCKED';
    return state;
  }

  logger.info(
    {
      hedgeSide,
      tokensNeeded: tokensNeeded.toFixed(4),
      costToBalance: '$' + costToBalance.toFixed(2),
      sniperAmount: '$' + sniperAmount.toFixed(2),
      sniperRemaining: '$' + state.sniperPoolRemaining.toFixed(2),
    },
    'Executing sniper buy to lock arbitrage'
  );

  const result = await executeBuy(tradingClient, tokenIds, state, hedgeSide, sniperAmount, 'SNIPER', hedgePrice);

  if (result.success) {
    state.hedgeTokens += result.tokens;
    state.hedgeSpent += result.spent;
    state.sniperPoolRemaining -= result.spent;
    state.hedgeAvgPrice = state.hedgeSpent / state.hedgeTokens;

    // Calculate guaranteed tokens and profit
    state.guaranteedTokens = Math.min(state.primaryTokens, state.hedgeTokens);
    const totalSpent = state.primarySpent + state.hedgeSpent;
    state.expectedProfit = state.guaranteedTokens - totalSpent;
    state.arbitrageLocked = state.expectedProfit > 0;

    state.phase = 'LOCKED';

    logger.info(
      {
        guaranteedTokens: state.guaranteedTokens.toFixed(4),
        totalSpent: '$' + totalSpent.toFixed(2),
        profit: '$' + state.expectedProfit.toFixed(2),
        profitPct: ((state.expectedProfit / totalSpent) * 100).toFixed(2) + '%',
        locked: state.arbitrageLocked,
      },
      state.arbitrageLocked ? 'ARBITRAGE LOCKED!' : 'Position hedged (not profitable)'
    );
  }

  return state;
}

/**
 * Main trading loop
 */
async function main(): Promise<void> {
  const appConfig = getConfig();
  const tradingClient = new TradingClient(appConfig);
  const marketClient = new MarketClient();

  logger.info(
    {
      crypto: config.crypto.toUpperCase(),
      totalCapital: '$' + config.totalCapital.toFixed(2),
      pools: {
        initial: '$' + INITIAL_POOL.toFixed(2),
        dca: '$' + DCA_POOL.toFixed(2) + ` (${config.dcaLevels} levels)`,
        sniper: '$' + SNIPER_POOL.toFixed(2),
      },
      entryRange: `${(ENTRY_MIN * 100).toFixed(0)}%-${(ENTRY_MAX * 100).toFixed(0)}%`,
      dcaTrigger: (config.dcaTriggerPct * 100).toFixed(0) + '%',
      arbitrageThreshold: config.arbitrageThreshold,
      sniperWindow: config.sniperWindowSeconds + 's',
      dryRun: DRY_RUN,
    },
    DRY_RUN ? '[DRY RUN] AVWA Strategy Started' : 'AVWA Strategy Started (LIVE)'
  );

  let lastSlug = '';
  let state: AvwaState | null = null;
  let cumulativeProfit = 0;

  while (true) {
    try {
      const slug = getCurrentWindowSlug();
      const timeLeft = getTimeLeft();

      // New window - finalize previous position
      if (slug !== lastSlug) {
        if (state && state.phase !== 'RESOLVED') {
          const metrics = getStateMetrics(state);

          if (state.arbitrageLocked) {
            cumulativeProfit = await updateSession(config.crypto, config, metrics.profit);
            logger.info(
              {
                slug: state.marketSlug,
                guaranteed: '$' + metrics.guaranteed.toFixed(2),
                spent: '$' + metrics.totalSpent.toFixed(2),
                profit: '$' + metrics.profit.toFixed(2),
                cumulative: '$' + cumulativeProfit.toFixed(2),
              },
              'Window closed - ARBITRAGE LOCKED'
            );
          } else if (metrics.totalSpent > 0) {
            logger.warn(
              {
                slug: state.marketSlug,
                spent: '$' + metrics.totalSpent.toFixed(2),
                phase: state.phase,
              },
              'Window closed - Position UNHEDGED'
            );
          }

          await resolvePosition(state, metrics.profit);
        }

        // Initialize new state
        state = initializeState(slug, config);

        // Try to load existing state (crash recovery)
        const existingState = await loadState(slug);
        if (existingState && existingState.status === 'ACTIVE') {
          state = existingState;
          // Recalculate remaining pools from spent
          state.initialPoolRemaining = INITIAL_POOL - (state.primarySpent > 0 && state.dcaLevel === 0 ? INITIAL_POOL : 0);
          state.dcaPoolRemaining = DCA_POOL - state.dcaLevel * DCA_PER_LEVEL;
          state.sniperPoolRemaining = SNIPER_POOL - state.hedgeSpent;
          logger.info({ slug, phase: state.phase }, 'Recovered existing position');
        }

        lastSlug = slug;
        logger.info({ slug, timeLeft: timeLeft + 's' }, 'New market window');
      }

      if (!state) {
        state = initializeState(slug, config);
      }

      // Skip if already resolved
      if (state.phase === 'RESOLVED' || state.phase === 'LOCKED') {
        await sleep(1000);
        continue;
      }

      // Get market data
      const marketData = await marketClient.getMarketTokenIds(slug);
      if (!marketData) {
        logger.debug({ slug }, 'Market not found');
        await sleep(2000);
        continue;
      }

      // Fetch prices
      const { upPrice, downPrice } = await tradingClient.getBatchPrices(
        marketData.tokenIds.up,
        marketData.tokenIds.down
      );

      if (upPrice <= 0 || downPrice <= 0) {
        await sleep(500);
        continue;
      }

      // Execute phase logic
      const prevPhase = state.phase;

      switch (state.phase) {
        case 'WAITING':
          state = await handleWaitingPhase(state, upPrice, downPrice);
          break;

        case 'ENTRY':
          state = await handleEntryPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice);
          break;

        case 'DCA':
          state = await handleDcaPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice, timeLeft);
          break;

        case 'SNIPER_READY':
          state = await handleSniperPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice, timeLeft);
          break;

        case 'LOCKING':
          state = await handleLockingPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice);
          break;
      }

      // Save state if changed
      if (state.phase !== prevPhase || state.primaryTokens > 0) {
        await saveState(state);
      }

      // Log status periodically
      if (state.primaryTokens > 0 && Math.random() < 0.1) {
        const metrics = getStateMetrics(state);
        logger.info(
          {
            phase: state.phase,
            timeLeft: timeLeft + 's',
            up: (upPrice * 100).toFixed(1) + '%',
            down: (downPrice * 100).toFixed(1) + '%',
            primaryTok: state.primaryTokens.toFixed(2),
            hedgeTok: state.hedgeTokens.toFixed(2),
            spent: '$' + metrics.totalSpent.toFixed(2),
            dcaLevel: state.dcaLevel,
          },
          'Status'
        );
      }

      // Adaptive polling
      const pollDelay = timeLeft <= 60 ? 200 : timeLeft <= 180 ? 500 : 1000;
      await sleep(pollDelay);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(5000);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down AVWA...');
  process.exit(0);
});

// Run
main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});

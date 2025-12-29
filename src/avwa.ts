/**
 * AVWA V2 (Adaptive Volume-Weighted Arbitrage) Strategy
 *
 * Dual-side entry strategy for safer arbitrage on Polymarket BTC up/down markets.
 *
 * V2 Key Changes from V1:
 *   - INITIAL: Buy BOTH sides weighted by price (equal tokens from start)
 *   - DCA: Rebalance imbalance (buy weaker side) instead of one-sided DCA
 *   - RESERVE: Emergency/final lock in last 2 minutes (renamed from SNIPER)
 *
 * Capital Allocation (40/40/20):
 *   Tier 1 (Initial): 40% = $2,000 - Buy BOTH sides weighted by price
 *   Tier 2 (DCA Pool): 40% = $2,000 - Rebalance imbalance
 *   Tier 3 (Reserve): 20% = $1,000 - Emergency/final lock
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.avwa node dist/avwa.js btc
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
  syncLegacyFields,
  getStateMetrics,
  shouldRebalance,
  type AvwaState,
  type AvwaConfig,
  type AvwaTradeRecord,
} from './services/avwa-state-manager.js';
import type { TokenIds } from './types/index.js';

// Parse config from environment - V2: 40/40/20 allocation
const config: AvwaConfig = {
  crypto: process.argv[2]?.toLowerCase() || 'btc',
  totalCapital: parseFloat(process.env.TOTAL_CAPITAL || '5000'),
  initialPoolPct: parseFloat(process.env.INITIAL_POOL_PCT || '0.40'), // V2: 40%
  dcaPoolPct: parseFloat(process.env.DCA_POOL_PCT || '0.40'), // V2: 40%
  reservePoolPct: parseFloat(process.env.RESERVE_POOL_PCT || '0.20'), // V2: 20%

  // V2: Entry conditions - based on individual prices
  minProfitPct: parseFloat(process.env.MIN_PROFIT_PCT || '0.01'), // (unused in V2)
  maxTotalPrice: parseFloat(process.env.MAX_TOTAL_PRICE || '0.99'), // (unused in V2)

  // V2: DCA/Rebalance triggers
  imbalanceThreshold: parseFloat(process.env.IMBALANCE_THRESHOLD || '0.05'), // 5%
  dcaAmount: parseFloat(process.env.DCA_AMOUNT || '200'), // $200 per rebalance

  // Reserve trigger
  reserveWindowSeconds: parseInt(process.env.RESERVE_WINDOW_SECONDS || '120'), // 2 min

  // Anti-slippage
  maxSlippagePct: parseFloat(process.env.MAX_SLIPPAGE_PCT || '0.005'),
  icebergThreshold: parseFloat(process.env.ICEBERG_THRESHOLD || '100'),
  icebergChunkSize: parseFloat(process.env.ICEBERG_CHUNK_SIZE || '50'),
};

// Entry conditions (separate from config interface for backward compatibility)
const ENTRY_MIN = parseFloat(process.env.ENTRY_MIN || '0.05');
const ENTRY_MAX = parseFloat(process.env.ENTRY_MAX || '0.80');

const DRY_RUN = process.env.DRY_RUN !== 'false';

// Calculated pool amounts
const INITIAL_POOL = config.totalCapital * config.initialPoolPct;
const DCA_POOL = config.totalCapital * config.dcaPoolPct;
const RESERVE_POOL = config.totalCapital * config.reservePoolPct;

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
 * Execute a buy (dry run or live) - V2
 */
async function executeBuy(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  state: AvwaState,
  side: 'UP' | 'DOWN',
  amount: number,
  pool: 'INITIAL' | 'DCA' | 'RESERVE',
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
 * V2: Entry when higher price is in range (5%-80%)
 */
async function handleWaitingPhase(
  state: AvwaState,
  upPrice: number,
  downPrice: number
): Promise<AvwaState> {
  const higherPrice = Math.max(upPrice, downPrice);

  // V2: Entry when higher price is in range
  if (higherPrice >= ENTRY_MIN && higherPrice <= ENTRY_MAX) {
    state.phase = 'INITIAL';
    logger.info(
      {
        higherPrice: (higherPrice * 100).toFixed(2) + '%',
        up: (upPrice * 100).toFixed(1) + '%',
        down: (downPrice * 100).toFixed(1) + '%',
      },
      'Entry conditions met, transitioning to INITIAL phase'
    );
  }

  return state;
}

/**
 * Handle INITIAL phase - V2: Buy BOTH sides weighted by price
 * This creates equal tokens on both sides for guaranteed arbitrage from start
 */
async function handleInitialPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number
): Promise<AvwaState> {
  const higherPrice = Math.max(upPrice, downPrice);

  // Verify still in entry range
  if (higherPrice < ENTRY_MIN || higherPrice > ENTRY_MAX) {
    logger.info({ higherPrice: (higherPrice * 100).toFixed(2) + '%' }, 'Price out of range, waiting...');
    state.phase = 'WAITING';
    return state;
  }

  const totalPrice = upPrice + downPrice;

  // V2: Calculate weighted buys for equal tokens
  // tokensPerDollar = INITIAL_POOL / totalPrice
  // upSpend = tokens * upPrice, downSpend = tokens * downPrice
  const tokensTarget = INITIAL_POOL / totalPrice;
  const upSpendAmount = tokensTarget * upPrice;
  const downSpendAmount = tokensTarget * downPrice;

  logger.info(
    {
      totalPrice: (totalPrice * 100).toFixed(2) + '%',
      tokensTarget: tokensTarget.toFixed(4),
      upSpend: '$' + upSpendAmount.toFixed(2),
      downSpend: '$' + downSpendAmount.toFixed(2),
      profitPct: ((1 - totalPrice) * 100).toFixed(2) + '%',
    },
    'V2: Buying BOTH sides weighted by price'
  );

  // Buy UP side
  const upResult = await executeBuy(tradingClient, tokenIds, state, 'UP', upSpendAmount, 'INITIAL', upPrice);

  if (upResult.success) {
    state.upTokens += upResult.tokens;
    state.upSpent += upResult.spent;
  }

  // Buy DOWN side
  const downResult = await executeBuy(tradingClient, tokenIds, state, 'DOWN', downSpendAmount, 'INITIAL', downPrice);

  if (downResult.success) {
    state.downTokens += downResult.tokens;
    state.downSpent += downResult.spent;
  }

  // Update state
  state.initialPoolRemaining = 0;
  syncLegacyFields(state);

  state.phase = 'DCA';

  const metrics = getStateMetrics(state);
  logger.info(
    {
      upTokens: state.upTokens.toFixed(4),
      downTokens: state.downTokens.toFixed(4),
      totalSpent: '$' + metrics.totalSpent.toFixed(2),
      guaranteed: '$' + metrics.guaranteed.toFixed(2),
      profit: '$' + metrics.profit.toFixed(2),
      profitPct: metrics.profitPct.toFixed(2) + '%',
      imbalancePct: (metrics.imbalancePct * 100).toFixed(2) + '%',
    },
    'V2: Initial entry complete, transitioning to DCA phase'
  );

  return state;
}

/**
 * Handle DCA phase - V2: Rebalance imbalance by buying the weaker side
 */
async function handleDcaPhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number,
  timeLeft: number
): Promise<AvwaState> {
  // Check for rebalance need
  const rebalanceCheck = shouldRebalance(state, config.imbalanceThreshold);

  if (rebalanceCheck.needed && state.dcaPoolRemaining > 0) {
    const weakerSide = rebalanceCheck.side;
    const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

    // Calculate rebalance amount
    const tokensNeeded = rebalanceCheck.tokensNeeded;
    const costToBalance = tokensNeeded * weakerPrice;
    const dcaAmount = Math.min(config.dcaAmount, costToBalance, state.dcaPoolRemaining);

    if (dcaAmount >= 1) {
      logger.info(
        {
          weakerSide,
          imbalance: rebalanceCheck.tokensNeeded.toFixed(4),
          costToBalance: '$' + costToBalance.toFixed(2),
          dcaAmount: '$' + dcaAmount.toFixed(2),
          dcaRemaining: '$' + state.dcaPoolRemaining.toFixed(2),
        },
        'V2: Rebalancing imbalance'
      );

      const result = await executeBuy(tradingClient, tokenIds, state, weakerSide, dcaAmount, 'DCA', weakerPrice);

      if (result.success) {
        if (weakerSide === 'UP') {
          state.upTokens += result.tokens;
          state.upSpent += result.spent;
        } else {
          state.downTokens += result.tokens;
          state.downSpent += result.spent;
        }

        state.dcaPoolRemaining -= result.spent;
        state.dcaLevel += 1;
        syncLegacyFields(state);

        const metrics = getStateMetrics(state);
        logger.info(
          {
            dcaLevel: state.dcaLevel,
            upTokens: state.upTokens.toFixed(4),
            downTokens: state.downTokens.toFixed(4),
            imbalancePct: (metrics.imbalancePct * 100).toFixed(2) + '%',
            profit: '$' + metrics.profit.toFixed(2),
          },
          'V2: Rebalance executed'
        );
      }
    }
  }

  // Transition to RESERVE if time is running out
  if (timeLeft <= config.reserveWindowSeconds) {
    state.phase = 'RESERVE';
    logger.info({ timeLeft: timeLeft + 's' }, 'Transitioning to RESERVE phase');
  }

  return state;
}

/**
 * Handle RESERVE phase - V2: Final lock in last 2 minutes
 * Ensures position is perfectly balanced before window closes
 */
async function handleReservePhase(
  state: AvwaState,
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  upPrice: number,
  downPrice: number,
  timeLeft: number
): Promise<AvwaState> {
  const metrics = getStateMetrics(state);

  // Check if we need to use reserve to improve position
  if (state.reservePoolRemaining > 0 && !metrics.isBalanced) {
    const imbalance = state.upTokens - state.downTokens;
    const weakerSide: 'UP' | 'DOWN' = imbalance > 0 ? 'DOWN' : 'UP';
    const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

    const tokensNeeded = Math.abs(imbalance);
    const costToBalance = tokensNeeded * weakerPrice;
    const reserveAmount = Math.min(costToBalance, state.reservePoolRemaining);

    if (reserveAmount >= 1) {
      logger.info(
        {
          weakerSide,
          tokensNeeded: tokensNeeded.toFixed(4),
          costToBalance: '$' + costToBalance.toFixed(2),
          reserveAmount: '$' + reserveAmount.toFixed(2),
          timeLeft: timeLeft + 's',
        },
        'V2: Using RESERVE to balance position'
      );

      const result = await executeBuy(tradingClient, tokenIds, state, weakerSide, reserveAmount, 'RESERVE', weakerPrice);

      if (result.success) {
        if (weakerSide === 'UP') {
          state.upTokens += result.tokens;
          state.upSpent += result.spent;
        } else {
          state.downTokens += result.tokens;
          state.downSpent += result.spent;
        }

        state.reservePoolRemaining -= result.spent;
        syncLegacyFields(state);
      }
    }
  }

  // Lock position if time is critical (< 30s) or position is good
  if (timeLeft <= 30 || metrics.isBalanced) {
    const finalMetrics = getStateMetrics(state);

    state.guaranteedTokens = finalMetrics.guaranteed;
    state.expectedProfit = finalMetrics.profit;
    state.arbitrageLocked = finalMetrics.profit > 0;
    state.phase = 'LOCKED';

    logger.info(
      {
        upTokens: state.upTokens.toFixed(4),
        downTokens: state.downTokens.toFixed(4),
        guaranteed: '$' + finalMetrics.guaranteed.toFixed(2),
        totalSpent: '$' + finalMetrics.totalSpent.toFixed(2),
        profit: '$' + finalMetrics.profit.toFixed(2),
        profitPct: finalMetrics.profitPct.toFixed(2) + '%',
        locked: state.arbitrageLocked,
      },
      state.arbitrageLocked ? 'V2: ARBITRAGE LOCKED!' : 'V2: Position locked (check profit)'
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
        initial: '$' + INITIAL_POOL.toFixed(2) + ' (40%)',
        dca: '$' + DCA_POOL.toFixed(2) + ' (40%)',
        reserve: '$' + RESERVE_POOL.toFixed(2) + ' (20%)',
      },
      entry: {
        maxTotalPrice: (config.maxTotalPrice * 100).toFixed(0) + '%',
        minProfitPct: (config.minProfitPct * 100).toFixed(0) + '%',
      },
      rebalance: {
        imbalanceThreshold: (config.imbalanceThreshold * 100).toFixed(0) + '%',
        dcaAmount: '$' + config.dcaAmount.toFixed(0),
      },
      reserveWindow: config.reserveWindowSeconds + 's',
      dryRun: DRY_RUN,
    },
    DRY_RUN ? '[DRY RUN] AVWA V2 Strategy Started' : 'AVWA V2 Strategy Started (LIVE)'
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

          if (state.arbitrageLocked || metrics.profit > 0) {
            cumulativeProfit = await updateSession(config.crypto, config, metrics.profit);
            logger.info(
              {
                slug: state.marketSlug,
                guaranteed: '$' + metrics.guaranteed.toFixed(2),
                spent: '$' + metrics.totalSpent.toFixed(2),
                profit: '$' + metrics.profit.toFixed(2),
                cumulative: '$' + cumulativeProfit.toFixed(2),
              },
              'Window closed - POSITION RESOLVED'
            );
          } else if (metrics.totalSpent > 0) {
            logger.warn(
              {
                slug: state.marketSlug,
                spent: '$' + metrics.totalSpent.toFixed(2),
                profit: '$' + metrics.profit.toFixed(2),
                phase: state.phase,
              },
              'Window closed - Position UNBALANCED'
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
          // Recalculate remaining pools
          state.initialPoolRemaining = state.upSpent + state.downSpent > 0 ? 0 : INITIAL_POOL;
          state.dcaPoolRemaining = DCA_POOL - (state.dcaLevel * config.dcaAmount);
          state.reservePoolRemaining = RESERVE_POOL;
          logger.info({ slug, phase: state.phase }, 'Recovered existing position');
        }

        lastSlug = slug;
        logger.info({ slug, timeLeft: timeLeft + 's' }, 'New market window');
      }

      if (!state) {
        state = initializeState(slug, config);
      }

      // Skip if already resolved or locked
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

        case 'INITIAL':
          state = await handleInitialPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice);
          break;

        case 'DCA':
          state = await handleDcaPhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice, timeLeft);
          break;

        case 'RESERVE':
          state = await handleReservePhase(state, tradingClient, marketData.tokenIds, upPrice, downPrice, timeLeft);
          break;
      }

      // Save state if changed
      if (state.phase !== prevPhase || state.upTokens > 0) {
        await saveState(state);
      }

      // Log status periodically
      if ((state.upTokens > 0 || state.downTokens > 0) && Math.random() < 0.1) {
        const metrics = getStateMetrics(state);
        logger.info(
          {
            phase: state.phase,
            timeLeft: timeLeft + 's',
            up: (upPrice * 100).toFixed(1) + '%',
            down: (downPrice * 100).toFixed(1) + '%',
            upTok: state.upTokens.toFixed(2),
            downTok: state.downTokens.toFixed(2),
            spent: '$' + metrics.totalSpent.toFixed(2),
            profit: '$' + metrics.profit.toFixed(2),
            imbal: (metrics.imbalancePct * 100).toFixed(1) + '%',
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
  logger.info('Shutting down AVWA V2...');
  process.exit(0);
});

// Run
main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});

/**
 * AVWA V3 Strategy Backtester - Multi-Tick Arbitrage
 *
 * Key insight: Buy UP and DOWN at DIFFERENT ticks throughout the window.
 * The losing side becomes very cheap (1-5%) late in the window,
 * making combined average cost < 100%.
 *
 * Strategy:
 *   - Phase 1 (40%): Buy HIGHER side first, then balance
 *   - Phase 2 (40%): Find LOWER prices, balance position
 *   - Phase 3 (20%): DEFEND - wait till end to lock profit
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:7432/polymarket" node scripts/test-avwa.cjs [market_slug]
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================
// AVWA V3 Configuration
// ============================================
const CONFIG = {
  totalCapital: 100,
  phase1Pct: 0.30,            // $30 - initial position (winner side)
  phase2Pct: 0.50,            // $50 - wait for CHEAP loser side
  phase3Pct: 0.20,            // $20 - defense/balance

  tickBuyMin: 1,              // $1 min per tick
  tickBuyMax: 5,              // $5 max per tick

  // Key thresholds for multi-tick arbitrage
  phase2CheapThreshold: 0.15, // Only buy loser when < 15%
  expensiveThreshold: 0.70,   // Skip buying if price > 70%
  reserveWindowSeconds: 120,  // Last 2 min = Phase 3
};

// Calculated pools
const PHASE1_POOL = CONFIG.totalCapital * CONFIG.phase1Pct;
const PHASE2_POOL = CONFIG.totalCapital * CONFIG.phase2Pct;
const PHASE3_POOL = CONFIG.totalCapital * CONFIG.phase3Pct;

// ============================================
// State
// ============================================
let state = {
  phase: 'PH1',  // PH1, PH2, PH3, LOCK

  upTokens: 0,
  upSpent: 0,
  downTokens: 0,
  downSpent: 0,

  phase1Remaining: PHASE1_POOL,
  phase2Remaining: PHASE2_POOL,
  phase3Remaining: PHASE3_POOL,

  tickCount: 0,
  trades: [],

  arbFirstDetected: null,  // Tick when arbitrage first detected

  // Track initial prediction - the side we think will WIN
  predictedWinner: null,   // 'UP' or 'DOWN' - set on first tick based on lower price
};

// ============================================
// Helper Functions
// ============================================

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getMetrics() {
  const totalSpent = state.upSpent + state.downSpent;
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const profit = guaranteed - totalSpent;
  const profitPct = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
  return { totalSpent, guaranteed, profit, profitPct };
}

function canLockProfit() {
  const { profit } = getMetrics();
  return profit > 0;
}

function executeBuy(side, amount, price, phase) {
  if (amount <= 0) return null;

  const tokens = amount / price;

  if (side === 'UP') {
    state.upTokens += tokens;
    state.upSpent += amount;
  } else {
    state.downTokens += tokens;
    state.downSpent += amount;
  }

  state.trades.push({ phase, side, amount, tokens, price });
  return { side, amount, tokens, price };
}

// ============================================
// Per-Tick Logic
// ============================================

function processTick(upPrice, downPrice, timeLeft) {
  state.tickCount++;

  const higherSide = upPrice > downPrice ? 'UP' : 'DOWN';
  const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';
  const higherPrice = Math.max(upPrice, downPrice);
  const lowerPrice = Math.min(upPrice, downPrice);

  // Check if arbitrage possible - mark but continue accumulating
  let arbNote = '';
  if (canLockProfit()) {
    if (!state.arbFirstDetected) {
      state.arbFirstDetected = state.tickCount;
      const { profit } = getMetrics();
      arbNote = ` [ARB! +$${profit.toFixed(2)}]`;
    }
  }

  // On first tick, predict the winner based on lower price
  if (state.predictedWinner === null) {
    state.predictedWinner = lowerSide;  // Lower price at start = likely winner
  }

  const predictedLoser = state.predictedWinner === 'UP' ? 'DOWN' : 'UP';
  const winnerPrice = state.predictedWinner === 'UP' ? upPrice : downPrice;
  const loserPrice = predictedLoser === 'UP' ? upPrice : downPrice;

  // Phase 1: Buy the PREDICTED WINNER side - build initial position
  if (state.phase === 'PH1' && state.phase1Remaining > 0) {
    const amount = Math.min(
      randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax),
      state.phase1Remaining
    );

    // Only buy predicted winner if price hasn't gotten too expensive
    if (winnerPrice <= CONFIG.expensiveThreshold) {
      const trade = executeBuy(state.predictedWinner, amount, winnerPrice, 'PH1');
      state.phase1Remaining -= amount;

      if (state.phase1Remaining <= 0) {
        state.phase = 'PH2';
      }

      return `BUY ${state.predictedWinner} $${amount.toFixed(0)} @ ${(winnerPrice * 100).toFixed(0)}% → ${trade.tokens.toFixed(2)} tkn (winner)${arbNote}`;
    } else {
      // Winner got expensive, switch to Phase 2
      state.phase = 'PH2';
    }
  }

  // Phase 2: Buy LOSER side to BALANCE with winner tokens
  if (state.phase === 'PH2' && state.phase2Remaining > 0) {
    // Calculate how many loser tokens we need to match winner tokens
    const winnerTokens = state.predictedWinner === 'UP' ? state.upTokens : state.downTokens;
    const loserTokens = predictedLoser === 'UP' ? state.upTokens : state.downTokens;
    const tokensNeeded = winnerTokens - loserTokens;

    // If already balanced OR profitable, STOP buying!
    if (tokensNeeded <= 2 && canLockProfit()) {
      state.phase = 'LOCK';
      const { profit } = getMetrics();
      return `LOCKED: Balanced with profit! $${profit.toFixed(2)}${arbNote}`;
    }

    // Only buy when the LOSER side becomes cheap enough
    if (loserPrice <= CONFIG.phase2CheapThreshold && tokensNeeded > 0) {
      // Calculate exact $ needed to get tokensNeeded tokens
      const spendNeeded = tokensNeeded * loserPrice;
      const amount = Math.min(
        randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax),
        state.phase2Remaining,
        spendNeeded + 1  // Slight overshoot OK
      );

      const trade = executeBuy(predictedLoser, amount, loserPrice, 'PH2');
      state.phase2Remaining -= amount;

      if (state.phase2Remaining <= 0) {
        state.phase = 'PH3';
      }

      return `BUY ${predictedLoser} $${amount.toFixed(0)} @ ${(loserPrice * 100).toFixed(0)}% → ${trade.tokens.toFixed(2)} tkn (CHEAP! need ${tokensNeeded.toFixed(0)} more)${arbNote}`;
    }

    // Skip - wait for loser to become cheap
    if (timeLeft <= CONFIG.reserveWindowSeconds) {
      state.phase = 'PH3';
    }
    return '';
  }

  // If locked, stop trading
  if (state.phase === 'LOCK') {
    return '';
  }

  // Phase 3: Defense - use remaining capital to BALANCE (carefully!)
  if (state.phase === 'PH3') {
    const totalRemaining = state.phase2Remaining + state.phase3Remaining;

    if (totalRemaining > 0 && timeLeft <= CONFIG.reserveWindowSeconds) {
      // Calculate how far off balance we are
      const tokenDiff = Math.abs(state.upTokens - state.downTokens);
      const maxTokens = Math.max(state.upTokens, state.downTokens);

      // If already close to balanced (within 10%), stop buying
      if (tokenDiff / maxTokens < 0.10 && maxTokens > 50) {
        state.phase = 'DONE';
        const { profit } = getMetrics();
        return `BALANCED: Tokens close enough, profit: $${profit.toFixed(2)}`;
      }

      // Buy weaker side to balance, but limit spend to what we need
      const weakerSide = state.upTokens <= state.downTokens ? 'UP' : 'DOWN';
      const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

      // Calculate how much $ to spend to get tokenDiff tokens at weakerPrice
      const neededSpend = tokenDiff * weakerPrice;
      const maxSpend = Math.min(randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax), totalRemaining, neededSpend);

      if (maxSpend < 0.5) {
        // Not worth buying
        state.phase = 'DONE';
        const { profit } = getMetrics();
        return `COMPLETE: All capital deployed, profit: $${profit.toFixed(2)}`;
      }

      const trade = executeBuy(weakerSide, maxSpend, weakerPrice, 'PH3');

      // Deduct from phase pools
      if (state.phase2Remaining > 0) {
        const fromPh2 = Math.min(maxSpend, state.phase2Remaining);
        state.phase2Remaining -= fromPh2;
      }
      state.phase3Remaining = Math.max(0, state.phase3Remaining - maxSpend);

      return `DEFENSE: BUY ${weakerSide} $${maxSpend.toFixed(0)} @ ${(weakerPrice * 100).toFixed(0)}% → ${trade.tokens.toFixed(2)} tkn${arbNote}`;
    }

    // All capital used or window not reached yet
    if (totalRemaining <= 0) {
      state.phase = 'DONE';
      const { profit } = getMetrics();
      return `COMPLETE: All capital deployed, profit: $${profit.toFixed(2)}`;
    }

    return '';
  }

  return '';  // No action
}

// ============================================
// Tick Logging
// ============================================

function logTick(snapshot, timeLeft, action) {
  if (state.phase === 'LOCK' && !action.includes('LOCKED')) return;

  const time = snapshot.timestamp.toISOString().substr(11, 8);
  const upPrice = (Number(snapshot.upPrice) * 100).toFixed(1);
  const downPrice = (Number(snapshot.downPrice) * 100).toFixed(1);
  const metrics = getMetrics();

  const upTkn = state.upTokens.toFixed(1);
  const downTkn = state.downTokens.toFixed(1);
  const profit = metrics.profit.toFixed(2);

  console.log(
    `#${state.tickCount.toString().padStart(3)} | ${time} | ` +
    `UP:${upPrice.padStart(5)}% DOWN:${downPrice.padStart(5)}% | ` +
    `[${state.phase.padEnd(4)}] | ` +
    `UP=${upTkn.padStart(7)} DOWN=${downTkn.padStart(7)} | ` +
    `Profit:$${profit.padStart(7)} | ` +
    `${action}`
  );
}

// ============================================
// Main Backtest Function
// ============================================

async function runBacktest(marketSlug) {
  console.log('='.repeat(120));
  console.log('AVWA V3 STRATEGY BACKTEST - Multi-Tick Arbitrage');
  console.log('='.repeat(120));
  console.log(`Market: ${marketSlug}`);
  console.log(`Capital: $${CONFIG.totalCapital.toFixed(2)}`);
  console.log(`  Phase 1: $${PHASE1_POOL.toFixed(2)} (${CONFIG.phase1Pct * 100}%) - Buy higher side, then balance`);
  console.log(`  Phase 2: $${PHASE2_POOL.toFixed(2)} (${CONFIG.phase2Pct * 100}%) - Find lower prices (<${CONFIG.phase2PriceThreshold * 100}%)`);
  console.log(`  Phase 3: $${PHASE3_POOL.toFixed(2)} (${CONFIG.phase3Pct * 100}%) - Defense (last ${CONFIG.reserveWindowSeconds}s)`);
  console.log(`Per-tick: $${CONFIG.tickBuyMin}-$${CONFIG.tickBuyMax}`);
  console.log('='.repeat(120));

  // Fetch price data
  const priceData = await prisma.arbitrageLog.findMany({
    where: { marketSlug },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      upPrice: true,
      downPrice: true,
    },
  });

  if (priceData.length === 0) {
    console.error('No price data found for market:', marketSlug);
    return;
  }

  console.log(`Loaded ${priceData.length} price snapshots`);
  console.log(`Time range: ${priceData[0].timestamp.toISOString()} to ${priceData[priceData.length - 1].timestamp.toISOString()}`);
  console.log('='.repeat(120));

  // Parse window timing
  const slugParts = marketSlug.split('-');
  const windowStartTs = parseInt(slugParts[slugParts.length - 1]);
  const windowEndTs = windowStartTs + 15 * 60;

  // Header
  console.log('\n' + '='.repeat(120));
  console.log('TICK-BY-TICK EXECUTION');
  console.log('='.repeat(120));
  console.log(
    '#     | Time     | ' +
    'UP%    DOWN%   | ' +
    'Phase | ' +
    'UP Tokens   DOWN Tokens | ' +
    'Profit    | Action'
  );
  console.log('-'.repeat(120));

  // Process each tick
  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;

    // Stop if locked
    if (state.phase === 'LOCK') break;

    // Process tick
    const action = processTick(upPrice, downPrice, timeLeft);

    // Log tick (only if action or significant)
    if (action || state.tickCount <= 5 || state.tickCount % 50 === 0 || timeLeft <= 120) {
      logTick(snapshot, timeLeft, action);
    }
  }

  console.log('='.repeat(120));

  // Final results
  console.log('\n' + '='.repeat(120));
  console.log('FINAL RESULTS');
  console.log('='.repeat(120));

  const metrics = getMetrics();
  const finalUpPrice = Number(priceData[priceData.length - 1].upPrice);
  const finalDownPrice = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUpPrice > finalDownPrice ? 'UP' : 'DOWN';

  console.log(`Final Phase: ${state.phase}`);
  console.log(`Market Winner: ${winner} (UP: ${(finalUpPrice * 100).toFixed(1)}%, DOWN: ${(finalDownPrice * 100).toFixed(1)}%)`);
  console.log('');

  // Phase breakdown
  const phase1Trades = state.trades.filter(t => t.phase === 'PH1');
  const phase2Trades = state.trades.filter(t => t.phase === 'PH2');
  const phase3Trades = state.trades.filter(t => t.phase === 'PH3');

  console.log('Phase Breakdown:');
  console.log(`  Phase 1: ${phase1Trades.length} buys, $${(PHASE1_POOL - state.phase1Remaining).toFixed(2)} spent`);
  console.log(`  Phase 2: ${phase2Trades.length} buys, $${(PHASE2_POOL - state.phase2Remaining).toFixed(2)} spent`);
  console.log(`  Phase 3: ${phase3Trades.length} buys, $${(PHASE3_POOL - state.phase3Remaining).toFixed(2)} spent`);
  console.log('');

  // Token breakdown
  const upAvgPrice = state.upSpent > 0 ? state.upSpent / state.upTokens : 0;
  const downAvgPrice = state.downSpent > 0 ? state.downSpent / state.downTokens : 0;

  console.log('Position:');
  console.log(`  UP:   ${state.upTokens.toFixed(2)} tokens (spent $${state.upSpent.toFixed(2)}, avg ${(upAvgPrice * 100).toFixed(1)}%)`);
  console.log(`  DOWN: ${state.downTokens.toFixed(2)} tokens (spent $${state.downSpent.toFixed(2)}, avg ${(downAvgPrice * 100).toFixed(1)}%)`);
  console.log(`  Combined Avg: ${((upAvgPrice + downAvgPrice) * 100).toFixed(1)}%`);
  console.log('');

  // Outcome
  console.log('Outcome:');
  console.log(`  Total Spent: $${metrics.totalSpent.toFixed(2)}`);
  console.log(`  Guaranteed (min tokens): ${metrics.guaranteed.toFixed(2)} = $${metrics.guaranteed.toFixed(2)}`);
  console.log(`  Profit: $${metrics.profit.toFixed(2)} (${metrics.profitPct.toFixed(2)}%)`);
  console.log('');

  // Actual payout based on winner
  const actualPayout = winner === 'UP' ? state.upTokens : state.downTokens;
  const actualProfit = actualPayout - metrics.totalSpent;
  console.log('Actual (winner-based):');
  console.log(`  Winner: ${winner}`);
  console.log(`  Payout: $${actualPayout.toFixed(2)}`);
  console.log(`  Actual Profit: $${actualProfit.toFixed(2)} (${((actualProfit / metrics.totalSpent) * 100).toFixed(2)}%)`);

  console.log('='.repeat(120));

  // Summary
  console.log('\nSUMMARY:');
  if (state.phase === 'LOCK' && metrics.profit > 0) {
    console.log(`  SUCCESS - Arbitrage locked with $${metrics.profit.toFixed(2)} guaranteed profit`);
  } else if (actualProfit > 0) {
    console.log(`  Partial WIN - Made $${actualProfit.toFixed(2)} (${winner} won)`);
  } else {
    console.log(`  LOSS - Lost $${Math.abs(actualProfit).toFixed(2)}`);
  }
}

// ============================================
// Entry Point
// ============================================

const marketSlug = process.argv[2] || 'btc-updown-15m-1766919600';

runBacktest(marketSlug)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

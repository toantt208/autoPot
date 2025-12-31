/**
 * Micro Buy Strategy - Based on SmartMicroBot Algorithm
 *
 * Key Insight: Solve system of equations at each tick to find optimal
 * buy amounts that balance UP/DOWN holdings for guaranteed profit.
 *
 * Equations:
 *   Goal: holdings.UP ≈ holdings.DOWN ≈ totalSpent
 *   Solve for bUp, bDown at each tick to achieve balance
 *
 * Capital Guard: Don't buy more than X times total spent in one tick
 * (prevents extreme price swings from draining capital)
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:7432/polymarket" node scripts/test-micro-buy.cjs [market_slug]
 */

const { PrismaClient } = require('@prisma/client');

// Hardcode database URL for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:7432/polymarket';

const prisma = new PrismaClient();

// ============================================
// Configuration
// ============================================
const CONFIG = {
  initialBalance: 100,      // Starting capital
  maxBuyRatio: 2.0,         // Max buy per tick = 2x total spent
  minBuyAmount: 0.10,       // Minimum buy to execute
  tickBuyMin: 1,            // Min $ per tick
  tickBuyMax: 5,            // Max $ per tick (micro buying)

  // Entry conditions
  minPrice: 0.01,           // Don't buy if price < 1%
  maxPrice: 0.95,           // Don't buy if price > 95%

  // Cheap buying threshold
  cheapThreshold: 0.20,     // Buy aggressively when price < 20%
  expensiveThreshold: 0.70, // Avoid buying when price > 70%
};

// ============================================
// Micro Buy Bot Class
// ============================================
class MicroBuyBot {
  constructor(initialBalance, maxBuyRatio) {
    this.balance = initialBalance;
    this.maxBuyRatio = maxBuyRatio;
    this.holdings = { UP: 0, DOWN: 0 };
    this.totalSpent = 0;
    this.trades = [];
    this.tickCount = 0;

    // V4-style: Buy both sides, prefer cheap side
    this.predictedWinner = null;  // Track for stats only
    this.phase1Pool = initialBalance * 0.50;  // 50% - buy both sides early
    this.phase2Pool = initialBalance * 0.40;  // 40% - buy cheap side to balance
    this.phase3Pool = initialBalance * 0.10;  // 10% - reserve
  }

  /**
   * Calculate optimal buy amounts using linear algebra
   * Goal: After buying, holdings.UP ≈ holdings.DOWN ≈ totalSpent + cost
   */
  calculateOptimalBuy(pUp, pDown) {
    // System of equations:
    // (holdings.UP + bUp/pUp) = (holdings.DOWN + bDown/pDown)  [balance condition]
    // (holdings.UP + bUp/pUp) = (totalSpent + bUp + bDown)      [profit condition]
    //
    // Rearranged:
    // a1*bUp + b1*bDown = c1
    // a2*bUp + b2*bDown = c2

    const a1 = (1 / pUp) - 1;
    const b1 = -1;
    const c1 = this.totalSpent - this.holdings.UP;

    const a2 = -1;
    const b2 = (1 / pDown) - 1;
    const c2 = this.totalSpent - this.holdings.DOWN;

    // Solve using Cramer's rule
    const D = a1 * b2 - a2 * b1;
    if (Math.abs(D) < 0.0001) {
      return { bUp: 0, bDown: 0, reason: 'singular_matrix' };
    }

    let bUp = (c1 * b2 - c2 * b1) / D;
    let bDown = (a1 * c2 - a2 * c1) / D;

    // Can't buy negative amounts
    bUp = Math.max(0, bUp);
    bDown = Math.max(0, bDown);

    return { bUp, bDown, reason: 'calculated' };
  }

  /**
   * Process a single price tick
   * V4 Strategy: Buy BOTH sides to stay balanced, prefer cheap prices
   */
  onPriceTick(upPrice, downPrice, timeLeft) {
    this.tickCount++;

    // Identify price sides
    const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const higherSide = upPrice > downPrice ? 'UP' : 'DOWN';
    const lowerPrice = Math.min(upPrice, downPrice);
    const higherPrice = Math.max(upPrice, downPrice);

    // Track predicted winner for stats (but don't use it for buying)
    if (this.predictedWinner === null) {
      this.predictedWinner = lowerSide;
    }

    // Check current arbitrage status
    const guaranteed = Math.min(this.holdings.UP, this.holdings.DOWN);
    const profit = guaranteed - this.totalSpent;
    const tokenDiff = Math.abs(this.holdings.UP - this.holdings.DOWN);
    const maxTokens = Math.max(this.holdings.UP, this.holdings.DOWN);
    const isBalanced = maxTokens > 0 ? tokenDiff / maxTokens < 0.15 : false;

    // If we have profit locked + balanced, stop buying
    if (profit > 0 && isBalanced && maxTokens > 30) {
      return { action: 'SKIP', reason: 'profit_locked' };
    }

    // === PHASE 1: Buy BOTH sides to build balanced position (50%) ===
    if (this.phase1Pool > 0) {
      // Buy the side with FEWER tokens to stay balanced
      const weakerSide = this.holdings.UP <= this.holdings.DOWN ? 'UP' : 'DOWN';
      const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

      // Only buy if price is reasonable (< 70%)
      if (weakerPrice <= CONFIG.expensiveThreshold) {
        const amount = Math.min(
          Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
          this.phase1Pool,
          this.balance
        );

        if (amount >= CONFIG.minBuyAmount) {
          this.phase1Pool -= amount;

          if (weakerSide === 'UP') {
            return this.execute(amount, 0, upPrice, downPrice);
          } else {
            return this.execute(0, amount, upPrice, downPrice);
          }
        }
      } else {
        // Price too high, try the other side
        const otherSide = weakerSide === 'UP' ? 'DOWN' : 'UP';
        const otherPrice = otherSide === 'UP' ? upPrice : downPrice;

        if (otherPrice <= CONFIG.expensiveThreshold) {
          const amount = Math.min(
            Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
            this.phase1Pool,
            this.balance
          );

          if (amount >= CONFIG.minBuyAmount) {
            this.phase1Pool -= amount;

            if (otherSide === 'UP') {
              return this.execute(amount, 0, upPrice, downPrice);
            } else {
              return this.execute(0, amount, upPrice, downPrice);
            }
          }
        }
      }

      // Both sides too expensive, end phase 1
      if (higherPrice > CONFIG.expensiveThreshold) {
        this.phase1Pool = 0;
      }
    }

    // === PHASE 2: Buy CHEAP side to balance (40%) ===
    if (this.phase2Pool > 0) {
      // Already balanced and profitable? Lock it!
      if (isBalanced && profit > 0 && maxTokens > 30) {
        return { action: 'SKIP', reason: 'balanced_profitable' };
      }

      // Only buy when the lower price is CHEAP (< 20%)
      if (lowerPrice <= CONFIG.cheapThreshold && lowerPrice >= CONFIG.minPrice) {
        const amount = Math.min(
          Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
          this.phase2Pool,
          this.balance
        );

        if (amount >= CONFIG.minBuyAmount) {
          this.phase2Pool -= amount;

          if (lowerSide === 'UP') {
            return this.execute(amount, 0, upPrice, downPrice);
          } else {
            return this.execute(0, amount, upPrice, downPrice);
          }
        }
      }

      // Time pressure: deploy remaining to balance
      if (timeLeft <= 120 && this.phase2Pool > 0) {
        const weakerSide = this.holdings.UP < this.holdings.DOWN ? 'UP' : 'DOWN';
        const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

        if (weakerPrice <= 0.50 && tokenDiff > 5) {
          const amount = Math.min(this.phase2Pool, this.balance);
          if (amount >= CONFIG.minBuyAmount) {
            this.phase2Pool -= amount;

            if (weakerSide === 'UP') {
              return this.execute(amount, 0, upPrice, downPrice);
            } else {
              return this.execute(0, amount, upPrice, downPrice);
            }
          }
        }
      }
    }

    // === PHASE 3: Reserve for final balance (10%) ===
    if (this.phase3Pool > 0 && timeLeft <= 60) {
      const weakerSide = this.holdings.UP < this.holdings.DOWN ? 'UP' : 'DOWN';
      const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

      // Try to balance position if significantly imbalanced
      if (tokenDiff > 10 && weakerPrice <= 0.30) {
        const amount = Math.min(this.phase3Pool, this.balance);
        if (amount >= CONFIG.minBuyAmount) {
          this.phase3Pool -= amount;

          if (weakerSide === 'UP') {
            return this.execute(amount, 0, upPrice, downPrice);
          } else {
            return this.execute(0, amount, upPrice, downPrice);
          }
        }
      }
    }

    return { action: 'SKIP', reason: 'no_opportunity' };
  }

  /**
   * Execute a buy order
   */
  execute(bUp, bDown, pUp, pDown) {
    const cost = bUp + bDown;

    const upTokens = bUp / pUp;
    const downTokens = bDown / pDown;

    this.holdings.UP += upTokens;
    this.holdings.DOWN += downTokens;
    this.totalSpent += cost;
    this.balance -= cost;

    const trade = {
      tick: this.tickCount,
      bUp,
      bDown,
      pUp,
      pDown,
      upTokens,
      downTokens,
      cost,
    };
    this.trades.push(trade);

    return {
      action: 'BUY',
      trade,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const minPayout = Math.min(this.holdings.UP, this.holdings.DOWN);
    const profit = minPayout - this.totalSpent;
    const profitPct = this.totalSpent > 0 ? (profit / this.totalSpent) * 100 : 0;
    const imbalance = Math.abs(this.holdings.UP - this.holdings.DOWN);
    const maxHoldings = Math.max(this.holdings.UP, this.holdings.DOWN);
    const imbalancePct = maxHoldings > 0 ? (imbalance / maxHoldings) * 100 : 0;

    return {
      upTokens: this.holdings.UP,
      downTokens: this.holdings.DOWN,
      totalSpent: this.totalSpent,
      balance: this.balance,
      minPayout,
      profit,
      profitPct,
      imbalancePct,
    };
  }
}

// ============================================
// Tick Logging
// ============================================
function logTick(tick, snapshot, result, metrics) {
  const time = snapshot.timestamp.toISOString().substr(11, 8);
  const upPrice = (Number(snapshot.upPrice) * 100).toFixed(1);
  const downPrice = (Number(snapshot.downPrice) * 100).toFixed(1);

  let actionStr = '';
  if (result.action === 'BUY') {
    const t = result.trade;
    actionStr = `BUY UP:$${t.bUp.toFixed(2)} DOWN:$${t.bDown.toFixed(2)}`;
  } else if (result.action === 'GUARD') {
    actionStr = `GUARD (need $${result.needed.toFixed(0)}, limit $${result.limit.toFixed(0)})`;
  } else if (result.action === 'SKIP') {
    actionStr = `SKIP (${result.reason})`;
  }

  const upTkn = metrics.upTokens.toFixed(1);
  const downTkn = metrics.downTokens.toFixed(1);
  const profit = metrics.profit.toFixed(2);
  const imbal = metrics.imbalancePct.toFixed(1);

  console.log(
    `#${tick.toString().padStart(3)} | ${time} | ` +
    `UP:${upPrice.padStart(5)}% DOWN:${downPrice.padStart(5)}% | ` +
    `Tkn: UP=${upTkn.padStart(7)} DN=${downTkn.padStart(7)} | ` +
    `Imbal:${imbal.padStart(5)}% | ` +
    `Profit:$${profit.padStart(7)} | ` +
    actionStr
  );
}

// ============================================
// Main Backtest Function
// ============================================
async function runBacktest(marketSlug) {
  console.log('='.repeat(130));
  console.log('MICRO BUY STRATEGY BACKTEST');
  console.log('='.repeat(130));
  console.log(`Market: ${marketSlug}`);
  console.log(`Initial Balance: $${CONFIG.initialBalance}`);
  console.log(`Max Buy Ratio: ${CONFIG.maxBuyRatio}x`);
  console.log(`Max Per Tick: $${CONFIG.tickBuyMax}`);
  console.log('='.repeat(130));

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
  console.log('='.repeat(130));

  // Parse window timing
  const slugParts = marketSlug.split('-');
  const windowStartTs = parseInt(slugParts[slugParts.length - 1]);
  const windowEndTs = windowStartTs + 15 * 60;

  // Create bot
  const bot = new MicroBuyBot(CONFIG.initialBalance, CONFIG.maxBuyRatio);

  // Header
  console.log('\n' + '='.repeat(130));
  console.log('TICK-BY-TICK EXECUTION');
  console.log('='.repeat(130));

  // Process each tick
  let lastLogTick = 0;
  for (let i = 0; i < priceData.length; i++) {
    const snapshot = priceData[i];
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;

    const result = bot.onPriceTick(upPrice, downPrice, timeLeft);
    const metrics = bot.getMetrics();

    // Log significant events or periodic updates
    const tick = i + 1;
    const shouldLog =
      result.action === 'BUY' ||
      result.action === 'GUARD' ||
      tick <= 5 ||
      tick % 100 === 0 ||
      timeLeft <= 120 ||
      tick === priceData.length;

    if (shouldLog && tick !== lastLogTick) {
      logTick(tick, snapshot, result, metrics);
      lastLogTick = tick;
    }
  }

  console.log('='.repeat(130));

  // Final results
  console.log('\n' + '='.repeat(130));
  console.log('FINAL RESULTS');
  console.log('='.repeat(130));

  const metrics = bot.getMetrics();
  const finalUpPrice = Number(priceData[priceData.length - 1].upPrice);
  const finalDownPrice = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUpPrice > finalDownPrice ? 'UP' : 'DOWN';

  console.log(`Final Phase: ${bot.tickCount} ticks processed`);
  console.log(`Market Winner: ${winner} (UP: ${(finalUpPrice * 100).toFixed(1)}%, DOWN: ${(finalDownPrice * 100).toFixed(1)}%)`);
  console.log(`Predicted Winner: ${bot.predictedWinner} (${bot.predictedWinner === winner ? 'CORRECT' : 'WRONG'})`);
  console.log('');

  // Trade summary
  console.log('Trade Summary:');
  console.log(`  Total Trades: ${bot.trades.length}`);
  console.log(`  Total Spent: $${metrics.totalSpent.toFixed(2)}`);
  console.log(`  Remaining Balance: $${metrics.balance.toFixed(2)}`);
  console.log('');

  // Position
  const upAvg = metrics.upTokens > 0 ? (bot.trades.filter(t => t.bUp > 0).reduce((s, t) => s + t.bUp, 0) / metrics.upTokens) : 0;
  const downAvg = metrics.downTokens > 0 ? (bot.trades.filter(t => t.bDown > 0).reduce((s, t) => s + t.bDown, 0) / metrics.downTokens) : 0;

  console.log('Position:');
  console.log(`  UP:   ${metrics.upTokens.toFixed(2)} tokens`);
  console.log(`  DOWN: ${metrics.downTokens.toFixed(2)} tokens`);
  console.log(`  Imbalance: ${metrics.imbalancePct.toFixed(2)}%`);
  console.log('');

  // Outcome
  console.log('Outcome:');
  console.log(`  Guaranteed (min tokens): ${metrics.minPayout.toFixed(2)} = $${metrics.minPayout.toFixed(2)}`);
  console.log(`  Profit: $${metrics.profit.toFixed(2)} (${metrics.profitPct.toFixed(2)}%)`);
  console.log('');

  // Actual payout based on winner
  const actualPayout = winner === 'UP' ? metrics.upTokens : metrics.downTokens;
  const actualProfit = actualPayout - metrics.totalSpent;
  console.log('Actual (winner-based):');
  console.log(`  Winner: ${winner}`);
  console.log(`  Payout: $${actualPayout.toFixed(2)}`);
  console.log(`  Actual Profit: $${actualProfit.toFixed(2)} (${((actualProfit / metrics.totalSpent) * 100).toFixed(2)}%)`);

  console.log('='.repeat(130));

  // Summary
  console.log('\nSUMMARY:');
  if (metrics.profit > 0) {
    console.log(`  SUCCESS - Guaranteed profit of $${metrics.profit.toFixed(2)}`);
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

/**
 * Tiered Buy Strategy V5 - No Prediction
 *
 * Core concept:
 * - Always buy the WEAKER side (lower price = better value)
 * - Use tiered budgets based on price ranges
 * - SAVING mode: "Golden time" when side with more tokens drops below 50%
 * - Stop when: min(UP, DOWN) > totalSpent (arbitrage locked)
 *
 * Usage:
 *   node scripts/test-tiered-buy.cjs [market_slug]
 */

const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:7432/polymarket';
const prisma = new PrismaClient();

// ============================================
// Configuration
// ============================================
const CONFIG = {
  totalCapital: 1000,
  tickBuyMin: 1,
  tickBuyMax: 5,
};

// Tier budgets for each price range
const TIERS = {
  building: {
    // For accumulating position normally
    '50-60': 100,  // Good value range
    '60-70': 50,   // Getting expensive
    '70-80': 25,   // Expensive
    '80+': 25,     // Very expensive, minimal buying
  },
  saving: {
    // "Golden time" - side with more tokens is now losing
    '40-50': 100,  // Starting to get cheap
    '30-40': 200,  // Getting cheaper
    '20-30': 300,  // Very cheap
    '<20': 400,    // Extremely cheap - buy aggressively
  }
};

// ============================================
// TieredBuyBot Class
// ============================================
class TieredBuyBot {
  constructor() {
    this.holdings = { UP: 0, DOWN: 0 };
    this.totalSpent = 0;
    this.balance = CONFIG.totalCapital;
    this.tickCount = 0;
    this.trades = [];
    this.locked = false;

    // Track spending per tier per side
    this.tierSpent = {
      UP: { building: {}, saving: {} },
      DOWN: { building: {}, saving: {} }
    };
  }

  getTierKey(price) {
    const p = price * 100;
    if (p >= 80) return '80+';
    if (p >= 70) return '70-80';
    if (p >= 60) return '60-70';
    if (p >= 50) return '50-60';
    if (p >= 40) return '40-50';
    if (p >= 30) return '30-40';
    if (p >= 20) return '20-30';
    return '<20';
  }

  getMode(side, sidePrice) {
    // Simple rule: price < 50% → always use saving tiers (cheap = buy more)
    // price >= 50% → use building tiers (expensive = buy less)
    if (sidePrice < 0.50) {
      return 'saving';  // Cheap prices = good value, buy more
    }
    return 'building';  // Expensive prices = buy less
  }

  getRemainingBudget(side, mode, tierKey) {
    const budgets = mode === 'building' ? TIERS.building : TIERS.saving;
    const maxBudget = budgets[tierKey] || 0;
    const spent = this.tierSpent[side][mode][tierKey] || 0;
    return maxBudget - spent;
  }

  processTick(upPrice, downPrice) {
    this.tickCount++;

    // Check arbitrage condition
    const guaranteed = Math.min(this.holdings.UP, this.holdings.DOWN);
    if (guaranteed > this.totalSpent && guaranteed > 0) {
      this.locked = true;
      return { action: 'LOCKED', profit: guaranteed - this.totalSpent };
    }

    // Already locked? Skip
    if (this.locked) {
      return { action: 'SKIP', reason: 'already_locked' };
    }

    // No balance left?
    if (this.balance <= 0) {
      return { action: 'SKIP', reason: 'no_balance' };
    }

    // Determine weaker side (lower price = better value)
    const weakerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const weakerPrice = Math.min(upPrice, downPrice);

    // Get mode and tier for weaker side
    const mode = this.getMode(weakerSide, weakerPrice);
    const tierKey = this.getTierKey(weakerPrice);
    const remaining = this.getRemainingBudget(weakerSide, mode, tierKey);

    // Check if we can buy
    if (remaining <= 0) {
      return { action: 'SKIP', reason: 'tier_exhausted', tier: tierKey, mode };
    }

    // Random amount $1-5, capped by remaining budget and balance
    const amount = Math.min(
      Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
      remaining,
      this.balance
    );

    if (amount < 0.10) {
      return { action: 'SKIP', reason: 'amount_too_small' };
    }

    // Execute buy
    const tokens = amount / weakerPrice;
    this.holdings[weakerSide] += tokens;
    this.totalSpent += amount;
    this.balance -= amount;
    this.tierSpent[weakerSide][mode][tierKey] =
      (this.tierSpent[weakerSide][mode][tierKey] || 0) + amount;

    const trade = {
      tick: this.tickCount,
      side: weakerSide,
      mode,
      tier: tierKey,
      amount,
      tokens,
      price: weakerPrice
    };
    this.trades.push(trade);

    return { action: 'BUY', ...trade };
  }

  getMetrics() {
    const guaranteed = Math.min(this.holdings.UP, this.holdings.DOWN);
    const profit = guaranteed - this.totalSpent;
    const imbalance = Math.abs(this.holdings.UP - this.holdings.DOWN);
    const maxHoldings = Math.max(this.holdings.UP, this.holdings.DOWN);
    const imbalancePct = maxHoldings > 0 ? (imbalance / maxHoldings) * 100 : 0;

    return {
      upTokens: this.holdings.UP,
      downTokens: this.holdings.DOWN,
      totalSpent: this.totalSpent,
      balance: this.balance,
      guaranteed,
      profit,
      profitPct: this.totalSpent > 0 ? (profit / this.totalSpent) * 100 : 0,
      imbalancePct,
      locked: this.locked
    };
  }

  getTierSummary() {
    const summary = { UP: {}, DOWN: {} };
    for (const side of ['UP', 'DOWN']) {
      for (const mode of ['building', 'saving']) {
        for (const [tier, spent] of Object.entries(this.tierSpent[side][mode])) {
          if (spent > 0) {
            const key = `${mode}:${tier}`;
            summary[side][key] = spent.toFixed(2);
          }
        }
      }
    }
    return summary;
  }
}

// ============================================
// Logging
// ============================================
function logTick(tick, snapshot, result, metrics) {
  const time = snapshot.timestamp.toISOString().substr(11, 8);
  const upPrice = (Number(snapshot.upPrice) * 100).toFixed(1);
  const downPrice = (Number(snapshot.downPrice) * 100).toFixed(1);

  let actionStr = '';
  if (result.action === 'BUY') {
    actionStr = `BUY ${result.side} $${result.amount.toFixed(2)} @ ${(result.price * 100).toFixed(0)}% [${result.mode}:${result.tier}] → ${result.tokens.toFixed(1)} tkn`;
  } else if (result.action === 'LOCKED') {
    actionStr = `LOCKED! Profit: $${result.profit.toFixed(2)}`;
  } else if (result.action === 'SKIP') {
    actionStr = `SKIP (${result.reason}${result.tier ? ` ${result.tier}` : ''})`;
  }

  const upTkn = metrics.upTokens.toFixed(1);
  const downTkn = metrics.downTokens.toFixed(1);
  const profit = metrics.profit.toFixed(2);

  console.log(
    `#${tick.toString().padStart(3)} | ${time} | ` +
    `UP:${upPrice.padStart(5)}% DOWN:${downPrice.padStart(5)}% | ` +
    `Tkn: UP=${upTkn.padStart(7)} DN=${downTkn.padStart(7)} | ` +
    `$${metrics.totalSpent.toFixed(0).padStart(4)} | ` +
    actionStr
  );
}

// ============================================
// Main Backtest Function
// ============================================
async function runBacktest(marketSlug) {
  console.log('='.repeat(140));
  console.log('TIERED BUY STRATEGY V5 - Backtest');
  console.log('='.repeat(140));
  console.log(`Market: ${marketSlug}`);
  console.log(`Capital: $${CONFIG.totalCapital}`);
  console.log(`Per-tick: $${CONFIG.tickBuyMin}-${CONFIG.tickBuyMax}`);
  console.log('');
  console.log('BUILDING Tiers:', JSON.stringify(TIERS.building));
  console.log('SAVING Tiers:', JSON.stringify(TIERS.saving));
  console.log('='.repeat(140));

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
  console.log('='.repeat(140));

  // Create bot
  const bot = new TieredBuyBot();

  // Header
  console.log('\n' + '='.repeat(140));
  console.log('TICK-BY-TICK EXECUTION');
  console.log('='.repeat(140));

  // Process each tick
  let lastLogTick = 0;
  for (let i = 0; i < priceData.length; i++) {
    const snapshot = priceData[i];
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);

    const result = bot.processTick(upPrice, downPrice);
    const metrics = bot.getMetrics();

    // Log significant events or periodic updates
    const tick = i + 1;
    const shouldLog =
      result.action === 'BUY' ||
      result.action === 'LOCKED' ||
      tick <= 5 ||
      tick % 100 === 0 ||
      tick === priceData.length;

    if (shouldLog && tick !== lastLogTick) {
      logTick(tick, snapshot, result, metrics);
      lastLogTick = tick;
    }

    // Stop if locked
    if (result.action === 'LOCKED') {
      break;
    }
  }

  console.log('='.repeat(140));

  // Final results
  console.log('\n' + '='.repeat(140));
  console.log('FINAL RESULTS');
  console.log('='.repeat(140));

  const metrics = bot.getMetrics();
  const finalUpPrice = Number(priceData[priceData.length - 1].upPrice);
  const finalDownPrice = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUpPrice > finalDownPrice ? 'UP' : 'DOWN';

  console.log(`Ticks processed: ${bot.tickCount}`);
  console.log(`Total trades: ${bot.trades.length}`);
  console.log(`Market Winner: ${winner} (UP: ${(finalUpPrice * 100).toFixed(1)}%, DOWN: ${(finalDownPrice * 100).toFixed(1)}%)`);
  console.log('');

  // Position
  console.log('Position:');
  console.log(`  UP:   ${metrics.upTokens.toFixed(2)} tokens`);
  console.log(`  DOWN: ${metrics.downTokens.toFixed(2)} tokens`);
  console.log(`  Imbalance: ${metrics.imbalancePct.toFixed(2)}%`);
  console.log('');

  // Spending
  console.log('Spending:');
  console.log(`  Total Spent: $${metrics.totalSpent.toFixed(2)}`);
  console.log(`  Remaining: $${metrics.balance.toFixed(2)}`);
  console.log('');

  // Tier usage
  console.log('Tier Usage:');
  const tierSummary = bot.getTierSummary();
  console.log(`  UP: ${JSON.stringify(tierSummary.UP)}`);
  console.log(`  DOWN: ${JSON.stringify(tierSummary.DOWN)}`);
  console.log('');

  // Outcome
  console.log('Outcome:');
  console.log(`  Guaranteed (min tokens): ${metrics.guaranteed.toFixed(2)}`);
  console.log(`  Profit: $${metrics.profit.toFixed(2)} (${metrics.profitPct.toFixed(2)}%)`);
  console.log(`  Status: ${metrics.locked ? 'LOCKED' : 'NOT LOCKED'}`);
  console.log('');

  // Actual payout
  const actualPayout = winner === 'UP' ? metrics.upTokens : metrics.downTokens;
  const actualProfit = actualPayout - metrics.totalSpent;
  console.log('Actual (winner-based):');
  console.log(`  Winner: ${winner}`);
  console.log(`  Payout: $${actualPayout.toFixed(2)}`);
  console.log(`  Actual Profit: $${actualProfit.toFixed(2)} (${((actualProfit / metrics.totalSpent) * 100).toFixed(2)}%)`);

  console.log('='.repeat(140));

  // Summary
  console.log('\nSUMMARY:');
  if (metrics.profit > 0) {
    console.log(`  SUCCESS - Guaranteed profit of $${metrics.profit.toFixed(2)} (${metrics.profitPct.toFixed(2)}%)`);
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

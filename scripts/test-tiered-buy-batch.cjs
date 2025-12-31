/**
 * Tiered Buy Strategy V5 - Batch Tester
 *
 * Tests the tiered buying strategy across multiple windows.
 * Core concept:
 * - Always buy the WEAKER side (lower price = better value)
 * - Use tiered budgets based on price ranges
 * - Stop when: min(UP, DOWN) > totalSpent (arbitrage locked)
 *
 * Usage:
 *   node scripts/test-tiered-buy-batch.cjs [crypto] [limit]
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
    '50-60': 100,
    '60-70': 50,
    '70-80': 25,
    '80+': 25,
  },
  saving: {
    '40-50': 100,
    '30-40': 200,
    '20-30': 300,
    '<20': 400,
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
    this.locked = false;

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
    if (sidePrice < 0.50) {
      return 'saving';
    }
    return 'building';
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

    if (this.locked) return { action: 'SKIP', reason: 'already_locked' };
    if (this.balance <= 0) return { action: 'SKIP', reason: 'no_balance' };

    const weakerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const weakerPrice = Math.min(upPrice, downPrice);

    const mode = this.getMode(weakerSide, weakerPrice);
    const tierKey = this.getTierKey(weakerPrice);
    const remaining = this.getRemainingBudget(weakerSide, mode, tierKey);

    if (remaining <= 0) return { action: 'SKIP', reason: 'tier_exhausted' };

    const amount = Math.min(
      Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
      remaining,
      this.balance
    );

    if (amount < 0.10) return { action: 'SKIP', reason: 'amount_too_small' };

    const tokens = amount / weakerPrice;
    this.holdings[weakerSide] += tokens;
    this.totalSpent += amount;
    this.balance -= amount;
    this.tierSpent[weakerSide][mode][tierKey] =
      (this.tierSpent[weakerSide][mode][tierKey] || 0) + amount;

    return { action: 'BUY', side: weakerSide, amount, tokens, price: weakerPrice };
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
}

// ============================================
// Simulate Single Window
// ============================================
function simulateWindow(priceData) {
  const bot = new TieredBuyBot();

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const result = bot.processTick(upPrice, downPrice);

    if (result.action === 'LOCKED') break;
  }

  const metrics = bot.getMetrics();
  const finalUp = Number(priceData[priceData.length - 1].upPrice);
  const finalDown = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUp > finalDown ? 'UP' : 'DOWN';
  const actualPayout = winner === 'UP' ? metrics.upTokens : metrics.downTokens;
  const actualProfit = actualPayout - metrics.totalSpent;

  return {
    ...metrics,
    winner,
    actualPayout,
    actualProfit,
    actualProfitPct: metrics.totalSpent > 0 ? (actualProfit / metrics.totalSpent) * 100 : 0,
    entered: metrics.totalSpent > 0,
  };
}

// ============================================
// Main Batch Function
// ============================================
async function run() {
  const crypto = process.argv[2] || 'btc';
  const limit = parseInt(process.argv[3]) || 100;

  const markets = await prisma.$queryRaw`
    SELECT DISTINCT market_slug FROM arbitrage_logs
    WHERE crypto = ${crypto} AND market_slug LIKE ${crypto + '-updown-15m-%'}
    GROUP BY market_slug HAVING COUNT(*) > 100
    ORDER BY market_slug DESC LIMIT ${limit}
  `;

  console.log('='.repeat(120));
  console.log('TIERED BUY STRATEGY V5 - Batch Test');
  console.log('='.repeat(120));
  console.log(`Crypto: ${crypto.toUpperCase()}`);
  console.log(`Markets: ${markets.length}`);
  console.log(`Capital: $${CONFIG.totalCapital}`);
  console.log('');
  console.log('BUILDING Tiers:', JSON.stringify(TIERS.building));
  console.log('SAVING Tiers:', JSON.stringify(TIERS.saving));
  console.log('='.repeat(120));
  console.log('');

  let wins = 0, losses = 0, locks = 0;
  let totalSpent = 0, totalActualProfit = 0, totalGuaranteedProfit = 0;
  let entered = 0, skipped = 0;

  for (const m of markets) {
    const slug = m.market_slug;
    const data = await prisma.arbitrageLog.findMany({
      where: { marketSlug: slug },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, upPrice: true, downPrice: true },
    });
    if (data.length < 50) {
      skipped++;
      continue;
    }

    const r = simulateWindow(data);

    if (r.entered) {
      entered++;
      const profitStr = r.actualProfit >= 0
        ? '+$' + r.actualProfit.toFixed(2)
        : '-$' + Math.abs(r.actualProfit).toFixed(2);
      const lockStr = r.locked ? 'LOCK' : 'OPEN';
      const balance = 'UP:' + r.upTokens.toFixed(0).padStart(5) + ' DN:' + r.downTokens.toFixed(0).padStart(5);
      const imb = r.imbalancePct.toFixed(0) + '%';

      console.log(
        slug + ' | ' +
        lockStr.padEnd(4) + ' | ' +
        'Win:' + r.winner + ' | ' +
        balance + ' | ' +
        'Imb:' + imb.padStart(4) + ' | ' +
        'Spent:$' + r.totalSpent.toFixed(0).padStart(4) + ' | ' +
        profitStr.padStart(10)
      );

      totalSpent += r.totalSpent;
      totalActualProfit += r.actualProfit;
      totalGuaranteedProfit += r.profit;
      if (r.actualProfit > 0) wins++;
      else losses++;
      if (r.locked) locks++;
    } else {
      skipped++;
    }
  }

  const total = wins + losses;
  console.log('');
  console.log('='.repeat(120));
  console.log('SUMMARY');
  console.log('='.repeat(120));
  console.log('');
  console.log('Markets tested: ' + (entered + skipped));
  console.log('Entered: ' + entered + ' (' + (entered / (entered + skipped) * 100).toFixed(1) + '%)');
  console.log('Skipped: ' + skipped);
  console.log('');

  if (total > 0) {
    console.log('Results: ' + wins + ' wins, ' + losses + ' losses (' + (wins / total * 100).toFixed(1) + '% win rate)');
    console.log('Locks achieved: ' + locks + '/' + total + ' (' + (locks / total * 100).toFixed(1) + '%)');
    console.log('');
    console.log('Financials (Actual - based on winner):');
    console.log('  Total Spent: $' + totalSpent.toFixed(2));
    console.log('  Total Profit: $' + totalActualProfit.toFixed(2));
    console.log('  ROI: ' + (totalActualProfit / totalSpent * 100).toFixed(2) + '%');
    console.log('  Avg Profit/Trade: $' + (totalActualProfit / total).toFixed(2));
    console.log('');
    console.log('Financials (Guaranteed - arbitrage):');
    console.log('  Total Guaranteed Profit: $' + totalGuaranteedProfit.toFixed(2));
    console.log('  Guaranteed ROI: ' + (totalGuaranteedProfit / totalSpent * 100).toFixed(2) + '%');
  }
  console.log('='.repeat(120));
}

run().finally(() => prisma.$disconnect());

/**
 * Calculated Arbitrage Strategy V6 - Batch Tester
 *
 * Tests the calculated arbitrage strategy across multiple windows.
 *
 * Usage:
 *   node scripts/test-calculated-arb-batch.cjs [crypto] [limit]
 */

const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:7432/polymarket';
const prisma = new PrismaClient();

// ============================================
// Configuration
// ============================================
const CONFIG = {
  totalCapital: 1000,
  cheapThreshold: 0.40,
  tickBuyMin: 1,
  tickBuyMax: 5,
  maxRatio: 0.70,        // Max ratio for any side (70/30)
};

// ============================================
// CalculatedArbBot Class
// ============================================
class CalculatedArbBot {
  constructor() {
    this.balance = CONFIG.totalCapital;
    this.holdings = { UP: 0, DOWN: 0 };
    this.spent = { UP: 0, DOWN: 0 };
    this.locked = false;
    this.tickCount = 0;
    this.buildCount = 0;
    this.balanceCount = 0;
  }

  getTotalSpent() {
    return this.spent.UP + this.spent.DOWN;
  }

  getMinTokens() {
    return Math.min(this.holdings.UP, this.holdings.DOWN);
  }

  getAvgCost(side) {
    return this.holdings[side] > 0 ? this.spent[side] / this.holdings[side] : 0;
  }

  getCombinedAvg() {
    const upAvg = this.getAvgCost('UP');
    const downAvg = this.getAvgCost('DOWN');
    if (upAvg === 0 || downAvg === 0) return Infinity;
    return upAvg + downAvg;
  }

  calculateProfitIfBalance(upPrice, downPrice) {
    const upTokens = this.holdings.UP;
    const downTokens = this.holdings.DOWN;
    const totalSpent = this.getTotalSpent();

    if (upTokens === 0 && downTokens === 0) {
      return { profit: 0, costToBalance: 0, deficitSide: null };
    }

    if (upTokens === downTokens) {
      return { profit: upTokens - totalSpent, costToBalance: 0, deficitSide: null };
    }

    const surplus = upTokens > downTokens ? 'UP' : 'DOWN';
    const deficit = surplus === 'UP' ? 'DOWN' : 'UP';
    const surplusTokens = this.holdings[surplus];
    const deficitTokens = this.holdings[deficit];
    const deficitPrice = deficit === 'UP' ? upPrice : downPrice;

    const tokensNeeded = surplusTokens - deficitTokens;
    const costToBalance = tokensNeeded * deficitPrice;
    const profit = surplusTokens - (totalSpent + costToBalance);

    return {
      profit,
      deficitSide: deficit,
      costToBalance,
      tokensNeeded,
      newGuaranteed: surplusTokens
    };
  }

  processTick(upPrice, downPrice) {
    this.tickCount++;

    if (this.locked) return { action: 'SKIP' };
    if (this.balance <= 0) return { action: 'SKIP' };

    const minTokens = this.getMinTokens();
    const totalSpent = this.getTotalSpent();

    if (minTokens > totalSpent && minTokens > 0) {
      this.locked = true;
      return { action: 'LOCKED', profit: minTokens - totalSpent };
    }

    const balanceCalc = this.calculateProfitIfBalance(upPrice, downPrice);

    if (balanceCalc.profit > 0 && balanceCalc.costToBalance > 0) {
      const amount = Math.min(balanceCalc.costToBalance, this.balance);
      const side = balanceCalc.deficitSide;
      const price = side === 'UP' ? upPrice : downPrice;
      const tokens = amount / price;

      this.holdings[side] += tokens;
      this.spent[side] += amount;
      this.balance -= amount;
      this.balanceCount++;

      const newMin = this.getMinTokens();
      const newSpent = this.getTotalSpent();
      if (newMin > newSpent) {
        this.locked = true;
        return { action: 'BALANCE_LOCK', profit: newMin - newSpent };
      }

      return { action: 'BALANCE' };
    }

    const cheapSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const expensiveSide = cheapSide === 'UP' ? 'DOWN' : 'UP';
    const cheapPrice = Math.min(upPrice, downPrice);
    const expensivePrice = Math.max(upPrice, downPrice);

    // Calculate current ratio
    const totalTokens = this.holdings.UP + this.holdings.DOWN;
    const cheapTokens = this.holdings[cheapSide];
    const cheapRatio = totalTokens > 0 ? cheapTokens / totalTokens : 0.5;

    // Determine which side to buy based on ratio constraint
    let sideToBuy, priceToBuy;

    if (cheapRatio >= CONFIG.maxRatio && totalTokens > 0) {
      // Cheap side is too heavy - must buy expensive side
      sideToBuy = expensiveSide;
      priceToBuy = expensivePrice;
    } else if (cheapPrice <= CONFIG.cheapThreshold) {
      // Cheap side is within ratio and price is good
      sideToBuy = cheapSide;
      priceToBuy = cheapPrice;
    } else {
      return { action: 'SKIP' };
    }

    const amount = Math.min(
      Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
      this.balance
    );
    const tokens = amount / priceToBuy;

    this.holdings[sideToBuy] += tokens;
    this.spent[sideToBuy] += amount;
    this.balance -= amount;
    this.buildCount++;

    return { action: sideToBuy === cheapSide ? 'BUILD' : 'REBALANCE' };
  }

  getMetrics() {
    const totalSpent = this.getTotalSpent();
    const minTokens = this.getMinTokens();
    const profit = minTokens - totalSpent;
    const imbalance = Math.abs(this.holdings.UP - this.holdings.DOWN);
    const maxHoldings = Math.max(this.holdings.UP, this.holdings.DOWN);
    const imbalancePct = maxHoldings > 0 ? (imbalance / maxHoldings) * 100 : 0;

    return {
      upTokens: this.holdings.UP,
      downTokens: this.holdings.DOWN,
      totalSpent,
      balance: this.balance,
      combinedAvg: this.getCombinedAvg(),
      minTokens,
      profit,
      profitPct: totalSpent > 0 ? (profit / totalSpent) * 100 : 0,
      imbalancePct,
      locked: this.locked,
      buildCount: this.buildCount,
      balanceCount: this.balanceCount
    };
  }
}

// ============================================
// Simulate Single Window
// ============================================
function simulateWindow(priceData) {
  const bot = new CalculatedArbBot();

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const result = bot.processTick(upPrice, downPrice);

    if (result.action === 'LOCKED' || result.action === 'BALANCE_LOCK') break;
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

  console.log('='.repeat(130));
  console.log('CALCULATED ARBITRAGE STRATEGY V6 - Batch Test');
  console.log('='.repeat(130));
  console.log(`Crypto: ${crypto.toUpperCase()}`);
  console.log(`Markets: ${markets.length}`);
  console.log(`Capital: $${CONFIG.totalCapital}`);
  console.log(`Cheap threshold: ${CONFIG.cheapThreshold * 100}%`);
  console.log('='.repeat(130));
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
      const combAvg = r.combinedAvg === Infinity ? '---' : (r.combinedAvg * 100).toFixed(0) + '%';
      const balance = 'UP:' + r.upTokens.toFixed(0).padStart(5) + ' DN:' + r.downTokens.toFixed(0).padStart(5);
      const trades = 'B:' + r.buildCount + ' L:' + r.balanceCount;

      console.log(
        slug + ' | ' +
        lockStr.padEnd(4) + ' | ' +
        'Win:' + r.winner + ' | ' +
        balance + ' | ' +
        'CombAvg:' + combAvg.padStart(4) + ' | ' +
        trades.padStart(8) + ' | ' +
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
      console.log(slug + ' | SKIP | No entry (prices never < ' + (CONFIG.cheapThreshold * 100) + '%)');
    }
  }

  const total = wins + losses;
  console.log('');
  console.log('='.repeat(130));
  console.log('SUMMARY');
  console.log('='.repeat(130));
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
  console.log('='.repeat(130));
}

run().finally(() => prisma.$disconnect());

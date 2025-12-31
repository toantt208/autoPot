/**
 * Calculated Arbitrage Strategy V6 - Single Window Tester
 *
 * Core concept:
 * - BUILD position on cheap side (< 40%) with small amounts
 * - CHECK each tick if balancing would be profitable
 * - BALANCE when profitIfBalance > 0 - buy exact amount needed
 * - LOCK when min(UP, DOWN) > totalSpent
 *
 * Usage:
 *   node scripts/test-calculated-arb.cjs [market_slug]
 */

const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:7432/polymarket';
const prisma = new PrismaClient();

// ============================================
// Configuration
// ============================================
const CONFIG = {
  totalCapital: 1000,
  cheapThreshold: 0.40,  // Only buy when price < 40%
  tickBuyMin: 1,
  tickBuyMax: 5,
  maxRatio: 0.52,        // Max ratio for any side (52/48)
};

// ============================================
// CalculatedArbBot Class
// ============================================
class CalculatedArbBot {
  constructor() {
    this.capital = CONFIG.totalCapital;
    this.balance = CONFIG.totalCapital;
    this.holdings = { UP: 0, DOWN: 0 };
    this.spent = { UP: 0, DOWN: 0 };
    this.locked = false;
    this.tickCount = 0;
    this.trades = [];
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

  // Calculate profit if we balance at current prices
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

    // After balancing: guaranteed = surplusTokens
    // newTotalSpent = totalSpent + costToBalance
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

    if (this.locked) return { action: 'SKIP', reason: 'locked' };
    if (this.balance <= 0) return { action: 'SKIP', reason: 'no_balance' };

    const minTokens = this.getMinTokens();
    const totalSpent = this.getTotalSpent();

    // Already arbitrage locked?
    if (minTokens > totalSpent && minTokens > 0) {
      this.locked = true;
      return { action: 'LOCKED', profit: minTokens - totalSpent };
    }

    // Calculate if balancing now would be profitable
    const balanceCalc = this.calculateProfitIfBalance(upPrice, downPrice);

    if (balanceCalc.profit > 0 && balanceCalc.costToBalance > 0) {
      // PROFITABLE TO BALANCE - buy deficit side
      const amount = Math.min(balanceCalc.costToBalance, this.balance);
      const side = balanceCalc.deficitSide;
      const price = side === 'UP' ? upPrice : downPrice;
      const tokens = amount / price;

      this.holdings[side] += tokens;
      this.spent[side] += amount;
      this.balance -= amount;

      const trade = {
        tick: this.tickCount,
        action: 'BALANCE',
        side,
        amount,
        tokens,
        price,
        expectedProfit: balanceCalc.profit
      };
      this.trades.push(trade);

      // Check if now locked
      const newMin = this.getMinTokens();
      const newSpent = this.getTotalSpent();
      if (newMin > newSpent) {
        this.locked = true;
        return {
          action: 'BALANCE_LOCK',
          side, amount, tokens, price,
          profit: newMin - newSpent
        };
      }

      return { action: 'BALANCE', side, amount, tokens, price };
    }

    // NOT profitable to balance yet - buy to build position while maintaining ratio
    const cheapSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const expensiveSide = cheapSide === 'UP' ? 'DOWN' : 'UP';
    const cheapPrice = Math.min(upPrice, downPrice);
    const expensivePrice = Math.max(upPrice, downPrice);

    // Calculate current ratio
    const totalTokens = this.holdings.UP + this.holdings.DOWN;
    const cheapTokens = this.holdings[cheapSide];
    const expensiveTokens = this.holdings[expensiveSide];
    const cheapRatio = totalTokens > 0 ? cheapTokens / totalTokens : 0.5;

    // Determine which side to buy based on ratio constraint
    let sideToBuy, priceToBuy;

    if (cheapRatio >= CONFIG.maxRatio && totalTokens > 0) {
      // Cheap side is too heavy - must buy expensive side to maintain balance
      sideToBuy = expensiveSide;
      priceToBuy = expensivePrice;
    } else if (cheapPrice <= CONFIG.cheapThreshold) {
      // Cheap side is within ratio and price is good - buy cheap
      sideToBuy = cheapSide;
      priceToBuy = cheapPrice;
    } else {
      // No good opportunity
      return { action: 'SKIP', reason: 'waiting_for_cheap', cheapPrice, cheapRatio };
    }

    // Buy the selected side
    const amount = Math.min(
      Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
      this.balance
    );
    const tokens = amount / priceToBuy;

    this.holdings[sideToBuy] += tokens;
    this.spent[sideToBuy] += amount;
    this.balance -= amount;

    const actionType = sideToBuy === cheapSide ? 'BUILD' : 'REBALANCE';
    const trade = {
      tick: this.tickCount,
      action: actionType,
      side: sideToBuy,
      amount,
      tokens,
      price: priceToBuy
    };
    this.trades.push(trade);

    return { action: actionType, side: sideToBuy, amount, tokens, price: priceToBuy };
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
      upSpent: this.spent.UP,
      downSpent: this.spent.DOWN,
      totalSpent,
      balance: this.balance,
      upAvg: this.getAvgCost('UP'),
      downAvg: this.getAvgCost('DOWN'),
      combinedAvg: this.getCombinedAvg(),
      minTokens,
      profit,
      profitPct: totalSpent > 0 ? (profit / totalSpent) * 100 : 0,
      imbalancePct,
      locked: this.locked
    };
  }
}

// ============================================
// Logging
// ============================================
function logTick(tick, snapshot, result, metrics) {
  const time = snapshot.timestamp.toISOString().substr(11, 8);
  const upPrice = (Number(snapshot.upPrice) * 100).toFixed(1);
  const downPrice = (Number(snapshot.downPrice) * 100).toFixed(1);
  const combinedAvg = metrics.combinedAvg === Infinity ? '---' : (metrics.combinedAvg * 100).toFixed(0) + '%';

  let actionStr = '';
  if (result.action === 'BUILD') {
    actionStr = `BUILD ${result.side} $${result.amount.toFixed(2)} @ ${(result.price * 100).toFixed(0)}% → ${result.tokens.toFixed(1)} tkn`;
  } else if (result.action === 'REBALANCE') {
    actionStr = `REBAL ${result.side} $${result.amount.toFixed(2)} @ ${(result.price * 100).toFixed(0)}% → ${result.tokens.toFixed(1)} tkn`;
  } else if (result.action === 'BALANCE') {
    actionStr = `BALANCE ${result.side} $${result.amount.toFixed(2)} @ ${(result.price * 100).toFixed(0)}%`;
  } else if (result.action === 'BALANCE_LOCK') {
    actionStr = `BALANCE_LOCK ${result.side} $${result.amount.toFixed(2)} → Profit: $${result.profit.toFixed(2)}`;
  } else if (result.action === 'LOCKED') {
    actionStr = `LOCKED! Profit: $${result.profit.toFixed(2)}`;
  } else if (result.action === 'SKIP') {
    actionStr = `SKIP (${result.reason})`;
  }

  const upTkn = metrics.upTokens.toFixed(0);
  const downTkn = metrics.downTokens.toFixed(0);

  console.log(
    `#${tick.toString().padStart(3)} | ${time} | ` +
    `UP:${upPrice.padStart(5)}% DN:${downPrice.padStart(5)}% | ` +
    `Tkn: UP=${upTkn.padStart(5)} DN=${downTkn.padStart(5)} | ` +
    `CombAvg:${combinedAvg.padStart(4)} | ` +
    `$${metrics.totalSpent.toFixed(0).padStart(4)} | ` +
    actionStr
  );
}

// ============================================
// Main Backtest Function
// ============================================
async function runBacktest(marketSlug) {
  console.log('='.repeat(150));
  console.log('CALCULATED ARBITRAGE STRATEGY V6 - Backtest');
  console.log('='.repeat(150));
  console.log(`Market: ${marketSlug}`);
  console.log(`Capital: $${CONFIG.totalCapital}`);
  console.log(`Cheap threshold: ${CONFIG.cheapThreshold * 100}%`);
  console.log(`Per-tick: $${CONFIG.tickBuyMin}-${CONFIG.tickBuyMax}`);
  console.log('='.repeat(150));

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
  console.log('='.repeat(150));

  // Create bot
  const bot = new CalculatedArbBot();

  // Header
  console.log('\n' + '='.repeat(150));
  console.log('TICK-BY-TICK EXECUTION');
  console.log('='.repeat(150));

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
      result.action === 'BUILD' ||
      result.action === 'REBALANCE' ||
      result.action === 'BALANCE' ||
      result.action === 'BALANCE_LOCK' ||
      result.action === 'LOCKED' ||
      tick <= 5 ||
      tick % 100 === 0 ||
      tick === priceData.length;

    if (shouldLog && tick !== lastLogTick) {
      logTick(tick, snapshot, result, metrics);
      lastLogTick = tick;
    }

    // Stop if locked
    if (result.action === 'LOCKED' || result.action === 'BALANCE_LOCK') {
      break;
    }
  }

  console.log('='.repeat(150));

  // Final results
  console.log('\n' + '='.repeat(150));
  console.log('FINAL RESULTS');
  console.log('='.repeat(150));

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
  console.log(`  UP:   ${metrics.upTokens.toFixed(2)} tokens (spent $${metrics.upSpent.toFixed(2)}, avg ${(metrics.upAvg * 100).toFixed(1)}%)`);
  console.log(`  DOWN: ${metrics.downTokens.toFixed(2)} tokens (spent $${metrics.downSpent.toFixed(2)}, avg ${(metrics.downAvg * 100).toFixed(1)}%)`);
  console.log(`  Combined Avg: ${metrics.combinedAvg === Infinity ? 'N/A' : (metrics.combinedAvg * 100).toFixed(1) + '%'}`);
  console.log(`  Imbalance: ${metrics.imbalancePct.toFixed(2)}%`);
  console.log('');

  // Spending
  console.log('Spending:');
  console.log(`  Total Spent: $${metrics.totalSpent.toFixed(2)}`);
  console.log(`  Remaining: $${metrics.balance.toFixed(2)}`);
  console.log('');

  // Outcome
  console.log('Outcome:');
  console.log(`  Guaranteed (min tokens): ${metrics.minTokens.toFixed(2)}`);
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

  console.log('='.repeat(150));

  // Summary
  console.log('\nSUMMARY:');
  if (metrics.locked && metrics.profit > 0) {
    console.log(`  SUCCESS - Arbitrage locked with profit of $${metrics.profit.toFixed(2)} (${metrics.profitPct.toFixed(2)}%)`);
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

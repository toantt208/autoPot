/**
 * AVWA V4 - Balanced Approach
 *
 * Key insight: Instead of predicting winner, buy BOTH sides to stay balanced.
 * Wait for the loser side to become cheap, then lock profit.
 *
 * Strategy:
 *   - Phase 1 (30%): Buy BOTH sides alternating to stay balanced
 *   - Phase 2 (50%): Wait for CHEAP price (<15%), buy to maintain balance
 *   - Lock when: Balanced + Combined avg < 100%
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CONFIG = {
  totalCapital: 100,
  phase1Pct: 0.30,
  phase2Pct: 0.50,
  phase3Pct: 0.20,
  tickBuyMin: 1,
  tickBuyMax: 5,
  phase2CheapThreshold: 0.15,  // Only buy when loser < 15%
  expensiveThreshold: 0.70,   // Skip buying if price > 70%
  reserveWindowSeconds: 120,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function simulateWindow(priceData, windowStartTs) {
  const windowEndTs = windowStartTs + 15 * 60;
  const PHASE1_POOL = CONFIG.totalCapital * CONFIG.phase1Pct;
  const PHASE2_POOL = CONFIG.totalCapital * CONFIG.phase2Pct;

  let state = {
    phase: 'PH1',
    upTokens: 0, upSpent: 0,
    downTokens: 0, downSpent: 0,
    phase1Remaining: PHASE1_POOL,
    phase2Remaining: PHASE2_POOL,
  };

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;

    const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const lowerPrice = Math.min(upPrice, downPrice);

    const guaranteed = Math.min(state.upTokens, state.downTokens);
    const totalSpent = state.upSpent + state.downSpent;
    const canLock = guaranteed > totalSpent;

    if (state.phase === 'LOCK') break;

    // Phase 1: Buy BOTH sides to stay balanced
    if (state.phase === 'PH1' && state.phase1Remaining > 0) {
      // Buy the side with FEWER tokens
      const weakerSide = state.upTokens <= state.downTokens ? 'UP' : 'DOWN';
      const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;

      // Skip if price too high
      if (weakerPrice <= CONFIG.expensiveThreshold) {
        const amount = Math.min(randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax), state.phase1Remaining);
        const tokens = amount / weakerPrice;
        if (weakerSide === 'UP') {
          state.upTokens += tokens; state.upSpent += amount;
        } else {
          state.downTokens += tokens; state.downSpent += amount;
        }
        state.phase1Remaining -= amount;
      }

      if (state.phase1Remaining <= 0) state.phase = 'PH2';
      continue;
    }

    // Phase 2: Buy CHEAP side only, maintain balance, lock when profitable
    if (state.phase === 'PH2' && state.phase2Remaining > 0) {
      // Check if we can lock profit (balanced + profitable)
      const tokenDiff = Math.abs(state.upTokens - state.downTokens);
      const maxTokens = Math.max(state.upTokens, state.downTokens);
      const isBalanced = tokenDiff / maxTokens < 0.15;

      if (isBalanced && canLock && maxTokens > 30) {
        state.phase = 'LOCK';
        break;
      }

      // Only buy when the loser side is cheap
      if (lowerPrice <= CONFIG.phase2CheapThreshold) {
        const amount = Math.min(randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax), state.phase2Remaining);
        const tokens = amount / lowerPrice;
        if (lowerSide === 'UP') {
          state.upTokens += tokens; state.upSpent += amount;
        } else {
          state.downTokens += tokens; state.downSpent += amount;
        }
        state.phase2Remaining -= amount;
      }

      if (state.phase2Remaining <= 0 || timeLeft <= CONFIG.reserveWindowSeconds) {
        state.phase = 'PH3';
      }
    }

    // Phase 3: Final balance attempt
    if (state.phase === 'PH3') {
      const tokenDiff = Math.abs(state.upTokens - state.downTokens);
      const maxTokens = Math.max(state.upTokens, state.downTokens);
      const isBalanced = tokenDiff / maxTokens < 0.15;

      if (isBalanced && canLock && maxTokens > 30) {
        state.phase = 'LOCK';
        break;
      }
    }
  }

  const totalSpent = state.upSpent + state.downSpent;
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const profit = guaranteed - totalSpent;
  const finalUp = Number(priceData[priceData.length - 1].upPrice);
  const finalDown = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUp > finalDown ? 'UP' : 'DOWN';

  const upAvg = state.upSpent > 0 ? state.upSpent / state.upTokens : 0;
  const downAvg = state.downSpent > 0 ? state.downSpent / state.downTokens : 0;
  const combinedAvg = upAvg + downAvg;

  return {
    phase: state.phase,
    totalSpent,
    guaranteed,
    profit,
    winner,
    upTokens: state.upTokens,
    downTokens: state.downTokens,
    combinedAvg,
  };
}

async function run() {
  const markets = await prisma.$queryRaw`
    SELECT DISTINCT market_slug FROM arbitrage_logs
    WHERE crypto = 'btc' AND market_slug LIKE 'btc-updown-15m-%'
    GROUP BY market_slug HAVING COUNT(*) > 100
    ORDER BY market_slug DESC LIMIT 50
  `;

  console.log('='.repeat(100));
  console.log('AVWA V4 Batch Test - Balanced Both Sides Strategy');
  console.log('='.repeat(100));
  console.log('');

  let wins = 0, losses = 0, totalProfit = 0, totalSpent = 0, locks = 0;

  for (const m of markets) {
    const slug = m.market_slug;
    const ts = parseInt(slug.split('-').pop());
    const data = await prisma.arbitrageLog.findMany({
      where: { marketSlug: slug },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, upPrice: true, downPrice: true },
    });
    if (data.length < 50) continue;

    const r = simulateWindow(data, ts);
    const profitStr = r.profit >= 0 ? '+$' + r.profit.toFixed(2) : '-$' + Math.abs(r.profit).toFixed(2);
    const status = r.phase === 'LOCK' ? 'LOCK' : r.totalSpent > 0 ? 'PART' : 'SKIP';
    const combAvg = (r.combinedAvg * 100).toFixed(0) + '%';
    const balance = 'UP:' + r.upTokens.toFixed(0) + ' DN:' + r.downTokens.toFixed(0);

    console.log(
      slug + ' | ' + status.padEnd(4) + ' | ' +
      'Win:' + r.winner + ' | ' +
      balance.padStart(15) + ' | ' +
      'Avg:' + combAvg.padStart(4) + ' | ' +
      'Spent:$' + r.totalSpent.toFixed(0).padStart(3) + ' | ' +
      profitStr.padStart(8)
    );

    if (r.totalSpent > 0) {
      totalSpent += r.totalSpent;
      totalProfit += r.profit;
      if (r.profit > 0) wins++; else losses++;
      if (r.phase === 'LOCK') locks++;
    }
  }

  const total = wins + losses;
  console.log('');
  console.log('='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));
  console.log('');
  console.log('Results: ' + wins + ' wins, ' + losses + ' losses (' + (wins/total*100).toFixed(1) + '% win rate)');
  console.log('Locks achieved: ' + locks + '/' + total + ' (' + (locks/total*100).toFixed(1) + '%)');
  console.log('');
  console.log('Financials:');
  console.log('  Total Spent: $' + totalSpent.toFixed(2));
  console.log('  Total Profit: $' + totalProfit.toFixed(2));
  console.log('  ROI: ' + (totalProfit/totalSpent*100).toFixed(2) + '%');
  console.log('  Avg Profit/Trade: $' + (totalProfit/total).toFixed(2));
  console.log('='.repeat(100));
}

run().finally(() => prisma.$disconnect());

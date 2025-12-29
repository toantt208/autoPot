/**
 * AVWA V3 - Batch Tester
 * Tests the predicted winner + cheap loser strategy
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
  phase2CheapThreshold: 0.15,
  expensiveThreshold: 0.70,
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
    predictedWinner: null,
  };

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;

    const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';

    if (state.predictedWinner === null) {
      state.predictedWinner = lowerSide;
    }

    const predictedLoser = state.predictedWinner === 'UP' ? 'DOWN' : 'UP';
    const winnerPrice = state.predictedWinner === 'UP' ? upPrice : downPrice;
    const loserPrice = predictedLoser === 'UP' ? upPrice : downPrice;

    const guaranteed = Math.min(state.upTokens, state.downTokens);
    const totalSpent = state.upSpent + state.downSpent;
    const canLock = guaranteed > totalSpent;

    if (state.phase === 'LOCK') break;

    // Phase 1: Buy predicted winner
    if (state.phase === 'PH1' && state.phase1Remaining > 0) {
      if (winnerPrice <= CONFIG.expensiveThreshold) {
        const amount = Math.min(randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax), state.phase1Remaining);
        const tokens = amount / winnerPrice;
        if (state.predictedWinner === 'UP') {
          state.upTokens += tokens; state.upSpent += amount;
        } else {
          state.downTokens += tokens; state.downSpent += amount;
        }
        state.phase1Remaining -= amount;
        if (state.phase1Remaining <= 0) state.phase = 'PH2';
      } else {
        state.phase = 'PH2';
      }
      continue;
    }

    // Phase 2: Buy loser when cheap, stop when balanced & profitable
    if (state.phase === 'PH2' && state.phase2Remaining > 0) {
      const winnerTokens = state.predictedWinner === 'UP' ? state.upTokens : state.downTokens;
      const loserTokens = predictedLoser === 'UP' ? state.upTokens : state.downTokens;
      const tokensNeeded = winnerTokens - loserTokens;

      if (tokensNeeded <= 2 && canLock) {
        state.phase = 'LOCK';
        break;
      }

      if (loserPrice <= CONFIG.phase2CheapThreshold && tokensNeeded > 0) {
        const spendNeeded = tokensNeeded * loserPrice;
        const amount = Math.min(randomBetween(CONFIG.tickBuyMin, CONFIG.tickBuyMax), state.phase2Remaining, spendNeeded + 1);
        const tokens = amount / loserPrice;
        if (predictedLoser === 'UP') {
          state.upTokens += tokens; state.upSpent += amount;
        } else {
          state.downTokens += tokens; state.downSpent += amount;
        }
        state.phase2Remaining -= amount;
        if (state.phase2Remaining <= 0) state.phase = 'PH3';
      }

      if (timeLeft <= CONFIG.reserveWindowSeconds) {
        state.phase = 'PH3';
      }
    }
  }

  const totalSpent = state.upSpent + state.downSpent;
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const profit = guaranteed - totalSpent;
  const finalUp = Number(priceData[priceData.length - 1].upPrice);
  const finalDown = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUp > finalDown ? 'UP' : 'DOWN';

  return {
    phase: state.phase,
    totalSpent,
    guaranteed,
    profit,
    winner,
    predictedWinner: state.predictedWinner,
    predictionCorrect: state.predictedWinner === winner,
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
  console.log('AVWA V3 Batch Test - Predicted Winner + Cheap Loser Strategy');
  console.log('='.repeat(100));
  console.log('');

  let wins = 0, losses = 0, totalProfit = 0, totalSpent = 0;
  let correctPredictions = 0, locks = 0;

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
    const predChar = r.predictionCorrect ? 'Y' : 'N';

    console.log(
      slug + ' | ' + status.padEnd(4) + ' | ' +
      'Pred:' + r.predictedWinner + ' Win:' + r.winner + ' ' + predChar + ' | ' +
      'Spent:$' + r.totalSpent.toFixed(0).padStart(3) + ' | ' +
      profitStr.padStart(8)
    );

    if (r.totalSpent > 0) {
      totalSpent += r.totalSpent;
      totalProfit += r.profit;
      if (r.profit > 0) wins++; else losses++;
      if (r.predictionCorrect) correctPredictions++;
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
  console.log('Prediction accuracy: ' + correctPredictions + '/' + total + ' (' + (correctPredictions/total*100).toFixed(1) + '%)');
  console.log('');
  console.log('Financials:');
  console.log('  Total Spent: $' + totalSpent.toFixed(2));
  console.log('  Total Profit: $' + totalProfit.toFixed(2));
  console.log('  ROI: ' + (totalProfit/totalSpent*100).toFixed(2) + '%');
  console.log('  Avg Profit/Trade: $' + (totalProfit/total).toFixed(2));
  console.log('='.repeat(100));
}

run().finally(() => prisma.$disconnect());

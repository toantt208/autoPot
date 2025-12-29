/**
 * AVWA V5 - Late Entry Strategy
 *
 * Key insight: Wait until the LOSER becomes very cheap (<15%), THEN enter.
 * At that point:
 *   - Winner is at 85-99% (expensive but we know it's the winner)
 *   - Loser is at 1-15% (very cheap!)
 *   - Combined < 100% = guaranteed profit
 *
 * Strategy:
 *   - Phase 1: WAIT until loser < 15%
 *   - Phase 2: Buy BOTH sides weighted to achieve equal tokens
 *   - Lock: Immediately after buying
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CONFIG = {
  totalCapital: 100,
  entryThreshold: 0.15,  // Only enter when loser < 15%
  minWinnerPrice: 0.85,  // Winner should be > 85% (clear winner)
};

function simulateWindow(priceData, windowStartTs) {
  const windowEndTs = windowStartTs + 15 * 60;

  let state = {
    phase: 'WAITING',
    upTokens: 0, upSpent: 0,
    downTokens: 0, downSpent: 0,
    entryTick: null,
  };

  for (let i = 0; i < priceData.length; i++) {
    const snapshot = priceData[i];
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);

    const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const higherSide = upPrice > downPrice ? 'UP' : 'DOWN';
    const lowerPrice = Math.min(upPrice, downPrice);
    const higherPrice = Math.max(upPrice, downPrice);

    if (state.phase === 'LOCKED') break;

    // WAITING: Look for clear opportunity (loser < 15%, winner > 85%)
    if (state.phase === 'WAITING') {
      if (lowerPrice <= CONFIG.entryThreshold && higherPrice >= CONFIG.minWinnerPrice) {
        // ENTRY SIGNAL! Buy both sides weighted for equal tokens
        const totalPrice = upPrice + downPrice;
        const tokensTarget = CONFIG.totalCapital / totalPrice;

        // Buy UP
        const upAmount = tokensTarget * upPrice;
        state.upTokens = tokensTarget;
        state.upSpent = upAmount;

        // Buy DOWN
        const downAmount = tokensTarget * downPrice;
        state.downTokens = tokensTarget;
        state.downSpent = downAmount;

        state.entryTick = i + 1;
        state.phase = 'LOCKED';
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
    entryTick: state.entryTick,
    entered: totalSpent > 0,
  };
}

async function run() {
  const markets = await prisma.$queryRaw`
    SELECT DISTINCT market_slug FROM arbitrage_logs
    WHERE crypto = 'btc' AND market_slug LIKE 'btc-updown-15m-%'
    GROUP BY market_slug HAVING COUNT(*) > 100
    ORDER BY market_slug DESC LIMIT 100
  `;

  console.log('='.repeat(100));
  console.log('AVWA V5 Batch Test - Late Entry Strategy');
  console.log('='.repeat(100));
  console.log('Entry condition: Loser < ' + (CONFIG.entryThreshold * 100) + '% AND Winner > ' + (CONFIG.minWinnerPrice * 100) + '%');
  console.log('');

  let wins = 0, losses = 0, totalProfit = 0, totalSpent = 0, entered = 0, skipped = 0;

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

    if (r.entered) {
      entered++;
      const profitStr = r.profit >= 0 ? '+$' + r.profit.toFixed(2) : '-$' + Math.abs(r.profit).toFixed(2);
      const combAvg = (r.combinedAvg * 100).toFixed(0) + '%';
      const balance = 'UP:' + r.upTokens.toFixed(0) + ' DN:' + r.downTokens.toFixed(0);

      console.log(
        slug + ' | ' +
        'Tick:' + String(r.entryTick).padStart(3) + ' | ' +
        'Win:' + r.winner + ' | ' +
        balance.padStart(15) + ' | ' +
        'Avg:' + combAvg.padStart(4) + ' | ' +
        'Spent:$' + r.totalSpent.toFixed(0).padStart(3) + ' | ' +
        profitStr.padStart(8)
      );

      totalSpent += r.totalSpent;
      totalProfit += r.profit;
      if (r.profit > 0) wins++; else losses++;
    } else {
      skipped++;
    }
  }

  const total = wins + losses;
  console.log('');
  console.log('='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));
  console.log('');
  console.log('Markets tested: ' + (entered + skipped));
  console.log('Entered: ' + entered + ' (' + (entered/(entered+skipped)*100).toFixed(1) + '%)');
  console.log('Skipped (no opportunity): ' + skipped);
  console.log('');
  if (total > 0) {
    console.log('Results: ' + wins + ' wins, ' + losses + ' losses (' + (wins/total*100).toFixed(1) + '% win rate)');
    console.log('');
    console.log('Financials:');
    console.log('  Total Spent: $' + totalSpent.toFixed(2));
    console.log('  Total Profit: $' + totalProfit.toFixed(2));
    console.log('  ROI: ' + (totalProfit/totalSpent*100).toFixed(2) + '%');
    console.log('  Avg Profit/Trade: $' + (totalProfit/total).toFixed(2));
  }
  console.log('='.repeat(100));
}

run().finally(() => prisma.$disconnect());

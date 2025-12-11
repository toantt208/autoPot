/**
 * Martingale Strategy Analysis
 *
 * Simulate betting on one side with Martingale (double on loss)
 * Entry at market open = 50% price
 *
 * Usage: node scripts/analyze-martingale.cjs [crypto] [side] [baseBet]
 * Example: node scripts/analyze-martingale.cjs BTC UP 2
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate balance needed for a given loss streak
 * Formula: (2^(streak+1) - 1) × baseBet
 */
function calculateBalanceNeeded(streak, baseBet) {
  return (Math.pow(2, streak + 1) - 1) * baseBet;
}

async function analyzeMartingale(crypto = 'BTC', targetSide = 'UP', baseBet = 1) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`MARTINGALE ANALYSIS: Always bet ${targetSide} on ${crypto}`);
  console.log(`Base bet: $${baseBet}, Entry price: 50%`);
  console.log(`${'='.repeat(80)}\n`);

  const windows = await prisma.statsWindow.findMany({
    where: {
      crypto: crypto.toUpperCase(),
      finalSide: { not: null },
    },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      finalSide: true,
      startTime: true,
    },
  });

  if (windows.length === 0) {
    console.log('No data found');
    return;
  }

  let currentBet = baseBet;
  let totalProfit = 0;
  let maxBet = baseBet;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  let wins = 0;
  let losses = 0;
  let currentStreak = 0;
  let maxLossStreak = 0;

  // Group by date for daily analysis
  const dailyResults = {};

  console.log('Round | Bet     | Result | Side Won | Profit  | Total   | Streak');
  console.log('------|---------|--------|----------|---------|---------|-------');

  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];
    const won = window.finalSide === targetSide;
    const date = window.startTime.toISOString().split('T')[0];

    if (!dailyResults[date]) {
      dailyResults[date] = { wins: 0, losses: 0, profit: 0, maxBet: baseBet, windows: 0 };
    }
    dailyResults[date].windows++;

    let roundProfit;
    if (won) {
      // Win: bet at 50% = 2x shares, payout = 2 * bet, profit = bet
      roundProfit = currentBet;
      totalProfit += roundProfit;
      wins++;
      currentStreak = 0;
      dailyResults[date].wins++;
      dailyResults[date].profit += roundProfit;

      // Reset bet
      currentBet = baseBet;
      currentDrawdown = 0;
    } else {
      // Lose: lose entire bet
      roundProfit = -currentBet;
      totalProfit += roundProfit;
      losses++;
      currentStreak++;
      if (currentStreak > maxLossStreak) maxLossStreak = currentStreak;
      dailyResults[date].losses++;
      dailyResults[date].profit += roundProfit;

      currentDrawdown += currentBet;
      if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;

      // Double bet for next round
      currentBet = currentBet * 2;
      if (currentBet > maxBet) maxBet = currentBet;
      if (currentBet > dailyResults[date].maxBet) dailyResults[date].maxBet = currentBet;
    }

    const status = won ? '✓ WIN' : '✗ LOSE';
    const streakStr = won ? '-' : `L${currentStreak}`;

    // Only show first 20 and last 10
    if (i < 20 || i >= windows.length - 10) {
      const betShown = won ? (currentBet === baseBet ? baseBet : currentBet) : currentBet / 2;
      console.log(
        `${String(i + 1).padStart(5)} | $${String(betShown).padStart(6)} | ${status.padEnd(6)} | ${window.finalSide.padEnd(8)} | ${(roundProfit >= 0 ? '+' : '') + '$' + roundProfit.toFixed(0).padStart(5)} | $${totalProfit.toFixed(0).padStart(6)} | ${streakStr}`
      );
    } else if (i === 20) {
      console.log('  ... | ...     | ...    | ...      | ...     | ...     | ...');
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`Total Windows: ${windows.length}`);
  console.log(`Wins: ${wins} (${((wins / windows.length) * 100).toFixed(1)}%)`);
  console.log(`Losses: ${losses}`);
  console.log(`Max Loss Streak: ${maxLossStreak}`);
  console.log(`Max Bet Required: $${maxBet} (2^${Math.log2(maxBet)} = ${maxLossStreak} losses in a row)`);
  console.log(`Max Drawdown: $${maxDrawdown}`);
  console.log(`Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`Profit per Window: $${(totalProfit / windows.length).toFixed(4)}`);

  // Balance requirement table
  console.log(`\n${'='.repeat(80)}`);
  console.log(`BALANCE REQUIREMENTS (for $${baseBet} base bet)`);
  console.log(`${'='.repeat(80)}`);
  console.log('Streak | Next Bet | Total Balance Needed | Status');
  console.log('-------|----------|---------------------|--------');
  for (let i = 0; i <= 10; i++) {
    const nextBet = Math.pow(2, i) * baseBet;
    const balanceNeeded = calculateBalanceNeeded(i, baseBet);
    const status = i <= maxLossStreak ? (i === maxLossStreak ? '← MAX HIT' : '✓ survived') : '';
    console.log(`${String(i).padStart(6)} | $${String(nextBet).padStart(7)} | $${String(balanceNeeded).padStart(18)} | ${status}`);
  }
  console.log(`\nYou need at least $${calculateBalanceNeeded(maxLossStreak, baseBet)} to survive the worst streak (${maxLossStreak} losses).`);

  // Daily breakdown
  console.log(`\n${'='.repeat(80)}`);
  console.log('DAILY BREAKDOWN');
  console.log(`${'='.repeat(80)}`);
  console.log('Date       | Windows | Wins | Losses | Max Bet | Profit');
  console.log('-----------|---------|------|--------|---------|--------');

  let runningTotal = 0;
  for (const [date, data] of Object.entries(dailyResults)) {
    runningTotal += data.profit;
    console.log(
      `${date} | ${String(data.windows).padStart(7)} | ${String(data.wins).padStart(4)} | ${String(data.losses).padStart(6)} | $${String(data.maxBet).padStart(6)} | ${data.profit >= 0 ? '+' : ''}$${data.profit.toFixed(0).padStart(5)} (total: $${runningTotal.toFixed(0)})`
    );
  }

  // Also test the opposite side
  console.log(`\n${'='.repeat(80)}`);
  console.log(`COMPARISON: What if betting ${targetSide === 'UP' ? 'DOWN' : 'UP'} instead?`);
  console.log(`${'='.repeat(80)}`);

  const oppositeSide = targetSide === 'UP' ? 'DOWN' : 'UP';
  let oppBet = baseBet;
  let oppProfit = 0;
  let oppMaxBet = baseBet;

  for (const window of windows) {
    const won = window.finalSide === oppositeSide;
    if (won) {
      oppProfit += oppBet;
      oppBet = baseBet;
    } else {
      oppProfit -= oppBet;
      oppBet *= 2;
      if (oppBet > oppMaxBet) oppMaxBet = oppBet;
    }
  }

  console.log(`Betting ${oppositeSide}: Total Profit = $${oppProfit.toFixed(2)}, Max Bet = $${oppMaxBet}`);
  console.log(`Betting ${targetSide}: Total Profit = $${totalProfit.toFixed(2)}, Max Bet = $${maxBet}`);
}

async function main() {
  const crypto = process.argv[2] || 'BTC';
  const side = (process.argv[3] || 'UP').toUpperCase();
  const baseBet = parseFloat(process.argv[4]) || 1;

  try {
    await analyzeMartingale(crypto, side, baseBet);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

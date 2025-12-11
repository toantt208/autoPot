/**
 * Analyze profit if buying the higher side at a specific time before close
 *
 * Strategy: Buy the higher side at specified entry time, hold until market resolves
 *
 * Usage: DATABASE_URL="postgresql://..." node scripts/analyze-first-5min.cjs [entryMinutes]
 * Example: node scripts/analyze-first-5min.cjs 4  (enter at last 4 minutes)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BET_AMOUNT = 10; // $10 per trade
const ENTRY_MINUTES = parseInt(process.argv[2]) || 5; // Default 5 minutes
const ENTRY_SECONDS = ENTRY_MINUTES * 60;

async function analyze() {
  console.log(`\nEntry time: ${ENTRY_MINUTES} minutes before close (${ENTRY_SECONDS}s)\n`);

  // Get all windows with ID >= 400 that have a finalSide
  const windows = await prisma.statsWindow.findMany({
    where: {
      id: { gt: 401 },
      finalSide: { not: null },
    },
    orderBy: { id: 'asc' },
    include: {
      snapshots: {
        where: {
          timeLeft: { lte: ENTRY_SECONDS }, // Only snapshots at or after entry time
        },
        orderBy: { timeLeft: 'desc' },
        take: 1, // Get first snapshot at/after entry time (highest timeLeft <= ENTRY_SECONDS)
      },
    },
  });

  console.log(`\nAnalyzing ${windows.length} windows (ID >= 400)...\n`);
  console.log('Window ID | Crypto | Entry Side | Entry Price | Final Side | Won | Profit USD');
  console.log('----------|--------|------------|-------------|------------|-----|------------');

  let totalWins = 0;
  let totalLosses = 0;
  let totalProfitUsd = 0;
  let skipped = 0;

  for (const window of windows) {
    if (window.snapshots.length === 0) {
      skipped++;
      continue;
    }

    const firstSnapshot = window.snapshots[0];
    const upPrice = Number(firstSnapshot.upPrice);
    const downPrice = Number(firstSnapshot.downPrice);

    // Entry: buy the higher side
    const entrySide = upPrice >= downPrice ? 'UP' : 'DOWN';
    const entryPrice = Math.max(upPrice, downPrice);

    // Check if won
    const won = entrySide === window.finalSide;

    // Calculate profit
    // Shares = amount / entryPrice
    // If win: payout = shares * 1 = shares
    // If lose: payout = 0
    const shares = BET_AMOUNT / entryPrice;
    const payout = won ? shares : 0;
    const profitUsd = payout - BET_AMOUNT;

    if (won) {
      totalWins++;
    } else {
      totalLosses++;
    }
    totalProfitUsd += profitUsd;

    const status = won ? '✓' : '✗';
    const profitStr = profitUsd >= 0 ? `+$${profitUsd.toFixed(2)}` : `-$${Math.abs(profitUsd).toFixed(2)}`;

    console.log(
      `${String(window.id).padEnd(9)} | ${window.crypto.padEnd(6)} | ${entrySide.padEnd(10)} | ${(entryPrice * 100).toFixed(1).padStart(10)}% | ${(window.finalSide || '?').padEnd(10)} | ${status}   | ${profitStr.padStart(10)}`
    );
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Windows Analyzed: ${windows.length - skipped}`);
  console.log(`Skipped (no snapshots): ${skipped}`);
  console.log(`Wins: ${totalWins}`);
  console.log(`Losses: ${totalLosses}`);
  console.log(`Win Rate: ${((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)}%`);
  console.log(`Bet Amount per Trade: $${BET_AMOUNT}`);
  console.log(`Total Profit/Loss: ${totalProfitUsd >= 0 ? '+' : ''}$${totalProfitUsd.toFixed(2)}`);
  console.log(`Average Profit per Trade: ${(totalProfitUsd / (totalWins + totalLosses)).toFixed(2)}`);
}

async function main() {
  try {
    await analyze();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

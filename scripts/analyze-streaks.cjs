/**
 * Analyze longest consecutive streaks per crypto
 *
 * Finds the longest streak of consecutive UP or DOWN results for each token
 *
 * Usage: node scripts/analyze-streaks.cjs
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeStreaks() {
  const cryptos = ['BTC', 'ETH', 'SOL', 'XRP'];

  console.log('\n' + '='.repeat(80));
  console.log('LONGEST STREAK ANALYSIS');
  console.log('='.repeat(80));
  console.log('\nCrypto | Longest UP | Longest DOWN | Current Streak | All Streaks');
  console.log('-------|------------|--------------|----------------|------------');

  for (const crypto of cryptos) {
    const windows = await prisma.statsWindow.findMany({
      where: {
        crypto,
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
      console.log(`${crypto.padEnd(6)} | No data`);
      continue;
    }

    let longestUp = 0;
    let longestDown = 0;
    let currentStreak = 0;
    let currentSide = null;
    let allStreaks = [];

    for (const window of windows) {
      if (window.finalSide === currentSide) {
        currentStreak++;
      } else {
        // Save previous streak
        if (currentSide && currentStreak > 0) {
          allStreaks.push({ side: currentSide, count: currentStreak });
          if (currentSide === 'UP' && currentStreak > longestUp) {
            longestUp = currentStreak;
          }
          if (currentSide === 'DOWN' && currentStreak > longestDown) {
            longestDown = currentStreak;
          }
        }
        currentSide = window.finalSide;
        currentStreak = 1;
      }
    }

    // Don't forget the last streak
    if (currentSide && currentStreak > 0) {
      allStreaks.push({ side: currentSide, count: currentStreak });
      if (currentSide === 'UP' && currentStreak > longestUp) {
        longestUp = currentStreak;
      }
      if (currentSide === 'DOWN' && currentStreak > longestDown) {
        longestDown = currentStreak;
      }
    }

    // Format all streaks (last 10)
    const recentStreaks = allStreaks.slice(-10).map(s => `${s.side[0]}${s.count}`).join(' ');

    console.log(
      `${crypto.padEnd(6)} | ${String(longestUp).padStart(10)} | ${String(longestDown).padStart(12)} | ${(currentSide + ' x ' + currentStreak).padStart(14)} | ${recentStreaks}`
    );
  }

  // Also show overall stats
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED STREAK HISTORY (All cryptos combined)');
  console.log('='.repeat(80));

  const allWindows = await prisma.statsWindow.findMany({
    where: { finalSide: { not: null } },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      crypto: true,
      finalSide: true,
      startTime: true,
    },
  });

  // Group by crypto and show streak sequences
  for (const crypto of cryptos) {
    const cryptoWindows = allWindows.filter(w => w.crypto === crypto);
    if (cryptoWindows.length === 0) continue;

    let streakStr = '';
    let currentSide = null;
    let currentStreak = 0;

    for (const window of cryptoWindows) {
      if (window.finalSide === currentSide) {
        currentStreak++;
      } else {
        if (currentSide) {
          streakStr += `${currentSide[0]}${currentStreak} `;
        }
        currentSide = window.finalSide;
        currentStreak = 1;
      }
    }
    if (currentSide) {
      streakStr += `${currentSide[0]}${currentStreak}`;
    }

    console.log(`\n${crypto}: ${streakStr}`);
  }

  console.log('\n');
}

async function main() {
  try {
    await analyzeStreaks();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

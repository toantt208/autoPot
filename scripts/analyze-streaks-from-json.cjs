/**
 * Analyze Streaks from JSON Data
 *
 * Analyzes consecutive UP/DOWN streaks from fetched crypto price data.
 * Calculates longest streaks, streak distributions, and Martingale requirements.
 *
 * Usage: node scripts/analyze-streaks-from-json.cjs [jsonFile] [crypto]
 * Example: node scripts/analyze-streaks-from-json.cjs data/crypto-prices-all-2025-11-09-to-2025-12-09.json BTC
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate balance needed for a given loss streak with Martingale
 * Formula: (2^(streak+1) - 1) × baseBet
 */
function calculateBalanceNeeded(streak, baseBet = 1) {
  return (Math.pow(2, streak + 1) - 1) * baseBet;
}

/**
 * Find all streaks in a sequence of results
 */
function findStreaks(results, targetSide) {
  const streaks = [];
  let currentStreak = 0;
  let streakStart = null;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.winner === targetSide) {
      // Streak continues or starts
      if (currentStreak === 0) {
        streakStart = result.startTime;
      }
      currentStreak++;
    } else if (result.winner !== null) {
      // Streak ends (opposite side won)
      if (currentStreak > 0) {
        streaks.push({
          length: currentStreak,
          side: targetSide,
          startTime: streakStart,
          endTime: results[i - 1].endTime,
        });
      }
      currentStreak = 0;
      streakStart = null;
    }
  }

  // Don't forget the last streak if still ongoing
  if (currentStreak > 0) {
    streaks.push({
      length: currentStreak,
      side: targetSide,
      startTime: streakStart,
      endTime: results[results.length - 1].endTime,
    });
  }

  return streaks;
}

/**
 * Find consecutive LOSS streaks (for Martingale analysis)
 * If you bet on targetSide, losses are when the opposite side wins
 */
function findLossStreaks(results, bettingSide) {
  const oppositeSide = bettingSide === 'UP' ? 'DOWN' : 'UP';
  return findStreaks(results, oppositeSide);
}

/**
 * Analyze a single crypto's data
 */
function analyzeCrypto(crypto, data) {
  if (!data || data.length === 0) {
    return null;
  }

  // Sort by start time
  data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const upStreaks = findStreaks(data, 'UP');
  const downStreaks = findStreaks(data, 'DOWN');

  // Loss streaks for Martingale (if betting UP, losses = DOWN streaks)
  const lossStreaksIfBettingUp = findStreaks(data, 'DOWN');
  const lossStreaksIfBettingDown = findStreaks(data, 'UP');

  const maxUpStreak = upStreaks.length > 0 ? Math.max(...upStreaks.map(s => s.length)) : 0;
  const maxDownStreak = downStreaks.length > 0 ? Math.max(...downStreaks.map(s => s.length)) : 0;
  const maxLossIfBettingUp = lossStreaksIfBettingUp.length > 0 ? Math.max(...lossStreaksIfBettingUp.map(s => s.length)) : 0;
  const maxLossIfBettingDown = lossStreaksIfBettingDown.length > 0 ? Math.max(...lossStreaksIfBettingDown.map(s => s.length)) : 0;

  // Streak distribution
  const upStreakDist = {};
  const downStreakDist = {};
  upStreaks.forEach(s => { upStreakDist[s.length] = (upStreakDist[s.length] || 0) + 1; });
  downStreaks.forEach(s => { downStreakDist[s.length] = (downStreakDist[s.length] || 0) + 1; });

  // Find the longest streaks with details
  const longestUpStreak = upStreaks.find(s => s.length === maxUpStreak);
  const longestDownStreak = downStreaks.find(s => s.length === maxDownStreak);

  return {
    crypto,
    totalWindows: data.length,
    upWins: data.filter(d => d.winner === 'UP').length,
    downWins: data.filter(d => d.winner === 'DOWN').length,
    maxUpStreak,
    maxDownStreak,
    longestUpStreak,
    longestDownStreak,
    maxLossIfBettingUp,
    maxLossIfBettingDown,
    upStreakDist,
    downStreakDist,
    upStreaks: upStreaks.filter(s => s.length >= 3),
    downStreaks: downStreaks.filter(s => s.length >= 3),
  };
}

function printAnalysis(analysis) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${analysis.crypto} ANALYSIS`);
  console.log(`${'='.repeat(80)}`);

  console.log(`Total Windows: ${analysis.totalWindows}`);
  console.log(`UP Wins: ${analysis.upWins} (${(analysis.upWins / analysis.totalWindows * 100).toFixed(1)}%)`);
  console.log(`DOWN Wins: ${analysis.downWins} (${(analysis.downWins / analysis.totalWindows * 100).toFixed(1)}%)`);

  console.log(`\nLongest UP Streak: ${analysis.maxUpStreak}`);
  if (analysis.longestUpStreak) {
    console.log(`  From: ${analysis.longestUpStreak.startTime}`);
    console.log(`  To:   ${analysis.longestUpStreak.endTime}`);
  }

  console.log(`\nLongest DOWN Streak: ${analysis.maxDownStreak}`);
  if (analysis.longestDownStreak) {
    console.log(`  From: ${analysis.longestDownStreak.startTime}`);
    console.log(`  To:   ${analysis.longestDownStreak.endTime}`);
  }

  // Martingale analysis
  console.log(`\n--- MARTINGALE ANALYSIS ---`);
  console.log(`If betting UP always:`);
  console.log(`  Max consecutive losses: ${analysis.maxLossIfBettingUp}`);
  console.log(`  Balance needed ($1 bet): $${calculateBalanceNeeded(analysis.maxLossIfBettingUp)}`);
  console.log(`  Balance needed ($2 bet): $${calculateBalanceNeeded(analysis.maxLossIfBettingUp, 2)}`);

  console.log(`If betting DOWN always:`);
  console.log(`  Max consecutive losses: ${analysis.maxLossIfBettingDown}`);
  console.log(`  Balance needed ($1 bet): $${calculateBalanceNeeded(analysis.maxLossIfBettingDown)}`);
  console.log(`  Balance needed ($2 bet): $${calculateBalanceNeeded(analysis.maxLossIfBettingDown, 2)}`);

  // Streak distribution
  console.log(`\n--- STREAK DISTRIBUTION ---`);
  console.log('UP Streaks:');
  const upDist = Object.entries(analysis.upStreakDist).sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [len, count] of upDist) {
    console.log(`  ${len} in a row: ${count} times`);
  }

  console.log('DOWN Streaks:');
  const downDist = Object.entries(analysis.downStreakDist).sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [len, count] of downDist) {
    console.log(`  ${len} in a row: ${count} times`);
  }

  // Show all streaks >= 5
  const bigStreaks = [...analysis.upStreaks, ...analysis.downStreaks]
    .filter(s => s.length >= 5)
    .sort((a, b) => b.length - a.length);

  if (bigStreaks.length > 0) {
    console.log(`\n--- BIG STREAKS (>= 5) ---`);
    for (const streak of bigStreaks) {
      console.log(`  ${streak.length} ${streak.side} | ${streak.startTime.split('T')[0]} ${streak.startTime.split('T')[1].slice(0, 5)} - ${streak.endTime.split('T')[1].slice(0, 5)}`);
    }
  }
}

async function main() {
  const jsonFile = process.argv[2];
  const cryptoFilter = process.argv[3]?.toUpperCase(); // Optional: BTC, ETH, SOL, XRP

  if (!jsonFile) {
    // Try to find the most recent file
    const dataDir = path.join(__dirname, '../data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter(f => f.startsWith('crypto-prices-'));
      if (files.length > 0) {
        const latestFile = path.join(dataDir, files.sort().reverse()[0]);
        console.log(`Using: ${latestFile}`);
        analyzeFile(latestFile, cryptoFilter);
        return;
      }
    }
    console.error('Usage: node scripts/analyze-streaks-from-json.cjs <jsonFile> [crypto]');
    console.error('Example: node scripts/analyze-streaks-from-json.cjs data/crypto-prices-all-2025-11-09-to-2025-12-09.json BTC');
    process.exit(1);
  }

  analyzeFile(jsonFile, cryptoFilter);
}

function analyzeFile(jsonFile, cryptoFilter = null) {
  const filePath = path.isAbsolute(jsonFile) ? jsonFile : path.join(process.cwd(), jsonFile);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nAnalyzing: ${filePath}`);
  if (cryptoFilter) {
    console.log(`Filtering: ${cryptoFilter} only`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Check if it's combined file or single crypto
  if (Array.isArray(data)) {
    // Single crypto file
    const crypto = path.basename(filePath).match(/crypto-prices-(\w+)-/)?.[1]?.toUpperCase() || 'UNKNOWN';
    if (cryptoFilter && crypto !== cryptoFilter) {
      console.log(`No data for ${cryptoFilter} in this file`);
      return;
    }
    const analysis = analyzeCrypto(crypto, data);
    if (analysis) printAnalysis(analysis);
  } else {
    // Combined file with all cryptos
    const allAnalyses = [];

    for (const [crypto, cryptoData] of Object.entries(data)) {
      // Skip if filter is set and doesn't match
      if (cryptoFilter && crypto.toUpperCase() !== cryptoFilter) {
        continue;
      }

      const analysis = analyzeCrypto(crypto, cryptoData);
      if (analysis) {
        allAnalyses.push(analysis);
        printAnalysis(analysis);
      }
    }

    if (allAnalyses.length === 0) {
      console.log(`No data found${cryptoFilter ? ` for ${cryptoFilter}` : ''}`);
      return;
    }

    // Only show summary table if analyzing multiple cryptos
    if (allAnalyses.length > 1) {
      // Summary table
      console.log(`\n${'='.repeat(80)}`);
      console.log('SUMMARY: MARTINGALE BALANCE REQUIREMENTS');
      console.log(`${'='.repeat(80)}`);
      console.log('Crypto | Max Loss (UP) | Balance ($1) | Max Loss (DOWN) | Balance ($1)');
      console.log('-------|---------------|--------------|-----------------|-------------');

      for (const a of allAnalyses) {
        console.log(
          `${a.crypto.padEnd(6)} | ${String(a.maxLossIfBettingUp).padStart(13)} | $${String(calculateBalanceNeeded(a.maxLossIfBettingUp)).padStart(11)} | ${String(a.maxLossIfBettingDown).padStart(15)} | $${String(calculateBalanceNeeded(a.maxLossIfBettingDown)).padStart(10)}`
        );
      }

      // Find the worst case across all cryptos
      const worstUp = Math.max(...allAnalyses.map(a => a.maxLossIfBettingUp));
      const worstDown = Math.max(...allAnalyses.map(a => a.maxLossIfBettingDown));
      const worst = Math.max(worstUp, worstDown);

      console.log(`\nWORST CASE ACROSS ALL CRYPTOS:`);
      console.log(`Max consecutive losses: ${worst}`);
      console.log(`Balance needed for $1 base bet: $${calculateBalanceNeeded(worst)}`);
      console.log(`Balance needed for $2 base bet: $${calculateBalanceNeeded(worst, 2)}`);
      console.log(`Balance needed for $5 base bet: $${calculateBalanceNeeded(worst, 5)}`);
    }
  }
}

main().catch(console.error);

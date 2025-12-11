/**
 * Martingale Simulation with Skip on Loss Streak
 *
 * Simulates Martingale betting with a rule:
 * If you lose N times in a row, skip M hours before resuming.
 *
 * Usage: node scripts/simulate-martingale-skip.cjs <jsonFile> [crypto] [side] [baseBet] [skipAfterLosses] [skipHours] [--reset]
 * Example: node scripts/simulate-martingale-skip.cjs data/crypto-prices-partial-2025-12-10.json BTC UP 1 5 1
 * Example with reset: node scripts/simulate-martingale-skip.cjs data/crypto-prices-partial-2025-12-10.json BTC UP 1 5 0 --reset
 *
 * Defaults: BTC, UP, $1 base bet, skip after 5 losses, skip 1 hour
 *
 * Options:
 *   --reset: Reset bet to base after skip (accept loss), instead of continuing with doubled bet
 *   skipHours=0: Skip until streak ends (wait for opposite side to win)
 */

const fs = require('fs');
const path = require('path');

function calculateBalanceNeeded(streak, baseBet = 1) {
  return (Math.pow(2, streak + 1) - 1) * baseBet;
}

function formatDate(isoString) {
  return isoString.replace('T', ' ').replace('Z', '');
}

function simulate(data, options) {
  const {
    crypto,
    targetSide,
    baseBet,
    skipAfterLosses,
    skipHours,
    resetAfterSkip = false, // If true, reset bet to base after skip (accept loss)
  } = options;

  const oppositeSide = targetSide === 'UP' ? 'DOWN' : 'UP';

  // Sort by startTime
  data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const results = {
    options,
    totalWindows: data.length,
    tradedWindows: 0,
    skippedWindows: 0,
    wins: 0,
    losses: 0,
    totalProfit: 0,
    maxBet: baseBet,
    maxDrawdown: 0,
    currentStreak: 0,
    maxLossStreak: 0,
    skipEvents: [],
    trades: [],
    dailyResults: {},
  };

  let currentBet = baseBet;
  let currentDrawdown = 0;
  let lossStreak = 0;
  let skipUntil = null;
  let waitForStreakEnd = false; // Skip until opposite side wins (streak ends)

  for (let i = 0; i < data.length; i++) {
    const window = data[i];
    const windowTime = new Date(window.startTime);
    const date = window.startTime.split('T')[0];

    // Initialize daily results
    if (!results.dailyResults[date]) {
      results.dailyResults[date] = {
        windows: 0,
        traded: 0,
        skipped: 0,
        wins: 0,
        losses: 0,
        profit: 0,
        maxBet: baseBet,
      };
    }
    results.dailyResults[date].windows++;

    // Check if we should skip (time-based)
    if (skipUntil && windowTime < skipUntil) {
      results.skippedWindows++;
      results.dailyResults[date].skipped++;
      // Add skipped trade to log
      results.trades.push({
        index: i,
        startTime: window.startTime,
        bet: 0,
        side: targetSide,
        winner: window.winner,
        won: false,
        profit: 0,
        totalProfit: results.totalProfit,
        streak: 0,
        skipped: true,
      });
      continue;
    }

    // Check if we're waiting for streak to end (skip until opposite side wins)
    if (waitForStreakEnd) {
      if (window.winner === oppositeSide) {
        // Streak ended! Resume betting
        waitForStreakEnd = false;
        if (resetAfterSkip) {
          currentBet = baseBet;
          lossStreak = 0;
          currentDrawdown = 0;
        }
      } else {
        // Still in losing streak, skip
        results.skippedWindows++;
        results.dailyResults[date].skipped++;
        results.trades.push({
          index: i,
          startTime: window.startTime,
          bet: 0,
          side: targetSide,
          winner: window.winner,
          won: false,
          profit: 0,
          totalProfit: results.totalProfit,
          streak: 0,
          skipped: true,
        });
        continue;
      }
    }

    // Reset skip if time has passed
    if (skipUntil && windowTime >= skipUntil) {
      skipUntil = null;
      if (resetAfterSkip) {
        currentBet = baseBet;
        lossStreak = 0;
        currentDrawdown = 0;
      }
      // Otherwise keep currentBet doubled - continue with doubled bet after skip
    }

    results.tradedWindows++;
    results.dailyResults[date].traded++;

    const won = window.winner === targetSide;

    const trade = {
      index: i,
      startTime: window.startTime,
      bet: currentBet,
      side: targetSide,
      winner: window.winner,
      won,
      profit: 0,
      totalProfit: 0,
      streak: 0,
      skipped: false,
    };

    if (won) {
      // Win: profit = bet amount
      trade.profit = currentBet;
      results.totalProfit += currentBet;
      results.wins++;
      results.dailyResults[date].wins++;
      results.dailyResults[date].profit += currentBet;

      // Track big wins (recovered from loss streak)
      if (lossStreak > 0) {
        results.recoveries = results.recoveries || [];
        results.recoveries.push({
          time: window.startTime,
          lossStreak,
          betAmount: currentBet,
          recovered: currentDrawdown,
        });
      }

      lossStreak = 0;
      currentBet = baseBet;
      currentDrawdown = 0;
    } else {
      // Lose: lose bet amount
      trade.profit = -currentBet;
      results.totalProfit -= currentBet;
      results.losses++;
      results.dailyResults[date].losses++;
      results.dailyResults[date].profit -= currentBet;

      lossStreak++;
      trade.streak = lossStreak;

      currentDrawdown += currentBet;
      if (currentDrawdown > results.maxDrawdown) {
        results.maxDrawdown = currentDrawdown;
      }

      if (lossStreak > results.maxLossStreak) {
        results.maxLossStreak = lossStreak;
      }

      // Double bet for next round
      currentBet = currentBet * 2;
      if (currentBet > results.maxBet) {
        results.maxBet = currentBet;
      }
      if (currentBet > results.dailyResults[date].maxBet) {
        results.dailyResults[date].maxBet = currentBet;
      }

      // Check if we should skip (after doubling the bet)
      if (lossStreak >= skipAfterLosses) {
        if (skipHours === 0) {
          // Skip until streak ends (opposite side wins)
          waitForStreakEnd = true;
          results.skipEvents.push({
            afterWindow: window.startTime,
            lossStreak,
            skipUntil: 'until streak ends',
            lostAmount: currentDrawdown,
            nextBet: resetAfterSkip ? baseBet : currentBet,
            mode: resetAfterSkip ? 'RESET' : 'CONTINUE',
          });
        } else {
          // Skip for N hours
          skipUntil = new Date(windowTime.getTime() + skipHours * 60 * 60 * 1000);
          results.skipEvents.push({
            afterWindow: window.startTime,
            lossStreak,
            skipUntil: skipUntil.toISOString(),
            lostAmount: currentDrawdown,
            nextBet: resetAfterSkip ? baseBet : currentBet,
            mode: resetAfterSkip ? 'RESET' : 'CONTINUE',
          });
        }
      }
    }

    trade.totalProfit = results.totalProfit;
    results.trades.push(trade);
  }

  return results;
}

function generateMarkdownReport(results, outputPath) {
  const {
    options,
    totalWindows,
    tradedWindows,
    skippedWindows,
    wins,
    losses,
    totalProfit,
    maxBet,
    maxDrawdown,
    maxLossStreak,
    skipEvents,
    trades,
    dailyResults,
  } = results;

  let md = `# Martingale Simulation with Skip Rule

## Configuration
- **Crypto**: ${options.crypto}
- **Target Side**: ${options.targetSide}
- **Base Bet**: $${options.baseBet}
- **Skip After**: ${options.skipAfterLosses} consecutive losses
- **Skip Duration**: ${options.skipHours} hour(s)

## Summary
| Metric | Value |
|--------|-------|
| Total Windows | ${totalWindows} |
| Traded Windows | ${tradedWindows} |
| Skipped Windows | ${skippedWindows} |
| Wins | ${wins} (${(wins/tradedWindows*100).toFixed(1)}%) |
| Losses | ${losses} (${(losses/tradedWindows*100).toFixed(1)}%) |
| **Total Profit** | **$${totalProfit.toFixed(2)}** |
| Max Bet Required | $${maxBet} |
| Max Drawdown | $${maxDrawdown.toFixed(2)} |
| Max Loss Streak | ${maxLossStreak} |
| Skip Events | ${skipEvents.length} |

## Balance Requirements (with skip rule)
After ${options.skipAfterLosses} losses, skip ${options.skipHours}h then continue with doubled bet.
Max bet seen in simulation: $${maxBet}

| Base Bet | Max Balance Needed |
|----------|-------------------|
| $1 | $${calculateBalanceNeeded(maxLossStreak, 1)} |
| $2 | $${calculateBalanceNeeded(maxLossStreak, 2)} |
| $5 | $${calculateBalanceNeeded(maxLossStreak, 5)} |

## Big Recoveries (won after loss streak)
`;

  const recoveries = results.recoveries || [];
  const bigRecoveries = recoveries.filter(r => r.lossStreak >= 5).sort((a, b) => b.lossStreak - a.lossStreak);

  if (bigRecoveries.length > 0) {
    md += `| Time | Loss Streak | Bet Amount | Recovered |
|------|-------------|------------|-----------|
`;
    bigRecoveries.slice(0, 20).forEach(r => {
      md += `| ${formatDate(r.time)} | ${r.lossStreak} | $${r.betAmount} | $${r.recovered} |
`;
    });
  } else {
    md += `*No big recoveries (5+ loss streaks recovered)*\n`;
  }

  md += `
## Skip Events (${skipEvents.length} total)
`;

  if (skipEvents.length > 0) {
    md += `| # | After Window | Loss Streak | Lost Amount | Next Bet | Skip Until | Mode |
|---|--------------|-------------|-------------|----------|------------|------|
`;
    skipEvents.forEach((event, i) => {
      const skipUntilStr = event.skipUntil === 'until streak ends' ? 'streak end' : formatDate(event.skipUntil);
      md += `| ${i + 1} | ${formatDate(event.afterWindow)} | ${event.lossStreak} | $${event.lostAmount.toFixed(0)} | $${event.nextBet} | ${skipUntilStr} | ${event.mode || 'CONTINUE'} |
`;
    });
  } else {
    md += `*No skip events occurred.*\n`;
  }

  md += `
## Daily Breakdown
| Date | Windows | Traded | Skipped | Wins | Losses | Max Bet | Profit | Running Total |
|------|---------|--------|---------|------|--------|---------|--------|---------------|
`;

  let runningTotal = 0;
  for (const [date, day] of Object.entries(dailyResults)) {
    runningTotal += day.profit;
    md += `| ${date} | ${day.windows} | ${day.traded} | ${day.skipped} | ${day.wins} | ${day.losses} | $${day.maxBet} | ${day.profit >= 0 ? '+' : ''}$${day.profit.toFixed(0)} | $${runningTotal.toFixed(0)} |
`;
  }

  // Group trades by day
  const tradesByDay = {};
  trades.forEach(trade => {
    const date = trade.startTime.split('T')[0];
    if (!tradesByDay[date]) {
      tradesByDay[date] = [];
    }
    tradesByDay[date].push(trade);
  });

  // Group skip events by day
  const skipEventsByDay = {};
  skipEvents.forEach(event => {
    const date = event.afterWindow.split('T')[0];
    if (!skipEventsByDay[date]) {
      skipEventsByDay[date] = [];
    }
    skipEventsByDay[date].push(event);
  });

  md += `
## Detailed Trade Log by Day
`;

  for (const [date, dayTrades] of Object.entries(tradesByDay)) {
    const dayStats = dailyResults[date];
    const daySkips = skipEventsByDay[date] || [];

    md += `
### ${date}
**Summary:** ${dayStats.traded} trades | ${dayStats.wins} wins | ${dayStats.losses} losses | Max Bet: $${dayStats.maxBet} | Profit: ${dayStats.profit >= 0 ? '+' : ''}$${dayStats.profit.toFixed(0)}
`;

    // Show skip events for this day
    if (daySkips.length > 0) {
      md += `
**Skip Events (${daySkips.length}):**
| After Time | Loss Streak | Lost Amount | Next Bet | Skip Until |
|------------|-------------|-------------|----------|------------|
`;
      daySkips.forEach(event => {
        const afterTime = event.afterWindow.split('T')[1].slice(0, 5);
        let skipUntilStr;
        if (event.skipUntil === 'until streak ends') {
          skipUntilStr = 'streak end';
        } else {
          const skipUntilTime = event.skipUntil.split('T')[1].slice(0, 5);
          const skipUntilDate = event.skipUntil.split('T')[0];
          skipUntilStr = skipUntilDate === date ? skipUntilTime : `${skipUntilDate} ${skipUntilTime}`;
        }
        const modeStr = event.mode === 'RESET' ? ' (RESET)' : '';
        md += `| ${afterTime} | ${event.lossStreak} | $${event.lostAmount.toFixed(0)} | $${event.nextBet} | ${skipUntilStr}${modeStr} |
`;
      });
    }

    md += `
| # | Time | Event | Bet | Result | Winner | Profit | Total | Streak |
|---|------|-------|-----|--------|--------|--------|-------|--------|
`;

    let tradeNum = 0;
    dayTrades.forEach((trade) => {
      const time = trade.startTime.split('T')[1].slice(0, 5);
      const timestamp = Math.floor(new Date(trade.startTime).getTime() / 1000);
      const eventSlug = `${options.crypto.toLowerCase()}-updown-15m-${timestamp}`;
      const eventLink = `[${eventSlug}](https://polymarket.com/event/${eventSlug})`;

      if (trade.skipped) {
        // Skipped window
        md += `| - | ${time} | ${eventLink} | - | ⏭️ SKIP | ${trade.winner} | - | $${trade.totalProfit.toFixed(0)} | - |
`;
      } else {
        tradeNum++;
        const resultEmoji = trade.won ? '✅' : '❌';
        const streakStr = trade.streak > 0 ? `L${trade.streak}` : '-';
        md += `| ${tradeNum} | ${time} | ${eventLink} | $${trade.bet} | ${resultEmoji} | ${trade.winner} | ${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(0)} | $${trade.totalProfit.toFixed(0)} | ${streakStr} |
`;
      }
    });
  }

  md += `
## Comparison: With vs Without Skip Rule

### Without Skip Rule (Pure Martingale)
- Max possible loss streak: ${maxLossStreak}
- Balance needed for $1 bet: $${calculateBalanceNeeded(maxLossStreak, 1)}
- Balance needed for $2 bet: $${calculateBalanceNeeded(maxLossStreak, 2)}

### With Skip Rule (${options.skipAfterLosses} losses → skip ${options.skipHours}h)
- Max loss streak before skip: ${options.skipAfterLosses}
- Balance needed for $1 bet: $${calculateBalanceNeeded(options.skipAfterLosses - 1, 1)}
- Balance needed for $2 bet: $${calculateBalanceNeeded(options.skipAfterLosses - 1, 2)}
- Skipped windows: ${skippedWindows}
- Skip events: ${skipEvents.length}

---
*Generated at ${new Date().toISOString()}*
`;

  fs.writeFileSync(outputPath, md);
  return md;
}

async function main() {
  const jsonFile = process.argv[2];
  const crypto = (process.argv[3] || 'BTC').toUpperCase();
  const targetSide = (process.argv[4] || 'UP').toUpperCase();
  const baseBet = parseFloat(process.argv[5]) || 1;
  const skipAfterLosses = parseInt(process.argv[6]) || 5;
  const skipHours = process.argv[7] !== undefined ? parseFloat(process.argv[7]) : 1;
  const resetAfterSkip = process.argv.includes('--reset');

  if (!jsonFile) {
    console.error('Usage: node scripts/simulate-martingale-skip.cjs <jsonFile> [crypto] [side] [baseBet] [skipAfterLosses] [skipHours]');
    console.error('Example: node scripts/simulate-martingale-skip.cjs data/crypto-prices-partial-2025-12-10.json BTC UP 1 5 1');
    process.exit(1);
  }

  const filePath = path.isAbsolute(jsonFile) ? jsonFile : path.join(process.cwd(), jsonFile);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nLoading data from: ${filePath}`);

  const allData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Get crypto data
  let data;
  if (Array.isArray(allData)) {
    data = allData;
  } else {
    data = allData[crypto];
    if (!data) {
      console.error(`No data found for ${crypto}`);
      process.exit(1);
    }
  }

  console.log(`Found ${data.length} windows for ${crypto}`);
  console.log(`\nSimulating Martingale with:`);
  console.log(`  - Target side: ${targetSide}`);
  console.log(`  - Base bet: $${baseBet}`);
  console.log(`  - Skip after: ${skipAfterLosses} consecutive losses`);
  console.log(`  - Skip duration: ${skipHours === 0 ? 'until streak ends' : skipHours + ' hour(s)'}`);
  console.log(`  - After skip: ${resetAfterSkip ? 'RESET (accept $' + (Math.pow(2, skipAfterLosses) - 1) * baseBet + ' max loss)' : 'CONTINUE with doubled bet'}`);

  const results = simulate(data, {
    crypto,
    targetSide,
    baseBet,
    skipAfterLosses,
    skipHours,
    resetAfterSkip,
  });

  // Generate report
  const outputPath = path.join(process.cwd(), 'RESULT.md');
  generateMarkdownReport(results, outputPath);

  console.log(`\n${'='.repeat(60)}`);
  console.log('SIMULATION COMPLETE');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Windows: ${results.totalWindows}`);
  console.log(`Traded: ${results.tradedWindows} | Skipped: ${results.skippedWindows}`);
  console.log(`Wins: ${results.wins} | Losses: ${results.losses}`);
  console.log(`Total Profit: $${results.totalProfit.toFixed(2)}`);
  console.log(`Max Bet: $${results.maxBet}`);
  console.log(`Max Drawdown: $${results.maxDrawdown.toFixed(2)}`);
  console.log(`Max Loss Streak: ${results.maxLossStreak}`);
  console.log(`Skip Events: ${results.skipEvents.length}`);

  // Show biggest recoveries
  const recoveries = results.recoveries || [];
  const bigRecoveries = recoveries.filter(r => r.lossStreak >= 5).sort((a, b) => b.lossStreak - a.lossStreak);
  if (bigRecoveries.length > 0) {
    console.log(`\nBiggest recoveries:`);
    bigRecoveries.slice(0, 5).forEach(r => {
      console.log(`  ${r.lossStreak} losses → won $${r.betAmount} (recovered $${r.recovered})`);
    });
  }

  console.log(`\nFull report saved to: ${outputPath}`);
}

main().catch(console.error);

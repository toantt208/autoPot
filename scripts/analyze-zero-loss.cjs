/**
 * Analyze Zero-Loss Configurations
 *
 * Tests multiple zero-loss configurations against historical data
 * to find the most profitable one.
 *
 * Usage: DATABASE_URL="..." node scripts/analyze-zero-loss.cjs [amount] [date]
 * Example:
 *   node scripts/analyze-zero-loss.cjs 10              # $10 per trade, all time
 *   node scripts/analyze-zero-loss.cjs 10 today       # $10 per trade, today only
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration from CLI args
const TRADE_AMOUNT = parseFloat(process.argv[2]) || 10; // $10 per trade
const DATE_FILTER = process.argv[3] || null;

// Realistic trading constraints
const MIN_ENTRY_PRICE = 0.20; // Minimum 20% - below this no liquidity
const MAX_ENTRY_PRICE = 0.98; // Maximum 98% - 99% not tradeable

// Only analyze windows after this slug (data before this had issues)
const MIN_WINDOW_SLUG = 'xrp-updown-15m-1765755000';

// Zero-loss configurations to test
const ZERO_LOSS_CONFIGS = [
  // High threshold configs (potential zero-loss)
  { name: 'th015', threshold: 0.015, minPrice: 0, maxTime: 600, desc: 'threshold >= 0.015' },
  { name: 'th014', threshold: 0.014, minPrice: 0, maxTime: 600, desc: 'threshold >= 0.014' },
  { name: 'th013', threshold: 0.013, minPrice: 0, maxTime: 600, desc: 'threshold >= 0.013' },
  { name: 'th012', threshold: 0.012, minPrice: 0, maxTime: 600, desc: 'threshold >= 0.012' },
  { name: 'th011', threshold: 0.011, minPrice: 0, maxTime: 600, desc: 'threshold >= 0.011' },

  // Price + threshold combos
  { name: 'p95_th012', threshold: 0.012, minPrice: 0.95, maxTime: 600, desc: 'price >= 95% + th >= 0.012' },
  { name: 'p90_th012', threshold: 0.012, minPrice: 0.90, maxTime: 600, desc: 'price >= 90% + th >= 0.012' },
  { name: 'p85_th012', threshold: 0.012, minPrice: 0.85, maxTime: 600, desc: 'price >= 85% + th >= 0.012' },

  // Time-limited configs
  { name: 't10_th001', threshold: 0.001, minPrice: 0, maxTime: 10, desc: 'T <= 10s + th >= 0.001' },
  { name: 't20_th001', threshold: 0.001, minPrice: 0, maxTime: 20, desc: 'T <= 20s + th >= 0.001' },
  { name: 't10_th0005', threshold: 0.0005, minPrice: 0, maxTime: 10, desc: 'T <= 10s + th >= 0.0005' },

  // Original configs for comparison
  { name: 'p89_th0045', threshold: 0.0045, minPrice: 0.89, maxTime: 600, desc: 'price >= 89% + th >= 0.0045' },
  { name: 't30_only', threshold: 0.0004, minPrice: 0, maxTime: 30, desc: 'T <= 30s only' },
  { name: 't50_only', threshold: 0.0004, minPrice: 0, maxTime: 50, desc: 'T <= 50s only' },
];

/**
 * Parse date filter to start/end timestamps
 */
function parseDateFilter(filter) {
  if (!filter) return null;

  const now = new Date();
  let startDate, endDate;

  if (filter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  } else if (filter === 'yesterday') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
    startDate = new Date(filter + 'T00:00:00');
    endDate = new Date(filter + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
  } else {
    console.error(`Invalid date filter: ${filter}`);
    console.error('Use: today, yesterday, or YYYY-MM-DD');
    process.exit(1);
  }

  return { startDate, endDate };
}

/**
 * Test a single config against all windows
 */
async function testConfig(config, windows, dateRange) {
  const results = {
    config: config.name,
    desc: config.desc,
    trades: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    entries: [],
  };

  for (const { window_slug } of windows) {
    // Get all logs for this window ordered by time
    const logs = await prisma.xrpPriceLog.findMany({
      where: { windowSlug: window_slug },
      orderBy: { timestamp: 'asc' },
    });

    if (logs.length < 10) continue;

    // Find first entry point matching config rules
    let entryLog = null;
    let entrySide = null;

    for (const log of logs) {
      // Skip if time_left <= 0 (after market close)
      if (log.timeLeft <= 0) continue;

      // Skip if time_left > maxTime
      if (log.timeLeft > config.maxTime) continue;

      const priceDiff = parseFloat(log.priceDiff.toString());
      const upPrice = parseFloat(log.upPrice.toString());
      const downPrice = parseFloat(log.downPrice.toString());

      // Check if threshold reached
      if (Math.abs(priceDiff) < config.threshold) continue;

      // Determine entry side and check price constraints
      if (priceDiff >= config.threshold) {
        // Would buy UP - check price is tradeable
        if (upPrice < MIN_ENTRY_PRICE || upPrice > MAX_ENTRY_PRICE) continue;
        if (upPrice < config.minPrice) continue;
        entryLog = log;
        entrySide = 'UP';
        break;
      } else if (priceDiff <= -config.threshold) {
        // Would buy DOWN - check price is tradeable
        if (downPrice < MIN_ENTRY_PRICE || downPrice > MAX_ENTRY_PRICE) continue;
        if (downPrice < config.minPrice) continue;
        entryLog = log;
        entrySide = 'DOWN';
        break;
      }
    }

    if (!entryLog) continue;

    // Get the log closest to T=0 to determine outcome
    let closestToZero = logs[0];
    let minAbsTimeLeft = Math.abs(logs[0].timeLeft);
    for (const log of logs) {
      const absTimeLeft = Math.abs(log.timeLeft);
      if (absTimeLeft < minAbsTimeLeft) {
        minAbsTimeLeft = absTimeLeft;
        closestToZero = log;
      }
    }
    const finalPriceDiff = parseFloat(closestToZero.priceDiff.toString());
    const actualWinner = finalPriceDiff >= 0 ? 'UP' : 'DOWN';

    // Calculate entry price and result
    const entryPrice = entrySide === 'UP'
      ? parseFloat(entryLog.upPrice.toString())
      : parseFloat(entryLog.downPrice.toString());

    const isWin = entrySide === actualWinner;
    const payout = isWin ? TRADE_AMOUNT / entryPrice : 0;
    const profit = payout - TRADE_AMOUNT;

    results.trades++;
    if (isWin) {
      results.wins++;
      results.profit += profit;
    } else {
      results.losses++;
      results.profit -= TRADE_AMOUNT;
    }

    results.entries.push({
      window: window_slug,
      side: entrySide,
      price: entryPrice,
      timeLeft: entryLog.timeLeft,
      diff: parseFloat(entryLog.priceDiff.toString()),
      finalDiff: finalPriceDiff,
      isWin,
      profit,
    });
  }

  return results;
}

async function main() {
  const dateRange = parseDateFilter(DATE_FILTER);

  console.log('='.repeat(70));
  console.log('ZERO-LOSS CONFIGURATION ANALYSIS');
  console.log('='.repeat(70));
  console.log(`Trade amount: $${TRADE_AMOUNT}`);
  if (dateRange) {
    console.log(`Date: ${DATE_FILTER} (${dateRange.startDate.toISOString().split('T')[0]})`);
  } else {
    console.log('Date: All time');
  }
  console.log('');

  // Get all unique windows
  let windows;
  if (dateRange) {
    windows = await prisma.$queryRaw`
      SELECT DISTINCT window_slug
      FROM xrp_price_logs
      WHERE timestamp >= ${dateRange.startDate} AND timestamp < ${dateRange.endDate}
        AND window_slug >= ${MIN_WINDOW_SLUG}
      ORDER BY window_slug
    `;
  } else {
    windows = await prisma.$queryRaw`
      SELECT DISTINCT window_slug
      FROM xrp_price_logs
      WHERE window_slug >= ${MIN_WINDOW_SLUG}
      ORDER BY window_slug
    `;
  }

  console.log(`Found ${windows.length} windows to analyze\n`);

  // Test each config
  const allResults = [];
  for (const config of ZERO_LOSS_CONFIGS) {
    console.log(`Testing: ${config.desc}...`);
    const result = await testConfig(config, windows, dateRange);
    allResults.push(result);
  }

  // Sort by profit (descending)
  allResults.sort((a, b) => b.profit - a.profit);

  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('RESULTS (sorted by profit)');
  console.log('='.repeat(70));
  console.log('');
  console.log('Config           | Trades | Wins | Losses | Win Rate | Profit    | Avg/Trade');
  console.log('-'.repeat(85));

  for (const r of allResults) {
    const winRate = r.trades > 0 ? ((r.wins / r.trades) * 100).toFixed(1) : '0.0';
    const avgProfit = r.trades > 0 ? (r.profit / r.trades).toFixed(2) : '0.00';
    const profitStr = r.profit >= 0 ? `+$${r.profit.toFixed(2)}` : `-$${Math.abs(r.profit).toFixed(2)}`;

    console.log(
      `${r.config.padEnd(16)} | ${String(r.trades).padStart(6)} | ${String(r.wins).padStart(4)} | ${String(r.losses).padStart(6)} | ${winRate.padStart(7)}% | ${profitStr.padStart(9)} | $${avgProfit}`
    );
  }

  // Show best config details
  const best = allResults[0];
  console.log('\n' + '='.repeat(70));
  console.log(`BEST CONFIG: ${best.desc}`);
  console.log('='.repeat(70));
  console.log(`Total trades: ${best.trades}`);
  console.log(`Wins: ${best.wins} | Losses: ${best.losses}`);
  console.log(`Win rate: ${best.trades > 0 ? ((best.wins / best.trades) * 100).toFixed(1) : 0}%`);
  console.log(`Total profit: $${best.profit.toFixed(2)}`);
  console.log(`Average profit per trade: $${best.trades > 0 ? (best.profit / best.trades).toFixed(2) : 0}`);

  // Show zero-loss configs
  console.log('\n' + '='.repeat(70));
  console.log('ZERO-LOSS CONFIGS (0 losses):');
  console.log('='.repeat(70));
  const zeroLoss = allResults.filter(r => r.losses === 0);
  if (zeroLoss.length === 0) {
    console.log('No zero-loss configs found!');
  } else {
    zeroLoss.sort((a, b) => b.profit - a.profit);
    for (const r of zeroLoss) {
      console.log(`  ${r.desc}: ${r.trades} trades, $${r.profit.toFixed(2)} profit`);
    }
    console.log(`\n  BEST ZERO-LOSS: ${zeroLoss[0].desc}`);
    console.log(`    Trades: ${zeroLoss[0].trades}, Profit: $${zeroLoss[0].profit.toFixed(2)}`);
  }

  // Show loss details for configs with losses
  const withLosses = allResults.filter(r => r.losses > 0);
  if (withLosses.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('LOSS ANALYSIS:');
    console.log('='.repeat(70));
    for (const r of withLosses) {
      const losses = r.entries.filter(e => !e.isWin);
      console.log(`\n${r.desc} (${r.losses} losses):`);
      for (const l of losses) {
        // Extract timestamp from window and format as HH:MM
        const lossTimestamp = parseInt(l.window.split('-').pop()) * 1000;
        const lossTime = new Date(lossTimestamp);
        const timeStr = lossTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        console.log(`  ${l.window} ${timeStr}: ${l.side} @ ${(l.price * 100).toFixed(0)}% | T-${l.timeLeft}s | diff: ${l.diff >= 0 ? '+' : ''}${l.diff.toFixed(4)} -> ${l.finalDiff >= 0 ? '+' : ''}${l.finalDiff.toFixed(4)}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);

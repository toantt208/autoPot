/**
 * Analyze XRP Price Logs - Tiered Entry Strategy
 *
 * Logic: Buy when price diff reaches tiered threshold based on time remaining
 * - Last 10min (600s): threshold 0.006
 * - Last 5min (300s): threshold 0.004
 * - Last 150s: threshold 0.002
 *
 * Usage: DATABASE_URL="..." node scripts/analyze-xrp-entry.cjs [amount] [date]
 * Example:
 *   node scripts/analyze-xrp-entry.cjs 1              # $1 per trade, all time
 *   node scripts/analyze-xrp-entry.cjs 1 today       # $1 per trade, today only
 *   node scripts/analyze-xrp-entry.cjs 5 2025-12-15  # $5 per trade, specific date
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration from CLI args
const TRADE_AMOUNT = parseFloat(process.argv[2]) || 1; // $1 per trade
const DATE_FILTER = process.argv[3] || null; // today, yesterday, or YYYY-MM-DD

// Tiered thresholds based on time remaining (safer = needs bigger diff)
// Format: { maxTimeLeft: threshold }
const TIERED_THRESHOLDS = [
  { maxTimeLeft: 5, threshold: 0.0004 },  // Last 150s: 0.002
  { maxTimeLeft: 10, threshold: 0.0005 },  // Last 150s: 0.002
  { maxTimeLeft: 50, threshold: 0.001 },  // Last 150s: 0.002
  { maxTimeLeft: 100, threshold: 0.0015 },  // Last 150s: 0.002
  { maxTimeLeft: 150, threshold: 0.002 },  // Last 150s: 0.002
  { maxTimeLeft: 300, threshold: 0.004 },  // Last 5min: 0.004
  { maxTimeLeft: 600, threshold: 0.006 },  // Last 10min: 0.006
];

// Only analyze windows after this slug (data before this had issues)
const MIN_WINDOW_SLUG = 'xrp-updown-15m-1765755000';

/**
 * Get threshold for given time_left
 */
function getThresholdForTime(timeLeft) {
  for (const tier of TIERED_THRESHOLDS) {
    if (timeLeft <= tier.maxTimeLeft) {
      return tier.threshold;
    }
  }
  return null; // No entry if outside all tiers
}

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

async function analyzeXrpEntry() {
  const dateRange = parseDateFilter(DATE_FILTER);

  console.log('='.repeat(60));
  console.log('XRP Entry Strategy Analysis (Tiered Thresholds)');
  console.log('Thresholds:');
  for (const tier of TIERED_THRESHOLDS) {
    console.log(`  - Last ${tier.maxTimeLeft}s: $${tier.threshold} diff`);
  }
  if (dateRange) {
    console.log(`Date: ${DATE_FILTER} (${dateRange.startDate.toISOString().split('T')[0]})`);
  } else {
    console.log('Date: All time');
  }
  console.log('='.repeat(60));

  // Get all unique windows (with optional date filter, after MIN_WINDOW_SLUG)
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

  console.log(`\nFound ${windows.length} windows to analyze\n`);

  const results = [];

  for (const { window_slug } of windows) {
    // Get all logs for this window ordered by time
    const logs = await prisma.xrpPriceLog.findMany({
      where: { windowSlug: window_slug },
      orderBy: { timestamp: 'asc' },
    });

    if (logs.length < 10) {
      console.log(`[${window_slug}] Skipping - only ${logs.length} records`);
      continue;
    }

    // Find first entry point where |price_diff| >= tiered threshold
    let entryLog = null;
    let entrySide = null;
    let entryThreshold = null;

    for (const log of logs) {
      // Skip if time_left <= 0 (after market close)
      if (log.timeLeft <= 0) continue;

      // Get threshold for this time
      const threshold = getThresholdForTime(log.timeLeft);
      if (!threshold) continue; // Outside all tiers

      const priceDiff = parseFloat(log.priceDiff.toString());

      if (priceDiff >= threshold) {
        entryLog = log;
        entrySide = 'UP';
        entryThreshold = threshold;
        break;
      } else if (priceDiff <= -threshold) {
        entryLog = log;
        entrySide = 'DOWN';
        entryThreshold = threshold;
        break;
      }
    }

    if (!entryLog) {
      console.log(`[${window_slug}] No entry - tiered threshold not reached`);
      continue;
    }

    // Get the log closest to T=0 (market close) to determine outcome
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

    results.push({
      window: window_slug,
      entrySide,
      entryPrice,
      entryTimeLeft: entryLog.timeLeft,
      entryThreshold,
      entryPriceDiff: parseFloat(entryLog.priceDiff.toString()),
      finalPriceDiff,
      actualWinner,
      isWin,
      profit,
    });

    const status = isWin ? '✅ WIN' : '❌ LOSS';
    const diffStr = parseFloat(entryLog.priceDiff.toString());
    const profitStr = profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
    console.log(
      `[${window_slug}] ${status} ${profitStr} | ${entrySide} @ ${(entryPrice * 100).toFixed(1)}% | ` +
      `T-${entryLog.timeLeft}s (th:${entryThreshold}) | ${diffStr >= 0 ? '+' : ''}${diffStr.toFixed(4)} → ${finalPriceDiff >= 0 ? '+' : ''}${finalPriceDiff.toFixed(4)}`
    );
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const wins = results.filter(r => r.isWin);
  const losses = results.filter(r => !r.isWin);
  const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
  const avgEntryPrice = results.reduce((sum, r) => sum + r.entryPrice, 0) / results.length;
  const avgTimeLeft = results.reduce((sum, r) => sum + r.entryTimeLeft, 0) / results.length;

  console.log(`Total trades: ${results.length}`);
  console.log(`Wins: ${wins.length} | Losses: ${losses.length}`);
  console.log(`Win rate: ${((wins.length / results.length) * 100).toFixed(2)}%`);
  console.log(`Total profit: $${totalProfit.toFixed(2)}`);
  console.log(`Avg entry price: ${(avgEntryPrice * 100).toFixed(1)}%`);
  console.log(`Avg time left at entry: ${avgTimeLeft.toFixed(0)}s`);

  // Breakdown by side
  console.log('\n--- By Entry Side ---');
  const upTrades = results.filter(r => r.entrySide === 'UP');
  const downTrades = results.filter(r => r.entrySide === 'DOWN');

  if (upTrades.length > 0) {
    const upWins = upTrades.filter(r => r.isWin).length;
    const upProfit = upTrades.reduce((sum, r) => sum + r.profit, 0);
    console.log(`UP entries: ${upTrades.length} trades, ${upWins} wins (${((upWins/upTrades.length)*100).toFixed(1)}%), $${upProfit.toFixed(2)} profit`);
  }

  if (downTrades.length > 0) {
    const downWins = downTrades.filter(r => r.isWin).length;
    const downProfit = downTrades.reduce((sum, r) => sum + r.profit, 0);
    console.log(`DOWN entries: ${downTrades.length} trades, ${downWins} wins (${((downWins/downTrades.length)*100).toFixed(1)}%), $${downProfit.toFixed(2)} profit`);
  }

  // Loss analysis
  if (losses.length > 0) {
    console.log('\n--- Loss Analysis ---');
    for (const loss of losses) {
      console.log(
        `${loss.window}: Entered ${loss.entrySide} @ ${(loss.entryPrice * 100).toFixed(1)}% | ` +
        `Diff: ${loss.entryPriceDiff >= 0 ? '+' : ''}${loss.entryPriceDiff.toFixed(4)} → ${loss.finalPriceDiff >= 0 ? '+' : ''}${loss.finalPriceDiff.toFixed(4)}`
      );
    }
  }

  await prisma.$disconnect();
}

analyzeXrpEntry().catch(console.error);

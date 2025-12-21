/**
 * Analyze Price Exit Strategy
 *
 * Checks if buying at a specific price reaches a target exit price,
 * and how long it takes.
 *
 * Usage: DATABASE_URL="..." node scripts/analyze-price-exit.cjs <side> <entryPrice> <exitPrice> [date]
 * Example:
 *   node scripts/analyze-price-exit.cjs UP 0.55 0.58        # Buy UP at 55%, exit at 58%
 *   node scripts/analyze-price-exit.cjs DOWN 0.60 0.65 today
 *   node scripts/analyze-price-exit.cjs UP 55 58            # Also accepts percentages
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CLI arguments
const SIDE = (process.argv[2] || 'UP').toUpperCase();
let ENTRY_PRICE = parseFloat(process.argv[3]) || 0.55;
let EXIT_PRICE = parseFloat(process.argv[4]) || 0.58;
const DATE_FILTER = process.argv[5] || null;

// Convert percentages to decimals if needed
if (ENTRY_PRICE > 1) ENTRY_PRICE = ENTRY_PRICE / 100;
if (EXIT_PRICE > 1) EXIT_PRICE = EXIT_PRICE / 100;

// Only analyze windows after this slug (data before this had issues)
const MIN_WINDOW_SLUG = 'xrp-updown-15m-1765755000';

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
 * Format timestamp from window slug to HH:MM
 */
function getTimeFromSlug(slug) {
  const timestamp = parseInt(slug.split('-').pop()) * 1000;
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

async function main() {
  // Validate side
  if (SIDE !== 'UP' && SIDE !== 'DOWN') {
    console.error('Side must be UP or DOWN');
    process.exit(1);
  }

  const dateRange = parseDateFilter(DATE_FILTER);

  console.log('='.repeat(60));
  console.log('XRP PRICE EXIT ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Side: ${SIDE} | Entry: ${(ENTRY_PRICE * 100).toFixed(0)}% | Exit: ${(EXIT_PRICE * 100).toFixed(0)}%`);
  if (dateRange) {
    console.log(`Date: ${DATE_FILTER} (${dateRange.startDate.toISOString().split('T')[0]})`);
  } else {
    console.log('Date: All time');
  }
  console.log('='.repeat(60));

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

  console.log(`\nAnalyzing ${windows.length} windows...\n`);

  const results = [];

  for (const { window_slug } of windows) {
    // Get all logs for this window ordered by time (descending timeLeft = earliest first)
    const logs = await prisma.xrpPriceLog.findMany({
      where: { windowSlug: window_slug },
      orderBy: { timeLeft: 'desc' },
    });

    if (logs.length < 10) continue;

    // Find first entry point where price hits entry price
    let entryLog = null;
    let entryIndex = -1;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log.timeLeft <= 0) continue;

      const price = SIDE === 'UP'
        ? parseFloat(log.upPrice.toString())
        : parseFloat(log.downPrice.toString());

      // Check if price hits entry level (>= for buying)
      if (price >= ENTRY_PRICE) {
        entryLog = log;
        entryIndex = i;
        break;
      }
    }

    if (!entryLog) continue;

    // After entry, look for exit price
    let exitLog = null;
    let exitFound = false;

    for (let i = entryIndex + 1; i < logs.length; i++) {
      const log = logs[i];
      if (log.timeLeft <= 0) continue;

      const price = SIDE === 'UP'
        ? parseFloat(log.upPrice.toString())
        : parseFloat(log.downPrice.toString());

      // Check if price hits exit level
      if (price >= EXIT_PRICE) {
        exitLog = log;
        exitFound = true;
        break;
      }
    }

    const entryPrice = SIDE === 'UP'
      ? parseFloat(entryLog.upPrice.toString())
      : parseFloat(entryLog.downPrice.toString());

    const exitPrice = exitFound
      ? (SIDE === 'UP'
          ? parseFloat(exitLog.upPrice.toString())
          : parseFloat(exitLog.downPrice.toString()))
      : null;

    const timeToExit = exitFound
      ? entryLog.timeLeft - exitLog.timeLeft
      : null;

    results.push({
      window: window_slug,
      time: getTimeFromSlug(window_slug),
      entryTimeLeft: entryLog.timeLeft,
      entryPrice,
      exitFound,
      exitTimeLeft: exitFound ? exitLog.timeLeft : null,
      exitPrice,
      timeToExit,
    });

    // Log each window
    const status = exitFound ? '✅ EXIT' : '❌ NO EXIT';
    const exitInfo = exitFound
      ? `Exit @ T-${exitLog.timeLeft}s (${timeToExit}s) @ ${(exitPrice * 100).toFixed(0)}%`
      : 'Window expired';
    console.log(
      `[${window_slug}] ${results[results.length - 1].time} | Entry @ T-${entryLog.timeLeft}s @ ${(entryPrice * 100).toFixed(0)}% | ${status} ${exitInfo}`
    );
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const exits = results.filter(r => r.exitFound);
  const noExits = results.filter(r => !r.exitFound);

  console.log(`\nTotal entries at ${(ENTRY_PRICE * 100).toFixed(0)}%: ${results.length}`);
  console.log(`Exits hit at ${(EXIT_PRICE * 100).toFixed(0)}%: ${exits.length}/${results.length} (${((exits.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`No exit (expired): ${noExits.length}`);

  if (exits.length > 0) {
    const times = exits.map(e => e.timeToExit);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\nTime to exit:`);
    console.log(`  Average: ${avgTime.toFixed(1)}s`);
    console.log(`  Fastest: ${minTime}s`);
    console.log(`  Slowest: ${maxTime}s`);

    // Time distribution
    const buckets = [
      { label: '0-30s', min: 0, max: 30, count: 0 },
      { label: '30-60s', min: 30, max: 60, count: 0 },
      { label: '60-120s', min: 60, max: 120, count: 0 },
      { label: '120-300s', min: 120, max: 300, count: 0 },
      { label: '300s+', min: 300, max: Infinity, count: 0 },
    ];

    for (const exit of exits) {
      for (const bucket of buckets) {
        if (exit.timeToExit >= bucket.min && exit.timeToExit < bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    console.log(`\nTime distribution:`);
    for (const bucket of buckets) {
      const pct = ((bucket.count / exits.length) * 100).toFixed(0);
      const bar = '█'.repeat(Math.round(bucket.count / exits.length * 20));
      console.log(`  ${bucket.label.padEnd(10)}: ${String(bucket.count).padStart(3)} (${pct.padStart(2)}%) ${bar}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);

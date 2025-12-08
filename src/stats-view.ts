/**
 * Stats Viewer CLI
 *
 * View trading window statistics from PostgreSQL database.
 *
 * Usage:
 *   node dist/stats-view.js [command] [options]
 *
 * Commands:
 *   recent [crypto] [hours]  - Show recent windows (default: all cryptos, 24 hours)
 *   daily [crypto] [days]    - Show daily flip statistics (default: 7 days)
 *   flips [crypto]           - Show flip timing distribution
 *   window <slug>            - Show detailed stats for a specific window
 *   summary                  - Show overall summary statistics
 */

import { prisma } from './db/index.js';

type Command = 'recent' | 'daily' | 'flips' | 'window' | 'summary' | 'trades' | 'help';

interface ViewOptions {
  crypto?: string;
  hours?: number;
  days?: number;
  slug?: string;
}

// Helper to format tables in console
function formatTable(headers: string[], rows: (string | number | null)[][]): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length))
  );

  const separator = colWidths.map((w) => '-'.repeat(w + 2)).join('+');
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');

  console.log(separator);
  console.log(headerRow);
  console.log(separator);

  for (const row of rows) {
    const formatted = row.map((cell, i) => String(cell ?? '-').padEnd(colWidths[i])).join(' | ');
    console.log(formatted);
  }
  console.log(separator);
}

async function showRecent(options: ViewOptions): Promise<void> {
  const hours = options.hours || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const where: any = { startTime: { gte: since } };
  if (options.crypto) {
    where.crypto = options.crypto.toUpperCase();
  }

  const windows = await prisma.statsWindow.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      flips: { orderBy: { timestamp: 'asc' } },
    },
    take: 50,
  });

  console.log(`\nRecent Windows (last ${hours} hours)`);
  console.log('='.repeat(80));

  if (windows.length === 0) {
    console.log('No windows found.');
    return;
  }

  const headers = ['Slug', 'Crypto', 'Flips', '@98%', 'P1 Side', 'P2 Side', 'Final', 'Flip Times'];
  const rows = windows.map((w: any) => [
    w.marketSlug.slice(-25),
    w.crypto,
    w.sideFlips,
    w.flipsAt98,
    w.phase1FinalSide,
    w.phase2FinalSide,
    w.finalSide,
    w.flips.map((f: any) => `${f.timeLeft}s`).join(', ') || '-',
  ]);

  formatTable(headers, rows);
  console.log(`\nTotal: ${windows.length} windows`);
}

async function showDaily(options: ViewOptions): Promise<void> {
  const days = options.days || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where: any = { startTime: { gte: since } };
  if (options.crypto) {
    where.crypto = options.crypto.toUpperCase();
  }

  // Group by date manually since Prisma doesn't support date grouping well
  const windows = await prisma.statsWindow.findMany({
    where,
    orderBy: { startTime: 'desc' },
  });

  // Aggregate by date and crypto
  const dailyStats: Record<string, { windows: number; flips: number; maxFlips: number }> = {};

  for (const w of windows) {
    const date = w.startTime.toISOString().split('T')[0];
    const key = `${date}-${w.crypto}-${w.interval}`;

    if (!dailyStats[key]) {
      dailyStats[key] = { windows: 0, flips: 0, maxFlips: 0 };
    }

    dailyStats[key].windows++;
    dailyStats[key].flips += w.sideFlips;
    dailyStats[key].maxFlips = Math.max(dailyStats[key].maxFlips, w.sideFlips);
  }

  console.log(`\nDaily Flip Statistics (last ${days} days)`);
  console.log('='.repeat(80));

  if (Object.keys(dailyStats).length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = ['Date', 'Crypto', 'Interval', 'Windows', 'Total Flips', 'Avg Flips', 'Max'];
  const rows = Object.entries(dailyStats)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, stats]) => {
      const [date, crypto, interval] = key.split('-');
      return [
        date,
        crypto,
        interval,
        stats.windows,
        stats.flips,
        (stats.flips / stats.windows).toFixed(2),
        stats.maxFlips,
      ];
    });

  formatTable(headers, rows);
}

async function showFlipTiming(options: ViewOptions): Promise<void> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const where: any = {
    window: {
      startTime: { gte: since },
    },
  };

  if (options.crypto) {
    where.window.crypto = options.crypto.toUpperCase();
  }

  const flips = await prisma.statsSideFlip.findMany({
    where,
    include: { window: true },
  });

  console.log('\nFlip Timing Distribution (last 7 days)');
  console.log('='.repeat(60));

  if (flips.length === 0) {
    console.log('No flips found.');
    return;
  }

  // Group by time bucket
  const buckets: Record<string, number> = {
    '60+ sec': 0,
    '30-60 sec': 0,
    '10-30 sec': 0,
    '5-10 sec': 0,
    '0-5 sec': 0,
    'After close': 0,
  };

  for (const flip of flips) {
    if (flip.timeLeft > 60) buckets['60+ sec']++;
    else if (flip.timeLeft > 30) buckets['30-60 sec']++;
    else if (flip.timeLeft > 10) buckets['10-30 sec']++;
    else if (flip.timeLeft > 5) buckets['5-10 sec']++;
    else if (flip.timeLeft >= 0) buckets['0-5 sec']++;
    else buckets['After close']++;
  }

  const headers = ['Time Bucket', 'Count', 'Percentage'];
  const total = flips.length;
  const rows = Object.entries(buckets).map(([bucket, count]) => [
    bucket,
    count,
    `${((count / total) * 100).toFixed(1)}%`,
  ]);

  formatTable(headers, rows);
  console.log(`\nTotal flips: ${total}`);
}

async function showWindowDetail(slug: string): Promise<void> {
  const window = await prisma.statsWindow.findUnique({
    where: { marketSlug: slug },
    include: {
      snapshots: { orderBy: { timestamp: 'asc' } },
      flips: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!window) {
    console.log(`Window not found: ${slug}`);
    return;
  }

  console.log('\nWindow Details');
  console.log('='.repeat(60));
  console.log(`Slug: ${window.marketSlug}`);
  console.log(`Crypto: ${window.crypto}`);
  console.log(`Interval: ${window.interval}`);
  console.log(`Start: ${window.startTime.toISOString()}`);
  console.log(`End: ${window.endTime.toISOString()}`);
  console.log(`Side Flips: ${window.sideFlips}`);
  console.log(`Phase 1 Final: ${window.phase1FinalSide || 'N/A'}`);
  console.log(`Phase 2 Final: ${window.phase2FinalSide || 'N/A'}`);
  console.log(`Final Side: ${window.finalSide || 'N/A'}`);

  if (window.flips.length > 0) {
    console.log('\nFlip Events:');
    for (const flip of window.flips) {
      console.log(`  ${flip.timeLeft}s left: ${flip.fromSide} -> ${flip.toSide}`);
    }
  }

  console.log(`\nSnapshots: ${window.snapshots.length} total`);

  if (window.snapshots.length > 0) {
    // Show first and last 5 snapshots
    const show =
      window.snapshots.length <= 10
        ? window.snapshots
        : [...window.snapshots.slice(0, 5), null, ...window.snapshots.slice(-5)];

    console.log('\nPrice Snapshots (sample):');
    const headers = ['Time Left', 'Phase', 'Up Price', 'Down Price', 'Higher'];
    const rows = show.map((s: any) => {
      if (!s) return ['...', '...', '...', '...', '...'];
      return [
        `${s.timeLeft}s`,
        s.phase,
        (Number(s.upPrice) * 100).toFixed(2) + '%',
        (Number(s.downPrice) * 100).toFixed(2) + '%',
        s.higherSide,
      ];
    });
    formatTable(headers, rows);
  }
}

async function showSummary(): Promise<void> {
  const totalWindows = await prisma.statsWindow.count();
  const totalFlips = await prisma.statsSideFlip.count();
  const totalFlipsAt98 = await prisma.statsSideFlip.count({ where: { wasAt98: true } });
  const totalSnapshots = await prisma.statsPriceSnapshot.count();

  // Get per-crypto stats
  const cryptoStats = await prisma.statsWindow.groupBy({
    by: ['crypto'],
    _count: true,
    _sum: { sideFlips: true, flipsAt98: true },
    _avg: { sideFlips: true },
  });

  console.log('\nStats Summary');
  console.log('='.repeat(60));
  console.log(`Total Windows: ${totalWindows}`);
  console.log(`Total Flips: ${totalFlips}`);
  console.log(`Total Flips @98%: ${totalFlipsAt98}`);
  console.log(`Total Snapshots: ${totalSnapshots}`);

  if (cryptoStats.length > 0) {
    console.log('\nPer-Crypto Statistics:');
    const headers = ['Crypto', 'Windows', 'Total Flips', 'Flips@98%', 'Avg Flips'];
    const rows = cryptoStats.map((s: any) => [
      s.crypto,
      s._count,
      s._sum.sideFlips || 0,
      s._sum.flipsAt98 || 0,
      (s._avg.sideFlips || 0).toFixed(2),
    ]);
    formatTable(headers, rows);
  }
}

async function showSimulatedTrades(options: ViewOptions): Promise<void> {
  const hours = options.hours || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const where: any = { createdAt: { gte: since } };
  if (options.crypto) {
    where.crypto = options.crypto.toUpperCase();
  }

  const trades = await prisma.statsSimulatedTrade.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  console.log(`\nSimulated Trades (last ${hours} hours)`);
  console.log('Buy higher side at phase1 start when >= 60% | $10 per trade');
  console.log('='.repeat(100));

  if (trades.length === 0) {
    console.log('No simulated trades found.');
    return;
  }

  const headers = ['Slug', 'Crypto', 'Side', 'Entry', 'Shares', 'Won', 'Payout', 'P/L $'];
  const rows = trades.map((t: any) => [
    t.marketSlug.slice(-20),
    t.crypto,
    t.side,
    `${(Number(t.entryPrice) * 100).toFixed(0)}%`,
    Number(t.shares).toFixed(2),
    t.won ? 'YES' : 'NO',
    `$${Number(t.payout).toFixed(2)}`,
    `${Number(t.profitUsd) >= 0 ? '+' : ''}$${Number(t.profitUsd).toFixed(2)}`,
  ]);

  formatTable(headers, rows);

  // Summary stats
  const wins = trades.filter((t: any) => t.won).length;
  const losses = trades.length - wins;
  const totalProfitUsd = trades.reduce((sum: number, t: any) => sum + Number(t.profitUsd), 0);
  const totalBet = trades.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const winRate = (wins / trades.length) * 100;

  console.log(`\nSummary: ${trades.length} trades | ${wins} wins | ${losses} losses | Win rate: ${winRate.toFixed(1)}%`);
  console.log(`Total bet: $${totalBet.toFixed(2)} | Total P/L: ${totalProfitUsd >= 0 ? '+' : ''}$${totalProfitUsd.toFixed(2)}`);
}

function showHelp(): void {
  console.log(`
Stats Viewer CLI

Usage: node dist/stats-view.js [command] [options]

Commands:
  recent [crypto] [hours]  Show recent windows (default: all cryptos, 24 hours)
  daily [crypto] [days]    Show daily flip statistics (default: 7 days)
  flips [crypto]           Show flip timing distribution
  window <slug>            Show detailed stats for a specific window
  summary                  Show overall summary statistics
  trades [crypto] [hours]  Show simulated trades (buy higher side at phase1 >= 60%)
  help                     Show this help message

Examples:
  node dist/stats-view.js recent btc 12
  node dist/stats-view.js daily eth 30
  node dist/stats-view.js flips sol
  node dist/stats-view.js window btc-updown-15m-1764690300
  node dist/stats-view.js summary
  node dist/stats-view.js trades btc 48
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = (args[0] || 'help') as Command;

  try {
    switch (command) {
      case 'recent':
        await showRecent({
          crypto: args[1],
          hours: args[2] ? parseInt(args[2], 10) : 24,
        });
        break;
      case 'daily':
        await showDaily({
          crypto: args[1],
          days: args[2] ? parseInt(args[2], 10) : 7,
        });
        break;
      case 'flips':
        await showFlipTiming({ crypto: args[1] });
        break;
      case 'window':
        if (!args[1]) {
          console.error('Error: window slug required');
          process.exit(1);
        }
        await showWindowDetail(args[1]);
        break;
      case 'summary':
        await showSummary();
        break;
      case 'trades':
        await showSimulatedTrades({
          crypto: args[1],
          hours: args[2] ? parseInt(args[2], 10) : 24,
        });
        break;
      case 'help':
      default:
        showHelp();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

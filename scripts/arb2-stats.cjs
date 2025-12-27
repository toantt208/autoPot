/**
 * Arbitrage V2 Stats Query Script
 *
 * Usage: node scripts/arb2-stats.cjs [crypto]
 * Example: node scripts/arb2-stats.cjs btc
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const crypto = process.argv[2]?.toLowerCase() || 'btc';

async function main() {
  console.log(`\n=== Arbitrage V2 Stats: ${crypto.toUpperCase()} ===\n`);

  // Active session
  const session = await prisma.arbitrageSession.findFirst({
    where: { crypto, active: true },
    orderBy: { startedAt: 'desc' },
  });

  if (session) {
    console.log('📊 Active Session:');
    console.log(`   Started: ${session.startedAt.toISOString()}`);
    console.log(`   Trades: ${session.totalTrades} (${session.wins}W / ${session.losses}L)`);
    console.log(`   Cumulative Profit: $${Number(session.cumulativeProfit).toFixed(2)}`);
    console.log(`   Target: $${Number(session.profitThreshold).toFixed(2)}`);
    console.log('');
  } else {
    console.log('No active session found.\n');
  }

  // Recent windows
  const windows = await prisma.arbitrageWindowStats.findMany({
    where: { crypto },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (windows.length > 0) {
    console.log('📈 Recent Windows:');
    console.log('─'.repeat(100));
    console.log(
      'Slug'.padEnd(40) +
      'Status'.padEnd(12) +
      'AvgTotal'.padEnd(10) +
      'Guaranteed'.padEnd(12) +
      'Spent'.padEnd(10) +
      'Profit'.padEnd(10) +
      'Emergency'
    );
    console.log('─'.repeat(100));

    for (const w of windows) {
      const slug = w.marketSlug.length > 38 ? '...' + w.marketSlug.slice(-35) : w.marketSlug;
      const avgTotal = w.avgTotal ? `${(Number(w.avgTotal) * 100).toFixed(1)}%` : '-';
      const guaranteed = `$${Number(w.guaranteed).toFixed(2)}`;
      const spent = `$${Number(w.totalSpent).toFixed(2)}`;
      const profit = w.profitUsd ? `$${Number(w.profitUsd).toFixed(2)}` : '-';
      const emergency = w.hedgeWasEmergency ? '⚠️ YES' : 'No';

      console.log(
        slug.padEnd(40) +
        w.status.padEnd(12) +
        avgTotal.padEnd(10) +
        guaranteed.padEnd(12) +
        spent.padEnd(10) +
        profit.padEnd(10) +
        emergency
      );
    }
    console.log('');
  }

  // Trade log summary
  const tradeCounts = await prisma.arbitrageTradeLog.groupBy({
    by: ['action'],
    where: { crypto },
    _count: true,
    orderBy: { _count: { action: 'desc' } },
  });

  if (tradeCounts.length > 0) {
    console.log('🎯 Action Summary:');
    for (const tc of tradeCounts) {
      console.log(`   ${tc.action}: ${tc._count}`);
    }
    console.log('');
  }

  // Recent trades
  const trades = await prisma.arbitrageTradeLog.findMany({
    where: { crypto, action: { not: 'HOLD' } },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  if (trades.length > 0) {
    console.log('📝 Recent Trades:');
    console.log('─'.repeat(110));
    console.log(
      'Time'.padEnd(20) +
      'Action'.padEnd(12) +
      'Side'.padEnd(6) +
      'Amount'.padEnd(10) +
      'Tokens'.padEnd(10) +
      'UP'.padEnd(8) +
      'DOWN'.padEnd(8) +
      'AvgTotal'.padEnd(10) +
      'Reason'
    );
    console.log('─'.repeat(110));

    for (const t of trades) {
      const time = t.timestamp.toLocaleTimeString();
      const side = t.side || '-';
      const amount = t.amount ? `$${Number(t.amount).toFixed(2)}` : '-';
      const tokens = t.tokens ? Number(t.tokens).toFixed(2) : '-';
      const up = `${(Number(t.upPrice) * 100).toFixed(1)}%`;
      const down = `${(Number(t.downPrice) * 100).toFixed(1)}%`;
      const avgTotal = t.avgTotal ? `${(Number(t.avgTotal) * 100).toFixed(1)}%` : '-';
      const reason = t.reason.length > 25 ? t.reason.slice(0, 25) + '...' : t.reason;

      console.log(
        time.padEnd(20) +
        t.action.padEnd(12) +
        side.padEnd(6) +
        amount.padEnd(10) +
        tokens.padEnd(10) +
        up.padEnd(8) +
        down.padEnd(8) +
        avgTotal.padEnd(10) +
        reason
      );
    }
    console.log('');
  }

  // Stats summary
  const allWindows = await prisma.arbitrageWindowStats.findMany({
    where: { crypto },
  });

  if (allWindows.length > 0) {
    const hedged = allWindows.filter((w) => w.status === 'HEDGED' || w.status === 'RESOLVED');
    const resolved = allWindows.filter((w) => w.status === 'RESOLVED');
    const emergency = allWindows.filter((w) => w.hedgeWasEmergency);
    const totalProfit = resolved.reduce((sum, w) => sum + Number(w.profitUsd || 0), 0);
    const avgProfit = resolved.length > 0 ? totalProfit / resolved.length : 0;

    console.log('📊 Overall Stats:');
    console.log(`   Total Windows: ${allWindows.length}`);
    console.log(`   Hedged: ${hedged.length}`);
    console.log(`   Resolved: ${resolved.length}`);
    console.log(`   Emergency Hedges: ${emergency.length}`);
    console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
    console.log(`   Avg Profit/Window: $${avgProfit.toFixed(2)}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error.message);
  prisma.$disconnect();
  process.exit(1);
});

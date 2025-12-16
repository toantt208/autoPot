/**
 * Analyze win rate when buying higher side at last N minutes
 * Usage: node scripts/analyze-last-minutes.cjs [minutes] [minPrice]
 * Example: node scripts/analyze-last-minutes.cjs 2 0.90
 */

const pkg = require('@prisma/client');
const { PrismaClient } = pkg;

const MINUTES = parseInt(process.argv[2]) || 2;
const MIN_PRICE = parseFloat(process.argv[3]) || 0;
const TIME_LEFT_SECONDS = MINUTES * 60;
const BET_AMOUNT = 10;

async function main() {
  const prisma = new PrismaClient();

  // Query: For each XRP window, get the first snapshot within last N minutes
  // and check if buying higher side would have won
  const trades = await prisma.$queryRaw`
    WITH last_snapshots AS (
      SELECT DISTINCT ON (ps.window_id)
        ps.window_id,
        ps.time_left,
        ps.up_price,
        ps.down_price,
        ps.higher_side,
        GREATEST(ps.up_price, ps.down_price) as higher_price,
        w.final_side,
        w.market_slug,
        w.created_at
      FROM stats_price_snapshots ps
      JOIN stats_windows w ON ps.window_id = w.id
      WHERE w.crypto = 'XRP'
        AND ps.time_left <= ${TIME_LEFT_SECONDS}
        AND ps.time_left > 0
        AND w.final_side IS NOT NULL
      ORDER BY ps.window_id, ps.time_left DESC
    )
    SELECT
      window_id,
      time_left,
      up_price,
      down_price,
      higher_side,
      higher_price,
      final_side,
      market_slug,
      created_at,
      CASE WHEN higher_side = final_side THEN true ELSE false END as won
    FROM last_snapshots
    WHERE higher_price >= ${MIN_PRICE}
    ORDER BY created_at DESC;
  `;

  if (trades.length === 0) {
    console.log('No trades found matching criteria');
    await prisma.$disconnect();
    return;
  }

  // Calculate stats
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;

  for (const trade of trades) {
    const hp = trade.higher_price;
    const entryPrice = typeof hp === 'object' && hp !== null ? parseFloat(hp.toString()) : parseFloat(hp);
    if (isNaN(entryPrice) || entryPrice <= 0 || entryPrice > 1) {
      continue; // Skip invalid entries
    }
    const shares = BET_AMOUNT / entryPrice;

    if (trade.won) {
      wins++;
      const payout = shares * 1;
      const profit = payout - BET_AMOUNT;
      totalProfit += profit;
    } else {
      losses++;
      totalProfit -= BET_AMOUNT;
    }
  }

  const totalTrades = wins + losses;
  const winRate = ((wins / totalTrades) * 100).toFixed(2);
  const avgEntryPrice = trades.reduce((sum, t) => {
    const hp = t.higher_price;
    return sum + (typeof hp === 'object' && hp !== null ? parseFloat(hp.toString()) : parseFloat(hp));
  }, 0) / totalTrades;

  console.log('\n========================================');
  console.log(`XRP Higher Side Analysis - Last ${MINUTES} minute(s)`);
  console.log(`Min Entry Price: ${MIN_PRICE > 0 ? (MIN_PRICE * 100).toFixed(0) + '%' : 'None'}`);
  console.log('========================================\n');

  console.log(`Total Trades:    ${totalTrades}`);
  console.log(`Wins:            ${wins}`);
  console.log(`Losses:          ${losses}`);
  console.log(`Win Rate:        ${winRate}%`);
  console.log(`Avg Entry Price: ${(avgEntryPrice * 100).toFixed(1)}%`);
  console.log(`Total Profit:    $${totalProfit.toFixed(2)}`);
  console.log(`ROI:             ${((totalProfit / (totalTrades * BET_AMOUNT)) * 100).toFixed(2)}%`);

  // Show losses breakdown by entry price
  if (losses > 0) {
    console.log('\n--- Losses by Entry Price ---');
    const lossBreakdown = {};
    for (const trade of trades) {
      if (!trade.won) {
        const hp = trade.higher_price;
        const price = ((typeof hp === 'object' && hp !== null ? parseFloat(hp.toString()) : parseFloat(hp)) * 100).toFixed(0) + '%';
        lossBreakdown[price] = (lossBreakdown[price] || 0) + 1;
      }
    }
    for (const [price, count] of Object.entries(lossBreakdown).sort((a, b) => b[0].localeCompare(a[0]))) {
      console.log(`  ${price}: ${count} loss(es)`);
    }
  }

  // Show recent trades
  console.log('\n--- Recent 10 Trades ---');
  const recent = trades.slice(0, 10);
  for (const t of recent) {
    const hp = t.higher_price;
    const entryPrice = ((typeof hp === 'object' && hp !== null ? parseFloat(hp.toString()) : parseFloat(hp)) * 100).toFixed(0);
    const status = t.won ? '✓ WIN' : '✗ LOSS';
    const date = new Date(t.created_at).toISOString().slice(0, 16).replace('T', ' ');
    console.log(`  ${date} | ${t.higher_side} @ ${entryPrice}% | ${status}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

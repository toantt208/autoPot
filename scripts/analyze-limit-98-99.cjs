/**
 * Analyze Limit 98-99 Strategy
 *
 * Calculates potential profit if you:
 * - Place limit buy at 98% for both UP and DOWN
 * - Sell at 99% when filled
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:7432/polymarket" node scripts/analyze-limit-98-99.cjs
 *   DATABASE_URL="..." node scripts/analyze-limit-98-99.cjs 2025-12-22
 *   DATABASE_URL="..." node scripts/analyze-limit-98-99.cjs 2025-12-20 2025-12-23
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BUY_PRICE = 0.98;
const SELL_PRICE = 0.99;
const BET_AMOUNT = parseFloat(process.env.BET_AMOUNT || '10');

// Profit calculations
const PROFIT_PER_WIN = BET_AMOUNT * (SELL_PRICE / BUY_PRICE - 1); // ~$0.102 for $10
const LOSS_PER_LOSE = BET_AMOUNT; // $10

async function analyze(startDate, endDate) {
  console.log('\n========================================');
  console.log('  LIMIT 98-99 STRATEGY ANALYSIS');
  console.log('========================================\n');
  console.log(`Date Range: ${startDate} to ${endDate}`);
  console.log(`Bet Amount: $${BET_AMOUNT}`);
  console.log(`Buy Price: ${BUY_PRICE * 100}%`);
  console.log(`Sell Price: ${SELL_PRICE * 100}%`);
  console.log(`Profit per Win: $${PROFIT_PER_WIN.toFixed(3)}`);
  console.log(`Loss per Lose: $${LOSS_PER_LOSE.toFixed(2)}`);
  console.log('');

  const query = `
    WITH windows_in_range AS (
      SELECT w.id, w.crypto, w.event_slug, w.start_time, w.final_side
      FROM stats_windows w
      WHERE w.start_time >= $1::timestamp AT TIME ZONE 'Asia/Bangkok'
        AND w.start_time < $2::timestamp AT TIME ZONE 'Asia/Bangkok'
    ),
    -- Find first time each side hit 98%
    up_98_hit AS (
      SELECT DISTINCT ON (s.window_id)
        s.window_id,
        s.timestamp as hit_time,
        s.time_left
      FROM stats_price_snapshots s
      JOIN windows_in_range w ON s.window_id = w.id
      WHERE s.up_price >= 0.98
      ORDER BY s.window_id, s.timestamp
    ),
    down_98_hit AS (
      SELECT DISTINCT ON (s.window_id)
        s.window_id,
        s.timestamp as hit_time,
        s.time_left
      FROM stats_price_snapshots s
      JOIN windows_in_range w ON s.window_id = w.id
      WHERE s.down_price >= 0.98
      ORDER BY s.window_id, s.timestamp
    ),
    -- Check if UP side reached 99% after hitting 98%
    up_99_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id, 1 as reached
      FROM stats_price_snapshots s
      JOIN up_98_hit u ON s.window_id = u.window_id
      WHERE s.up_price >= 0.99 AND s.timestamp >= u.hit_time
      ORDER BY s.window_id, s.timestamp
    ),
    -- Check if DOWN side reached 99% after hitting 98%
    down_99_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id, 1 as reached
      FROM stats_price_snapshots s
      JOIN down_98_hit d ON s.window_id = d.window_id
      WHERE s.down_price >= 0.99 AND s.timestamp >= d.hit_time
      ORDER BY s.window_id, s.timestamp
    ),
    -- Combine results
    results AS (
      SELECT
        w.id,
        w.crypto,
        w.event_slug,
        w.start_time,
        w.final_side,
        -- UP side analysis
        CASE WHEN u98.window_id IS NOT NULL THEN true ELSE false END as up_bought,
        CASE
          WHEN u99.window_id IS NOT NULL THEN 'SOLD_99'
          WHEN u98.window_id IS NOT NULL AND w.final_side = 'UP' THEN 'WIN_RESOLVED'
          WHEN u98.window_id IS NOT NULL AND w.final_side = 'DOWN' THEN 'LOSE'
          ELSE 'NOT_BOUGHT'
        END as up_result,
        -- DOWN side analysis
        CASE WHEN d98.window_id IS NOT NULL THEN true ELSE false END as down_bought,
        CASE
          WHEN d99.window_id IS NOT NULL THEN 'SOLD_99'
          WHEN d98.window_id IS NOT NULL AND w.final_side = 'DOWN' THEN 'WIN_RESOLVED'
          WHEN d98.window_id IS NOT NULL AND w.final_side = 'UP' THEN 'LOSE'
          ELSE 'NOT_BOUGHT'
        END as down_result
      FROM windows_in_range w
      LEFT JOIN up_98_hit u98 ON w.id = u98.window_id
      LEFT JOIN down_98_hit d98 ON w.id = d98.window_id
      LEFT JOIN up_99_hit u99 ON w.id = u99.window_id
      LEFT JOIN down_99_hit d99 ON w.id = d99.window_id
    )
    SELECT
      crypto,
      COUNT(*) as total_windows,
      -- UP side stats
      COUNT(*) FILTER (WHERE up_bought) as up_bought,
      COUNT(*) FILTER (WHERE up_result = 'SOLD_99') as up_sold_99,
      COUNT(*) FILTER (WHERE up_result = 'WIN_RESOLVED') as up_win_resolved,
      COUNT(*) FILTER (WHERE up_result = 'LOSE') as up_lose,
      -- DOWN side stats
      COUNT(*) FILTER (WHERE down_bought) as down_bought,
      COUNT(*) FILTER (WHERE down_result = 'SOLD_99') as down_sold_99,
      COUNT(*) FILTER (WHERE down_result = 'WIN_RESOLVED') as down_win_resolved,
      COUNT(*) FILTER (WHERE down_result = 'LOSE') as down_lose
    FROM results
    GROUP BY crypto
    ORDER BY crypto;
  `;

  const result = await pool.query(query, [startDate, endDate]);

  // Print per-crypto results
  console.log('┌─────────┬─────────┬──────────────────────────────────┬──────────────────────────────────┬───────────┐');
  console.log('│ Crypto  │ Windows │ UP Side                          │ DOWN Side                        │ Profit    │');
  console.log('│         │         │ Bought → Sold@99 / Win / Lose    │ Bought → Sold@99 / Win / Lose    │           │');
  console.log('├─────────┼─────────┼──────────────────────────────────┼──────────────────────────────────┼───────────┤');

  let totalProfit = 0;
  let totalWindows = 0;
  let totalUpBought = 0, totalUpSold = 0, totalUpWin = 0, totalUpLose = 0;
  let totalDownBought = 0, totalDownSold = 0, totalDownWin = 0, totalDownLose = 0;

  for (const row of result.rows) {
    const upProfit = (parseInt(row.up_sold_99) + parseInt(row.up_win_resolved)) * PROFIT_PER_WIN
                   - parseInt(row.up_lose) * LOSS_PER_LOSE;
    const downProfit = (parseInt(row.down_sold_99) + parseInt(row.down_win_resolved)) * PROFIT_PER_WIN
                     - parseInt(row.down_lose) * LOSS_PER_LOSE;
    const cryptoProfit = upProfit + downProfit;
    totalProfit += cryptoProfit;
    totalWindows += parseInt(row.total_windows);

    totalUpBought += parseInt(row.up_bought);
    totalUpSold += parseInt(row.up_sold_99);
    totalUpWin += parseInt(row.up_win_resolved);
    totalUpLose += parseInt(row.up_lose);

    totalDownBought += parseInt(row.down_bought);
    totalDownSold += parseInt(row.down_sold_99);
    totalDownWin += parseInt(row.down_win_resolved);
    totalDownLose += parseInt(row.down_lose);

    const upStr = `${row.up_bought} → ${row.up_sold_99} / ${row.up_win_resolved} / ${row.up_lose}`;
    const downStr = `${row.down_bought} → ${row.down_sold_99} / ${row.down_win_resolved} / ${row.down_lose}`;
    const profitStr = cryptoProfit >= 0 ? `+$${cryptoProfit.toFixed(2)}` : `-$${Math.abs(cryptoProfit).toFixed(2)}`;

    console.log(`│ ${row.crypto.padEnd(7)} │ ${String(row.total_windows).padStart(7)} │ ${upStr.padEnd(32)} │ ${downStr.padEnd(32)} │ ${profitStr.padStart(9)} │`);
  }

  console.log('├─────────┼─────────┼──────────────────────────────────┼──────────────────────────────────┼───────────┤');

  const totalUpStr = `${totalUpBought} → ${totalUpSold} / ${totalUpWin} / ${totalUpLose}`;
  const totalDownStr = `${totalDownBought} → ${totalDownSold} / ${totalDownWin} / ${totalDownLose}`;
  const totalProfitStr = totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`;

  console.log(`│ TOTAL   │ ${String(totalWindows).padStart(7)} │ ${totalUpStr.padEnd(32)} │ ${totalDownStr.padEnd(32)} │ ${totalProfitStr.padStart(9)} │`);
  console.log('└─────────┴─────────┴──────────────────────────────────┴──────────────────────────────────┴───────────┘');

  // Summary stats
  const totalTrades = totalUpBought + totalDownBought;
  const totalWins = totalUpSold + totalUpWin + totalDownSold + totalDownWin;
  const totalLosses = totalUpLose + totalDownLose;
  const winRate = totalTrades > 0 ? (totalWins / totalTrades * 100).toFixed(1) : 0;

  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`Total Windows: ${totalWindows}`);
  console.log(`Total Trades: ${totalTrades} (UP: ${totalUpBought}, DOWN: ${totalDownBought})`);
  console.log(`Wins: ${totalWins} (${winRate}%)`);
  console.log(`  - Sold at 99%: ${totalUpSold + totalDownSold}`);
  console.log(`  - Won at resolution: ${totalUpWin + totalDownWin}`);
  console.log(`Losses: ${totalLosses}`);
  console.log(`\nNet Profit: ${totalProfitStr}`);

  if (totalTrades > 0) {
    const avgProfitPerTrade = totalProfit / totalTrades;
    console.log(`Avg Profit per Trade: $${avgProfitPerTrade.toFixed(3)}`);
  }

  // Daily breakdown
  console.log('\n========================================');
  console.log('  DAILY BREAKDOWN');
  console.log('========================================');

  const dailyQuery = `
    WITH windows_in_range AS (
      SELECT w.id, w.crypto, w.start_time::date as trade_date, w.final_side
      FROM stats_windows w
      WHERE w.start_time >= $1::timestamp AT TIME ZONE 'Asia/Bangkok'
        AND w.start_time < $2::timestamp AT TIME ZONE 'Asia/Bangkok'
    ),
    up_98_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id, s.timestamp as hit_time
      FROM stats_price_snapshots s
      JOIN windows_in_range w ON s.window_id = w.id
      WHERE s.up_price >= 0.98
      ORDER BY s.window_id, s.timestamp
    ),
    down_98_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id, s.timestamp as hit_time
      FROM stats_price_snapshots s
      JOIN windows_in_range w ON s.window_id = w.id
      WHERE s.down_price >= 0.98
      ORDER BY s.window_id, s.timestamp
    ),
    up_99_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id
      FROM stats_price_snapshots s
      JOIN up_98_hit u ON s.window_id = u.window_id
      WHERE s.up_price >= 0.99 AND s.timestamp >= u.hit_time
      ORDER BY s.window_id, s.timestamp
    ),
    down_99_hit AS (
      SELECT DISTINCT ON (s.window_id) s.window_id
      FROM stats_price_snapshots s
      JOIN down_98_hit d ON s.window_id = d.window_id
      WHERE s.down_price >= 0.99 AND s.timestamp >= d.hit_time
      ORDER BY s.window_id, s.timestamp
    ),
    results AS (
      SELECT
        w.trade_date,
        CASE WHEN u98.window_id IS NOT NULL THEN 1 ELSE 0 END as up_bought,
        CASE WHEN u99.window_id IS NOT NULL THEN 1
             WHEN u98.window_id IS NOT NULL AND w.final_side = 'UP' THEN 1
             ELSE 0 END as up_win,
        CASE WHEN u98.window_id IS NOT NULL AND u99.window_id IS NULL AND w.final_side = 'DOWN' THEN 1 ELSE 0 END as up_lose,
        CASE WHEN d98.window_id IS NOT NULL THEN 1 ELSE 0 END as down_bought,
        CASE WHEN d99.window_id IS NOT NULL THEN 1
             WHEN d98.window_id IS NOT NULL AND w.final_side = 'DOWN' THEN 1
             ELSE 0 END as down_win,
        CASE WHEN d98.window_id IS NOT NULL AND d99.window_id IS NULL AND w.final_side = 'UP' THEN 1 ELSE 0 END as down_lose
      FROM windows_in_range w
      LEFT JOIN up_98_hit u98 ON w.id = u98.window_id
      LEFT JOIN down_98_hit d98 ON w.id = d98.window_id
      LEFT JOIN up_99_hit u99 ON w.id = u99.window_id
      LEFT JOIN down_99_hit d99 ON w.id = d99.window_id
    )
    SELECT
      trade_date,
      SUM(up_bought) + SUM(down_bought) as trades,
      SUM(up_win) + SUM(down_win) as wins,
      SUM(up_lose) + SUM(down_lose) as losses,
      ROUND(100.0 * (SUM(up_win) + SUM(down_win)) / NULLIF(SUM(up_bought) + SUM(down_bought), 0), 1) as win_rate
    FROM results
    GROUP BY trade_date
    ORDER BY trade_date;
  `;

  const dailyResult = await pool.query(dailyQuery, [startDate, endDate]);

  console.log('┌────────────┬────────┬──────┬────────┬──────────┬───────────┐');
  console.log('│ Date       │ Trades │ Wins │ Losses │ Win Rate │ Profit    │');
  console.log('├────────────┼────────┼──────┼────────┼──────────┼───────────┤');

  for (const row of dailyResult.rows) {
    const wins = parseInt(row.wins);
    const losses = parseInt(row.losses);
    const dayProfit = wins * PROFIT_PER_WIN - losses * LOSS_PER_LOSE;
    const profitStr = dayProfit >= 0 ? `+$${dayProfit.toFixed(2)}` : `-$${Math.abs(dayProfit).toFixed(2)}`;
    const dateStr = row.trade_date.toISOString().split('T')[0];

    console.log(`│ ${dateStr} │ ${String(row.trades).padStart(6)} │ ${String(row.wins).padStart(4)} │ ${String(row.losses).padStart(6)} │ ${String(row.win_rate || 0).padStart(6)}%  │ ${profitStr.padStart(9)} │`);
  }

  console.log('└────────────┴────────┴──────┴────────┴──────────┴───────────┘');

  await pool.end();
}

// Parse command line arguments
const args = process.argv.slice(2);
let startDate, endDate;

if (args.length === 0) {
  // Default: today
  const today = new Date();
  startDate = today.toISOString().split('T')[0];
  endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
} else if (args.length === 1) {
  // Single date
  startDate = args[0];
  const start = new Date(args[0]);
  endDate = new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
} else {
  // Date range
  startDate = args[0];
  endDate = args[1];
}

analyze(startDate, endDate).catch(console.error);

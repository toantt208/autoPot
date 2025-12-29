/**
 * Analyze arbitrage trader activity
 */

const data = require('/tmp/arb-trader.json');

// Group by market (using title)
const byMarket = {};

data.forEach(t => {
  const key = t.title || 'unknown';
  if (!byMarket[key]) {
    byMarket[key] = { up: [], down: [], title: key };
  }
  if (t.outcome === 'Up') {
    byMarket[key].up.push(t);
  } else {
    byMarket[key].down.push(t);
  }
});

// Analyze each market
console.log('='.repeat(100));
console.log('ARBITRAGE ANALYSIS - Trader 0x7f69983eb28245bba0d5083502a78744a8f66162');
console.log('='.repeat(100));

let totalProfit = 0;
let totalSpentAll = 0;
let marketsWithBothSides = 0;

Object.values(byMarket).forEach(m => {
  const upTotal = m.up.reduce((s, t) => s + t.usdcSize, 0);
  const upTokens = m.up.reduce((s, t) => s + t.size, 0);
  const upAvgPrice = upTokens > 0 ? upTotal / upTokens : 0;

  const downTotal = m.down.reduce((s, t) => s + t.usdcSize, 0);
  const downTokens = m.down.reduce((s, t) => s + t.size, 0);
  const downAvgPrice = downTokens > 0 ? downTotal / downTokens : 0;

  const totalSpent = upTotal + downTotal;
  const guaranteed = Math.min(upTokens, downTokens);
  const profit = guaranteed - totalSpent;

  totalSpentAll += totalSpent;
  totalProfit += profit;

  // Only show markets with both sides traded
  if (m.up.length > 0 && m.down.length > 0 && totalSpent > 5) {
    marketsWithBothSides++;
    const totalPricePct = upAvgPrice + downAvgPrice;

    console.log(`\nMarket: ${m.title.substring(0, 80)}`);
    console.log(`  UP:   ${m.up.length.toString().padStart(3)} trades | ${upTokens.toFixed(2).padStart(10)} tokens @ ${(upAvgPrice * 100).toFixed(2).padStart(6)}% | $${upTotal.toFixed(2).padStart(8)}`);
    console.log(`  DOWN: ${m.down.length.toString().padStart(3)} trades | ${downTokens.toFixed(2).padStart(10)} tokens @ ${(downAvgPrice * 100).toFixed(2).padStart(6)}% | $${downTotal.toFixed(2).padStart(8)}`);
    console.log(`  Total Price: ${(totalPricePct * 100).toFixed(2)}% | Spent: $${totalSpent.toFixed(2)} | Guaranteed: ${guaranteed.toFixed(2)} | Profit: $${profit.toFixed(2)}`);
  }
});

console.log('\n' + '='.repeat(100));
console.log('SUMMARY');
console.log('='.repeat(100));
console.log(`Markets with both sides: ${marketsWithBothSides}`);
console.log(`Total Spent: $${totalSpentAll.toFixed(2)}`);
console.log(`Total Profit: $${totalProfit.toFixed(2)}`);
console.log(`ROI: ${(totalProfit / totalSpentAll * 100).toFixed(2)}%`);

// Analyze timing pattern
console.log('\n' + '='.repeat(100));
console.log('TIMING ANALYSIS');
console.log('='.repeat(100));

// Group trades by second
const bySecond = {};
data.forEach(t => {
  const sec = t.timestamp;
  if (!bySecond[sec]) bySecond[sec] = [];
  bySecond[sec].push(t);
});

const tradeBursts = Object.entries(bySecond)
  .filter(([_, trades]) => trades.length >= 3)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

console.log('\nTop 10 Trade Bursts (multiple trades in same second):');
tradeBursts.forEach(([ts, trades]) => {
  const time = new Date(parseInt(ts) * 1000).toISOString();
  const upTrades = trades.filter(t => t.outcome === 'Up');
  const downTrades = trades.filter(t => t.outcome === 'Down');
  const upSpent = upTrades.reduce((s, t) => s + t.usdcSize, 0);
  const downSpent = downTrades.reduce((s, t) => s + t.usdcSize, 0);

  console.log(`  ${time}: ${trades.length} trades | UP: ${upTrades.length} ($${upSpent.toFixed(2)}) | DOWN: ${downTrades.length} ($${downSpent.toFixed(2)})`);
});

// Price analysis
console.log('\n' + '='.repeat(100));
console.log('PRICE DISTRIBUTION');
console.log('='.repeat(100));

const priceRanges = {
  '0-10%': 0,
  '10-20%': 0,
  '20-30%': 0,
  '30-40%': 0,
  '40-50%': 0,
  '50-60%': 0,
  '60-70%': 0,
  '70-80%': 0,
  '80-90%': 0,
  '90-100%': 0,
};

data.forEach(t => {
  const pct = t.price * 100;
  if (pct < 10) priceRanges['0-10%']++;
  else if (pct < 20) priceRanges['10-20%']++;
  else if (pct < 30) priceRanges['20-30%']++;
  else if (pct < 40) priceRanges['30-40%']++;
  else if (pct < 50) priceRanges['40-50%']++;
  else if (pct < 60) priceRanges['50-60%']++;
  else if (pct < 70) priceRanges['60-70%']++;
  else if (pct < 80) priceRanges['70-80%']++;
  else if (pct < 90) priceRanges['80-90%']++;
  else priceRanges['90-100%']++;
});

Object.entries(priceRanges).forEach(([range, count]) => {
  const bar = '█'.repeat(Math.floor(count / 10));
  console.log(`  ${range.padStart(8)}: ${count.toString().padStart(4)} ${bar}`);
});

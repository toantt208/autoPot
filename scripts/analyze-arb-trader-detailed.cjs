/**
 * Detailed analysis of arbitrage trader strategy
 * Understand why they're losing despite favorable pricing
 */

const data = require('/tmp/arb-trader.json');

// Focus on BTC 11:00-11:15 market (their biggest position)
const btcMarket = data.filter(t =>
  t.title && t.title.includes('11:00AM-11:15AM') && t.title.includes('Bitcoin')
);

console.log('='.repeat(100));
console.log('DETAILED ANALYSIS - BTC 11:00-11:15 Market');
console.log('='.repeat(100));

// Sort by timestamp
btcMarket.sort((a, b) => a.timestamp - b.timestamp);

// Track running state
let state = {
  upTokens: 0,
  upSpent: 0,
  downTokens: 0,
  downSpent: 0,
};

// Analyze trade patterns
console.log('\n=== TRADE TIMELINE ===');
console.log('Time      | Side | Amount    | Price  | UP Tkns | DOWN Tkns | Imbalance | Action');
console.log('-'.repeat(100));

let lastTimestamp = 0;
let burst = [];
let bursts = [];

btcMarket.forEach((t, i) => {
  const tokens = t.size;
  const price = t.price;
  const amount = t.usdcSize;

  if (t.outcome === 'Up') {
    state.upTokens += tokens;
    state.upSpent += amount;
  } else {
    state.downTokens += tokens;
    state.downSpent += amount;
  }

  const imbalance = state.upTokens - state.downTokens;
  const maxTokens = Math.max(state.upTokens, state.downTokens);
  const imbalancePct = maxTokens > 0 ? (imbalance / maxTokens * 100) : 0;

  // Group by timestamp for burst analysis
  if (t.timestamp === lastTimestamp) {
    burst.push(t);
  } else {
    if (burst.length > 0) bursts.push([...burst]);
    burst = [t];
    lastTimestamp = t.timestamp;
  }

  // Show first 20 and last 20 trades
  if (i < 20 || i >= btcMarket.length - 20) {
    const time = new Date(t.timestamp * 1000).toISOString().substr(11, 8);
    const side = t.outcome.padEnd(4);
    const amtStr = `$${amount.toFixed(2)}`.padStart(8);
    const priceStr = `${(price * 100).toFixed(1)}%`.padStart(6);
    const upStr = state.upTokens.toFixed(0).padStart(7);
    const downStr = state.downTokens.toFixed(0).padStart(9);
    const imbalStr = `${imbalancePct >= 0 ? '+' : ''}${imbalancePct.toFixed(1)}%`.padStart(9);

    // Analyze what they're doing
    let action = '';
    if (Math.abs(imbalancePct) > 50) {
      action = imbalance > 0 ? 'HEAVY UP' : 'HEAVY DOWN';
    } else if (Math.abs(imbalancePct) > 20) {
      action = imbalance > 0 ? 'UP BIAS' : 'DOWN BIAS';
    } else {
      action = 'BALANCED';
    }

    console.log(`${time} | ${side} | ${amtStr} | ${priceStr} | ${upStr} | ${downStr} | ${imbalStr} | ${action}`);
  } else if (i === 20) {
    console.log(`... ${btcMarket.length - 40} trades omitted ...`);
  }
});

if (burst.length > 0) bursts.push(burst);

// Final state analysis
console.log('\n=== FINAL STATE ===');
const totalSpent = state.upSpent + state.downSpent;
const guaranteed = Math.min(state.upTokens, state.downTokens);
const excess = Math.abs(state.upTokens - state.downTokens);
const excessSide = state.upTokens > state.downTokens ? 'UP' : 'DOWN';
const excessValue = state.upTokens > state.downTokens
  ? excess * (state.upSpent / state.upTokens)  // Avg UP price
  : excess * (state.downSpent / state.downTokens);  // Avg DOWN price

const avgUpPrice = state.upSpent / state.upTokens;
const avgDownPrice = state.downSpent / state.downTokens;
const totalPrice = avgUpPrice + avgDownPrice;

console.log(`UP:   ${state.upTokens.toFixed(2)} tokens @ ${(avgUpPrice * 100).toFixed(2)}% = $${state.upSpent.toFixed(2)}`);
console.log(`DOWN: ${state.downTokens.toFixed(2)} tokens @ ${(avgDownPrice * 100).toFixed(2)}% = $${state.downSpent.toFixed(2)}`);
console.log('');
console.log(`Total Price: ${(totalPrice * 100).toFixed(2)}%`);
console.log(`Total Spent: $${totalSpent.toFixed(2)}`);
console.log(`Guaranteed Tokens: ${guaranteed.toFixed(2)}`);
console.log(`Excess ${excessSide}: ${excess.toFixed(2)} tokens (~$${excessValue.toFixed(2)} at risk)`);
console.log('');

// Calculate expected outcomes
console.log('=== EXPECTED OUTCOMES ===');
const profitIfUp = state.upTokens - totalSpent;
const profitIfDown = state.downTokens - totalSpent;
const arbProfit = guaranteed - totalSpent;

console.log(`If UP wins:   Payout = ${state.upTokens.toFixed(2)} tokens → Profit = $${profitIfUp.toFixed(2)}`);
console.log(`If DOWN wins: Payout = ${state.downTokens.toFixed(2)} tokens → Profit = $${profitIfDown.toFixed(2)}`);
console.log(`Guaranteed:   Payout = ${guaranteed.toFixed(2)} tokens → Profit = $${arbProfit.toFixed(2)}`);
console.log('');

// The problem
console.log('=== THE PROBLEM ===');
console.log(`Imbalance: ${excess.toFixed(2)} excess ${excessSide} tokens`);
console.log(`If ${excessSide === 'UP' ? 'DOWN' : 'UP'} wins, they lose $${Math.abs(profitIfDown).toFixed(2)}`);
console.log('');

// What they should have done
console.log('=== WHAT THEY SHOULD HAVE DONE ===');
const optimalTokens = totalSpent / totalPrice;  // Equal tokens on both sides
const optimalProfit = optimalTokens - totalSpent;

console.log(`With $${totalSpent.toFixed(2)} at avg prices (${(totalPrice * 100).toFixed(2)}%):`);
console.log(`  Optimal: ${optimalTokens.toFixed(2)} tokens each side`);
console.log(`  Guaranteed Profit: $${optimalProfit.toFixed(2)} (${(optimalProfit / totalSpent * 100).toFixed(2)}%)`);
console.log('');
console.log(`Actual vs Optimal:`);
console.log(`  Actual guaranteed: ${guaranteed.toFixed(2)} tokens`);
console.log(`  Optimal guaranteed: ${optimalTokens.toFixed(2)} tokens`);
console.log(`  Missed profit: $${(optimalProfit - arbProfit).toFixed(2)}`);

// Burst analysis
console.log('\n=== BURST PATTERN ===');
console.log('Analyzing trade bursts (multiple trades in same second)...');

const largeBursts = bursts.filter(b => b.length >= 5).slice(0, 10);
console.log(`\nTop ${largeBursts.length} largest bursts:`);

largeBursts.forEach((b, i) => {
  const time = new Date(b[0].timestamp * 1000).toISOString().substr(11, 8);
  const upTrades = b.filter(t => t.outcome === 'Up');
  const downTrades = b.filter(t => t.outcome === 'Down');
  const upAmt = upTrades.reduce((s, t) => s + t.usdcSize, 0);
  const downAmt = downTrades.reduce((s, t) => s + t.usdcSize, 0);
  const upAvgPrice = upTrades.length > 0 ? upTrades.reduce((s, t) => s + t.price, 0) / upTrades.length : 0;
  const downAvgPrice = downTrades.length > 0 ? downTrades.reduce((s, t) => s + t.price, 0) / downTrades.length : 0;

  console.log(`  ${time}: ${b.length} trades`);
  console.log(`    UP:   ${upTrades.length} trades, $${upAmt.toFixed(2)} @ ${(upAvgPrice * 100).toFixed(1)}%`);
  console.log(`    DOWN: ${downTrades.length} trades, $${downAmt.toFixed(2)} @ ${(downAvgPrice * 100).toFixed(1)}%`);
});

// Strategy deduction
console.log('\n=== STRATEGY DEDUCTION ===');
console.log('Based on the analysis, this trader is:');
console.log('');
console.log('1. BUYING BOTH SIDES (attempting arbitrage)');
console.log('2. BUT NOT BALANCING properly - heavy UP bias');
console.log('3. RESULT: Not true arbitrage, more like directional betting with hedge');
console.log('');
console.log('The trader seems to be:');
console.log('- Buying DOWN when prices are low (30-35%)');
console.log('- Buying UP more aggressively (62% avg price)');
console.log('- Ending up with ~23% more UP tokens than DOWN');
console.log('');
console.log('This is NOT proper arbitrage. True arbitrage requires:');
console.log('- Equal tokens on both sides (or very close)');
console.log('- Profit = min(upTokens, downTokens) - totalSpent > 0');
console.log('');
console.log('Their mistake: Over-buying the higher-priced side (UP)');
console.log('Fix: Use weighted buying based on price ratio (like AVWA V2)');

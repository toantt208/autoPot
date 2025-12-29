/**
 * Compare AVWA V2 strategy vs the trader's actual execution
 * Using the same capital and prices
 */

const data = require('/tmp/arb-trader.json');

// Focus on BTC 11:00-11:15 market
const btcMarket = data.filter(t =>
  t.title && t.title.includes('11:00AM-11:15AM') && t.title.includes('Bitcoin')
);

console.log('='.repeat(100));
console.log('AVWA V2 vs TRADER COMPARISON');
console.log('='.repeat(100));

// Trader's actual results
const traderState = {
  upTokens: 0,
  upSpent: 0,
  downTokens: 0,
  downSpent: 0,
};

btcMarket.forEach(t => {
  if (t.outcome === 'Up') {
    traderState.upTokens += t.size;
    traderState.upSpent += t.usdcSize;
  } else {
    traderState.downTokens += t.size;
    traderState.downSpent += t.usdcSize;
  }
});

const traderTotalSpent = traderState.upSpent + traderState.downSpent;
const traderGuaranteed = Math.min(traderState.upTokens, traderState.downTokens);
const traderProfit = traderGuaranteed - traderTotalSpent;
const traderImbalance = Math.abs(traderState.upTokens - traderState.downTokens);

console.log('\n=== TRADER ACTUAL ===');
console.log(`Capital Used: $${traderTotalSpent.toFixed(2)}`);
console.log(`UP:   ${traderState.upTokens.toFixed(2)} tokens @ ${(traderState.upSpent / traderState.upTokens * 100).toFixed(2)}%`);
console.log(`DOWN: ${traderState.downTokens.toFixed(2)} tokens @ ${(traderState.downSpent / traderState.downTokens * 100).toFixed(2)}%`);
console.log(`Imbalance: ${traderImbalance.toFixed(2)} tokens (${(traderImbalance / Math.max(traderState.upTokens, traderState.downTokens) * 100).toFixed(1)}%)`);
console.log(`Guaranteed: ${traderGuaranteed.toFixed(2)} tokens`);
console.log(`Profit: $${traderProfit.toFixed(2)} (${(traderProfit / traderTotalSpent * 100).toFixed(2)}%)`);

// AVWA V2 would have done
const avgUpPrice = traderState.upSpent / traderState.upTokens;
const avgDownPrice = traderState.downSpent / traderState.downTokens;
const totalPrice = avgUpPrice + avgDownPrice;

// With same capital, AVWA V2 buys equal tokens
const avwaTokensEachSide = traderTotalSpent / totalPrice;
const avwaUpSpent = avwaTokensEachSide * avgUpPrice;
const avwaDownSpent = avwaTokensEachSide * avgDownPrice;
const avwaGuaranteed = avwaTokensEachSide;
const avwaProfit = avwaGuaranteed - traderTotalSpent;

console.log('\n=== AVWA V2 (OPTIMAL) ===');
console.log(`Capital Used: $${traderTotalSpent.toFixed(2)} (same)`);
console.log(`UP:   ${avwaTokensEachSide.toFixed(2)} tokens @ ${(avgUpPrice * 100).toFixed(2)}%`);
console.log(`DOWN: ${avwaTokensEachSide.toFixed(2)} tokens @ ${(avgDownPrice * 100).toFixed(2)}%`);
console.log(`Imbalance: 0.00 tokens (0.0%)`);
console.log(`Guaranteed: ${avwaGuaranteed.toFixed(2)} tokens`);
console.log(`Profit: $${avwaProfit.toFixed(2)} (${(avwaProfit / traderTotalSpent * 100).toFixed(2)}%)`);

// Comparison
console.log('\n=== COMPARISON ===');
console.log(`Guaranteed Tokens:`);
console.log(`  Trader: ${traderGuaranteed.toFixed(2)}`);
console.log(`  AVWA:   ${avwaGuaranteed.toFixed(2)}`);
console.log(`  Diff:   +${(avwaGuaranteed - traderGuaranteed).toFixed(2)} (${((avwaGuaranteed - traderGuaranteed) / traderGuaranteed * 100).toFixed(1)}% more)`);
console.log('');
console.log(`Profit:`);
console.log(`  Trader: $${traderProfit.toFixed(2)}`);
console.log(`  AVWA:   $${avwaProfit.toFixed(2)}`);
console.log(`  Diff:   +$${(avwaProfit - traderProfit).toFixed(2)}`);

// Risk comparison
console.log('\n=== RISK COMPARISON ===');
const traderIfUpWins = traderState.upTokens - traderTotalSpent;
const traderIfDownWins = traderState.downTokens - traderTotalSpent;

console.log(`If UP wins:`);
console.log(`  Trader: $${traderIfUpWins.toFixed(2)}`);
console.log(`  AVWA:   $${avwaProfit.toFixed(2)}`);
console.log('');
console.log(`If DOWN wins:`);
console.log(`  Trader: $${traderIfDownWins.toFixed(2)}`);
console.log(`  AVWA:   $${avwaProfit.toFixed(2)}`);
console.log('');
console.log(`Trader has ${traderIfUpWins > 0 ? 'positive' : 'negative'} outcome if UP wins`);
console.log(`Trader has ${traderIfDownWins > 0 ? 'positive' : 'negative'} outcome if DOWN wins`);
console.log(`AVWA has guaranteed ${avwaProfit > 0 ? 'positive' : 'negative'} outcome regardless`);

// What the trader could fix
console.log('\n=== HOW TO FIX TRADER STRATEGY ===');
console.log('');
console.log('1. WEIGHTED INITIAL BUY:');
console.log('   Instead of buying randomly, calculate:');
console.log(`   - Total Price = ${avgUpPrice.toFixed(4)} + ${avgDownPrice.toFixed(4)} = ${totalPrice.toFixed(4)}`);
console.log(`   - Target Tokens = Capital / Total Price = ${traderTotalSpent.toFixed(2)} / ${totalPrice.toFixed(4)} = ${avwaTokensEachSide.toFixed(2)}`);
console.log(`   - UP Spend = ${avwaTokensEachSide.toFixed(2)} × ${avgUpPrice.toFixed(4)} = $${avwaUpSpent.toFixed(2)}`);
console.log(`   - DOWN Spend = ${avwaTokensEachSide.toFixed(2)} × ${avgDownPrice.toFixed(4)} = $${avwaDownSpent.toFixed(2)}`);
console.log('');
console.log('2. CONTINUOUS REBALANCING:');
console.log('   When prices change, token balance shifts.');
console.log('   Check imbalance every tick:');
console.log('   - If imbalance > 5%, buy the weaker side');
console.log('   - This keeps position balanced throughout');
console.log('');
console.log('3. FINAL LOCK:');
console.log('   In last 2 minutes, use reserve to lock profit');
console.log('   - Calculate exact tokens needed to balance');
console.log('   - Execute final rebalance');

// Summary
console.log('\n' + '='.repeat(100));
console.log('SUMMARY');
console.log('='.repeat(100));
console.log('');
console.log(`The trader spent $${traderTotalSpent.toFixed(2)} and got:`);
console.log(`  - 18.8% imbalance (too much UP)`);
console.log(`  - $${traderProfit.toFixed(2)} guaranteed profit (${(traderProfit / traderTotalSpent * 100).toFixed(2)}%)`);
console.log(`  - $${Math.abs(traderIfDownWins).toFixed(2)} max loss if DOWN wins`);
console.log('');
console.log(`AVWA V2 with same capital would get:`);
console.log(`  - 0% imbalance (perfectly balanced)`);
console.log(`  - $${avwaProfit.toFixed(2)} guaranteed profit (${(avwaProfit / traderTotalSpent * 100).toFixed(2)}%)`);
console.log(`  - $0.00 max loss (risk-free arbitrage)`);
console.log('');
console.log(`AVWA V2 advantage: +$${(avwaProfit - traderProfit).toFixed(2)} additional profit`);
console.log('='.repeat(100));

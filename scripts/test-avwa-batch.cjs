/**
 * AVWA V2 Strategy Batch Backtester
 *
 * Tests AVWA V2 strategy across multiple market windows and generates summary stats.
 *
 * V2 Key Changes:
 *   - INITIAL: Buy BOTH sides weighted by price (equal tokens)
 *   - DCA: Rebalance imbalance (buy weaker side)
 *   - RESERVE: Emergency/final lock (renamed from SNIPER)
 *   - Capital: 40/40/20 allocation
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:7432/polymarket" node scripts/test-avwa-batch.cjs [limit]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// AVWA V2 Configuration
// ============================================
const CONFIG = {
  totalCapital: 100,
  initialPoolPct: 0.40,     // V2: 40% = $40 - buy BOTH sides
  dcaPoolPct: 0.40,         // V2: 40% = $40 - rebalance imbalance
  reservePoolPct: 0.20,     // V2: 20% = $20 - emergency/final lock

  // V2: Entry conditions
  entryMin: 0.05,           // Min probability to enter (5%)
  entryMax: 0.80,           // Max probability to enter (80%)
  maxTotalPrice: 1.02,      // Max totalPrice to consider entry (with limit order improvement)

  // Limit order simulation (we get better fills than market price)
  limitOrderImprovement: 0.05, // 5% better than market (split between both sides)

  // V2: Rebalance triggers
  imbalanceThreshold: 0.05, // 5% imbalance triggers rebalance
  dcaAmount: 200,           // $200 per rebalance

  // Reserve trigger
  reserveWindowSeconds: 120, // Last 2 minutes

  // Mock buy simulation (limit order execution - no slippage)
  mockBuyEnabled: true,
  chunkMinSize: 10,         // Min $10 per chunk
  chunkMaxSize: 40,         // Max $40 per chunk
  baseSlippagePct: 0.0,     // No slippage for limit orders
  sizeSlippageFactor: 0.0,  // No size-based slippage
  priceImpactPct: 0.0,      // No price impact (limit orders don't move market)
};

const INITIAL_POOL = CONFIG.totalCapital * CONFIG.initialPoolPct;
const DCA_POOL = CONFIG.totalCapital * CONFIG.dcaPoolPct;
const RESERVE_POOL = CONFIG.totalCapital * CONFIG.reservePoolPct;

// ============================================
// Mock Buy Function (Realistic Order Execution)
// ============================================

/**
 * Get random chunk size between min and max
 */
function getRandomChunkSize() {
  return CONFIG.chunkMinSize + Math.random() * (CONFIG.chunkMaxSize - CONFIG.chunkMinSize);
}

/**
 * Calculate slippage for a chunk based on size and cumulative volume
 */
function calculateSlippage(chunkAmount, cumulativeSpent) {
  const baseSlip = CONFIG.baseSlippagePct;
  const sizeSlip = (cumulativeSpent / 100) * CONFIG.sizeSlippageFactor;
  const variance = 0.8 + Math.random() * 0.4;
  return (baseSlip + sizeSlip) * variance;
}

/**
 * Mock buy function for batch testing
 * Returns { tokens, spent, avgPrice, slippage, chunks }
 */
function mockBuy(amount, basePrice) {
  if (!CONFIG.mockBuyEnabled || amount <= CONFIG.chunkMinSize) {
    // Small orders: simple execution with base slippage
    const slippage = CONFIG.baseSlippagePct * (0.8 + Math.random() * 0.4);
    const executionPrice = basePrice * (1 + slippage);
    return {
      tokens: amount / executionPrice,
      spent: amount,
      avgPrice: executionPrice,
      slippage,
      chunks: 1,
    };
  }

  let remainingAmount = amount;
  let totalTokens = 0;
  let totalSpent = 0;
  let currentPrice = basePrice;
  let chunkNum = 0;

  while (remainingAmount > 0) {
    chunkNum++;

    // Random chunk size
    const chunkSize = remainingAmount <= CONFIG.chunkMaxSize
      ? remainingAmount
      : Math.min(getRandomChunkSize(), remainingAmount);

    // Calculate slippage for this chunk
    const slippage = calculateSlippage(chunkSize, totalSpent);
    const executionPrice = currentPrice * (1 + slippage);

    // Calculate tokens received
    const chunkTokens = chunkSize / executionPrice;

    totalTokens += chunkTokens;
    totalSpent += chunkSize;
    remainingAmount -= chunkSize;

    // Price impact for next chunk
    currentPrice = currentPrice * (1 + CONFIG.priceImpactPct);
  }

  const avgPrice = totalSpent / totalTokens;
  const totalSlippage = (avgPrice - basePrice) / basePrice;

  return {
    tokens: totalTokens,
    spent: totalSpent,
    avgPrice,
    slippage: totalSlippage,
    chunks: chunkNum,
  };
}

function simulateWindow(priceData, windowStartTs) {
  const windowEndTs = windowStartTs + 15 * 60;

  let state = {
    phase: 'WAITING',
    upTokens: 0,
    upSpent: 0,
    downTokens: 0,
    downSpent: 0,
    dcaLevel: 0,
    initialPoolRemaining: INITIAL_POOL,
    dcaPoolRemaining: DCA_POOL,
    reservePoolRemaining: RESERVE_POOL,
    arbitrageLocked: false,
    trades: [],
    totalChunks: 0,
    totalSlippage: 0,
  };

  function executeBuy(side, amount, price, pool) {
    // Use mock buy with chunking and slippage
    const result = mockBuy(amount, price);

    if (side === 'UP') {
      state.upTokens += result.tokens;
      state.upSpent += result.spent;
    } else {
      state.downTokens += result.tokens;
      state.downSpent += result.spent;
    }

    state.trades.push({
      pool,
      side,
      amount: result.spent,
      tokens: result.tokens,
      price: result.avgPrice,
      chunks: result.chunks,
      slippage: result.slippage,
    });

    state.totalChunks += result.chunks;
    state.totalSlippage += result.slippage * result.spent;
  }

  function getImbalance() {
    const imbalance = state.upTokens - state.downTokens;
    const maxTokens = Math.max(state.upTokens, state.downTokens);
    const imbalancePct = maxTokens > 0 ? Math.abs(imbalance) / maxTokens : 0;
    return { imbalance, imbalancePct };
  }

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;

    if (state.phase === 'LOCKED' || state.phase === 'RESOLVED') continue;

    // WAITING - V2: Enter when higher price is in range AND totalPrice < max
    if (state.phase === 'WAITING') {
      const higherPrice = Math.max(upPrice, downPrice);
      const totalPrice = upPrice + downPrice;
      if (higherPrice >= CONFIG.entryMin &&
          higherPrice <= CONFIG.entryMax &&
          totalPrice <= CONFIG.maxTotalPrice) {
        state.phase = 'INITIAL';
      }
      continue;
    }

    // INITIAL - V2: Buy BOTH sides weighted by price ratio
    if (state.phase === 'INITIAL') {
      const higherPrice = Math.max(upPrice, downPrice);
      const marketTotalPrice = upPrice + downPrice;
      if (higherPrice < CONFIG.entryMin || higherPrice > CONFIG.entryMax || marketTotalPrice > CONFIG.maxTotalPrice) {
        state.phase = 'WAITING';
        continue;
      }

      // Apply limit order improvement (we get better fills than market)
      const improvementPerSide = CONFIG.limitOrderImprovement / 2;
      const effectiveUpPrice = upPrice * (1 - improvementPerSide);
      const effectiveDownPrice = downPrice * (1 - improvementPerSide);
      const effectiveTotalPrice = effectiveUpPrice + effectiveDownPrice;

      // V2: Calculate weighted buys using effective prices
      const tokensTarget = INITIAL_POOL / effectiveTotalPrice;
      const upSpendAmount = tokensTarget * effectiveUpPrice;
      const downSpendAmount = tokensTarget * effectiveDownPrice;

      executeBuy('UP', upSpendAmount, effectiveUpPrice, 'INITIAL');
      executeBuy('DOWN', downSpendAmount, effectiveDownPrice, 'INITIAL');
      state.initialPoolRemaining = 0;
      state.phase = 'DCA';
      continue;
    }

    // DCA - V2: Rebalance imbalance
    if (state.phase === 'DCA') {
      const { imbalance, imbalancePct } = getImbalance();

      if (imbalancePct >= CONFIG.imbalanceThreshold && state.dcaPoolRemaining > 0) {
        const weakerSide = imbalance > 0 ? 'DOWN' : 'UP';
        const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;
        const tokensNeeded = Math.abs(imbalance);
        const costToBalance = tokensNeeded * weakerPrice;
        const dcaAmount = Math.min(CONFIG.dcaAmount, costToBalance, state.dcaPoolRemaining);

        if (dcaAmount >= 1) {
          executeBuy(weakerSide, dcaAmount, weakerPrice, 'DCA');
          state.dcaPoolRemaining -= dcaAmount;
          state.dcaLevel += 1;
        }
      }

      if (timeLeft <= CONFIG.reserveWindowSeconds) {
        state.phase = 'RESERVE';
      }
      continue;
    }

    // RESERVE - V2: Final lock
    if (state.phase === 'RESERVE') {
      const { imbalance, imbalancePct } = getImbalance();

      if (state.reservePoolRemaining > 0 && imbalancePct >= CONFIG.imbalanceThreshold) {
        const weakerSide = imbalance > 0 ? 'DOWN' : 'UP';
        const weakerPrice = weakerSide === 'UP' ? upPrice : downPrice;
        const tokensNeeded = Math.abs(imbalance);
        const costToBalance = tokensNeeded * weakerPrice;
        const reserveAmount = Math.min(costToBalance, state.reservePoolRemaining);

        if (reserveAmount >= 1) {
          executeBuy(weakerSide, reserveAmount, weakerPrice, 'RESERVE');
          state.reservePoolRemaining -= reserveAmount;
        }
      }

      if (timeLeft <= 30 || imbalancePct < CONFIG.imbalanceThreshold) {
        const guaranteed = Math.min(state.upTokens, state.downTokens);
        const totalSpent = state.upSpent + state.downSpent;
        state.arbitrageLocked = guaranteed > totalSpent;
        state.phase = 'LOCKED';
      }
    }
  }

  // Calculate results
  const totalSpent = state.upSpent + state.downSpent;
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const expectedProfit = guaranteed - totalSpent;

  const finalUpPrice = Number(priceData[priceData.length - 1].upPrice);
  const finalDownPrice = Number(priceData[priceData.length - 1].downPrice);
  const winner = finalUpPrice > finalDownPrice ? 'UP' : 'DOWN';

  // V2: Actual payout depends on winner
  const actualPayout = winner === 'UP' ? state.upTokens : state.downTokens;
  const actualProfit = actualPayout - totalSpent;

  const { imbalancePct } = getImbalance();

  // Calculate average slippage
  const avgSlippage = totalSpent > 0 ? state.totalSlippage / totalSpent : 0;

  return {
    phase: state.phase,
    upTokens: state.upTokens,
    upSpent: state.upSpent,
    downTokens: state.downTokens,
    downSpent: state.downSpent,
    dcaLevel: state.dcaLevel,
    totalSpent,
    guaranteed,
    expectedProfit,
    arbitrageLocked: state.arbitrageLocked,
    winner,
    actualPayout,
    actualProfit,
    trades: state.trades.length,
    enteredTrade: totalSpent > 0,
    imbalancePct,
    totalChunks: state.totalChunks,
    avgSlippage,
  };
}

async function runBatchTest(limit = 20) {
  console.log('='.repeat(100));
  console.log('AVWA V2 BATCH BACKTEST');
  console.log('='.repeat(100));
  console.log(`Capital: $${CONFIG.totalCapital}`);
  console.log(`  Initial: $${INITIAL_POOL} (${CONFIG.initialPoolPct * 100}%) - Buy BOTH sides`);
  console.log(`  DCA: $${DCA_POOL} (${CONFIG.dcaPoolPct * 100}%) - Rebalance imbalance`);
  console.log(`  Reserve: $${RESERVE_POOL} (${CONFIG.reservePoolPct * 100}%) - Emergency/final lock`);
  console.log(`Entry: ${CONFIG.entryMin * 100}% < higherPrice < ${CONFIG.entryMax * 100}%`);
  console.log(`Rebalance: ${CONFIG.imbalanceThreshold * 100}% imbalance triggers $${CONFIG.dcaAmount} DCA`);
  console.log(`Mock Buy: $${CONFIG.chunkMinSize}-$${CONFIG.chunkMaxSize} chunks, ${CONFIG.baseSlippagePct * 100}% base slippage, ${CONFIG.priceImpactPct * 100}% price impact/chunk`);
  console.log('='.repeat(100));

  // Get unique market slugs
  const markets = await prisma.$queryRaw`
    SELECT DISTINCT market_slug
    FROM arbitrage_logs
    WHERE crypto = 'btc' AND market_slug LIKE 'btc-updown-15m-%'
    GROUP BY market_slug
    HAVING COUNT(*) > 100
    ORDER BY market_slug DESC
    LIMIT ${limit}
  `;

  console.log(`Testing ${markets.length} market windows...\n`);

  const results = [];

  for (const market of markets) {
    const slug = market.market_slug;
    const slugParts = slug.split('-');
    const windowStartTs = parseInt(slugParts[slugParts.length - 1]);

    const priceData = await prisma.arbitrageLog.findMany({
      where: { marketSlug: slug },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, upPrice: true, downPrice: true },
    });

    if (priceData.length < 50) continue;

    const result = simulateWindow(priceData, windowStartTs);
    result.slug = slug;
    result.snapshots = priceData.length;
    results.push(result);

    const status = result.arbitrageLocked ? 'LOCKED' : result.enteredTrade ? 'PARTIAL' : 'SKIP';
    const profit = result.actualProfit >= 0 ? `+$${result.actualProfit.toFixed(2)}` : `-$${Math.abs(result.actualProfit).toFixed(2)}`;
    const imbal = (result.imbalancePct * 100).toFixed(1) + '%';

    const slip = (result.avgSlippage * 100).toFixed(2) + '%';
    console.log(
      `${slug} | ${status.padEnd(7)} | Winner: ${result.winner} | ` +
      `Imbal: ${imbal.padStart(5)} | Spent: $${result.totalSpent.toFixed(0).padStart(4)} | ${profit.padStart(10)} | ` +
      `${result.totalChunks} chunks | Slip: ${slip.padStart(6)} | DCA: ${result.dcaLevel}`
    );
  }

  // Summary
  console.log('\n' + '='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));

  const traded = results.filter(r => r.enteredTrade);
  const locked = results.filter(r => r.arbitrageLocked);
  const wins = traded.filter(r => r.actualProfit > 0);
  const losses = traded.filter(r => r.actualProfit <= 0);

  const totalProfit = traded.reduce((sum, r) => sum + r.actualProfit, 0);
  const totalSpent = traded.reduce((sum, r) => sum + r.totalSpent, 0);
  const avgProfit = traded.length > 0 ? totalProfit / traded.length : 0;

  console.log(`\nMarket Windows: ${results.length}`);
  console.log(`  Traded: ${traded.length} (${(traded.length / results.length * 100).toFixed(1)}%)`);
  console.log(`  Skipped: ${results.length - traded.length}`);
  console.log('');
  console.log(`Arbitrage Locks: ${locked.length} (${(locked.length / traded.length * 100).toFixed(1)}% of trades)`);
  console.log('');
  console.log(`Win/Loss:`);
  console.log(`  Wins: ${wins.length} (${(wins.length / traded.length * 100).toFixed(1)}%)`);
  console.log(`  Losses: ${losses.length} (${(losses.length / traded.length * 100).toFixed(1)}%)`);
  console.log('');
  console.log(`Financials:`);
  console.log(`  Total Spent: $${totalSpent.toFixed(2)}`);
  console.log(`  Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`  Avg Profit/Trade: $${avgProfit.toFixed(2)}`);
  console.log(`  ROI: ${((totalProfit / totalSpent) * 100).toFixed(2)}%`);

  // Best and Worst trades
  if (traded.length > 0) {
    const best = traded.reduce((a, b) => a.actualProfit > b.actualProfit ? a : b);
    const worst = traded.reduce((a, b) => a.actualProfit < b.actualProfit ? a : b);

    console.log('');
    console.log(`Best Trade: ${best.slug}`);
    console.log(`  Profit: $${best.actualProfit.toFixed(2)} (${(best.actualProfit / best.totalSpent * 100).toFixed(2)}%)`);
    console.log(`  Locked: ${best.arbitrageLocked} | Imbalance: ${(best.imbalancePct * 100).toFixed(2)}%`);
    console.log('');
    console.log(`Worst Trade: ${worst.slug}`);
    console.log(`  Profit: $${worst.actualProfit.toFixed(2)} (${(worst.actualProfit / worst.totalSpent * 100).toFixed(2)}%)`);
    console.log(`  Locked: ${worst.arbitrageLocked} | Imbalance: ${(worst.imbalancePct * 100).toFixed(2)}%`);
  }

  // V2 Analysis
  console.log('\nV2 Analysis:');
  const avgImbalance = traded.reduce((sum, r) => sum + r.imbalancePct, 0) / traded.length;
  const maxLoss = traded.length > 0 ? Math.min(...traded.map(r => r.actualProfit)) : 0;
  console.log(`  Average Imbalance: ${(avgImbalance * 100).toFixed(2)}%`);
  console.log(`  Max Single Loss: $${Math.abs(maxLoss).toFixed(2)}`);
  console.log(`  Max Loss %: ${(maxLoss / CONFIG.totalCapital * 100).toFixed(2)}%`);

  // Mock Buy Analysis
  console.log('\nMock Buy Analysis:');
  const totalChunks = traded.reduce((sum, r) => sum + r.totalChunks, 0);
  const avgChunksPerTrade = traded.length > 0 ? totalChunks / traded.length : 0;
  const avgSlippageAll = traded.reduce((sum, r) => sum + r.avgSlippage, 0) / traded.length;
  const slippageCost = traded.reduce((sum, r) => sum + (r.avgSlippage * r.totalSpent), 0);
  console.log(`  Total Chunks Executed: ${totalChunks}`);
  console.log(`  Avg Chunks/Trade: ${avgChunksPerTrade.toFixed(1)}`);
  console.log(`  Avg Slippage: ${(avgSlippageAll * 100).toFixed(3)}%`);
  console.log(`  Total Slippage Cost: $${slippageCost.toFixed(2)}`);

  // By DCA level
  console.log('\nBy DCA/Rebalance Level:');
  for (let i = 0; i <= 10; i++) {
    const level = traded.filter(r => r.dcaLevel === i);
    if (level.length > 0) {
      const levelProfit = level.reduce((sum, r) => sum + r.actualProfit, 0);
      console.log(`  Level ${i}: ${level.length} trades, Profit: $${levelProfit.toFixed(2)}`);
    }
  }

  console.log('='.repeat(100));
}

const limit = parseInt(process.argv[2]) || 20;
runBatchTest(limit)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

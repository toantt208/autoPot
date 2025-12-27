/**
 * Test script for shouldBuy() function - Arbitrage First Strategy
 *
 * Usage: DATABASE_URL="postgresql://postgres:postgres@localhost:7432/polymarket" node scripts/test-should-buy.cjs [market-slug]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Config
const DEFAULT_BUDGET = 1000;
const TARGET_PROFIT_RATIO = 0.02; // 2% of budget as target profit
const ENTRY_UP = 10;   // Fixed entry: $10 for UP
const ENTRY_DOWN = 5;  // Fixed entry: $5 for DOWN

/**
 * Core shouldBuy function - Arbitrage First Strategy
 *
 * @param upSpent Tổng vốn đã ném vào UP
 * @param upShares Tổng số shares UP đang nắm giữ
 * @param downSpent Tổng vốn đã ném vào DOWN
 * @param downShares Tổng số shares DOWN đang nắm giữ
 * @param upPrice Giá UP hiện tại (0 < upPrice < 1)
 * @param downPrice Giá DOWN hiện tại (0 < downPrice < 1)
 * @param targetProfit Lợi nhuận mục tiêu ($)
 * @param remainingBudget Ngân sách còn lại ($)
 */
function shouldBuy(upSpent, upShares, downSpent, downShares, upPrice, downPrice, targetProfit, remainingBudget) {
  const currentTotalSpent = upSpent + downSpent;

  // --- 1. KIỂM TRA CƠ HỘI ARBITRAGE (CHỐT LỜI CHẮC CHẮN) ---
  // Giải hệ phương trình để tìm x (buyUp) sao cho:
  // Profit_UP = Profit_DOWN
  // upShares + x/upPrice - (currentTotalSpent + x) = downShares - (currentTotalSpent + x)
  // => x = (downShares - upShares) * upPrice

  let x_arb = (downShares - upShares) * upPrice;
  let y_arb = (upShares - downShares) * downPrice;

  // Only consider arbitrage if buy amount >= $1 (avoid floating point issues)
  if (x_arb >= 1) {
    // Cần mua thêm UP để cân bằng với lượng DownShares đang cao
    const totalCapital = currentTotalSpent + x_arb;
    const profit = downShares - totalCapital;
    if (profit > 0) {
      return {
        buyUp: parseFloat(x_arb.toFixed(2)),
        buyDown: 0,
        status: "ARBITRAGE_UP",
        expectedProfit: parseFloat(profit.toFixed(2))
      };
    }
  } else if (y_arb >= 1) {
    // Cần mua thêm DOWN để cân bằng với lượng UpShares đang cao
    const totalCapital = currentTotalSpent + y_arb;
    const profit = upShares - totalCapital;
    if (profit > 0) {
      return {
        buyUp: 0,
        buyDown: parseFloat(y_arb.toFixed(2)),
        status: "ARBITRAGE_DOWN",
        expectedProfit: parseFloat(profit.toFixed(2))
      };
    }
  }

  // --- 2. CHIẾN THUẬT DCA: Duy trì targetProfit trên side có giá cao hơn ---
  // Chỉ mua side có giá cao (likely winner), không mua cả hai
  // Formula: X = gap * price / (1 - price)
  // Where gap = totalSpent + targetProfit - currentShares

  if (upPrice > downPrice) {
    // UP more likely to win - maintain targetProfit on UP side
    const gap = currentTotalSpent + targetProfit - upShares;
    if (gap <= 0) {
      return { buyUp: 0, buyDown: 0, status: "HOLD_UP", expectedProfit: -gap };
    }
    let buyMoreUp = gap * upPrice / (1 - upPrice);
    // Respect remaining budget
    buyMoreUp = Math.min(buyMoreUp, remainingBudget);
    return {
      buyUp: parseFloat(buyMoreUp.toFixed(2)),
      buyDown: 0,
      status: "DCA_UP",
      expectedProfit: targetProfit
    };
  } else {
    // DOWN more likely to win - maintain targetProfit on DOWN side
    const gap = currentTotalSpent + targetProfit - downShares;
    if (gap <= 0) {
      return { buyUp: 0, buyDown: 0, status: "HOLD_DOWN", expectedProfit: -gap };
    }
    let buyMoreDown = gap * downPrice / (1 - downPrice);
    // Respect remaining budget
    buyMoreDown = Math.min(buyMoreDown, remainingBudget);
    return {
      buyUp: 0,
      buyDown: parseFloat(buyMoreDown.toFixed(2)),
      status: "DCA_DOWN",
      expectedProfit: targetProfit
    };
  }
}

function getTimeLeft(timestamp, marketSlug) {
  const parts = marketSlug.split('-');
  const windowStart = parseInt(parts[parts.length - 1]);
  const windowEnd = windowStart + 15 * 60;
  const now = Math.floor(new Date(timestamp).getTime() / 1000);
  return Math.max(0, windowEnd - now);
}

function simulate(prices, marketSlug, maxBudget) {
  const targetProfit = maxBudget * TARGET_PROFIT_RATIO;

  console.log('\n');
  console.log('┌──────┬───────┬───────┬──────────────────────────────┬─────────┬─────────┬───────────┬───────────┬───────────┬────────────┬────────────┐');
  console.log('│ Tick │  UP%  │ DOWN% │           Action             │  AvgUP  │ AvgDOWN │  SharesUP │SharesDOWN │   Spent   │  ProfitUP  │ ProfitDOWN │');
  console.log('├──────┼───────┼───────┼──────────────────────────────┼─────────┼─────────┼───────────┼───────────┼───────────┼────────────┼────────────┤');

  const state = { upShares: 0, upSpent: 0, downShares: 0, downSpent: 0 };
  let lockedProfit = null;

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];
    const upPrice = Number(p.upPrice);
    const downPrice = Number(p.downPrice);
    const totalSpent = state.upSpent + state.downSpent;
    const remainingBudget = maxBudget - totalSpent;

    // Check max spend
    if (remainingBudget <= 0) {
      console.log('├──────┴───────┴───────┴──────────────────────────────┴─────────┴─────────┴───────────┴───────────┴───────────┴────────────┴────────────┤');
      console.log(`│                                              >>> MAX BUDGET $${maxBudget} REACHED <<<                                                    │`);
      break;
    }

    // Check if profit locked AND meets target
    if (lockedProfit !== null && lockedProfit >= targetProfit) {
      console.log('├──────┴───────┴───────┴──────────────────────────────┴─────────┴─────────┴───────────┴───────────┴───────────┴────────────┴────────────┤');
      console.log(`│                                        >>> TARGET REACHED: +$${lockedProfit.toFixed(2)} PROFIT <<<                                              │`);
      break;
    }

    let actionStr = '';
    let buyUp = 0;
    let buyDown = 0;

    // === FIRST ENTRY: Buy BOTH sides with fixed small amounts ===
    if (state.upShares === 0 && state.downShares === 0) {
      buyUp = Math.min(ENTRY_UP, remainingBudget * 0.5);
      buyDown = Math.min(ENTRY_DOWN, remainingBudget - buyUp);
      actionStr = `ENTRY: UP$${buyUp.toFixed(0)}+DN$${buyDown.toFixed(0)}`;
    } else {
      // Calculate current locked profit (min of both sides)
      const currentProfitUp = state.upShares - totalSpent;
      const currentProfitDown = state.downShares - totalSpent;
      const currentLockedProfit = Math.min(currentProfitUp, currentProfitDown);

      // Update locked profit if positive
      if (currentLockedProfit > 0) {
        lockedProfit = currentLockedProfit;
      }

      // If locked profit meets target, we're done (checked at loop start)
      // Otherwise, use DCA to build position toward target
      const decision = shouldBuy(
        state.upSpent,
        state.upShares,
        state.downSpent,
        state.downShares,
        upPrice,
        downPrice,
        targetProfit,
        remainingBudget
      );

      buyUp = Math.min(decision.buyUp, remainingBudget);
      buyDown = Math.min(decision.buyDown, remainingBudget - buyUp);

      if (decision.status.startsWith('ARBITRAGE') && decision.expectedProfit >= targetProfit) {
        actionStr = `${decision.status} +$${decision.expectedProfit.toFixed(2)}`;
        lockedProfit = decision.expectedProfit;
      } else if (decision.status.startsWith('HOLD')) {
        actionStr = `${decision.status} +$${decision.expectedProfit.toFixed(0)}`;
      } else if (decision.status === 'DCA_UP') {
        actionStr = `DCA_UP $${buyUp.toFixed(0)} →+$${targetProfit.toFixed(0)}`;
      } else if (decision.status === 'DCA_DOWN') {
        actionStr = `DCA_DN $${buyDown.toFixed(0)} →+$${targetProfit.toFixed(0)}`;
      } else if (decision.status.startsWith('ARBITRAGE')) {
        // Small arbitrage - show as DCA continuation
        if (buyUp > 0) {
          actionStr = `DCA_UP $${buyUp.toFixed(0)} (arb)`;
        } else if (buyDown > 0) {
          actionStr = `DCA_DN $${buyDown.toFixed(0)} (arb)`;
        } else {
          actionStr = `HOLD (locked $${currentLockedProfit.toFixed(1)})`;
        }
      } else {
        actionStr = 'WAIT';
      }
    }

    // Execute buys
    if (buyUp > 0) {
      state.upShares += buyUp / upPrice;
      state.upSpent += buyUp;
    }
    if (buyDown > 0) {
      state.downShares += buyDown / downPrice;
      state.downSpent += buyDown;
    }

    // Calculate after buy
    const avgUp = state.upShares > 0 ? (state.upSpent / state.upShares) : 0;
    const avgDown = state.downShares > 0 ? (state.downSpent / state.downShares) : 0;
    const newTotalSpent = state.upSpent + state.downSpent;
    const profitUp = state.upShares - newTotalSpent;
    const profitDown = state.downShares - newTotalSpent;

    // Print row
    console.log(
      `│ ${String(i + 1).padStart(4)} │` +
      ` ${(upPrice * 100).toFixed(0).padStart(3)}%  │` +
      ` ${(downPrice * 100).toFixed(0).padStart(3)}%  │` +
      ` ${actionStr.padEnd(28)} │` +
      ` ${(avgUp * 100).toFixed(1).padStart(5)}%  │` +
      ` ${(avgDown * 100).toFixed(1).padStart(5)}%  │` +
      ` ${state.upShares.toFixed(1).padStart(9)} │` +
      ` ${state.downShares.toFixed(1).padStart(9)} │` +
      ` $${newTotalSpent.toFixed(0).padStart(8)} │` +
      ` ${profitUp >= 0 ? '+' : ''}${profitUp.toFixed(0).padStart(9)} │` +
      ` ${profitDown >= 0 ? '+' : ''}${profitDown.toFixed(0).padStart(9)} │`
    );
  }

  console.log('└──────┴───────┴───────┴──────────────────────────────┴─────────┴─────────┴───────────┴───────────┴───────────┴────────────┴────────────┘');

  // Final summary
  const totalSpent = state.upSpent + state.downSpent;
  const profitUp = state.upShares - totalSpent;
  const profitDown = state.downShares - totalSpent;

  console.log('\n' + '='.repeat(100));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(100));
  console.log(`Budget: $${maxBudget} | Target Profit: $${targetProfit.toFixed(2)} (${TARGET_PROFIT_RATIO * 100}%)`);
  console.log(`Spent: UP $${state.upSpent.toFixed(2)} + DOWN $${state.downSpent.toFixed(2)} = $${totalSpent.toFixed(2)}`);
  console.log(`Shares: UP ${state.upShares.toFixed(2)}, DOWN ${state.downShares.toFixed(2)}`);
  console.log('');
  console.log(`-> If UP wins:   profit = $${profitUp.toFixed(2)}`);
  console.log(`-> If DOWN wins: profit = $${profitDown.toFixed(2)}`);

  const actualLockedProfit = Math.min(profitUp, profitDown);
  if (actualLockedProfit > 0) {
    console.log(`\n🎯 LOCKED PROFIT: +$${actualLockedProfit.toFixed(2)} guaranteed!`);
  } else {
    console.log(`\n⚠️  NO LOCKED PROFIT - betting on ${profitUp > profitDown ? 'UP' : 'DOWN'} to win`);
    console.log(`   Best case: +$${Math.max(profitUp, profitDown).toFixed(2)} | Worst case: $${actualLockedProfit.toFixed(2)}`);
  }
}

async function main() {
  const slugArg = process.argv[2];
  const budgetArg = process.argv[3] ? parseInt(process.argv[3]) : DEFAULT_BUDGET;

  let marketSlug = slugArg;
  if (!marketSlug) {
    const recent = await prisma.arbitrageLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { marketSlug: true },
    });
    if (!recent) {
      console.log('No data found');
      process.exit(1);
    }
    marketSlug = recent.marketSlug;
  }

  console.log(`\n${'#'.repeat(80)}`);
  console.log(`# Window: ${marketSlug}`);
  console.log(`# Budget: $${budgetArg} | Target Profit: $${(budgetArg * TARGET_PROFIT_RATIO).toFixed(2)} (${TARGET_PROFIT_RATIO * 100}%)`);
  console.log('#'.repeat(80));

  const prices = await prisma.arbitrageLog.findMany({
    where: { marketSlug },
    orderBy: { timestamp: 'asc' },
  });

  if (prices.length === 0) {
    console.log('No price data');
    process.exit(1);
  }

  const upPrices = prices.map(p => Number(p.upPrice));
  const downPrices = prices.map(p => Number(p.downPrice));
  console.log(`Ticks: ${prices.length}`);
  console.log(`UP: ${(Math.min(...upPrices) * 100).toFixed(0)}% - ${(Math.max(...upPrices) * 100).toFixed(0)}%`);
  console.log(`DOWN: ${(Math.min(...downPrices) * 100).toFixed(0)}% - ${(Math.max(...downPrices) * 100).toFixed(0)}%`);

  // Run simulation with specified budget
  simulate(prices, marketSlug, budgetArg);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e.message);
  prisma.$disconnect();
  process.exit(1);
});

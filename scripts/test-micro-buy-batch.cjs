/**
 * Micro Buy Strategy - Batch Tester
 *
 * Tests the V3-style prediction strategy across multiple windows:
 * - Phase 1: Buy predicted winner early (40%)
 * - Phase 2: Buy cheap loser to balance (50%)
 * - Phase 3: Reserve for final balance (10%)
 */
const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:7432/polymarket';
const prisma = new PrismaClient();

const CONFIG = {
  initialBalance: 100,
  maxBuyRatio: 2.0,
  minBuyAmount: 0.10,
  tickBuyMin: 1,
  tickBuyMax: 5,
  minPrice: 0.01,
  maxPrice: 0.95,
  cheapThreshold: 0.20,
  expensiveThreshold: 0.70,
};

class MicroBuyBot {
  constructor() {
    this.balance = CONFIG.initialBalance;
    this.holdings = { UP: 0, DOWN: 0 };
    this.totalSpent = 0;
    this.predictedWinner = null;
    this.phase1Pool = CONFIG.initialBalance * 0.40;  // 40% - buy predicted winner
    this.phase2Pool = CONFIG.initialBalance * 0.50;  // 50% - buy cheap loser
    this.phase3Pool = CONFIG.initialBalance * 0.10;  // 10% - reserve
  }

  onPriceTick(upPrice, downPrice, timeLeft) {
    const lowerSide = upPrice < downPrice ? 'UP' : 'DOWN';
    const lowerPrice = Math.min(upPrice, downPrice);

    // V3: Predict winner based on first tick's lower price (contrarian)
    if (this.predictedWinner === null) {
      this.predictedWinner = lowerSide;
    }

    const predictedLoser = this.predictedWinner === 'UP' ? 'DOWN' : 'UP';
    const winnerPrice = this.predictedWinner === 'UP' ? upPrice : downPrice;
    const loserPrice = predictedLoser === 'UP' ? upPrice : downPrice;

    const guaranteed = Math.min(this.holdings.UP, this.holdings.DOWN);
    const profit = guaranteed - this.totalSpent;

    // Profit lock check
    if (profit > 0 && guaranteed > 0) {
      const winnerTokens = this.predictedWinner === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      const loserTokens = predictedLoser === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      if (Math.abs(winnerTokens - loserTokens) < Math.max(winnerTokens, loserTokens) * 0.15) {
        return;
      }
    }

    // Phase 1: Buy PREDICTED WINNER (40%)
    if (this.phase1Pool > 0) {
      if (winnerPrice <= CONFIG.expensiveThreshold) {
        const amount = Math.min(
          Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
          this.phase1Pool,
          this.balance
        );
        if (amount >= CONFIG.minBuyAmount) {
          this.phase1Pool -= amount;
          this.execute(this.predictedWinner, amount, winnerPrice);
          return;
        }
      } else {
        this.phase1Pool = 0;
      }
    }

    // Phase 2: Buy CHEAP LOSER to balance (50%)
    if (this.phase2Pool > 0) {
      const winnerTokens = this.predictedWinner === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      const loserTokens = predictedLoser === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      const tokensNeeded = winnerTokens - loserTokens;

      if (tokensNeeded <= 2 && profit > 0) return;

      if (loserPrice <= CONFIG.cheapThreshold && loserPrice >= CONFIG.minPrice) {
        const amount = Math.min(
          Math.random() * (CONFIG.tickBuyMax - CONFIG.tickBuyMin) + CONFIG.tickBuyMin,
          this.phase2Pool,
          this.balance
        );
        if (amount >= CONFIG.minBuyAmount) {
          this.phase2Pool -= amount;
          this.execute(predictedLoser, amount, loserPrice);
          return;
        }
      }

      if (timeLeft <= 120 && this.phase2Pool > 0) {
        if (loserTokens < winnerTokens && loserPrice <= 0.50) {
          const amount = Math.min(this.phase2Pool, this.balance);
          if (amount >= CONFIG.minBuyAmount) {
            this.phase2Pool -= amount;
            this.execute(predictedLoser, amount, loserPrice);
            return;
          }
        }
      }
    }

    // Phase 3: Reserve (10%)
    if (this.phase3Pool > 0 && timeLeft <= 60) {
      const winnerTokens = this.predictedWinner === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      const loserTokens = predictedLoser === 'UP' ? this.holdings.UP : this.holdings.DOWN;
      if (loserTokens < winnerTokens && loserPrice <= 0.30) {
        const amount = Math.min(this.phase3Pool, this.balance);
        if (amount >= CONFIG.minBuyAmount) {
          this.phase3Pool -= amount;
          this.execute(predictedLoser, amount, loserPrice);
        }
      }
    }
  }

  execute(side, amount, price) {
    const tokens = amount / price;
    this.holdings[side] += tokens;
    this.totalSpent += amount;
    this.balance -= amount;
  }

  getResult(actualWinner) {
    const guaranteed = Math.min(this.holdings.UP, this.holdings.DOWN);
    const profit = guaranteed - this.totalSpent;
    const upAvg = this.holdings.UP > 0 ? (this.totalSpent * (this.holdings.UP / (this.holdings.UP + this.holdings.DOWN))) / this.holdings.UP : 0;
    const downAvg = this.holdings.DOWN > 0 ? (this.totalSpent * (this.holdings.DOWN / (this.holdings.UP + this.holdings.DOWN))) / this.holdings.DOWN : 0;

    return {
      totalSpent: this.totalSpent,
      guaranteed,
      profit,
      predictedWinner: this.predictedWinner,
      actualWinner,
      predictionCorrect: this.predictedWinner === actualWinner,
      upTokens: this.holdings.UP,
      downTokens: this.holdings.DOWN,
      entered: this.totalSpent > 0,
    };
  }
}

function simulateWindow(priceData, windowStartTs) {
  const windowEndTs = windowStartTs + 15 * 60;
  const bot = new MicroBuyBot();

  for (const snapshot of priceData) {
    const upPrice = Number(snapshot.upPrice);
    const downPrice = Number(snapshot.downPrice);
    const currentTs = Math.floor(snapshot.timestamp.getTime() / 1000);
    const timeLeft = windowEndTs - currentTs;
    bot.onPriceTick(upPrice, downPrice, timeLeft);
  }

  const finalUp = Number(priceData[priceData.length - 1].upPrice);
  const finalDown = Number(priceData[priceData.length - 1].downPrice);
  const actualWinner = finalUp > finalDown ? 'UP' : 'DOWN';

  return bot.getResult(actualWinner);
}

async function run() {
  const crypto = process.argv[2] || 'btc';
  const limit = parseInt(process.argv[3]) || 100;

  const markets = await prisma.$queryRaw`
    SELECT DISTINCT market_slug FROM arbitrage_logs
    WHERE crypto = ${crypto} AND market_slug LIKE ${crypto + '-updown-15m-%'}
    GROUP BY market_slug HAVING COUNT(*) > 100
    ORDER BY market_slug DESC LIMIT ${limit}
  `;

  console.log('='.repeat(110));
  console.log('MICRO BUY STRATEGY - Batch Test');
  console.log('='.repeat(110));
  console.log(`Crypto: ${crypto.toUpperCase()}`);
  console.log(`Markets: ${markets.length}`);
  console.log('='.repeat(110));
  console.log('');

  let wins = 0, losses = 0, totalProfit = 0, totalSpent = 0;
  let correctPredictions = 0, entered = 0, skipped = 0;

  for (const m of markets) {
    const slug = m.market_slug;
    const ts = parseInt(slug.split('-').pop());
    const data = await prisma.arbitrageLog.findMany({
      where: { marketSlug: slug },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, upPrice: true, downPrice: true },
    });
    if (data.length < 50) continue;

    const r = simulateWindow(data, ts);

    if (r.entered) {
      entered++;
      const profitStr = r.profit >= 0 ? '+$' + r.profit.toFixed(2) : '-$' + Math.abs(r.profit).toFixed(2);
      const predChar = r.predictionCorrect ? 'Y' : 'N';
      const balance = 'UP:' + r.upTokens.toFixed(0) + ' DN:' + r.downTokens.toFixed(0);

      console.log(
        slug + ' | ' +
        'Pred:' + r.predictedWinner + ' Win:' + r.actualWinner + ' ' + predChar + ' | ' +
        balance.padStart(15) + ' | ' +
        'Spent:$' + r.totalSpent.toFixed(0).padStart(3) + ' | ' +
        profitStr.padStart(8)
      );

      totalSpent += r.totalSpent;
      totalProfit += r.profit;
      if (r.profit > 0) wins++;
      else losses++;
      if (r.predictionCorrect) correctPredictions++;
    } else {
      skipped++;
    }
  }

  const total = wins + losses;
  console.log('');
  console.log('='.repeat(110));
  console.log('SUMMARY');
  console.log('='.repeat(110));
  console.log('');
  console.log('Markets tested: ' + (entered + skipped));
  console.log('Entered: ' + entered + ' (' + (entered / (entered + skipped) * 100).toFixed(1) + '%)');
  console.log('Skipped: ' + skipped);
  console.log('');
  if (total > 0) {
    console.log('Results: ' + wins + ' wins, ' + losses + ' losses (' + (wins / total * 100).toFixed(1) + '% win rate)');
    console.log('Prediction accuracy: ' + correctPredictions + '/' + total + ' (' + (correctPredictions / total * 100).toFixed(1) + '%)');
    console.log('');
    console.log('Financials:');
    console.log('  Total Spent: $' + totalSpent.toFixed(2));
    console.log('  Total Profit: $' + totalProfit.toFixed(2));
    console.log('  ROI: ' + (totalProfit / totalSpent * 100).toFixed(2) + '%');
    console.log('  Avg Profit/Trade: $' + (totalProfit / total).toFixed(2));
  }
  console.log('='.repeat(110));
}

run().finally(() => prisma.$disconnect());

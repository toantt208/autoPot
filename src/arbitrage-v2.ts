/**
 * Polymarket Profit-Based Arbitrage Strategy (V2)
 *
 * Strategy:
 * 1. Buy higher side when price in 5%-80% range ($5 per buy)
 * 2. Calculate profit in both scenarios (profitIfUpWins, profitIfDownWins)
 * 3. Buy weaker side to improve lower profit scenario
 * 4. Stop buying when BOTH scenarios reach $5 profit OR $30 max spent
 * 5. Emergency balance with 60s left if unbalanced
 *
 * Config:
 *   TARGET_PROFIT: $5 per window (default)
 *   MAX_SPEND: $30 per window (default)
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.xrp_higher node dist/arbitrage-v2.js btc
 */

import { getConfig } from './config/index.js';
import type { Config } from './config/index.js';
import { MarketClient } from './clients/market-client.js';
import { TradingClient } from './clients/trading-client.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import { generateSlug } from './services/market-timing.js';
import type { TokenIds } from './types/index.js';
import { prisma } from './db/index.js';

// Config from env/args
const CRYPTO = process.argv[2]?.toLowerCase() || 'btc';
const ENTRY_MIN = parseFloat(process.env.ENTRY_MIN || '0.05');
const ENTRY_MAX = parseFloat(process.env.ENTRY_MAX || '0.80');
const INITIAL_BET = parseFloat(process.env.BET_AMOUNT || '5');
const PROFIT_THRESHOLD = parseFloat(process.env.PROFIT_THRESHOLD || '5');
const DRY_RUN = process.env.DRY_RUN !== 'false';

// New profit-based strategy config
const TARGET_PROFIT = parseFloat(process.env.TARGET_PROFIT || '5'); // $5 profit target per window
const MAX_SPEND = parseFloat(process.env.MAX_SPEND || '30'); // Max $30 per window
const EMERGENCY_SECONDS = parseInt(process.env.EMERGENCY_SECONDS || '60'); // Force balance at 60s

// Position state for current window
interface PositionState {
  marketSlug: string;
  upTokens: number;
  upSpent: number;
  downTokens: number;
  downSpent: number;
  trades: TradeRecord[];
}

interface TradeRecord {
  timestamp: Date;
  side: 'UP' | 'DOWN';
  price: number;
  amount: number;
  tokens: number;
}

type ActionType = 'BUY_UP' | 'BUY_DOWN' | 'BUY_BOTH' | 'HOLD';

interface BuyDecision {
  action: ActionType;
  upAmount: number;
  downAmount: number;
  reason: string;
  // Profit metrics
  profitIfUpWins: number;
  profitIfDownWins: number;
  guaranteedProfit: number;
  totalSpent: number;
}

/**
 * Calculate position metrics
 */
function getMetrics(state: PositionState) {
  const guaranteed = Math.min(state.upTokens, state.downTokens);
  const totalSpent = state.upSpent + state.downSpent;
  const profit = guaranteed - totalSpent;
  const profitPct = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
  const avgUpPrice = state.upTokens > 0 ? state.upSpent / state.upTokens : 0;
  const avgDownPrice = state.downTokens > 0 ? state.downSpent / state.downTokens : 0;
  const avgTotal = avgUpPrice + avgDownPrice;
  const imbalance = state.upTokens - state.downTokens;

  return {
    guaranteed,
    totalSpent,
    profit,
    profitPct,
    avgUpPrice,
    avgDownPrice,
    avgTotal,
    imbalance,
  };
}

/**
 * Profit-based buy decision function
 *
 * Strategy:
 * 1. Calculate profit if UP wins, profit if DOWN wins
 * 2. If BOTH scenarios reach $5 profit → STOP
 * 3. Keep buying if spent < $30
 * 4. Buy the weaker side (lower profit potential)
 */
function shouldBuy(
  state: PositionState,
  currentUpPrice: number,
  currentDownPrice: number,
  timeLeft: number
): BuyDecision {
  const totalSpent = state.upSpent + state.downSpent;
  const profitIfUpWins = state.upTokens - totalSpent;
  const profitIfDownWins = state.downTokens - totalSpent;
  const guaranteedProfit = Math.min(state.upTokens, state.downTokens) - totalSpent;
  const imbalance = state.upTokens - state.downTokens;

  const baseResult = { profitIfUpWins, profitIfDownWins, guaranteedProfit, totalSpent };

  // RULE 0: Emergency balance if time running out and unbalanced
  if (timeLeft <= EMERGENCY_SECONDS && Math.abs(imbalance) > 0.5) {
    const needSide = imbalance > 0 ? 'DOWN' : 'UP';
    const needTokens = Math.abs(imbalance);
    const needPrice = needSide === 'UP' ? currentUpPrice : currentDownPrice;
    const needCost = needTokens * needPrice;

    return {
      action: needSide === 'UP' ? 'BUY_UP' : 'BUY_DOWN',
      upAmount: needSide === 'UP' ? needCost : 0,
      downAmount: needSide === 'DOWN' ? needCost : 0,
      reason: `⚠️ EMERGENCY: ${timeLeft}s left, force balance`,
      ...baseResult,
    };
  }

  // RULE 1: Both scenarios profitable ($TARGET_PROFIT+) → STOP
  if (profitIfUpWins >= TARGET_PROFIT && profitIfDownWins >= TARGET_PROFIT) {
    return {
      action: 'HOLD',
      upAmount: 0,
      downAmount: 0,
      reason: `✅ Target reached: UP=$${profitIfUpWins.toFixed(2)}, DOWN=$${profitIfDownWins.toFixed(2)}`,
      ...baseResult,
    };
  }

  // RULE 2: Max spend reached ($MAX_SPEND) → STOP
  if (totalSpent >= MAX_SPEND) {
    return {
      action: 'HOLD',
      upAmount: 0,
      downAmount: 0,
      reason: `Max spend $${MAX_SPEND} reached`,
      ...baseResult,
    };
  }

  const remainingBudget = MAX_SPEND - totalSpent;

  // RULE 3: No position yet → buy higher side (if price in 5-80% range)
  if (state.upTokens === 0 && state.downTokens === 0) {
    const higherSide = currentUpPrice > currentDownPrice ? 'UP' : 'DOWN';
    const higherPrice = Math.max(currentUpPrice, currentDownPrice);

    if (higherPrice < ENTRY_MIN || higherPrice > ENTRY_MAX) {
      return {
        action: 'HOLD',
        upAmount: 0,
        downAmount: 0,
        reason: `Wait: price ${(higherPrice * 100).toFixed(1)}% outside ${(ENTRY_MIN * 100).toFixed(0)}-${(ENTRY_MAX * 100).toFixed(0)}%`,
        ...baseResult,
      };
    }

    const amount = Math.min(INITIAL_BET, remainingBudget);
    return {
      action: higherSide === 'UP' ? 'BUY_UP' : 'BUY_DOWN',
      upAmount: higherSide === 'UP' ? amount : 0,
      downAmount: higherSide === 'DOWN' ? amount : 0,
      reason: `Start: ${higherSide} at ${(higherPrice * 100).toFixed(1)}%`,
      ...baseResult,
    };
  }

  // RULE 4: Buy weaker side (to improve lower profit scenario)
  // Priority: whichever side has LESS profit potential
  const needMoreUp = profitIfUpWins < profitIfDownWins;
  const targetSide = needMoreUp ? 'UP' : 'DOWN';
  const targetPrice = needMoreUp ? currentUpPrice : currentDownPrice;

  // Calculate how much to buy to improve the weaker side
  const currentWeakProfit = Math.min(profitIfUpWins, profitIfDownWins);
  const neededProfit = TARGET_PROFIT - currentWeakProfit;
  const neededShares = neededProfit; // 1 share = $1 payout
  const idealCost = neededShares * targetPrice;
  const amount = Math.min(idealCost, remainingBudget, INITIAL_BET); // Cap at $5 per buy

  // Don't buy if amount is too small
  if (amount < 0.5) {
    return {
      action: 'HOLD',
      upAmount: 0,
      downAmount: 0,
      reason: `Wait: amount too small ($${amount.toFixed(2)})`,
      ...baseResult,
    };
  }

  return {
    action: targetSide === 'UP' ? 'BUY_UP' : 'BUY_DOWN',
    upAmount: targetSide === 'UP' ? amount : 0,
    downAmount: targetSide === 'DOWN' ? amount : 0,
    reason: `Buy ${targetSide}: profit $${currentWeakProfit.toFixed(2)} < $${TARGET_PROFIT}`,
    ...baseResult,
  };
}

/**
 * Get time left in current window (seconds)
 */
function getTimeLeft(): number {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 15 * 60;
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  return currentStart + intervalSeconds - now;
}

/**
 * Get current window slug
 */
function getCurrentWindowSlug(): string {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 15 * 60;
  const currentStart = Math.floor(now / intervalSeconds) * intervalSeconds;
  return generateSlug(CRYPTO, '15m', currentStart);
}

/**
 * Fetch prices using batch API
 */
async function fetchPrices(
  tradingClient: TradingClient,
  tokenIds: TokenIds
): Promise<{ upPrice: number; downPrice: number }> {
  return tradingClient.getBatchPrices(tokenIds.up, tokenIds.down);
}

/**
 * Execute market buy
 */
async function executeBuy(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  side: 'UP' | 'DOWN',
  amount: number,
  slug: string
): Promise<{ success: boolean; tokens: number; spent: number }> {
  const tokenId = side === 'UP' ? tokenIds.up : tokenIds.down;

  if (DRY_RUN) {
    // Simulate with current price
    const prices = await tradingClient.getBatchPrices(tokenIds.up, tokenIds.down);
    const price = side === 'UP' ? prices.upPrice : prices.downPrice;
    const tokens = amount / price;

    logger.info(
      { side, amount: '$' + amount.toFixed(2), tokens: tokens.toFixed(2), price: (price * 100).toFixed(1) + '%' },
      `🧪 DRY RUN - Would buy ${side}`
    );

    return { success: true, tokens, spent: amount };
  }

  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk: tokenIds.negRisk,
      tickSize: tokenIds.tickSize,
    });

    const txHash = result?.transactionsHashes?.[0];
    const tokensReceived = parseFloat((result as any).takingAmount || '0');
    const usdcSpent = parseFloat((result as any).makingAmount || String(amount));

    if (txHash) {
      logger.info(
        { side, spent: '$' + usdcSpent.toFixed(2), tokens: tokensReceived.toFixed(2), slug },
        `${side} buy filled`
      );
      return { success: true, tokens: tokensReceived, spent: usdcSpent };
    }

    return { success: false, tokens: 0, spent: 0 };
  } catch (error: any) {
    logger.error({ error: error.message, side, slug }, 'Buy error');
    return { success: false, tokens: 0, spent: 0 };
  }
}

/**
 * Log trade/decision to database
 */
async function logTrade(
  state: PositionState,
  decision: BuyDecision,
  upPrice: number,
  downPrice: number,
  timeLeft: number,
  tradeSide?: 'UP' | 'DOWN',
  tradeAmount?: number,
  tradeTokens?: number,
  tradePrice?: number
): Promise<void> {
  const metrics = getMetrics(state);

  try {
    await prisma.arbitrageTradeLog.create({
      data: {
        marketSlug: state.marketSlug,
        crypto: CRYPTO,
        timestamp: new Date(),
        upPrice,
        downPrice,
        timeLeft,
        action: decision.action,
        reason: decision.reason.substring(0, 200),
        side: tradeSide,
        amount: tradeAmount,
        tokens: tradeTokens,
        price: tradePrice,
        upTokens: state.upTokens,
        upSpent: state.upSpent,
        downTokens: state.downTokens,
        downSpent: state.downSpent,
        avgUpPrice: metrics.avgUpPrice > 0 ? metrics.avgUpPrice : null,
        avgDownPrice: metrics.avgDownPrice > 0 ? metrics.avgDownPrice : null,
        avgTotal: metrics.avgTotal > 0 ? metrics.avgTotal : null,
        guaranteed: metrics.guaranteed,
        expectedProfit: decision.guaranteedProfit,
      },
    });
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to log trade');
  }
}

/**
 * Save/update window stats
 */
async function saveWindowStats(
  state: PositionState,
  status: string,
  isEmergency: boolean = false
): Promise<void> {
  const metrics = getMetrics(state);
  const profitPct = metrics.totalSpent > 0 ? (metrics.profit / metrics.totalSpent) * 100 : 0;

  // Parse window start time from slug
  const slugParts = state.marketSlug.split('-');
  const windowTimestamp = parseInt(slugParts[slugParts.length - 1]);
  const windowStart = new Date(windowTimestamp * 1000);

  try {
    await prisma.arbitrageWindowStats.upsert({
      where: { marketSlug: state.marketSlug },
      create: {
        marketSlug: state.marketSlug,
        crypto: CRYPTO,
        windowStart,
        entryTime: state.trades.length > 0 ? state.trades[0].timestamp : null,
        entrySide: state.trades.length > 0 ? state.trades[0].side : null,
        entryPrice: state.trades.length > 0 ? state.trades[0].price : null,
        hedgeTime: state.downTokens > 0 && state.upTokens > 0 ? new Date() : null,
        hedgePrice: metrics.avgDownPrice > 0 ? metrics.avgDownPrice : null,
        hedgeWasEmergency: isEmergency,
        totalBuys: state.trades.length,
        upTokens: state.upTokens,
        upSpent: state.upSpent,
        downTokens: state.downTokens,
        downSpent: state.downSpent,
        avgTotal: metrics.avgTotal > 0 ? metrics.avgTotal : null,
        guaranteed: metrics.guaranteed,
        totalSpent: metrics.totalSpent,
        profitUsd: metrics.profit,
        profitPct: profitPct,
        status,
      },
      update: {
        hedgeTime: state.downTokens > 0 && state.upTokens > 0 ? new Date() : undefined,
        hedgePrice: metrics.avgDownPrice > 0 ? metrics.avgDownPrice : undefined,
        hedgeWasEmergency: isEmergency,
        totalBuys: state.trades.length,
        upTokens: state.upTokens,
        upSpent: state.upSpent,
        downTokens: state.downTokens,
        downSpent: state.downSpent,
        avgTotal: metrics.avgTotal > 0 ? metrics.avgTotal : undefined,
        guaranteed: metrics.guaranteed,
        totalSpent: metrics.totalSpent,
        profitUsd: metrics.profit,
        profitPct: profitPct,
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to save window stats');
  }
}

/**
 * Update session cumulative profit
 */
async function updateSession(profit: number): Promise<number> {
  let session = await prisma.arbitrageSession.findFirst({
    where: { crypto: CRYPTO, active: true },
  });

  if (!session) {
    session = await prisma.arbitrageSession.create({
      data: {
        crypto: CRYPTO,
        startedAt: new Date(),
        profitThreshold: PROFIT_THRESHOLD,
        active: true,
      },
    });
  }

  const newProfit = Number(session.cumulativeProfit) + profit;
  const shouldStop = newProfit >= PROFIT_THRESHOLD;

  await prisma.arbitrageSession.update({
    where: { id: session.id },
    data: {
      totalTrades: { increment: 1 },
      wins: profit > 0 ? { increment: 1 } : undefined,
      losses: profit <= 0 ? { increment: 1 } : undefined,
      cumulativeProfit: newProfit,
      active: !shouldStop,
      endedAt: shouldStop ? new Date() : undefined,
    },
  });

  return newProfit;
}

/**
 * Main trading loop
 */
async function main(): Promise<void> {
  const config = getConfig();
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

  logger.info(
    {
      crypto: CRYPTO.toUpperCase(),
      entryRange: `${(ENTRY_MIN * 100).toFixed(0)}%-${(ENTRY_MAX * 100).toFixed(0)}%`,
      targetProfit: '$' + TARGET_PROFIT,
      maxSpend: '$' + MAX_SPEND,
      initialBet: '$' + INITIAL_BET,
      sessionThreshold: '$' + PROFIT_THRESHOLD,
      emergencySeconds: EMERGENCY_SECONDS,
      dryRun: DRY_RUN,
    },
    DRY_RUN
      ? '🧪 Arbitrage V2 Started (DRY RUN)'
      : '🚀 Arbitrage V2 Started (LIVE MODE)'
  );

  let lastSlug = '';
  let state: PositionState | null = null;
  let cumulativeProfit = 0;

  while (cumulativeProfit < PROFIT_THRESHOLD) {
    try {
      const slug = getCurrentWindowSlug();
      const timeLeft = getTimeLeft();

      // New window - finalize previous position
      if (slug !== lastSlug) {
        if (state && state.upTokens > 0 && state.downTokens > 0) {
          // Calculate final profit
          const metrics = getMetrics(state);
          cumulativeProfit = await updateSession(metrics.profit);

          logger.info(
            {
              slug: state.marketSlug,
              guaranteed: '$' + metrics.guaranteed.toFixed(2),
              spent: '$' + metrics.totalSpent.toFixed(2),
              profit: '$' + metrics.profit.toFixed(2),
              cumulative: '$' + cumulativeProfit.toFixed(2),
            },
            '✅ Window closed - Position resolved'
          );

          await saveWindowStats(state, 'RESOLVED');
        } else if (state) {
          // Unhedged position - record potential loss
          const loss = state.upSpent + state.downSpent;
          logger.warn({ slug: state.marketSlug, loss: '$' + loss.toFixed(2) }, '⚠️ Window closed - UNHEDGED');
          await saveWindowStats(state, 'EXPIRED');
        }

        // Reset for new window
        state = {
          marketSlug: slug,
          upTokens: 0,
          upSpent: 0,
          downTokens: 0,
          downSpent: 0,
          trades: [],
        };
        lastSlug = slug;
        logger.info({ slug, timeLeft: timeLeft + 's' }, '📊 New window');
      }

      if (!state) {
        state = {
          marketSlug: slug,
          upTokens: 0,
          upSpent: 0,
          downTokens: 0,
          downSpent: 0,
          trades: [],
        };
      }

      // Get market data
      const marketData = await marketClient.getMarketTokenIds(slug);
      if (!marketData) {
        logger.debug({ slug }, 'Market not found');
        await sleep(2000);
        continue;
      }

      // Fetch prices
      const { upPrice, downPrice } = await fetchPrices(tradingClient, marketData.tokenIds);

      if (upPrice <= 0 || downPrice <= 0) {
        await sleep(1000);
        continue;
      }

      // Calculate decision using profit-based strategy
      const decision = shouldBuy(state, upPrice, downPrice, timeLeft);

      // Log current state periodically
      if (decision.action !== 'HOLD' || Math.random() < 0.1) {
        logger.info(
          {
            timeLeft: timeLeft + 's',
            up: (upPrice * 100).toFixed(1) + '%',
            down: (downPrice * 100).toFixed(1) + '%',
            upTok: state.upTokens.toFixed(2),
            downTok: state.downTokens.toFixed(2),
            spent: '$' + decision.totalSpent.toFixed(2),
            profitUp: '$' + decision.profitIfUpWins.toFixed(2),
            profitDown: '$' + decision.profitIfDownWins.toFixed(2),
            action: decision.action,
            reason: decision.reason,
          },
          decision.action === 'HOLD' ? 'Status' : '🎯 ' + decision.action
        );
      }

      // Detect emergency hedge
      const isEmergency = decision.reason.includes('EMERGENCY');

      // Execute decision
      if (decision.action === 'BUY_UP' && decision.upAmount > 0) {
        const result = await executeBuy(
          tradingClient,
          marketData.tokenIds,
          'UP',
          decision.upAmount,
          slug
        );
        if (result.success) {
          state.upTokens += result.tokens;
          state.upSpent += result.spent;
          state.trades.push({
            timestamp: new Date(),
            side: 'UP',
            price: upPrice,
            amount: result.spent,
            tokens: result.tokens,
          });

          // Log to DB
          await logTrade(state, decision, upPrice, downPrice, timeLeft, 'UP', result.spent, result.tokens, upPrice);
          const status = state.downTokens > 0 ? 'HEDGED' : 'WAITING_HEDGE';
          await saveWindowStats(state, status, isEmergency);
        }
      }

      if (decision.action === 'BUY_DOWN' && decision.downAmount > 0) {
        const result = await executeBuy(
          tradingClient,
          marketData.tokenIds,
          'DOWN',
          decision.downAmount,
          slug
        );
        if (result.success) {
          state.downTokens += result.tokens;
          state.downSpent += result.spent;
          state.trades.push({
            timestamp: new Date(),
            side: 'DOWN',
            price: downPrice,
            amount: result.spent,
            tokens: result.tokens,
          });

          // Log to DB
          await logTrade(state, decision, upPrice, downPrice, timeLeft, 'DOWN', result.spent, result.tokens, downPrice);
          const status = state.upTokens > 0 ? 'HEDGED' : 'WAITING_HEDGE';
          await saveWindowStats(state, status, isEmergency);
        }
      }

      if (decision.action === 'BUY_BOTH' && decision.upAmount > 0 && decision.downAmount > 0) {
        const [upResult, downResult] = await Promise.all([
          executeBuy(tradingClient, marketData.tokenIds, 'UP', decision.upAmount, slug),
          executeBuy(tradingClient, marketData.tokenIds, 'DOWN', decision.downAmount, slug),
        ]);

        if (upResult.success) {
          state.upTokens += upResult.tokens;
          state.upSpent += upResult.spent;
          state.trades.push({
            timestamp: new Date(),
            side: 'UP',
            price: upPrice,
            amount: upResult.spent,
            tokens: upResult.tokens,
          });
        }
        if (downResult.success) {
          state.downTokens += downResult.tokens;
          state.downSpent += downResult.spent;
          state.trades.push({
            timestamp: new Date(),
            side: 'DOWN',
            price: downPrice,
            amount: downResult.spent,
            tokens: downResult.tokens,
          });
        }

        if (upResult.success || downResult.success) {
          // Log both trades
          if (upResult.success) {
            await logTrade(state, decision, upPrice, downPrice, timeLeft, 'UP', upResult.spent, upResult.tokens, upPrice);
          }
          if (downResult.success) {
            await logTrade(state, decision, upPrice, downPrice, timeLeft, 'DOWN', downResult.spent, downResult.tokens, downPrice);
          }
          await saveWindowStats(state, 'HEDGED', isEmergency);
        }
      }

      // Log HOLD decisions periodically (every 30 seconds) for analysis
      if (decision.action === 'HOLD' && state.trades.length > 0 && timeLeft % 30 === 0) {
        await logTrade(state, decision, upPrice, downPrice, timeLeft);
      }

      await sleep(1000);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(5000);
    }
  }

  logger.info({ cumulativeProfit: '$' + cumulativeProfit.toFixed(2) }, '🎉 Profit threshold reached!');
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

// Run
main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});

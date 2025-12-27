/**
 * Polymarket Arbitrage Strategy (with Dry Run & DB Logging)
 *
 * Arbitrage opportunity: When UP + DOWN < 1, buy EQUAL TOKENS on both sides
 * One side ALWAYS wins → guaranteed profit
 *
 * Key insight: Buy equal tokens, not equal dollars
 * - Total budget split proportionally by price
 * - UP spend = Budget × (UP_price / Total_price)
 * - DOWN spend = Budget × (DOWN_price / Total_price)
 *
 * Example (UP=55%, DOWN=40%, Total=95%, Budget=$20):
 *   UP spend = $20 × 0.55/0.95 = $11.58 → 21.05 tokens
 *   DOWN spend = $20 × 0.40/0.95 = $8.42 → 21.05 tokens
 *   Winner pays $1/token → Get $21.05 back
 *   Profit = $21.05 - $20 = $1.05 (5.26%)
 *
 * DRY_RUN mode: Logs to DB without executing real trades
 *
 * Usage: DOTENV_CONFIG_PATH=.env.xxx node dist/arbitrage.js [crypto] [minProfit]
 * Example: DOTENV_CONFIG_PATH=.env.xrp_higher node dist/arbitrage.js btc 0.05
 * Example: DRY_RUN=false DOTENV_CONFIG_PATH=.env.xrp_higher node dist/arbitrage.js btc 0.05
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { getConfig } from './config/index.js';
import type { Config } from './config/index.js';
import { MarketClient } from './clients/market-client.js';
import { TradingClient } from './clients/trading-client.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import { generateSlug } from './services/market-timing.js';
import type { TokenIds } from './types/index.js';
import { prisma } from './db/index.js';

const CLOB_HOST = 'https://clob.polymarket.com';
const POLYGON_CHAIN_ID = 137;

// Config
const TOTAL_BUDGET = parseFloat(process.env.BET_AMOUNT || '20'); // Total budget for both sides
const MIN_PROFIT = parseFloat(process.argv[3] || '0.05'); // Minimum profit (5% = 0.05)
const CRYPTO = process.argv[2]?.toLowerCase() || 'btc';
const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default: true (dry run mode)

interface ArbitrageOpportunity {
  slug: string;
  upPrice: number;
  downPrice: number;
  totalPrice: number;
  profitPercent: number;
  // Calculated amounts
  upSpend: number;
  downSpend: number;
  tokens: number; // Equal tokens on both sides
  expectedReturn: number;
  expectedProfit: number;
}

interface TradeResult {
  side: 'UP' | 'DOWN';
  success: boolean;
  tokensReceived: number;
  amountSpent: number;
  price: number;
  orderId?: string;
}

type ArbitrageAction = 'PRICE_CHECK' | 'OPPORTUNITY' | 'SIMULATED_BUY' | 'EXECUTED';

/**
 * Log arbitrage action to database
 */
async function logToDb(data: {
  marketSlug: string;
  crypto: string;
  upPrice: number;
  downPrice: number;
  action: ArbitrageAction;
  opportunity?: ArbitrageOpportunity;
}): Promise<void> {
  const totalPrice = data.upPrice + data.downPrice;
  const profitPercent = totalPrice < 1 ? (1 - totalPrice) / totalPrice : 0;

  try {
    await prisma.arbitrageLog.create({
      data: {
        marketSlug: data.marketSlug,
        crypto: data.crypto,
        timestamp: new Date(),
        upPrice: data.upPrice,
        downPrice: data.downPrice,
        totalPrice,
        profitPercent,
        action: data.action,
        upSpend: data.opportunity?.upSpend,
        downSpend: data.opportunity?.downSpend,
        tokens: data.opportunity?.tokens,
        expectedProfit: data.opportunity?.expectedProfit,
      },
    });
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to log to DB');
  }
}

/**
 * Create CLOB client
 */
function createClobClient(config: Config): ClobClient {
  const wallet = new Wallet(config.MASTER_PRIVATE_KEY);
  const creds: ApiKeyCreds = {
    key: config.CLOB_API_KEY,
    secret: config.CLOB_SECRET,
    passphrase: config.CLOB_PASSPHRASE,
  };

  return new ClobClient(
    CLOB_HOST,
    POLYGON_CHAIN_ID,
    wallet,
    creds,
    SignatureType.POLY_GNOSIS_SAFE,
    config.GNOSIS_SAFE_ADDRESS
  );
}

/**
 * Fetch current prices for both sides using batch API
 */
async function fetchPrices(
  tradingClient: TradingClient,
  tokenIds: TokenIds
): Promise<{ upPrice: number; downPrice: number }> {
  // Use getBatchPrices which returns correct buy prices
  return tradingClient.getBatchPrices(tokenIds.up, tokenIds.down);
}

/**
 * Calculate arbitrage opportunity with balanced buying
 *
 * Formula for equal tokens:
 * - tokens = budget / (upPrice + downPrice)
 * - upSpend = tokens × upPrice
 * - downSpend = tokens × downPrice
 * - return = tokens × $1 = tokens
 * - profit = tokens - budget = budget × (1/(upPrice+downPrice) - 1)
 * - profitPercent = (1 - totalPrice) / totalPrice
 */
function checkArbitrage(
  slug: string,
  upPrice: number,
  downPrice: number
): ArbitrageOpportunity | null {
  if (upPrice <= 0 || downPrice <= 0) {
    return null;
  }

  const totalPrice = upPrice + downPrice;

  // Profit formula: (1 - total) / total
  const profitPercent = (1 - totalPrice) / totalPrice;

  // Only profitable if meets minimum threshold
  if (profitPercent < MIN_PROFIT) {
    return null;
  }

  // Calculate balanced buy amounts (equal tokens)
  const tokens = TOTAL_BUDGET / totalPrice;
  const upSpend = tokens * upPrice;
  const downSpend = tokens * downPrice;
  const expectedReturn = tokens; // Winner pays $1 per token
  const expectedProfit = expectedReturn - TOTAL_BUDGET;

  return {
    slug,
    upPrice,
    downPrice,
    totalPrice,
    profitPercent,
    upSpend,
    downSpend,
    tokens,
    expectedReturn,
    expectedProfit,
  };
}

/**
 * Execute market buy
 */
async function marketBuy(
  tradingClient: TradingClient,
  tokenId: string,
  amount: number,
  negRisk: boolean,
  tickSize: string,
  side: 'UP' | 'DOWN',
  slug: string
): Promise<TradeResult> {
  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk,
      tickSize,
    });

    const txHash = result?.transactionsHashes?.[0];
    const tokensReceived = parseFloat((result as any).takingAmount || '0');
    const usdcSpent = parseFloat((result as any).makingAmount || String(amount));
    const fillPrice = tokensReceived > 0 ? usdcSpent / tokensReceived : 0;

    if (txHash) {
      logger.info(
        {
          side,
          spent: '$' + usdcSpent.toFixed(2),
          tokens: tokensReceived.toFixed(2),
          price: (fillPrice * 100).toFixed(1) + '%',
          slug,
        },
        `${side} buy filled`
      );
      return { side, success: true, tokensReceived, amountSpent: usdcSpent, price: fillPrice, orderId: result.orderID };
    }

    return { side, success: false, tokensReceived: 0, amountSpent: 0, price: 0 };
  } catch (error: any) {
    logger.error({ error: error.message, side, slug }, 'Buy error');
    return { side, success: false, tokensReceived: 0, amountSpent: 0, price: 0 };
  }
}

/**
 * Execute arbitrage trade - buy equal tokens on both sides
 */
async function executeArbitrage(
  tradingClient: TradingClient,
  tokenIds: TokenIds,
  opportunity: ArbitrageOpportunity
): Promise<{ success: boolean; upResult: TradeResult; downResult: TradeResult }> {
  logger.info(
    {
      slug: opportunity.slug,
      up: (opportunity.upPrice * 100).toFixed(1) + '%',
      down: (opportunity.downPrice * 100).toFixed(1) + '%',
      total: (opportunity.totalPrice * 100).toFixed(1) + '%',
      upSpend: '$' + opportunity.upSpend.toFixed(2),
      downSpend: '$' + opportunity.downSpend.toFixed(2),
      tokens: opportunity.tokens.toFixed(2),
      expectedProfit: '$' + opportunity.expectedProfit.toFixed(2),
      profitPercent: (opportunity.profitPercent * 100).toFixed(2) + '%',
    },
    '🎯 ARBITRAGE FOUND - Buying equal tokens...'
  );

  // Buy both sides simultaneously with calculated amounts
  const [upResult, downResult] = await Promise.all([
    marketBuy(
      tradingClient,
      tokenIds.up,
      opportunity.upSpend,
      tokenIds.negRisk,
      tokenIds.tickSize,
      'UP',
      opportunity.slug
    ),
    marketBuy(
      tradingClient,
      tokenIds.down,
      opportunity.downSpend,
      tokenIds.negRisk,
      tokenIds.tickSize,
      'DOWN',
      opportunity.slug
    ),
  ]);

  const success = upResult.success && downResult.success;

  if (success) {
    // Calculate actual profit (guaranteed = min tokens received)
    const totalSpent = upResult.amountSpent + downResult.amountSpent;
    const guaranteedTokens = Math.min(upResult.tokensReceived, downResult.tokensReceived);
    const guaranteedReturn = guaranteedTokens; // $1 per token
    const guaranteedProfit = guaranteedReturn - totalSpent;
    const actualProfitPercent = (guaranteedProfit / totalSpent) * 100;

    logger.info(
      {
        slug: opportunity.slug,
        totalSpent: '$' + totalSpent.toFixed(2),
        upTokens: upResult.tokensReceived.toFixed(2),
        downTokens: downResult.tokensReceived.toFixed(2),
        guaranteedTokens: guaranteedTokens.toFixed(2),
        guaranteedReturn: '$' + guaranteedReturn.toFixed(2),
        guaranteedProfit: '$' + guaranteedProfit.toFixed(2),
        profitPercent: actualProfitPercent.toFixed(2) + '%',
      },
      '✅ ARBITRAGE EXECUTED - Guaranteed profit locked!'
    );
  } else {
    logger.warn(
      {
        slug: opportunity.slug,
        upSuccess: upResult.success,
        downSuccess: downResult.success,
        upTokens: upResult.tokensReceived.toFixed(2),
        downTokens: downResult.tokensReceived.toFixed(2),
      },
      '⚠️ ARBITRAGE PARTIAL - One side failed (position at risk)'
    );
  }

  return { success, upResult, downResult };
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
 * Main arbitrage loop
 */
async function main(): Promise<void> {
  const config = getConfig();
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

  // Calculate max total price for profit threshold
  // profitPercent = (1 - total) / total >= MIN_PROFIT
  // 1 - total >= MIN_PROFIT * total
  // 1 >= total * (1 + MIN_PROFIT)
  // total <= 1 / (1 + MIN_PROFIT)
  const maxTotalPrice = 1 / (1 + MIN_PROFIT);

  logger.info(
    {
      crypto: CRYPTO.toUpperCase(),
      totalBudget: '$' + TOTAL_BUDGET,
      minProfit: (MIN_PROFIT * 100).toFixed(1) + '%',
      maxTotalPrice: (maxTotalPrice * 100).toFixed(1) + '%',
      dryRun: DRY_RUN,
    },
    DRY_RUN
      ? '🧪 Arbitrage Bot Started (DRY RUN - Logging to DB only)'
      : '🔄 Arbitrage Bot Started (LIVE MODE)'
  );

  let lastSlug = '';
  let tradesThisWindow = 0;
  let lastLogTime = 0;
  const MAX_TRADES_PER_WINDOW = 1;
  const LOG_INTERVAL = 1000; // Log price check every 1 second

  while (true) {
    try {
      const slug = getCurrentWindowSlug();

      // Reset counter on new window
      if (slug !== lastSlug) {
        lastSlug = slug;
        tradesThisWindow = 0;
        logger.info({ slug }, '📊 New window');
      }

      // Skip if already traded this window
      if (tradesThisWindow >= MAX_TRADES_PER_WINDOW) {
        await sleep(5000);
        continue;
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

      const totalPrice = upPrice + downPrice;
      const profitPercent = totalPrice < 1 ? ((1 - totalPrice) / totalPrice) * 100 : 0;
      const now = Date.now();

      // Log current prices to console
      logger.debug(
        {
          slug,
          up: (upPrice * 100).toFixed(1) + '%',
          down: (downPrice * 100).toFixed(1) + '%',
          total: (totalPrice * 100).toFixed(1) + '%',
          profit: profitPercent.toFixed(2) + '%',
          needed: (MIN_PROFIT * 100).toFixed(1) + '%',
        },
        'Price check'
      );

      // Log to DB every 5 seconds
      if (now - lastLogTime >= LOG_INTERVAL) {
        await logToDb({
          marketSlug: slug,
          crypto: CRYPTO,
          upPrice,
          downPrice,
          action: 'PRICE_CHECK',
        });
        lastLogTime = now;
      }

      // Check for arbitrage
      const opportunity = checkArbitrage(slug, upPrice, downPrice);

      if (opportunity) {
        // Log opportunity found
        await logToDb({
          marketSlug: slug,
          crypto: CRYPTO,
          upPrice: opportunity.upPrice,
          downPrice: opportunity.downPrice,
          action: 'OPPORTUNITY',
          opportunity,
        });

        if (DRY_RUN) {
          // Dry run - log simulated buy without executing
          await logToDb({
            marketSlug: slug,
            crypto: CRYPTO,
            upPrice: opportunity.upPrice,
            downPrice: opportunity.downPrice,
            action: 'SIMULATED_BUY',
            opportunity,
          });

          logger.info(
            {
              slug: opportunity.slug,
              up: (opportunity.upPrice * 100).toFixed(1) + '%',
              down: (opportunity.downPrice * 100).toFixed(1) + '%',
              total: (opportunity.totalPrice * 100).toFixed(1) + '%',
              profit: (opportunity.profitPercent * 100).toFixed(2) + '%',
              upSpend: '$' + opportunity.upSpend.toFixed(2),
              downSpend: '$' + opportunity.downSpend.toFixed(2),
              expectedProfit: '$' + opportunity.expectedProfit.toFixed(2),
            },
            '🧪 DRY RUN - Would have executed arbitrage'
          );
          tradesThisWindow++;
        } else {
          // Live mode - execute actual trade
          const result = await executeArbitrage(tradingClient, marketData.tokenIds, opportunity);
          if (result.success) {
            await logToDb({
              marketSlug: slug,
              crypto: CRYPTO,
              upPrice: opportunity.upPrice,
              downPrice: opportunity.downPrice,
              action: 'EXECUTED',
              opportunity,
            });
            tradesThisWindow++;
          }
        }
        await sleep(2000);
      } else {
        // No opportunity - check again soon
        await sleep(500);
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(5000);
    }
  }
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

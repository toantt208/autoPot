/**
 * Scalp Market Script
 *
 * Continuously buys and sells on a specific market.
 * Takes market token ID and loops buying at trigger price, selling at +1 cent.
 *
 * Usage: DOTENV_CONFIG_PATH=.env.scale node dist/scalp-market.js <tokenId> [amount] [triggerPrice]
 * Example:
 *   DOTENV_CONFIG_PATH=.env.scale node dist/scalp-market.js 88351357385932886172206678541431860537137176722110440000691463125412638506601 5 0.60
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';

// Configuration
const POLYGON_CHAIN_ID = 137;
const CLOB_HOST = 'https://clob.polymarket.com';
const POLL_INTERVAL_MS = 1000;
const ORDER_CHECK_INTERVAL_MS = 2000;

// CLI arguments
const TOKEN_ID = process.argv[2];
const TRADE_AMOUNT = parseFloat(process.argv[3]) || 5;
let TRIGGER_PRICE_MIN = parseFloat(process.argv[4]) || 0.60;
let TRIGGER_PRICE_MAX = parseFloat(process.argv[5]) || 0.95;
const SELL_PRICE_INCREMENT = 0.01;

// Convert percentages to decimals if needed
if (TRIGGER_PRICE_MIN > 1) TRIGGER_PRICE_MIN = TRIGGER_PRICE_MIN / 100;
if (TRIGGER_PRICE_MAX > 1) TRIGGER_PRICE_MAX = TRIGGER_PRICE_MAX / 100;

interface ScalpState {
  phase: 'monitoring' | 'buying' | 'selling' | 'waiting';
  buyOrderId: string | null;
  sellOrderId: string | null;
  tokensOwned: number;
  fillPrice: number;
  tradeCount: number;
  totalProfit: number;
}

async function main(): Promise<void> {
  if (!TOKEN_ID) {
    console.error('Usage: DOTENV_CONFIG_PATH=.env.xxx node dist/scalp-market.js <tokenId> [amount] [triggerMin] [triggerMax]');
    console.error('Example:');
    console.error('  DOTENV_CONFIG_PATH=.env.scale node dist/scalp-market.js 883513... 5 60 95');
    process.exit(1);
  }

  const config = getConfig();

  logger.info(
    {
      tokenId: TOKEN_ID.slice(0, 20) + '...',
      tradeAmount: TRADE_AMOUNT,
      triggerRange: `${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}%`,
      sellIncrement: `+${(SELL_PRICE_INCREMENT * 100).toFixed(0)} cent`,
      dryRun: config.DRY_RUN,
    },
    'Starting Scalp Market Script'
  );

  // Initialize clients
  const tradingClient = new TradingClient(config);

  // Initialize CLOB client for limit orders and price fetching
  const wallet = new Wallet(config.MASTER_PRIVATE_KEY);
  const creds: ApiKeyCreds = {
    key: config.CLOB_API_KEY,
    secret: config.CLOB_SECRET,
    passphrase: config.CLOB_PASSPHRASE,
  };

  const clobClient = new ClobClient(
    CLOB_HOST,
    POLYGON_CHAIN_ID,
    wallet,
    creds,
    SignatureType.POLY_GNOSIS_SAFE,
    config.GNOSIS_SAFE_ADDRESS
  );

  const state: ScalpState = {
    phase: 'monitoring',
    buyOrderId: null,
    sellOrderId: null,
    tokensOwned: 0,
    fillPrice: 0,
    tradeCount: 0,
    totalProfit: 0,
  };

  let isShuttingDown = false;

  // Graceful shutdown
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(
      { trades: state.tradeCount, totalProfit: `$${state.totalProfit.toFixed(4)}` },
      'Shutting down Scalp Market Script...'
    );
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info('Scalp Market Script running. Press Ctrl+C to stop.');

  while (!isShuttingDown) {
    try {
      // Get current price
      const priceData = await clobClient.getPrice(TOKEN_ID, Side.BUY);
      const currentPrice = parseFloat(priceData.price || '0');

      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

      switch (state.phase) {
        case 'monitoring': {
          console.log(
            `[${timeStr}] Price: ${(currentPrice * 100).toFixed(1)}% | Range: ${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}% | Trades: ${state.tradeCount} | Profit: $${state.totalProfit.toFixed(4)}`
          );

          // Check if price is in trigger range
          if (currentPrice >= TRIGGER_PRICE_MIN && currentPrice <= TRIGGER_PRICE_MAX) {
            logger.info(
              { price: currentPrice, range: `${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}%` },
              'Price in range! Buying...'
            );

            if (!config.DRY_RUN) {
              try {
                const result = await tradingClient.marketBuy({
                  tokenId: TOKEN_ID,
                  amount: TRADE_AMOUNT,
                  negRisk: true, // Assume neg risk, adjust if needed
                  tickSize: '0.01',
                });

                // Check if order was successful and matched immediately
                if (result.success && result.status === 'matched') {
                  const takingAmount = parseFloat((result as any).takingAmount || '0');
                  const makingAmount = parseFloat((result as any).makingAmount || '0');

                  if (takingAmount > 0) {
                    state.tokensOwned = takingAmount;
                    state.fillPrice = makingAmount / takingAmount;
                    state.buyOrderId = result.orderID;

                    logger.info(
                      {
                        tokens: takingAmount.toFixed(4),
                        fillPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                        spent: `$${makingAmount.toFixed(4)}`,
                      },
                      'Buy filled! Placing limit sell...'
                    );

                    // Immediately place limit sell
                    const rawSellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
                    const sellPrice = Math.ceil(rawSellPrice * 100) / 100;

                    const sellOrder = await clobClient.createOrder(
                      {
                        tokenID: TOKEN_ID,
                        price: sellPrice,
                        size: state.tokensOwned,
                        side: Side.SELL,
                        expiration: 0,
                      },
                      {
                        negRisk: true,
                        tickSize: '0.01' as TickSize,
                      }
                    );

                    const sellResult = await clobClient.postOrder(sellOrder, OrderType.GTC);
                    state.sellOrderId = (sellResult as any).orderID;
                    state.phase = 'selling';

                    logger.info(
                      { orderId: state.sellOrderId, sellPrice: `${(sellPrice * 100).toFixed(0)}%` },
                      'Limit sell order placed'
                    );
                  }
                } else if (result.orderID && !result.success) {
                  // Order placed but not matched yet
                  state.buyOrderId = result.orderID;
                  state.phase = 'buying';
                  logger.info({ orderId: result.orderID }, 'Buy order placed, waiting for fill...');
                } else {
                  logger.error({ result }, 'Buy order failed');
                }
              } catch (error: any) {
                logger.error({ error: error.message }, 'Error placing buy order');
              }
            } else {
              // Dry run simulation
              state.tokensOwned = TRADE_AMOUNT / currentPrice;
              state.fillPrice = currentPrice;
              state.phase = 'selling';
              logger.info('DRY RUN: Simulated buy');
            }
          }
          break;
        }

        case 'buying': {
          // Poll buy order status
          if (state.buyOrderId) {
            try {
              const order = await clobClient.getOrder(state.buyOrderId);
              const sizeMatched = parseFloat((order as any)?.size_matched || '0');
              const status = (order as any)?.status;

              console.log(`[${timeStr}] Buy order: ${status} | Filled: ${sizeMatched.toFixed(4)}`);

              if (status === 'MATCHED' || status === 'FILLED' || sizeMatched > 0) {
                state.tokensOwned = sizeMatched;
                state.fillPrice = TRADE_AMOUNT / sizeMatched;

                logger.info(
                  { tokens: sizeMatched.toFixed(4), fillPrice: `${(state.fillPrice * 100).toFixed(1)}%` },
                  'Buy order filled!'
                );

                // Place limit sell
                const rawSellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
                const sellPrice = Math.ceil(rawSellPrice * 100) / 100;

                const sellOrder = await clobClient.createOrder(
                  {
                    tokenID: TOKEN_ID,
                    price: sellPrice,
                    size: state.tokensOwned,
                    side: Side.SELL,
                    expiration: 0,
                  },
                  {
                    negRisk: true,
                    tickSize: '0.01' as TickSize,
                  }
                );

                const sellResult = await clobClient.postOrder(sellOrder, OrderType.GTC);
                state.sellOrderId = (sellResult as any).orderID;
                state.phase = 'selling';

                logger.info(
                  { orderId: state.sellOrderId, sellPrice: `${(sellPrice * 100).toFixed(0)}%` },
                  'Limit sell order placed'
                );
              } else if (status === 'CANCELLED' || status === 'EXPIRED') {
                logger.warn({ status }, 'Buy order cancelled/expired');
                state.phase = 'monitoring';
                state.buyOrderId = null;
              }
            } catch (error: any) {
              logger.warn({ error: error.message }, 'Error checking buy order');
            }
          }
          break;
        }

        case 'selling': {
          // Poll sell order status
          if (state.sellOrderId && state.sellOrderId !== 'dry-run') {
            try {
              const order = await clobClient.getOrder(state.sellOrderId);
              const sizeMatched = parseFloat((order as any)?.size_matched || '0');
              const originalSize = parseFloat((order as any)?.original_size || '0');
              const status = (order as any)?.status;

              console.log(
                `[${timeStr}] Sell order: ${status} | Filled: ${sizeMatched.toFixed(4)}/${originalSize.toFixed(4)} | Price: ${(currentPrice * 100).toFixed(1)}%`
              );

              if (status === 'MATCHED' || status === 'FILLED' || sizeMatched >= originalSize) {
                const sellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
                const profit = SELL_PRICE_INCREMENT * state.tokensOwned;

                state.tradeCount++;
                state.totalProfit += profit;

                logger.info(
                  {
                    buyPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                    sellPrice: `${(sellPrice * 100).toFixed(0)}%`,
                    profit: `$${profit.toFixed(4)}`,
                    totalTrades: state.tradeCount,
                    totalProfit: `$${state.totalProfit.toFixed(4)}`,
                  },
                  'SCALP COMPLETE!'
                );

                // Reset for next trade
                state.phase = 'waiting';
                state.sellOrderId = null;
                state.buyOrderId = null;
                state.tokensOwned = 0;
                state.fillPrice = 0;
              } else if (status === 'CANCELLED' || status === 'EXPIRED') {
                logger.warn({ status }, 'Sell order cancelled/expired, retrying...');
                state.sellOrderId = null;
                // Will retry placing sell order
                if (state.tokensOwned > 0) {
                  const rawSellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
                  const sellPrice = Math.ceil(rawSellPrice * 100) / 100;

                  const sellOrder = await clobClient.createOrder(
                    {
                      tokenID: TOKEN_ID,
                      price: sellPrice,
                      size: state.tokensOwned,
                      side: Side.SELL,
                      expiration: 0,
                    },
                    {
                      negRisk: true,
                      tickSize: '0.01' as TickSize,
                    }
                  );

                  const sellResult = await clobClient.postOrder(sellOrder, OrderType.GTC);
                  state.sellOrderId = (sellResult as any).orderID;
                }
              }
            } catch (error: any) {
              logger.warn({ error: error.message }, 'Error checking sell order');
            }
          }

          // Dry run completion
          if (config.DRY_RUN) {
            const sellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
            const profit = SELL_PRICE_INCREMENT * state.tokensOwned;
            state.tradeCount++;
            state.totalProfit += profit;
            logger.info(
              { profit: `$${profit.toFixed(4)}`, totalProfit: `$${state.totalProfit.toFixed(4)}` },
              'DRY RUN: SCALP COMPLETE!'
            );
            state.phase = 'waiting';
          }
          break;
        }

        case 'waiting': {
          // Wait a bit before next trade
          console.log(`[${timeStr}] Waiting before next trade... Price: ${(currentPrice * 100).toFixed(1)}%`);
          await sleep(2000);
          state.phase = 'monitoring';
          break;
        }
      }

      const interval = state.phase === 'monitoring' ? POLL_INTERVAL_MS : ORDER_CHECK_INTERVAL_MS;
      await sleep(interval);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error in main loop');
      await sleep(POLL_INTERVAL_MS * 5);
    }
  }
}

main().catch((error) => {
  logger.error({ error: error.message }, 'Scalp Market Script failed');
  process.exit(1);
});

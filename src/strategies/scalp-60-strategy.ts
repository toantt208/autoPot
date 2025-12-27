/**
 * Scalp 60% Strategy
 *
 * When any side (UP or DOWN) hits 60%, immediately buys that side.
 * After fill, places a GTC limit sell at fill price + 1 cent.
 *
 * Flow:
 * 1. Monitor prices until one side hits trigger (default 60%)
 * 2. Place market buy order
 * 3. Wait for buy fill, calculate actual fill price
 * 4. Place limit sell at fill price + 1 cent
 * 5. Wait for sell fill
 * 6. Return with profit
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { fetchPrices } from '../services/price-monitor.js';
import { sleep } from '../utils/retry.js';
import { TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

// Strategy parameters
const TRIGGER_PRICE_MIN = 0.70; // 70% minimum trigger
const TRIGGER_PRICE_MAX = 0.90; // 90% maximum trigger
const SELL_PRICE_INCREMENT = 0.01; // 1 cent profit target
const STOP_LOSS_PRICE = 0.20; // Stop-loss if price goes under 20 cents
const ENTRY_WINDOW_SECONDS = 5 * 60; // Only enter in last 5 minutes
const POLL_INTERVAL_MS = 1000;
const ORDER_CHECK_INTERVAL_MS = 2000;
const POLYGON_CHAIN_ID = 137;
const CLOB_HOST = 'https://clob.polymarket.com';

export interface StrategyResult {
  marketSlug: string;
  traded: boolean;
  tradeResult?: TradeResult;
  skipReason?: string;
}

interface ScalpState {
  phase: 'monitoring' | 'buying' | 'selling' | 'complete';
  buyOrderId: string | null;
  sellOrderId: string | null;
  tokenId: string | null;
  side: 'UP' | 'DOWN' | null;
  tokensOwned: number;
  fillPrice: number;
}

/**
 * Check if we're within the market window (before close)
 */
function isInMarketWindow(window: MarketWindow, now: number): boolean {
  return now >= window.startTime && now < window.marketCloseTime;
}

/**
 * Create CLOB client for limit orders
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
 * Execute the scalp 60% strategy for a single market window
 */
export async function executeScalp60Strategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);

  logger.info(
    { window: formatWindowInfo(window, now), strategy: 'scalp-60' },
    'Executing scalp 60% strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Create CLOB client for limit orders
  const clobClient = createClobClient(config);

  // Initialize state
  const state: ScalpState = {
    phase: 'monitoring',
    buyOrderId: null,
    sellOrderId: null,
    tokenId: null,
    side: null,
    tokensOwned: 0,
    fillPrice: 0,
  };

  // Main strategy loop
  while (state.phase !== 'complete') {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = window.marketCloseTime - currentTime;

    // Exit if market closed
    if (timeLeft <= 0) {
      logger.info({ slug: window.slug }, 'Market closed, exiting scalp strategy');
      break;
    }

    // Fetch current prices
    const snapshot = await fetchPrices(tradingClient, tokenIds);
    const { upPrice, downPrice } = snapshot;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    switch (state.phase) {
      case 'monitoring': {
        // Only enter in last 5 minutes
        const inEntryWindow = timeLeft <= ENTRY_WINDOW_SECONDS;

        logger.debug(
          {
            slug: window.slug,
            up: `${(upPrice * 100).toFixed(0)}%`,
            down: `${(downPrice * 100).toFixed(0)}%`,
            triggerRange: `${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}%`,
            timeLeft: `${timeLeft}s`,
            inEntryWindow,
          },
          'Monitoring for trigger'
        );

        // Only buy in last 5 minutes AND price in range (70%-95%)
        const upInRange = inEntryWindow && upPrice >= TRIGGER_PRICE_MIN && upPrice <= TRIGGER_PRICE_MAX;
        const downInRange = inEntryWindow && downPrice >= TRIGGER_PRICE_MIN && downPrice <= TRIGGER_PRICE_MAX;

        if (upInRange) {
          logger.info(
            { price: upPrice, range: `${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}%`, slug: window.slug },
            'UP in trigger range! Buying...'
          );
          state.side = 'UP';
          state.tokenId = tokenIds.up;

          if (!config.DRY_RUN) {
            try {
              const result = await tradingClient.marketBuy({
                tokenId: tokenIds.up,
                amount: config.BET_AMOUNT_USDC,
                negRisk: tokenIds.negRisk,
                tickSize: tokenIds.tickSize,
              });

              // Check if order was successful
              if (!result.orderID || result.status === 400 || (result as any).error) {
                logger.error(
                  { result, slug: window.slug },
                  'Market buy order failed'
                );
                // Reset state and continue monitoring
                state.side = null;
                state.tokenId = null;
                break;
              }

              state.buyOrderId = result.orderID;
              state.phase = 'buying';
              logger.info({ orderId: result.orderID, status: result.status }, 'Market buy order placed successfully');
            } catch (error: any) {
              logger.error({ error: error.message, slug: window.slug }, 'Market buy order threw error');
              state.side = null;
              state.tokenId = null;
            }
          } else {
            state.buyOrderId = 'dry-run';
            state.tokensOwned = Math.floor((config.BET_AMOUNT_USDC / upPrice) * 100) / 100;
            state.fillPrice = upPrice;
            state.phase = 'selling';
          }
        } else if (downInRange) {
          logger.info(
            { price: downPrice, range: `${(TRIGGER_PRICE_MIN * 100).toFixed(0)}%-${(TRIGGER_PRICE_MAX * 100).toFixed(0)}%`, slug: window.slug },
            'DOWN in trigger range! Buying...'
          );
          state.side = 'DOWN';
          state.tokenId = tokenIds.down;

          if (!config.DRY_RUN) {
            try {
              const result = await tradingClient.marketBuy({
                tokenId: tokenIds.down,
                amount: config.BET_AMOUNT_USDC,
                negRisk: tokenIds.negRisk,
                tickSize: tokenIds.tickSize,
              });

              // Check if order was successful
              if (!result.orderID || result.status === 400 || (result as any).error) {
                logger.error(
                  { result, slug: window.slug },
                  'Market buy order failed'
                );
                // Reset state and continue monitoring
                state.side = null;
                state.tokenId = null;
                break;
              }

              state.buyOrderId = result.orderID;
              state.phase = 'buying';
              logger.info({ orderId: result.orderID, status: result.status }, 'Market buy order placed successfully');
            } catch (error: any) {
              logger.error({ error: error.message, slug: window.slug }, 'Market buy order threw error');
              state.side = null;
              state.tokenId = null;
            }
          } else {
            state.buyOrderId = 'dry-run';
            state.tokensOwned = Math.floor((config.BET_AMOUNT_USDC / downPrice) * 100) / 100;
            state.fillPrice = downPrice;
            state.phase = 'selling';
          }
        }
        break;
      }

      case 'buying': {
        if (state.buyOrderId && state.buyOrderId !== 'dry-run') {
          try {
            const order = await clobClient.getOrder(state.buyOrderId);
            const sizeMatched = parseFloat((order as any)?.size_matched || '0');
            const orderPrice = parseFloat((order as any)?.price || '0');
            const status = (order as any)?.status;

            logger.debug(
              { orderId: state.buyOrderId, status, sizeMatched, orderPrice },
              'Checking buy order status'
            );

            if (status === 'MATCHED' || status === 'FILLED' || sizeMatched > 0) {
              // Round down to 2 decimal places to avoid CLOB rounding issues
              state.tokensOwned = Math.floor(sizeMatched * 100) / 100;
              // Calculate actual fill price from USDC spent / tokens received
              state.fillPrice = config.BET_AMOUNT_USDC / sizeMatched;

              // Validate fill price is in valid range
              if (state.fillPrice <= 0 || state.fillPrice > 0.99) {
                logger.error(
                  { fillPrice: state.fillPrice, orderPrice, sizeMatched, order },
                  'Invalid fill price detected, skipping limit sell'
                );
                state.phase = 'complete';
                break;
              }

              const slippage = ((state.fillPrice - TRIGGER_PRICE_MIN) / TRIGGER_PRICE_MIN * 100).toFixed(1);

              logger.info(
                {
                  side: state.side,
                  tokens: sizeMatched.toFixed(4),
                  fillPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                  slippage: `${slippage}%`,
                  slug: window.slug,
                },
                'Buy order filled!'
              );

              // Immediately place limit sell order
              if (state.tokenId) {
                const rawSellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
                // Ensure sell price doesn't exceed 0.99
                const sellPrice = Math.min(Math.ceil(rawSellPrice * 100) / 100, 0.99);

                logger.info(
                  {
                    side: state.side,
                    tokens: state.tokensOwned.toFixed(4),
                    fillPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                    sellPrice: `${(sellPrice * 100).toFixed(0)}%`,
                    expectedProfit: `$${(SELL_PRICE_INCREMENT * state.tokensOwned).toFixed(4)}`,
                    slug: window.slug,
                  },
                  'Placing limit sell order instantly...'
                );

                // Retry loop for limit sell order
                let sellOrderPlaced = false;
                let retryCount = 0;
                while (!sellOrderPlaced) {
                  try {
                    const sellOrder = await clobClient.createOrder(
                      {
                        tokenID: state.tokenId,
                        price: sellPrice,
                        size: state.tokensOwned,
                        side: Side.SELL,
                        expiration: 0,
                      },
                      {
                        negRisk: tokenIds.negRisk,
                        tickSize: tokenIds.tickSize as TickSize,
                      }
                    );

                    const result = await clobClient.postOrder(sellOrder, OrderType.GTC);

                    if ((result as any).orderID) {
                      state.sellOrderId = (result as any).orderID;
                      sellOrderPlaced = true;
                      logger.info(
                        { orderId: state.sellOrderId, price: sellPrice },
                        'Limit sell order placed instantly'
                      );
                    } else {
                      const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';
                      retryCount++;
                      logger.warn(
                        { error: errorMsg, retry: retryCount },
                        'Limit sell order failed, retrying in 2s...'
                      );
                      await sleep(2000);
                    }
                  } catch (error: any) {
                    retryCount++;
                    logger.warn(
                      { error: error.message, retry: retryCount },
                      'Limit sell order error, retrying in 2s...'
                    );
                    await sleep(2000);
                  }
                }
              }

              state.phase = 'selling';
            } else if (status === 'CANCELLED' || status === 'EXPIRED') {
              logger.warn({ status, slug: window.slug }, 'Buy order cancelled/expired');
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
        // Check current price for stop-loss
        const currentPrice = state.side === 'UP' ? upPrice : downPrice;

        // Check stop-loss condition - trigger if price goes under 20 cents
        if (currentPrice < STOP_LOSS_PRICE && state.tokensOwned > 0 && state.tokenId) {
          logger.warn(
            {
              side: state.side,
              fillPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
              currentPrice: `${(currentPrice * 100).toFixed(1)}%`,
              stopLossPrice: `${(STOP_LOSS_PRICE * 100).toFixed(0)}%`,
              tokens: state.tokensOwned.toFixed(4),
              slug: window.slug,
            },
            'STOP-LOSS TRIGGERED! Price under 20 cents, market selling...'
          );

          // Cancel existing limit sell order if any
          if (state.sellOrderId && state.sellOrderId !== 'dry-run') {
            try {
              await clobClient.cancelOrder(state.sellOrderId);
              logger.info({ orderId: state.sellOrderId }, 'Cancelled limit sell order');
            } catch (error: any) {
              logger.warn({ error: error.message }, 'Error cancelling limit sell order');
            }
          }

          // Market sell to cut losses - retry until success
          if (!config.DRY_RUN) {
            let stopLossSold = false;
            let retryCount = 0;
            while (!stopLossSold) {
              try {
                const sellResult = await tradingClient.marketSell({
                  tokenId: state.tokenId,
                  amount: state.tokensOwned,
                  negRisk: tokenIds.negRisk,
                  tickSize: tokenIds.tickSize,
                });

                if (sellResult.success || sellResult.status === 'matched') {
                  stopLossSold = true;
                  const loss = (state.fillPrice - currentPrice) * state.tokensOwned;
                  logger.warn(
                    {
                      side: state.side,
                      buyPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                      sellPrice: `${(currentPrice * 100).toFixed(1)}%`,
                      loss: `-$${loss.toFixed(4)}`,
                      sellResult: sellResult.status,
                      slug: window.slug,
                    },
                    'STOP-LOSS EXECUTED'
                  );
                } else {
                  const errorMsg = (sellResult as any).errorMsg || sellResult.status || 'Unknown error';
                  retryCount++;
                  logger.warn(
                    { error: errorMsg, retry: retryCount },
                    'Stop-loss market sell failed, retrying in 2s...'
                  );
                  await sleep(2000);
                }
              } catch (error: any) {
                retryCount++;
                logger.warn(
                  { error: error.message, retry: retryCount },
                  'Stop-loss market sell error, retrying in 2s...'
                );
                await sleep(2000);
              }
            }
          } else {
            const loss = (state.fillPrice - currentPrice) * state.tokensOwned;
            logger.warn(
              {
                side: state.side,
                loss: `-$${loss.toFixed(4)}`,
              },
              'DRY RUN: STOP-LOSS EXECUTED'
            );
          }

          state.phase = 'complete';
          break;
        }

        // Place limit sell order if not already placed
        if (!state.sellOrderId && state.tokensOwned > 0 && state.tokenId) {
          const rawSellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
          const sellPrice = Math.ceil(rawSellPrice * 100) / 100;

          logger.info(
            {
              side: state.side,
              tokens: state.tokensOwned.toFixed(4),
              fillPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
              sellPrice: `${(sellPrice * 100).toFixed(0)}%`,
              stopLoss: `${(STOP_LOSS_PRICE * 100).toFixed(0)}%`,
              expectedProfit: `$${(SELL_PRICE_INCREMENT * state.tokensOwned).toFixed(4)}`,
              slug: window.slug,
            },
            'Placing limit sell order...'
          );

          if (!config.DRY_RUN) {
            // Retry loop for limit sell order
            let sellOrderPlaced = false;
            let retryCount = 0;
            while (!sellOrderPlaced) {
              try {
                const sellOrder = await clobClient.createOrder(
                  {
                    tokenID: state.tokenId,
                    price: sellPrice,
                    size: state.tokensOwned,
                    side: Side.SELL,
                    expiration: 0,
                  },
                  {
                    negRisk: tokenIds.negRisk,
                    tickSize: tokenIds.tickSize as TickSize,
                  }
                );

                const result = await clobClient.postOrder(sellOrder, OrderType.GTC);

                if ((result as any).orderID) {
                  state.sellOrderId = (result as any).orderID;
                  sellOrderPlaced = true;
                  logger.info(
                    { orderId: state.sellOrderId, price: sellPrice },
                    'Limit sell order placed'
                  );
                } else {
                  const errorMsg = (result as any).errorMsg || (result as any).error || 'Unknown error';
                  retryCount++;
                  logger.warn(
                    { error: errorMsg, retry: retryCount },
                    'Limit sell order failed, retrying in 2s...'
                  );
                  await sleep(2000);
                }
              } catch (error: any) {
                retryCount++;
                logger.warn(
                  { error: error.message, retry: retryCount },
                  'Limit sell order error, retrying in 2s...'
                );
                await sleep(2000);
              }
            }
          } else {
            state.sellOrderId = 'dry-run';
          }
        }

        // Check if sell order filled
        if (state.sellOrderId && state.sellOrderId !== 'dry-run') {
          try {
            const order = await clobClient.getOrder(state.sellOrderId);
            const sizeMatched = parseFloat((order as any)?.size_matched || '0');
            const originalSize = parseFloat((order as any)?.original_size || '0');
            const status = (order as any)?.status;

            logger.debug(
              { orderId: state.sellOrderId, status, filled: `${sizeMatched}/${originalSize}`, currentPrice: `${(currentPrice * 100).toFixed(0)}%` },
              'Checking sell order status'
            );

            if (status === 'MATCHED' || status === 'FILLED' || sizeMatched >= originalSize) {
              const sellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
              const profit = SELL_PRICE_INCREMENT * state.tokensOwned;

              logger.info(
                {
                  side: state.side,
                  buyPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
                  sellPrice: `${(sellPrice * 100).toFixed(0)}%`,
                  profit: `$${profit.toFixed(4)}`,
                  slug: window.slug,
                },
                'SCALP COMPLETE!'
              );

              state.phase = 'complete';
            } else if (status === 'CANCELLED' || status === 'EXPIRED') {
              logger.warn({ status }, 'Sell order cancelled/expired, retrying...');
              state.sellOrderId = null;
            }
          } catch (error: any) {
            logger.warn({ error: error.message }, 'Error checking sell order');
          }
        }

        // Handle dry run
        if (config.DRY_RUN && state.sellOrderId === 'dry-run') {
          const sellPrice = state.fillPrice + SELL_PRICE_INCREMENT;
          const profit = SELL_PRICE_INCREMENT * state.tokensOwned;
          logger.info(
            {
              side: state.side,
              buyPrice: `${(state.fillPrice * 100).toFixed(1)}%`,
              sellPrice: `${(sellPrice * 100).toFixed(0)}%`,
              profit: `$${profit.toFixed(4)}`,
              slug: window.slug,
            },
            'DRY RUN: SCALP COMPLETE!'
          );
          state.phase = 'complete';
        }
        break;
      }
    }

    // Wait before next iteration
    const interval = state.phase === 'monitoring' ? POLL_INTERVAL_MS : ORDER_CHECK_INTERVAL_MS;
    await sleep(interval);
  }

  // Determine result
  if (state.phase === 'complete' && state.side) {
    const tradeResult: TradeResult = {
      success: true,
      orderId: state.buyOrderId || undefined,
      marketSlug: window.slug,
      side: state.side,
    };
    tradeTracker.markTraded(window.slug, tradeResult);
    return { marketSlug: window.slug, traded: true, tradeResult };
  }

  // Market closed without completing trade
  if (state.tokensOwned > 0) {
    // We have tokens but sell didn't complete
    logger.warn(
      { slug: window.slug, tokensOwned: state.tokensOwned, sellOrderId: state.sellOrderId },
      'Market closed with open position'
    );
  }

  tradeTracker.markSkipped(window.slug);
  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: state.tokensOwned > 0 ? 'Market closed with open position' : 'Trigger price not reached',
  };
}

/**
 * Process a single market event with scalp 60% strategy
 */
export async function processMarketScalp60(
  eventConfig: EventConfig,
  tradingClient: TradingClient,
  marketClient: MarketClient,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  // Skip if not within the market window
  if (!isInMarketWindow(window, now)) {
    return null;
  }

  // Skip if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return null;
  }

  // Fetch market data
  const marketData = await marketClient.getMarketTokenIds(window.slug);
  if (!marketData) {
    logger.warn({ slug: window.slug }, 'Could not fetch market data');
    return null;
  }

  // Check if market is still open
  if (!marketClient.isMarketOpen(marketData.market)) {
    logger.debug({ slug: window.slug }, 'Market is closed');
    tradeTracker.markSkipped(window.slug);
    return null;
  }

  // Execute scalp strategy
  return executeScalp60Strategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config
  );
}

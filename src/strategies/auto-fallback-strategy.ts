/**
 * Auto Fallback Strategy
 *
 * Flow (example: BTC 13:00 - 13:15):
 * 1. Trading Window: Enter in the final window
 * 2. Auto Fallback: Buy the higher side ONCE and stop
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { fetchPrices } from '../services/price-monitor.js';
import { TradeTracker } from '../services/trade-executor.js';
import {
  calculateMarketWindow,
  isInTradingWindow,
  getSecondsUntilClose,
  formatWindowInfo,
} from '../services/market-timing.js';
import type { MarketWindow, TokenIds, TradeResult } from '../types/index.js';
import type { Config } from '../config/index.js';
import type { EventConfig } from '../config/events.js';

/**
 * Check if we're within the market window
 */
function isInMarketWindow(window: MarketWindow, now: number): boolean {
  return now >= window.startTime && now < window.endTime;
}

export interface StrategyResult {
  /** Market slug */
  marketSlug: string;
  /** Whether a trade was executed */
  traded: boolean;
  /** Trade result if traded */
  tradeResult?: TradeResult;
  /** Reason for skipping if not traded */
  skipReason?: string;
}

/**
 * Try to place a buy order, retry immediately on error
 * Returns true if order was matched, false otherwise
 */
async function tryBuy(
  tradingClient: TradingClient,
  tokenId: string,
  amount: number,
  negRisk: boolean,
  tickSize: string,
  side: string,
  slug: string
): Promise<{ matched: boolean; orderId?: string; txHash?: string; error?: string }> {
  try {
    const result = await tradingClient.marketBuy({
      tokenId,
      amount,
      negRisk,
      tickSize,
    });

    logger.info(result, 'Buy order result');
    const txHash = result?.transactionHashes[0]
    logger.info(
      { orderId: result.orderID, status: result.status, txHash, side, slug },
      'Order placed'
    );

    // Success if we have a transaction hash
    if (txHash) {
      logger.info({ orderId: result.orderID, txHash, side, slug }, 'Buy success (has txHash)! Stopping.');
      return { matched: true, orderId: result.orderID, txHash };
    }

    // Also consider DRY_RUN as success
    if (result.status === 'DRY_RUN') {
      return { matched: true, orderId: result.orderID };
    }

    return { matched: false, orderId: result.orderID };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.warn({ error: errorMsg, side, slug }, 'Buy error, will retry');
    return { matched: false, error: errorMsg };
  }
}

/**
 * Execute the auto fallback strategy for a single market window
 * Simply buys the higher side ONCE and stops
 */
export async function executeAutoFallbackStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);

  logger.info(
    { window: formatWindowInfo(window, now), strategy: 'auto-fallback' },
    'Executing auto fallback strategy'
  );

  // Check if already processed
  if (tradeTracker.hasProcessed(window.slug)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Already processed',
    };
  }

  // Only trade in the final N seconds
  if (!isInTradingWindow(window, now)) {
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: 'Not in trading window',
    };
  }

  logger.info(
    { slug: window.slug, secondsLeft: getSecondsUntilClose(window, now) },
    'Entering trading window (auto-fallback)'
  );

  // ============================================
  // Auto Fallback: Buy higher side ONCE and stop
  // ============================================
  logger.info({ slug: window.slug }, 'Auto fallback mode - buying higher side once');

  try {
    const snapshot = await fetchPrices(tradingClient, tokenIds);
    const { upPrice, downPrice } = snapshot;

    const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';
    const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;
    const higherPrice = Math.max(upPrice, downPrice);

    const currentTime = Math.floor(Date.now() / 1000);
    const timeInfo = `${window.marketCloseTime - currentTime}s left`;

    // Check if higher side is > 60%
    if (higherPrice < 0.60) {
      logger.info(
        {
          slug: window.slug,
          higherSide,
          higherPrice: `${(higherPrice * 100).toFixed(2)}%`,
          time: timeInfo,
        },
        'Higher side below 60%, skipping trade'
      );
      tradeTracker.markSkipped(window.slug);
      return {
        marketSlug: window.slug,
        traded: false,
        skipReason: 'Higher side below 60%',
      };
    }

    logger.info(
      {
        slug: window.slug,
        up: `${(upPrice * 100).toFixed(2)}%`,
        down: `${(downPrice * 100).toFixed(2)}%`,
        chosen: higherSide,
        time: timeInfo,
      },
      'Buying higher side'
    );

    const result = await tryBuy(
      tradingClient,
      higherTokenId,
      config.BET_AMOUNT_USDC,
      tokenIds.negRisk,
      tokenIds.tickSize,
      higherSide,
      window.slug
    );

    const tradeResult: TradeResult = {
      success: !!result.orderId,
      orderId: result.orderId,
      marketSlug: window.slug,
      side: higherSide,
      error: result.error,
    };
    tradeTracker.markTraded(window.slug, tradeResult);

    if (result.orderId) {
      logger.info(
        { orderId: result.orderId, side: higherSide, slug: window.slug },
        'Trade placed! Stopping.'
      );
      return { marketSlug: window.slug, traded: true, tradeResult };
    }

    logger.warn({ slug: window.slug, error: result.error }, 'Trade failed');
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: result.error || 'Trade failed',
    };
  } catch (error) {
    logger.error({ error, slug: window.slug }, 'Error in auto-fallback');
    const failedResult: TradeResult = {
      success: false,
      error: String(error),
      marketSlug: window.slug,
      side: 'UP',
    };
    tradeTracker.markTraded(window.slug, failedResult);
    return {
      marketSlug: window.slug,
      traded: false,
      skipReason: String(error),
    };
  }
}

/**
 * Process a single market event with auto fallback strategy
 */
export async function processMarketAutoFallback(
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

  // Only trade in the last 2 minutes
  if (!isInTradingWindow(window, now)) {
    return null;
  }

  // Execute auto fallback strategy
  return executeAutoFallbackStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config
  );
}

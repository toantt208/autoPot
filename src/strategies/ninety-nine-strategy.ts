/**
 * 99% Price Strategy
 *
 * Flow (example: BTC 13:00 - 13:15):
 * 1. Active Window (13:13:00 - 13:14:57): Poll for 99% threshold, buy if hit
 * 2. Fallback Window (13:14:57 - 13:15:00): Loop buying higher side until matched
 * 3. Retry Window (13:15:00 - 13:15:05): Keep retrying for 5 seconds after close
 */

import { TradingClient } from '../clients/trading-client.js';
import { MarketClient } from '../clients/market-client.js';
import { logger } from '../utils/logger.js';
import { fetchPrices } from '../services/price-monitor.js';
import { sleep } from '../utils/retry.js';
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

const FALLBACK_WINDOW_SECS = 3;  // Last 3 seconds before close
const RETRY_AFTER_CLOSE_SECS = 5; // 5 seconds after market close

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
 * Execute the 99% strategy for a single market window
 */
export async function executeStrategy(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  window: MarketWindow,
  tokenIds: TokenIds,
  tradeTracker: TradeTracker,
  config: Config
): Promise<StrategyResult> {
  const now = Math.floor(Date.now() / 1000);
  const fallbackStart = window.marketCloseTime - FALLBACK_WINDOW_SECS;
  const retryDeadline = window.marketCloseTime + RETRY_AFTER_CLOSE_SECS;

  logger.info(
    { window: formatWindowInfo(window, now), threshold: config.MIN_PRICE_THRESHOLD },
    'Executing strategy'
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
    'Entering trading window'
  );

  // ============================================
  // PHASE 1: Active Window - Poll for 99% threshold
  // ============================================
  while (Math.floor(Date.now() / 1000) < fallbackStart) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const { upPrice, downPrice } = snapshot;
      const timeLeft = window.marketCloseTime - Math.floor(Date.now() / 1000);

      logger.info(
        {
          slug: window.slug,
          up: `${(upPrice * 100).toFixed(2)}%`,
          down: `${(downPrice * 100).toFixed(2)}%`,
          threshold: `${(config.MIN_PRICE_THRESHOLD * 100).toFixed(0)}%`,
          timeLeft: `${timeLeft}s`,
        },
        'Price check'
      );

      // Check if either side hits 99% threshold
      let targetSide: 'UP' | 'DOWN' | null = null;
      let targetTokenId: string | null = null;
      let targetPrice = 0;

      if (upPrice >= config.MIN_PRICE_THRESHOLD) {
        targetSide = 'UP';
        targetTokenId = tokenIds.up;
        targetPrice = upPrice;
      } else if (downPrice >= config.MIN_PRICE_THRESHOLD) {
        targetSide = 'DOWN';
        targetTokenId = tokenIds.down;
        targetPrice = downPrice;
      }

      if (targetSide && targetTokenId) {
        logger.info(
          { side: targetSide, price: `${(targetPrice * 100).toFixed(2)}%`, slug: window.slug },
          '99% threshold hit! Buying...'
        );

        // Try to buy once, if no match move on (will retry in next loop or Phase 2)
        const result = await tryBuy(
          tradingClient,
          targetTokenId,
          config.BET_AMOUNT_USDC,
          tokenIds.negRisk,
          tokenIds.tickSize,
          targetSide,
          window.slug
        );

        if (result.matched) {
          const tradeResult: TradeResult = {
            success: true,
            orderId: result.orderId,
            marketSlug: window.slug,
            side: targetSide,
          };
          tradeTracker.markTraded(window.slug, tradeResult);
          return { marketSlug: window.slug, traded: true, tradeResult };
        }
        // No match - continue to next price check or Phase 2
        if (config.IS_SERVER) await sleep(500);
      } else {
        // No threshold hit - add delay before next price check
        if (config.IS_SERVER) await sleep(500);
      }
    } catch (error) {
      logger.warn({ error, slug: window.slug }, 'Error in active window, continuing...');
      if (config.IS_SERVER) await sleep(500);
    }
  }

  // ============================================
  // PHASE 2: Fallback Window - Buy higher side (loop continuously)
  // ============================================
  logger.info({ slug: window.slug }, 'Entering fallback window (last 3 seconds)');

  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    try {
      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const { upPrice, downPrice } = snapshot;

      const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';
      const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;
      const higherPrice = Math.max(upPrice, downPrice);

      // Check if higher side is > 55%
      if (higherPrice < 0.55) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeInfo = currentTime >= window.marketCloseTime
          ? `+${currentTime - window.marketCloseTime}s after close`
          : `${window.marketCloseTime - currentTime}s left`;

        logger.info(
          {
            slug: window.slug,
            higherSide,
            higherPrice: `${(higherPrice * 100).toFixed(2)}%`,
            time: timeInfo,
          },
          'Higher side below 55%, skipping'
        );
        continue;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isAfterClose = currentTime >= window.marketCloseTime;
      const timeInfo = isAfterClose
        ? `+${currentTime - window.marketCloseTime}s after close`
        : `${window.marketCloseTime - currentTime}s left`;

      logger.info(
        {
          slug: window.slug,
          up: `${(upPrice * 100).toFixed(2)}%`,
          down: `${(downPrice * 100).toFixed(2)}%`,
          chosen: higherSide,
          time: timeInfo,
          phase: isAfterClose ? 'retry' : 'fallback',
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

      if (result.matched) {
        const tradeResult: TradeResult = {
          success: true,
          orderId: result.orderId,
          marketSlug: window.slug,
          side: higherSide,
        };
        tradeTracker.markTraded(window.slug, tradeResult);
        logger.info(
          { orderId: result.orderId, side: higherSide, slug: window.slug },
          'Trade matched!'
        );
        return { marketSlug: window.slug, traded: true, tradeResult };
      }
      // Add delay before retry if IS_SERVER
      if (config.IS_SERVER) await sleep(500);
    } catch (error) {
      logger.warn({ error, slug: window.slug }, 'Error in fallback/retry window, continuing...');
      if (config.IS_SERVER) await sleep(500);
    }
  }

  // Retry deadline reached without match
  logger.error({ slug: window.slug }, 'Trade failed - retry deadline reached (5s after close)');
  const failedResult: TradeResult = {
    success: false,
    error: 'No match within retry window',
    marketSlug: window.slug,
    side: 'UP',
  };
  tradeTracker.markTraded(window.slug, failedResult);

  return {
    marketSlug: window.slug,
    traded: false,
    skipReason: 'No match within retry window',
  };
}

/**
 * Process a single market event
 */
export async function processMarket(
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

  // Execute trading strategy
  return executeStrategy(
    tradingClient,
    marketClient,
    window,
    marketData.tokenIds,
    tradeTracker,
    config
  );
}

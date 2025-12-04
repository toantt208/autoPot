/**
 * Market Timing Service
 *
 * Handles all timing calculations for 15-minute market windows.
 * Markets align to :00, :15, :30, :45 of each hour.
 */

import type { MarketWindow } from '../types/index.js';

const FIFTEEN_MINUTES = 15 * 60; // 900 seconds

/**
 * Generate market slug from crypto and timestamp
 */
export function generateSlug(crypto: string, startTimestamp: number): string {
  return `${crypto.toLowerCase()}-updown-15m-${startTimestamp}`;
}

/**
 * Calculate the start timestamp for the current 15-minute market window
 */
export function getCurrentMarketStartTimestamp(now: number = Math.floor(Date.now() / 1000)): number {
  return Math.floor(now / FIFTEEN_MINUTES) * FIFTEEN_MINUTES;
}

/**
 * Calculate the market window for a given crypto at the current time
 * @param tradingWindowSeconds - Duration of trading window in seconds (per-crypto configurable)
 */
export function calculateMarketWindow(
  crypto: string,
  tradingWindowSeconds: number,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow {
  const startTime = getCurrentMarketStartTimestamp(now);
  const endTime = startTime + FIFTEEN_MINUTES;

  return {
    slug: generateSlug(crypto, startTime),
    crypto: crypto.toLowerCase(),
    startTime,
    endTime,
    tradingWindowStart: endTime - tradingWindowSeconds,
  };
}

/**
 * Check if we're currently in the trading window (last N seconds before close)
 */
export function isInTradingWindow(
  window: MarketWindow,
  now: number = Math.floor(Date.now() / 1000)
): boolean {
  return now >= window.tradingWindowStart && now < window.endTime;
}

/**
 * Get seconds until the trading window starts
 */
export function getSecondsUntilTradingWindow(
  window: MarketWindow,
  now: number = Math.floor(Date.now() / 1000)
): number {
  return Math.max(0, window.tradingWindowStart - now);
}

/**
 * Get seconds until the market closes
 */
export function getSecondsUntilClose(
  window: MarketWindow,
  now: number = Math.floor(Date.now() / 1000)
): number {
  return Math.max(0, window.endTime - now);
}

/**
 * Format market window for logging
 */
export function formatWindowInfo(
  window: MarketWindow,
  now: number = Math.floor(Date.now() / 1000)
): string {
  const inTrading = isInTradingWindow(window, now);
  const untilClose = getSecondsUntilClose(window, now);

  let status = 'WAITING';
  if (inTrading) status = 'TRADING';
  if (now >= window.endTime) status = 'CLOSED';

  return `[${window.slug}] Status: ${status}, T-${untilClose}s`;
}

/**
 * Calculate the next market window (for the upcoming 15-minute period)
 * @param tradingWindowSeconds - Duration of trading window in seconds (per-crypto configurable)
 */
export function getNextMarketWindow(
  crypto: string,
  tradingWindowSeconds: number,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow {
  const nextStartTime = getCurrentMarketStartTimestamp(now) + FIFTEEN_MINUTES;
  const nextEndTime = nextStartTime + FIFTEEN_MINUTES;

  return {
    slug: generateSlug(crypto, nextStartTime),
    crypto: crypto.toLowerCase(),
    startTime: nextStartTime,
    endTime: nextEndTime,
    tradingWindowStart: nextEndTime - tradingWindowSeconds,
  };
}

/**
 * Get upcoming market windows (used by scheduler)
 * Returns windows for the next N 15-minute periods
 */
export function getUpcomingMarketWindows(
  crypto: string,
  tradingWindowSeconds: number,
  count: number = 4,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow[] {
  const windows: MarketWindow[] = [];
  let currentStartTime = getCurrentMarketStartTimestamp(now);

  for (let i = 0; i < count; i++) {
    const startTime = currentStartTime + i * FIFTEEN_MINUTES;
    const endTime = startTime + FIFTEEN_MINUTES;

    windows.push({
      slug: generateSlug(crypto, startTime),
      crypto: crypto.toLowerCase(),
      startTime,
      endTime,
      tradingWindowStart: endTime - tradingWindowSeconds,
    });
  }

  return windows;
}

/**
 * Calculate delay until trading window starts (in milliseconds)
 * Used by scheduler to delay job execution
 */
export function getDelayUntilTradingWindow(
  window: MarketWindow,
  now: number = Math.floor(Date.now() / 1000)
): number {
  const delaySeconds = window.tradingWindowStart - now;
  return Math.max(0, delaySeconds * 1000);
}

/**
 * Market Timing Service
 *
 * Handles all timing calculations for market windows.
 * 15m markets align to :00, :15, :30, :45 of each hour.
 * 1h markets align to the top of each hour.
 */

import type { MarketWindow } from '../types/index.js';
import type { EventConfig } from '../config/events.js';

const FIFTEEN_MINUTES = 15 * 60; // 900 seconds
const ONE_HOUR = 60 * 60; // 3600 seconds

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * Generate market slug based on format type
 */
export function generateSlug(
  slugName: string,
  slugFormat: '15m' | '1h',
  startTimestamp: number
): string {
  if (slugFormat === '15m') {
    return `${slugName.toLowerCase()}-updown-15m-${startTimestamp}`;
  }

  // 1h format: bitcoin-up-or-down-december-2-10pm-et
  // Convert to ET (UTC-5, ignoring DST for simplicity)
  const etDate = new Date((startTimestamp - 5 * 3600) * 1000);
  const month = MONTHS[etDate.getUTCMonth()];
  const day = etDate.getUTCDate();
  let hour = etDate.getUTCHours();
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12 || 12;

  return `${slugName.toLowerCase()}-up-or-down-${month}-${day}-${hour}${ampm}-et`;
}

/**
 * Calculate the start timestamp for the current market window
 */
export function getCurrentMarketStartTimestamp(
  interval: number,
  now: number = Math.floor(Date.now() / 1000)
): number {
  const intervalSeconds = interval * 60;
  return Math.floor(now / intervalSeconds) * intervalSeconds;
}

/**
 * Calculate the market window for a given event at the current time
 */
export function calculateMarketWindow(
  eventConfig: EventConfig,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow {
  const intervalSeconds = eventConfig.interval * 60;
  const startTime = getCurrentMarketStartTimestamp(eventConfig.interval, now);
  const marketCloseTime = startTime + intervalSeconds; // Actual market close
  const endTime = marketCloseTime + 60; // Grace period: 1 minute after market close

  return {
    slug: generateSlug(eventConfig.slugName, eventConfig.slugFormat, startTime),
    crypto: eventConfig.crypto.toLowerCase(),
    startTime,
    marketCloseTime,
    endTime,
    tradingWindowStart: marketCloseTime - eventConfig.tradingWindowSeconds, // 2 min before MARKET CLOSE
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
 * Calculate the next market window
 */
export function getNextMarketWindow(
  eventConfig: EventConfig,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow {
  const intervalSeconds = eventConfig.interval * 60;
  const nextStartTime = getCurrentMarketStartTimestamp(eventConfig.interval, now) + intervalSeconds;
  const marketCloseTime = nextStartTime + intervalSeconds; // Actual market close
  const nextEndTime = marketCloseTime + 60; // Grace period: 1 minute after market close

  return {
    slug: generateSlug(eventConfig.slugName, eventConfig.slugFormat, nextStartTime),
    crypto: eventConfig.crypto.toLowerCase(),
    startTime: nextStartTime,
    marketCloseTime,
    endTime: nextEndTime,
    tradingWindowStart: marketCloseTime - eventConfig.tradingWindowSeconds, // 2 min before MARKET CLOSE
  };
}

/**
 * Calculate the previous market window (the one that just ended)
 */
export function getPreviousMarketWindow(
  eventConfig: EventConfig,
  now: number = Math.floor(Date.now() / 1000)
): MarketWindow {
  const intervalSeconds = eventConfig.interval * 60;
  const currentStartTime = getCurrentMarketStartTimestamp(eventConfig.interval, now);
  const previousStartTime = currentStartTime - intervalSeconds;
  const previousEndTime = previousStartTime + intervalSeconds;

  return {
    slug: generateSlug(eventConfig.slugName, eventConfig.slugFormat, previousStartTime),
    crypto: eventConfig.crypto.toLowerCase(),
    startTime: previousStartTime,
    endTime: previousEndTime,
    tradingWindowStart: previousEndTime - eventConfig.tradingWindowSeconds,
  };
}

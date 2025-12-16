/**
 * Redis Price Service
 *
 * Fast price storage and retrieval for real-time trading.
 * Stores latest token prices in Redis for quick access.
 */

import { getRedis } from '../db/redis.js';
import { logger } from '../utils/logger.js';

// Redis key patterns
const PRICE_KEY_PREFIX = 'price:';
const BEAT_PRICE_KEY_PREFIX = 'beat:';

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface BeatPriceData {
  windowSlug: string;
  beatPrice: number;
  startTime: number;
  marketCloseTime: number;
  timestamp: number;
}

/**
 * Save latest price to Redis
 */
export async function savePrice(symbol: string, price: number, timestamp: number): Promise<void> {
  const redis = getRedis();
  const key = `${PRICE_KEY_PREFIX}${symbol.toUpperCase()}`;
  const data: PriceData = { symbol: symbol.toUpperCase(), price, timestamp };

  await redis.set(key, JSON.stringify(data));
}

/**
 * Get latest price from Redis
 */
export async function getLatestPrice(symbol: string): Promise<PriceData | null> {
  const redis = getRedis();
  const key = `${PRICE_KEY_PREFIX}${symbol.toUpperCase()}`;

  const data = await redis.get(key);
  if (!data) return null;

  return JSON.parse(data) as PriceData;
}

/**
 * Save beat price for a window
 */
export async function saveBeatPrice(
  windowSlug: string,
  beatPrice: number,
  startTime: number,
  marketCloseTime: number
): Promise<void> {
  const redis = getRedis();
  const key = `${BEAT_PRICE_KEY_PREFIX}${windowSlug}`;
  const data: BeatPriceData = {
    windowSlug,
    beatPrice,
    startTime,
    marketCloseTime,
    timestamp: Date.now(),
  };

  // Set with expiry (30 minutes)
  await redis.set(key, JSON.stringify(data), 'EX', 1800);
}

/**
 * Get beat price for a window
 */
export async function getBeatPrice(windowSlug: string): Promise<BeatPriceData | null> {
  const redis = getRedis();
  const key = `${BEAT_PRICE_KEY_PREFIX}${windowSlug}`;

  const data = await redis.get(key);
  if (!data) return null;

  return JSON.parse(data) as BeatPriceData;
}

/**
 * Calculate price diff between current price and beat price
 */
export async function getPriceDiff(symbol: string, windowSlug: string): Promise<{
  priceDiff: number;
  priceDiffPct: number;
  currentPrice: number;
  beatPrice: number;
} | null> {
  const [priceData, beatData] = await Promise.all([
    getLatestPrice(symbol),
    getBeatPrice(windowSlug),
  ]);

  if (!priceData || !beatData) {
    logger.debug({ symbol, windowSlug, hasPrice: !!priceData, hasBeat: !!beatData }, 'Missing price data');
    return null;
  }

  const priceDiff = priceData.price - beatData.beatPrice;
  const priceDiffPct = (priceDiff / beatData.beatPrice) * 100;

  return {
    priceDiff,
    priceDiffPct,
    currentPrice: priceData.price,
    beatPrice: beatData.beatPrice,
  };
}

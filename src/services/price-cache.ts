/**
 * Price Cache Service
 *
 * Caches token prices in Redis for fallback when CLOB has no orderbook.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PRICE_TTL_SECONDS = 300; // 5 minutes

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redis.on('error', (err) => {
      logger.debug({ error: err.message }, 'Redis connection error');
    });
  }
  return redis;
}

function getPriceKey(tokenId: string): string {
  return `prices:${tokenId}`;
}

/**
 * Save token price to Redis
 */
export async function savePrice(tokenId: string, price: number): Promise<void> {
  try {
    const client = getRedis();
    await client.setex(getPriceKey(tokenId), PRICE_TTL_SECONDS, price.toString());
    logger.debug({ tokenId: tokenId.slice(0, 20) + '...', price }, 'Price cached to Redis');
  } catch (error) {
    logger.debug({ error }, 'Failed to cache price');
  }
}

/**
 * Save both token prices to Redis
 */
export async function savePrices(
  upTokenId: string,
  upPrice: number,
  downTokenId: string,
  downPrice: number
): Promise<void> {
  try {
    const client = getRedis();
    await Promise.all([
      client.setex(getPriceKey(upTokenId), PRICE_TTL_SECONDS, upPrice.toString()),
      client.setex(getPriceKey(downTokenId), PRICE_TTL_SECONDS, downPrice.toString()),
    ]);
    logger.debug({ upPrice, downPrice }, 'Prices cached to Redis');
  } catch (error) {
    logger.debug({ error }, 'Failed to cache prices');
  }
}

/**
 * Get cached price from Redis by token ID
 */
export async function getCachedPrice(tokenId: string): Promise<number | null> {
  try {
    const client = getRedis();
    const priceStr = await client.get(getPriceKey(tokenId));

    if (!priceStr) {
      return null;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return null;
    }

    logger.debug({ tokenId: tokenId.slice(0, 20) + '...', price }, 'Got cached price from Redis');
    return price;
  } catch (error) {
    logger.debug({ error }, 'Failed to get cached price');
    return null;
  }
}

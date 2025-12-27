import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const TRADE_LOCK_PREFIX = 'trade_lock:';
const TRADE_LOCK_TTL = 120; // 2 minutes TTL

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redisClient.on('error', (err) => {
      logger.debug({ error: err.message }, 'Redis connection error');
    });
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Extract window timestamp from slug (e.g., "btc-updown-15m-1766378700" -> "1766378700")
 */
function getWindowTimestamp(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}

/**
 * Mark that a trade was made for a specific window
 * Returns true if successfully marked (first to buy)
 * Returns false if another bot already bought
 */
export async function markTradeLock(slug: string, crypto: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const windowTs = getWindowTimestamp(slug);
    const key = `${TRADE_LOCK_PREFIX}${windowTs}`;

    // Use SETNX (set if not exists) to atomically claim the lock
    const result = await redis.set(key, crypto, 'EX', TRADE_LOCK_TTL, 'NX');

    if (result === 'OK') {
      logger.info({ crypto, windowTs, slug }, 'Trade lock acquired');
      return true;
    } else {
      // Someone else already bought
      const existingCrypto = await redis.get(key);
      logger.info({ crypto, windowTs, existingCrypto }, 'Trade lock already held by another');
      return false;
    }
  } catch (error: any) {
    logger.warn({ error: error.message, slug }, 'Failed to mark trade lock, proceeding anyway');
    return true; // On error, allow trade to proceed
  }
}

/**
 * Check if any bot has already bought for this window
 * Returns the crypto that bought, or null if none
 */
export async function checkTradeLock(slug: string): Promise<string | null> {
  try {
    const redis = getRedis();
    const windowTs = getWindowTimestamp(slug);
    const key = `${TRADE_LOCK_PREFIX}${windowTs}`;

    return await redis.get(key);
  } catch (error: any) {
    logger.warn({ error: error.message, slug }, 'Failed to check trade lock');
    return null;
  }
}

export { Redis };

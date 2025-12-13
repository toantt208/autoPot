/**
 * Position Store
 *
 * Redis storage for tracking open positions for stop-loss monitoring.
 * Positions are stored with TTL and auto-expire after 1 hour.
 */

import { getRedis } from '../db/redis.js';
import { logger } from '../utils/logger.js';

// Position TTL in seconds (1 hour)
const POSITION_TTL_SECONDS = 3600;

/**
 * Position data stored in Redis after a successful buy
 */
export interface StoredPosition {
  /** Unique position key (xrp_{startTime}) */
  key: string;
  /** Side bought: 'UP' or 'DOWN' */
  sideBought: 'UP' | 'DOWN';
  /** Token ID of the token we bought */
  tokenIdBought: string;
  /** Amount in USDC that was spent */
  amount: number;
  /** Entry price when bought (0-1) */
  entryPrice: number;
  /** Whether this is a neg risk market */
  negRisk: boolean;
  /** Minimum tick size for orders */
  tickSize: string;
  /** Token ID for UP outcome (for price checking) */
  upTokenId: string;
  /** Token ID for DOWN outcome (for price checking) */
  downTokenId: string;
  /** Market slug */
  marketSlug: string;
  /** Unix timestamp: start of the 15-minute window */
  startTime: number;
  /** Unix timestamp: when market closes (determines resolution) */
  marketCloseTime: number;
  /** Unix timestamp: when position was created */
  createdAt: number;
}

/**
 * Generate position key: {prefix}_{startTime}
 */
export function getPositionKey(prefix: string, startTime: number): string {
  return `${prefix}_${startTime}`;
}

/**
 * Save position to Redis after successful buy
 * Key format: xrp_{startTime}
 * TTL: 1 hour (positions auto-expire)
 */
export async function savePosition(position: StoredPosition): Promise<void> {
  try {
    const client = getRedis();
    const data = JSON.stringify(position);
    await client.setex(position.key, POSITION_TTL_SECONDS, data);
    logger.debug({ key: position.key, ttl: POSITION_TTL_SECONDS }, 'Position saved to Redis');
  } catch (error: any) {
    logger.error({ error: error?.message, key: position.key }, 'Failed to save position to Redis');
    throw error;
  }
}

/**
 * Get a specific position by key
 */
export async function getPosition(key: string): Promise<StoredPosition | null> {
  try {
    const client = getRedis();
    const data = await client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as StoredPosition;
  } catch (error: any) {
    logger.error({ error: error?.message, key }, 'Failed to get position from Redis');
    return null;
  }
}

/**
 * Scan for all active positions with given prefix
 * Uses Redis SCAN to find keys matching pattern: {prefix}_*
 */
export async function getActivePositions(prefix: string): Promise<StoredPosition[]> {
  try {
    const client = getRedis();
    const pattern = `${prefix}_*`;
    const positions: StoredPosition[] = [];

    // Use SCAN to find all matching keys
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      // Get values for all found keys
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          try {
            const position = JSON.parse(data) as StoredPosition;
            positions.push(position);
          } catch (parseError) {
            logger.warn({ key }, 'Failed to parse position data');
          }
        }
      }
    } while (cursor !== '0');

    return positions;
  } catch (error: any) {
    logger.error({ error: error?.message, prefix }, 'Failed to get active positions from Redis');
    return [];
  }
}

/**
 * Delete position (after sell or expiration)
 */
export async function deletePosition(key: string): Promise<void> {
  try {
    const client = getRedis();
    await client.del(key);
    logger.debug({ key }, 'Position deleted from Redis');
  } catch (error: any) {
    logger.error({ error: error?.message, key }, 'Failed to delete position from Redis');
  }
}

/**
 * Check if position exists
 */
export async function positionExists(key: string): Promise<boolean> {
  try {
    const client = getRedis();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error: any) {
    logger.error({ error: error?.message, key }, 'Failed to check position existence');
    return false;
  }
}

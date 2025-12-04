/**
 * Polymarket Data API Client
 *
 * Fetches position data for redemption from the Data API.
 */

import { logger } from '../utils/logger.js';

const DATA_API_URL = 'https://data-api.polymarket.com';

export interface Position {
  /** Token ID (asset) */
  asset: string;
  /** Condition ID for the market */
  conditionId: string;
  /** Event ID */
  eventId: string;
  /** Market question/title */
  title: string;
  /** Outcome name (Yes/No or Up/Down) */
  outcome: string;
  /** Number of shares owned */
  size: number;
  /** Average entry price */
  avgPrice: number;
  /** Current price */
  curPrice: number;
  /** Current value in USDC */
  currentValue: number;
  /** Whether position can be redeemed (market resolved) */
  redeemable: boolean;
  /** Whether this is a negative risk market */
  negativeRisk: boolean;
  /** Market slug */
  slug: string;
}

/**
 * Fetch all positions for a user address
 */
export async function getPositions(userAddress: string): Promise<Position[]> {
  try {
    const url = `${DATA_API_URL}/positions?user=${userAddress}&sizeThreshold=0.01&limit=100`;

    logger.debug({ url }, 'Fetching positions from Data API');

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, 'Failed to fetch positions from Data API');
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      logger.warn({ data }, 'Unexpected response format from Data API');
      return [];
    }

    logger.debug({ count: data.length }, 'Positions fetched from Data API');

    return data as Position[];
  } catch (error) {
    logger.error({ error }, 'Error fetching positions from Data API');
    return [];
  }
}

/**
 * Fetch only redeemable positions for a user address
 */
export async function getRedeemablePositions(userAddress: string): Promise<Position[]> {
  const positions = await getPositions(userAddress);
  const redeemable = positions.filter((p) => p.redeemable);

  logger.info(
    { total: positions.length, redeemable: redeemable.length },
    'Filtered redeemable positions'
  );

  return redeemable;
}

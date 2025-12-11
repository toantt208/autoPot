/**
 * Polymarket Crypto Price API Client
 *
 * Fetches Chainlink prices (openPrice/closePrice) for crypto markets
 */

import { logger } from '../utils/logger.js';

const CRYPTO_PRICE_API = 'https://polymarket.com/api/crypto/crypto-price';

export interface CryptoPriceResponse {
  openPrice: number;
  closePrice: number | null;
  timestamp: number;
  completed: boolean;
  incomplete: boolean;
  cached: boolean;
}

/**
 * Map interval to API variant
 */
function getVariant(interval: number): string {
  switch (interval) {
    case 15:
      return 'fifteen';
    case 60:
      return 'hourly';
    default:
      return 'fifteen';
  }
}

/**
 * Fetch crypto price data from Polymarket API
 *
 * @param symbol - Crypto symbol (BTC, ETH, SOL, XRP)
 * @param eventStartTime - Market start time
 * @param endDate - Market end time
 * @param interval - Market interval in minutes (15, 60)
 */
export async function fetchCryptoPrice(
  symbol: string,
  eventStartTime: Date,
  endDate: Date,
  interval: number = 15
): Promise<CryptoPriceResponse | null> {
  const variant = getVariant(interval);
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    eventStartTime: eventStartTime.toISOString(),
    variant,
    endDate: endDate.toISOString(),
  });

  const url = `${CRYPTO_PRICE_API}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      logger.warn(
        { status: response.status, url },
        'Failed to fetch crypto price'
      );
      return null;
    }

    const data = await response.json() as CryptoPriceResponse;

    logger.debug(
      {
        symbol,
        openPrice: data.openPrice,
        closePrice: data.closePrice,
        completed: data.completed,
      },
      'Fetched crypto price'
    );

    return data;
  } catch (error) {
    logger.error({ error, symbol }, 'Error fetching crypto price');
    return null;
  }
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(
  beatPrice: number,
  finalPrice: number
): number {
  if (beatPrice === 0) return 0;
  return ((finalPrice - beatPrice) / beatPrice) * 100;
}

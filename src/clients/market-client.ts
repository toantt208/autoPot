/**
 * Market Client for Polymarket Gamma API
 *
 * Fetches market/event data from Gamma API.
 */

import { logger } from '../utils/logger.js';
import type { MarketData, TokenIds } from '../types/index.js';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

export class MarketClient {
  /**
   * Fetch event by slug from Gamma API
   */
  async getEventBySlug(slug: string): Promise<MarketData | null> {
    try {
      const url = `${GAMMA_API_URL}/events?slug=${encodeURIComponent(slug)}`;

      logger.info({ url, slug }, 'Requesting event from Gamma API');
      logger.debug({ url, slug }, 'Fetching event from Gamma API');

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        logger.warn(
          { status: response.status, slug },
          'Failed to fetch event from Gamma API'
        );
        return null;
      }

      const data = await response.json();

      // API returns an array, get first matching event
      if (!Array.isArray(data) || data.length === 0) {
        logger.debug({ slug }, 'Event not found in Gamma API');
        return null;
      }

      const event = data[0];
      logger.debug({ eventId: event.id, slug }, 'Event fetched from Gamma API');

      return event as MarketData;
    } catch (error) {
      logger.error({ error, slug }, 'Error fetching event from Gamma API');
      return null;
    }
  }

  /**
   * Parse a field that might be a JSON string or already an array
   */
  private parseJsonField<T>(field: T | string): T {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field) as T;
      } catch {
        return field as T;
      }
    }
    return field;
  }

  /**
   * Extract Up/Down token IDs from market data
   */
  extractTokenIds(market: MarketData): TokenIds | null {
    if (!market.markets || market.markets.length === 0) {
      logger.warn({ marketId: market.id }, 'No outcome markets found');
      return null;
    }

    // Get the first market (there's typically one market per event)
    const outcomeMarket = market.markets[0];

    // Parse clobTokenIds - it may be a JSON string like "[\"123\", \"456\"]"
    const clobTokenIds = this.parseJsonField<string[]>(outcomeMarket.clobTokenIds as unknown as string);
    const outcomes = this.parseJsonField<string[]>(outcomeMarket.outcomes as unknown as string);

    if (!clobTokenIds || clobTokenIds.length < 2) {
      logger.warn({ marketId: market.id, clobTokenIds }, 'Missing CLOB token IDs');
      return null;
    }

    if (!outcomes || outcomes.length < 2) {
      logger.warn({ marketId: market.id, outcomes }, 'Missing outcomes');
      return null;
    }

    logger.debug({ outcomes, clobTokenIds }, 'Parsed market data');

    // Find Up and Down token IDs based on outcome names
    let upTokenId: string | null = null;
    let downTokenId: string | null = null;

    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i].toLowerCase();
      const tokenId = clobTokenIds[i];

      if (outcome === 'up' || outcome.includes('up')) {
        upTokenId = tokenId;
      } else if (outcome === 'down' || outcome.includes('down')) {
        downTokenId = tokenId;
      }
    }

    if (!upTokenId || !downTokenId) {
      // Fallback: assume first is Up, second is Down
      logger.debug(
        { outcomes },
        'Using fallback token ID mapping'
      );
      upTokenId = clobTokenIds[0];
      downTokenId = clobTokenIds[1];
    }

    const negRisk = outcomeMarket.negRisk ?? false;
    const tickSize = outcomeMarket.orderPriceMinTickSize ?? '0.01';
    logger.debug({ upTokenId, downTokenId, negRisk, tickSize }, 'Token IDs extracted');

    return { up: upTokenId, down: downTokenId, negRisk, tickSize };
  }

  /**
   * Get event and extract token IDs in one call
   */
  async getMarketTokenIds(slug: string): Promise<{ market: MarketData; tokenIds: TokenIds } | null> {
    const market = await this.getEventBySlug(slug);
    if (!market) {
      return null;
    }

    const tokenIds = this.extractTokenIds(market);
    if (!tokenIds) {
      return null;
    }

    return { market, tokenIds };
  }

  /**
   * Check if a market is still open
   */
  isMarketOpen(market: MarketData): boolean {
    return !market.closed;
  }

  /**
   * Get current prices from market data (best-effort from cached data)
   */
  getCurrentPrices(market: MarketData): { upPrice: number; downPrice: number } | null {
    if (!market.markets || market.markets.length === 0) {
      return null;
    }

    const outcomeMarket = market.markets[0];

    // Parse JSON string fields
    const outcomePrices = this.parseJsonField<string[]>(outcomeMarket.outcomePrices as unknown as string);
    const outcomes = this.parseJsonField<string[]>(outcomeMarket.outcomes as unknown as string);

    if (!outcomePrices || outcomePrices.length < 2) {
      return null;
    }

    // outcomePrices corresponds to outcomes array
    let upPrice = 0;
    let downPrice = 0;

    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i].toLowerCase();
      const price = parseFloat(outcomePrices[i]);

      if (outcome === 'up' || outcome.includes('up')) {
        upPrice = price;
      } else if (outcome === 'down' || outcome.includes('down')) {
        downPrice = price;
      }
    }

    // Fallback
    if (upPrice === 0 && downPrice === 0) {
      upPrice = parseFloat(outcomePrices[0]);
      downPrice = parseFloat(outcomePrices[1]);
    }

    return { upPrice, downPrice };
  }
}

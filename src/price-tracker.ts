/**
 * Price Tracker Process
 *
 * Standalone process that listens to Polymarket RTDS WebSocket
 * and stores token prices to database for tracking.
 *
 * Usage: node dist/price-tracker.js
 */

import { RTDSClient, CryptoPriceUpdate } from './clients/rtds-client.js';
import { prisma } from './db/prisma.js';
import { logger } from './utils/logger.js';
import { savePrice } from './services/redis-price-service.js';
import { disconnectRedis } from './db/redis.js';

// Symbols to track
const TRACK_SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP'];

/**
 * Handle price update from RTDS - save to DB and Redis
 */
async function handlePriceUpdate(update: CryptoPriceUpdate, source: string): Promise<void> {
  if (!TRACK_SYMBOLS.includes(update.symbol)) return;

  try {
    // Save to Redis for quick access
    await savePrice(update.symbol, update.price, update.timestamp);

    // Save to DB for historical records
    await prisma.tokenPrice.create({
      data: {
        symbol: update.symbol,
        price: update.price,
        source,
        timestamp: new Date(update.timestamp),
      },
    });

    logger.debug(
      {
        symbol: update.symbol,
        price: update.price.toFixed(4),
        source,
      },
      'Price saved'
    );
  } catch (error: any) {
    logger.error({ error: error.message, symbol: update.symbol }, 'Failed to save price');
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  logger.info({ symbols: TRACK_SYMBOLS }, 'Starting Price Tracker...');

  // Create RTDS client
  const rtds = new RTDSClient();

  // Handle price updates
  rtds.on('price', (update: CryptoPriceUpdate) => {
    handlePriceUpdate(update, 'chainlink');
  });

  rtds.on('connected', () => {
    logger.info('Connected to RTDS, subscribing to price feeds...');
    rtds.subscribeCryptoPrices(TRACK_SYMBOLS);
  });

  rtds.on('disconnected', () => {
    logger.warn('Disconnected from RTDS, will auto-reconnect...');
  });

  rtds.on('error', (error: Error) => {
    logger.error({ error: error.message }, 'RTDS error');
  });

  // Connect to RTDS
  rtds.connect();

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down Price Tracker...');
    rtds.disconnect();
    await disconnectRedis();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive
  logger.info('Price Tracker running. Press Ctrl+C to stop.');
}

main().catch((error) => {
  logger.error({ error: error.message }, 'Price Tracker failed');
  process.exit(1);
});

/**
 * Polymarket Auto-Trading Bot
 *
 * Single entry point for all trading events.
 * Usage: node dist/index.js <event_type>
 * Events: btc_15m, eth_15m, sol_15m, xrp_15m, btc_1h, eth_1h, sol_1h
 */

import { getEventConfig, listEvents } from './config/events.js';
import { runBot } from './bot.js';
import { logger } from './utils/logger.js';

const eventType = process.argv[2];

if (!eventType) {
  console.error('Usage: node dist/index.js <event_type>');
  console.error(`Events: ${listEvents().join(', ')}`);
  process.exit(1);
}

let eventConfig;
try {
  eventConfig = getEventConfig(eventType);
} catch (error: any) {
  console.error(error.message);
  process.exit(1);
}

logger.info({ eventType, ...eventConfig }, 'Starting bot with event config');

runBot({ eventConfig }).catch((error) => {
  logger.fatal({ error }, 'Fatal error');
  process.exit(1);
});

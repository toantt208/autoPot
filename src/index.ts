/**
 * Polymarket Auto-Trading Bot
 *
 * Single entry point for all trading events.
 * Usage: node dist/index.js <event_type> [strategy]
 * Events: btc_15m, eth_15m, sol_15m, xrp_15m, btc_1h, eth_1h, sol_1h
 * Strategies: fallback (default), ninetynine
 */

import { getEventConfig, listEvents } from './config/events.js';
import { runBot, type StrategyType } from './bot.js';
import { logger } from './utils/logger.js';

const VALID_STRATEGIES: StrategyType[] = ['fallback', 'ninetynine'];

const eventType = process.argv[2];
const strategyArg = process.argv[3] as StrategyType | undefined;

if (!eventType) {
  console.error('Usage: node dist/index.js <event_type> [strategy]');
  console.error(`Events: ${listEvents().join(', ')}`);
  console.error(`Strategies: ${VALID_STRATEGIES.join(', ')} (default: fallback)`);
  process.exit(1);
}

const strategy: StrategyType = strategyArg && VALID_STRATEGIES.includes(strategyArg)
  ? strategyArg
  : 'fallback';

if (strategyArg && !VALID_STRATEGIES.includes(strategyArg)) {
  console.warn(`Unknown strategy "${strategyArg}", using fallback`);
}

let eventConfig;
try {
  eventConfig = getEventConfig(eventType);
} catch (error: any) {
  console.error(error.message);
  process.exit(1);
}

logger.info({ eventType, strategy, ...eventConfig }, 'Starting bot with event config');

runBot({ eventConfig, strategy }).catch((error) => {
  logger.fatal({ error }, 'Fatal error');
  process.exit(1);
});

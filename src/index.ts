/**
 * Polymarket Auto-Trading Bot
 *
 * Single entry point for all trading events.
 * Usage: node dist/index.js <event_type> [strategy] [martingale_options]
 * Events: btc_15m, eth_15m, sol_15m, xrp_15m, btc_1h, eth_1h, sol_1h
 * Strategies: fallback (default), ninetynine, martingale
 *
 * Martingale usage:
 *   node dist/index.js btc_15m martingale UP 1
 *   (bet on UP with $1 base bet)
 */

import { getEventConfig, listEvents } from './config/events.js';
import { runBot, type StrategyType } from './bot.js';
import { logger } from './utils/logger.js';

const VALID_STRATEGIES: StrategyType[] = ['fallback', 'ninetynine', 'martingale', 'higherside', 'scalp60'];

const eventType = process.argv[2];
const strategyArg = process.argv[3] as StrategyType | undefined;

// Martingale options: [side] [baseBet]
const martingaleSide = process.argv[4]?.toUpperCase() as 'UP' | 'DOWN' | undefined;
const martingaleBaseBet = parseFloat(process.argv[5]) || 1;

if (!eventType) {
  console.error('Usage: node dist/index.js <event_type> [strategy] [martingale_side] [base_bet]');
  console.error(`Events: ${listEvents().join(', ')}`);
  console.error(`Strategies: ${VALID_STRATEGIES.join(', ')} (default: fallback)`);
  console.error('');
  console.error('Martingale example:');
  console.error('  node dist/index.js btc_15m martingale UP 1');
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

// Build martingale options if using martingale strategy
const martingaleOptions = strategy === 'martingale'
  ? {
      targetSide: (martingaleSide === 'UP' || martingaleSide === 'DOWN') ? martingaleSide : 'UP',
      baseBet: martingaleBaseBet,
    }
  : undefined;

if (strategy === 'martingale') {
  logger.info(
    { eventType, strategy, targetSide: martingaleOptions?.targetSide, baseBet: martingaleOptions?.baseBet },
    'Starting Martingale bot'
  );
} else {
  logger.info({ eventType, strategy, ...eventConfig }, 'Starting bot with event config');
}

runBot({ eventConfig, strategy, martingale: martingaleOptions }).catch((error) => {
  logger.fatal({ error }, 'Fatal error');
  process.exit(1);
});

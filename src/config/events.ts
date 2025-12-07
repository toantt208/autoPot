/**
 * Event Configuration
 *
 * Defines all supported trading events and their configurations.
 */

export interface EventConfig {
  crypto: string;
  interval: number; // minutes
  tradingWindowSeconds: number;
  /** Full name for slug generation (e.g., 'bitcoin' for 1h markets) */
  slugName: string;
  /** Slug format: '15m' = btc-updown-15m-{timestamp}, '1h' = bitcoin-up-or-down-{date}-{time}-et */
  slugFormat: '15m' | '1h';
}

export const EVENTS: Record<string, EventConfig> = {
  // 15-minute markets
  btc_15m: { crypto: 'btc', interval: 15, tradingWindowSeconds: 88, slugName: 'btc', slugFormat: '15m' },
  eth_15m: { crypto: 'eth', interval: 15, tradingWindowSeconds: 88, slugName: 'eth', slugFormat: '15m' },
  sol_15m: { crypto: 'sol', interval: 15, tradingWindowSeconds: 88, slugName: 'sol', slugFormat: '15m' },
  xrp_15m: { crypto: 'xrp', interval: 15, tradingWindowSeconds: 30, slugName: 'xrp', slugFormat: '15m' },
  // 1-hour markets
  btc_1h: { crypto: 'btc', interval: 60, tradingWindowSeconds: 88, slugName: 'bitcoin', slugFormat: '1h' },
  eth_1h: { crypto: 'eth', interval: 60, tradingWindowSeconds: 88, slugName: 'ethereum', slugFormat: '1h' },
  sol_1h: { crypto: 'sol', interval: 60, tradingWindowSeconds: 88, slugName: 'solana', slugFormat: '1h' },
  xrp_1h: { crypto: 'xrp', interval: 60, tradingWindowSeconds: 30, slugName: 'xrp', slugFormat: '1h' },
};

export function getEventConfig(eventType: string): EventConfig {
  const config = EVENTS[eventType];
  if (!config) {
    throw new Error(`Unknown event type: ${eventType}. Valid: ${Object.keys(EVENTS).join(', ')}`);
  }
  return config;
}

export function listEvents(): string[] {
  return Object.keys(EVENTS);
}

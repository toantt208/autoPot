/**
 * Configuration module with Zod validation
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file (or custom path from DOTENV_CONFIG_PATH)
const envPath = process.env.DOTENV_CONFIG_PATH;
dotenv.config({ path: envPath, override: false });

const configSchema = z.object({
  // Wallet & Auth
  MASTER_PRIVATE_KEY: z.string().min(64, 'Private key required (64+ chars)'),
  GNOSIS_SAFE_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Valid Safe address required'),

  // CLOB API Credentials
  CLOB_API_KEY: z.string().min(1, 'CLOB API key required'),
  CLOB_SECRET: z.string().min(1, 'CLOB secret required'),
  CLOB_PASSPHRASE: z.string().min(1, 'CLOB passphrase required'),

  // Builder API Credentials (for relayer redemption)
  BUILDER_API_KEY: z.string().min(1, 'Builder API key required'),
  BUILDER_SECRET: z.string().min(1, 'Builder secret required'),
  BUILDER_PASSPHRASE: z.string().min(1, 'Builder passphrase required'),

  // Trading Parameters
  BET_AMOUNT_USDC: z.coerce.number().positive().default(10),
  MIN_PRICE_THRESHOLD: z.coerce.number().min(0.90).max(1).default(0.99),
  MIN_HIGHER_SIDE_PRICE: z.coerce.number().min(0.50).max(0.99).default(0.60),

  // Target Markets
  TARGET_CRYPTOS: z.string().default('btc,eth,sol'),

  // Timing Configuration (in seconds)
  // Default trading window for all cryptos (fallback)
  TRADING_WINDOW_SECONDS: z.coerce.number().int().positive().default(10),
  // Per-crypto trading windows: "btc:60,eth:10,sol:10"
  TRADING_WINDOWS: z.string().optional(),

  // RPC
  POLYGON_RPC_URL: z.string().url().default('https://polygon-rpc.com'),

  // Bot behavior
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DRY_RUN: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
  IS_SERVER: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
  SKIP_TX_CONFIRMATION: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
});

// Stats-only config (no trading credentials required)
const statsConfigSchema = z.object({
  // CLOB API Credentials (read-only access for prices)
  CLOB_API_KEY: z.string().default(''),
  CLOB_SECRET: z.string().default(''),
  CLOB_PASSPHRASE: z.string().default(''),

  // Target Markets
  TARGET_CRYPTOS: z.string().default('btc,eth,sol'),

  // Timing Configuration (in seconds)
  TRADING_WINDOW_SECONDS: z.coerce.number().int().positive().default(10),
  TRADING_WINDOWS: z.string().optional(),

  // RPC
  POLYGON_RPC_URL: z.string().url().default('https://polygon-rpc.com'),

  // Bot behavior
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof configSchema>;
export type StatsConfig = z.infer<typeof statsConfigSchema>;

let cachedConfig: Config | null = null;
let cachedStatsConfig: StatsConfig | null = null;

/**
 * Get validated configuration from environment variables
 * @throws Error if validation fails
 */
export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = configSchema.parse(process.env);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
      );
      throw new Error(`Configuration validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Get stats-only configuration (no trading credentials required)
 */
export function getStatsConfig(): StatsConfig {
  if (cachedStatsConfig) {
    return cachedStatsConfig;
  }

  try {
    cachedStatsConfig = statsConfigSchema.parse(process.env);
    return cachedStatsConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
      );
      throw new Error(`Stats configuration validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Get target cryptos as an array
 */
export function getTargetCryptos(config: Config): string[] {
  return config.TARGET_CRYPTOS.split(',').map((c) => c.trim().toLowerCase());
}

/**
 * Parse per-crypto trading windows from config
 * Format: "btc:60,eth:10,sol:10"
 */
function parseTradingWindows(config: Config): Map<string, number> {
  const windows = new Map<string, number>();

  if (config.TRADING_WINDOWS) {
    const pairs = config.TRADING_WINDOWS.split(',');
    for (const pair of pairs) {
      const [crypto, seconds] = pair.trim().split(':');
      if (crypto && seconds) {
        const parsedSeconds = parseInt(seconds, 10);
        if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
          windows.set(crypto.toLowerCase(), parsedSeconds);
        }
      }
    }
  }

  return windows;
}

// Cache for parsed trading windows
let tradingWindowsCache: Map<string, number> | null = null;

/**
 * Get the trading window duration for a specific crypto
 * Falls back to TRADING_WINDOW_SECONDS if not specified
 */
export function getTradingWindowSeconds(config: Config, crypto: string): number {
  if (!tradingWindowsCache) {
    tradingWindowsCache = parseTradingWindows(config);
  }

  const cryptoLower = crypto.toLowerCase();
  return tradingWindowsCache.get(cryptoLower) ?? config.TRADING_WINDOW_SECONDS;
}

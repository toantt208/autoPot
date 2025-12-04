/**
 * Post-Event Buy Script
 *
 * Monitors markets AFTER event time ends but before Polymarket closes them.
 * Buys the higher side if market is still open (closed: false, acceptingOrders: true).
 *
 * Usage: node dist/post-buy.js <event_type>
 * Example: node dist/post-buy.js btc_15m
 */

import { getConfig } from './config/index.js';
import { getEventConfig, listEvents } from './config/events.js';
import { TradingClient } from './clients/trading-client.js';
import { MarketClient } from './clients/market-client.js';
import { getCurrentMarketStartTimestamp, generateSlug } from './services/market-timing.js';
import { getCachedPrice } from './services/price-cache.js';
import { logger } from './utils/logger.js';

const ACTIVATE_BEFORE_CLOSE_SECONDS = 2; // Start 2 seconds before market end time

const BET_AMOUNT = 1; // 1 USDC per trade

interface MarketStatus {
  closed: boolean;
  acceptingOrders: boolean;
}

async function getMarketStatus(slug: string): Promise<MarketStatus | null> {
  try {
    const url = `https://gamma-api.polymarket.com/events/slug/${encodeURIComponent(slug)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { closed?: boolean; acceptingOrders?: boolean };
    return {
      closed: data.closed ?? true,
      acceptingOrders: true,
    };
  } catch (error) {
    logger.debug({ error, slug }, 'Failed to fetch market status');
    return null;
  }
}

async function buyUntilClosed(
  tradingClient: TradingClient,
  marketClient: MarketClient,
  slug: string
): Promise<void> {
  // Get market data for token IDs (once)
  const marketData = await marketClient.getMarketTokenIds(slug);
  if (!marketData) {
    logger.warn({ slug }, 'Could not fetch market data');
    return;
  }

  const { tokenIds } = marketData;

  console.log("HEREE")
  // Get prices (once)
  let [upPrice, downPrice] = await Promise.all([
    tradingClient.getBuyPrice(tokenIds.up),
    tradingClient.getBuyPrice(tokenIds.down),
  ]).catch((err: Error) => {
    logger.warn({ error: err.message, slug }, 'Error fetching CLOB prices');
    return [0, 0];
  });

  const higherSide = upPrice >= downPrice ? 'UP' : 'DOWN';
  const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;
  const higherPrice = Math.max(upPrice, downPrice);

  if (Number(higherPrice) === 0) {
    logger.warn({ slug }, 'Both token prices are zero, cannot proceed with buying');
    // return;
  }
  console.log(112312)
  logger.info(
    {
      slug,
      up: `${(upPrice * 100).toFixed(2)}%`,
      down: `${(downPrice * 100).toFixed(2)}%`,
      buying: higherSide,
    },
    'Starting buy loop'
  );

  // Loop: place orders until market is closed
  while (true) {
    // Check if orderbook exists before trying to buy
    const orderbookExists = await tradingClient.orderbookExists(higherTokenId);
    if (!orderbookExists) {
      logger.info({ slug, tokenId: higherTokenId.slice(0, 20) + '...' }, 'No orderbook exists, exiting');
      return;
    }

    // Try to place order
    try {
      const result = await tradingClient.marketBuy({
        tokenId: higherTokenId,
        amount: BET_AMOUNT,
        negRisk: tokenIds.negRisk,
        tickSize: tokenIds.tickSize,
      });

      logger.info(
        {
          orderId: result.orderID,
          status: result.status,
          side: higherSide,
          price: `${(higherPrice * 100).toFixed(2)}%`,
        },
        'Order placed'
      );
    } catch (error: any) {
      logger.warn({ error: error?.message }, 'Order failed');
    }

    // Check if market is closed
    const status = await getMarketStatus(slug);
    if (!status || status.closed) {
      logger.info({ slug }, 'Market closed, exiting buy loop');
      return;
    }
  }
}

async function main() {
  const eventType = process.argv[2];

  if (!eventType) {
    console.error('Usage: node dist/post-buy.js <event_type>');
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

  logger.info({ eventType, ...eventConfig }, 'Starting post-event buyer');

  const config = getConfig();

  if (config.DRY_RUN) {
    logger.warn('DRY RUN MODE - No real trades will be executed');
  }

  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

  // Track which markets are closed (don't check again)
  const closedMarkets = new Set<string>();

  // Graceful shutdown
  let isShuttingDown = false;
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info('Shutting down');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info('Entering main loop...');

  // On startup, check if previous market is still open
  {
    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds = eventConfig.interval * 60;
    const currentStart = getCurrentMarketStartTimestamp(eventConfig.interval, now);
    const previousStart = currentStart - intervalSeconds;
    const previousSlug = generateSlug(eventConfig.slugName, eventConfig.slugFormat, previousStart);

    logger.info({ slug: previousSlug }, 'Checking previous market on startup...');
    const previousStatus = await getMarketStatus(previousSlug);

    if (previousStatus && !previousStatus.closed) {
      logger.info({ slug: previousSlug }, 'Previous market still open! Starting to buy...');
      await buyUntilClosed(tradingClient, marketClient, previousSlug);
      closedMarkets.add(previousSlug);
    } else {
      logger.info({ slug: previousSlug, closed: previousStatus?.closed ?? 'not found' }, 'Previous market closed');
    }
  }

  while (!isShuttingDown) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const intervalSeconds = eventConfig.interval * 60;

      // Calculate current window
      const startTime = getCurrentMarketStartTimestamp(eventConfig.interval, now);
      const endTime = startTime + intervalSeconds; // Actual end time (no buffer)
      const slug = generateSlug(eventConfig.slugName, eventConfig.slugFormat, startTime);

      // Skip if this market was already closed
      if (closedMarkets.has(slug)) {
        // Wait until next window
        const nextWindowStart = startTime + intervalSeconds;
        const waitTime = Math.max(1, nextWindowStart - now);
        logger.debug({ slug, waitTime }, 'Market already closed, waiting for next window');
        await new Promise((r) => setTimeout(r, waitTime * 1000));
        continue;
      }

      // Calculate when to activate (2 seconds before end)
      const activateTime = endTime - ACTIVATE_BEFORE_CLOSE_SECONDS;
      const timeUntilActivate = activateTime - now;

      // If not yet time to activate, wait
      if (timeUntilActivate > 0) {
        logger.info(
          { slug, activateIn: `${timeUntilActivate}s`, endTime: new Date(endTime * 1000).toISOString() },
          'Waiting to activate'
        );
        await new Promise((r) => setTimeout(r, Math.min(timeUntilActivate * 1000, 30_000)));
        continue;
      }

      // Time to activate - start buying until closed
      logger.info({ slug }, 'Activating! Starting to buy...');
      await buyUntilClosed(tradingClient, marketClient, slug);
      closedMarkets.add(slug);

    } catch (error) {
      logger.error({ error }, 'Error in main loop');
    }
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error');
  process.exit(1);
});

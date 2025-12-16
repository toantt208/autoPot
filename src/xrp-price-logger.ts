/**
 * XRP Price Logger
 *
 * Logs XRP prices during full 15-minute windows for analysis.
 * Tracks beat price, current price, diff, and market prices.
 *
 * Usage: node dist/xrp-price-logger.js
 */

import { getEventConfig } from './config/events.js';
import { MarketClient } from './clients/market-client.js';
import { calculateMarketWindow } from './services/market-timing.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import { prisma } from './db/index.js';

const POLL_INTERVAL_MS = 1000; // Log every second

/**
 * Fetch market prices
 */
async function fetchMarketPrices(
  upTokenId: string,
  downTokenId: string
): Promise<{ upPrice: number; downPrice: number }> {
  const response = await fetch('https://clob.polymarket.com/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { token_id: upTokenId, side: 'BUY' },
      { token_id: downTokenId, side: 'BUY' },
    ]),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as Record<string, { BUY?: string }>;
  const upPrice = parseFloat(data[upTokenId]?.BUY || '0');
  const downPrice = parseFloat(data[downTokenId]?.BUY || '0');

  return { upPrice, downPrice };
}

/**
 * Get latest XRP token price from database
 */
async function getLatestTokenPrice(): Promise<number | null> {
  const result = await prisma.tokenPrice.findFirst({
    where: { symbol: 'XRP' },
    orderBy: { timestamp: 'desc' },
  });

  return result ? Number(result.price) : null;
}

/**
 * Fetch beat price (openPrice) from Polymarket crypto-price API
 * Retries until openPrice is available (Polymarket has delay defining beat price)
 */
async function fetchBeatPrice(startTime: number, endTime: number): Promise<number | null> {
  // API requires format without milliseconds (2025-12-14T11:30:00Z not 2025-12-14T11:30:00.000Z)
  const eventStartTime = new Date(startTime * 1000).toISOString().replace('.000Z', 'Z');
  const endDate = new Date(endTime * 1000).toISOString().replace('.000Z', 'Z');
  const url = `https://polymarket.com/api/crypto/crypto-price?symbol=XRP&eventStartTime=${eventStartTime}&variant=fifteen&endDate=${endDate}`;

  const maxRetries = 120; // Retry for up to 2 minutes
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info({ url, attempt }, 'Calling crypto-price API');

      const response = await fetch(url);
      if (!response.ok) {
        logger.warn({ status: response.status, attempt }, 'crypto-price API failed');
        await sleep(retryDelay);
        continue;
      }

      const data = (await response.json()) as { openPrice?: number | null };

      if (data?.openPrice != null) {
        logger.info({ openPrice: data.openPrice, attempt }, 'Beat price fetched');
        return data.openPrice;
      }

      logger.info({ attempt }, 'openPrice is null, retrying...');
      await sleep(retryDelay);
    } catch (err: any) {
      logger.error({ error: err.message, attempt }, 'crypto-price API error');
      await sleep(retryDelay);
    }
  }

  logger.error({ maxRetries }, 'Failed to fetch beat price after max retries');
  return null;
}

/**
 * Check if we're in the market window
 */
function isInWindow(startTime: number, endTime: number, now: number): boolean {
  return now >= startTime && now < endTime;
}

/**
 * Main loop for a single window
 */
async function logWindow(
  marketClient: MarketClient,
  windowSlug: string,
  startTime: number,
  endTime: number,
  marketCloseTime: number
): Promise<void> {
  const marketData = await marketClient.getMarketTokenIds(windowSlug);
  if (!marketData) {
    logger.warn({ slug: windowSlug }, 'Could not fetch market data');
    return;
  }

  const tokenIds = marketData.tokenIds;

  // Get beat price at start (use marketCloseTime, not endTime which includes buffer)
  logger.info({
    startTime: new Date(startTime * 1000).toISOString(),
    marketCloseTime: new Date(marketCloseTime * 1000).toISOString(),
  }, 'Fetching beat price...');

  const beatPrice = await fetchBeatPrice(startTime, marketCloseTime);
  if (!beatPrice) {
    logger.warn({ slug: windowSlug }, 'Could not fetch beat price');
    return;
  }

  logger.info(
    {
      slug: windowSlug,
      beatPrice: beatPrice.toFixed(4),
      startTime: new Date(startTime * 1000).toISOString(),
      endTime: new Date(endTime * 1000).toISOString(),
    },
    'Starting XRP price logging'
  );

  // Log prices until window ends
  while (Math.floor(Date.now() / 1000) < endTime + 5) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = marketCloseTime - now;

      const { upPrice, downPrice } = await fetchMarketPrices(tokenIds.up, tokenIds.down);
      const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';
      const tokenPrice = await getLatestTokenPrice();

      if (tokenPrice === null) {
        logger.warn('No token price available - is price-tracker running?');
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      const priceDiff = tokenPrice - beatPrice;
      const priceDiffPct = (priceDiff / beatPrice) * 100;

      // Save to database immediately
      await prisma.xrpPriceLog.create({
        data: {
          windowSlug,
          timestamp: new Date(),
          timeLeft,
          beatPrice,
          tokenPrice,
          priceDiff,
          priceDiffPct,
          upPrice,
          downPrice,
          higherSide,
        },
      });

      // Log to console
      const timeStr = timeLeft >= 0 ? `T-${timeLeft}s` : `T+${Math.abs(timeLeft)}s`;
      const diffSign = priceDiff >= 0 ? '+' : '';

      logger.info(
        {
          time: timeStr,
          beat: `$${beatPrice.toFixed(4)}`,
          current: `$${tokenPrice.toFixed(4)}`,
          diff: `${diffSign}$${priceDiff.toFixed(4)}`,
          diffPct: `${diffSign}${priceDiffPct.toFixed(3)}%`,
          up: `${(upPrice * 100).toFixed(1)}%`,
          down: `${(downPrice * 100).toFixed(1)}%`,
          higher: higherSide,
        },
        'XRP'
      );

      await sleep(POLL_INTERVAL_MS);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error fetching prices');
      await sleep(POLL_INTERVAL_MS);
    }
  }

  logger.info({ slug: windowSlug }, 'Window logging complete');
}
async function main(): Promise<void> {
  const eventConfig = getEventConfig('xrp_15m');

  logger.info('Starting XRP Price Logger');
  logger.info('Make sure price-tracker is running for XRP token prices');

  const marketClient = new MarketClient();
  const processedWindows = new Set<string>();

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info('Shutting down XRP Price Logger...');
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Main loop
  while (!isShuttingDown) {
    const now = Math.floor(Date.now() / 1000);
    const window = calculateMarketWindow(eventConfig, now);

    // Check if we're in a window we haven't processed
    if (isInWindow(window.startTime, window.endTime, now) && !processedWindows.has(window.slug)) {
      processedWindows.add(window.slug);

      await logWindow(
        marketClient,
        window.slug,
        window.startTime,
        window.endTime,
        window.marketCloseTime
      );
    } else if (!isInWindow(window.startTime, window.endTime, now)) {
      // Wait for next window
      const timeUntilNext = window.startTime - now;
      if (timeUntilNext > 0 && timeUntilNext % 60 === 0) {
        logger.info(
          {
            nextWindow: window.slug,
            startsIn: `${timeUntilNext}s`,
          },
          'Waiting for next window...'
        );
      }
    }

    await sleep(1000);
  }
}

main().catch((error) => {
  logger.error({ error: error.message }, 'XRP Price Logger failed');
  process.exit(1);
});

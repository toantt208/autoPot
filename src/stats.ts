/**
 * Price Statistics Collector
 *
 * Monitors prices during trading windows and collects stats:
 * - Price history during Phase 1 and Phase 2
 * - Side flips (when higher side changes)
 * - Win rate calculation
 *
 * Usage: node dist/stats.js <event_type>
 */

import { getEventConfig } from './config/events.js';
import { MarketClient } from './clients/market-client.js';
import { getRTDSClient, RTDSClient } from './clients/rtds-client.js';
import {
  fetchCryptoPrice,
  calculatePriceChange,
} from './services/crypto-price-api.js';
import {
  calculateMarketWindow,
  formatWindowInfo,
} from './services/market-timing.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import * as fs from 'fs';
import { prisma } from './db/index.js';

const STATS_WINDOW_SECS = 300;    // Collect prices for last 5 minutes
const FALLBACK_WINDOW_SECS = 10;
const RETRY_AFTER_CLOSE_SECS = 5;
const POLL_INTERVAL_MS = 500;

/**
 * Fetch market prices without requiring full trading credentials
 * Uses the public CLOB prices endpoint
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

  const data = await response.json() as Record<string, { BUY?: string; SELL?: string }>;

  // Response format: { "token_id": { "BUY": "0.7", "SELL": "0.8" }, ... }
  const upPrice = parseFloat(data[upTokenId]?.BUY || '0');
  const downPrice = parseFloat(data[downTokenId]?.BUY || '0');

  return { upPrice, downPrice };
}

interface PriceSnapshot {
  timestamp: number;
  timeLeft: number;
  upPrice: number;
  downPrice: number;
  higherSide: 'UP' | 'DOWN';
  phase: 'phase1' | 'phase2' | 'retry';
  tokenPrice: number | null; // Real-time Chainlink price from RTDS
  beatPrice: number | null;  // Chainlink openPrice (beat price) for reference
}

interface FlipEvent {
  timestamp: number;
  timeLeft: number;
  fromSide: 'UP' | 'DOWN';
  toSide: 'UP' | 'DOWN';
  priceAtFlip: number;
  wasAt98: boolean;
}

const SIM_TRADE_AMOUNT = 10; // $10 per trade

interface SimulatedTrade {
  side: 'UP' | 'DOWN';
  entryPrice: number;
  exitPrice: number;
  won: boolean;
  profitPercent: number;
  amount: number;      // Bet amount in USD
  shares: number;      // Shares bought = amount / entryPrice
  payout: number;      // Payout = shares if win, 0 if lose
  profitUsd: number;   // Profit/loss in USD
}

interface WindowStats {
  slug: string;
  startTime: string;
  endTime: string;
  snapshots: PriceSnapshot[];
  sideFlips: number;
  flipsAt98: number;
  flipTimestamps: number[];
  flipEvents: FlipEvent[];
  finalSide: 'UP' | 'DOWN' | null;
  phase1FinalSide: 'UP' | 'DOWN' | null;
  phase2FinalSide: 'UP' | 'DOWN' | null;
  wouldHaveWon: boolean | null;
  simulatedTrade: SimulatedTrade | null;
  beatPrice: number | null;      // Chainlink openPrice at window start
  finalPrice: number | null;     // Chainlink closePrice at window end
  priceChange: number | null;    // % change
}

interface SessionStats {
  crypto: string;
  interval: string;
  windows: WindowStats[];
  totalWindows: number;
  totalFlips: number;
  avgFlipsPerWindow: number;
  winRate: number;
  wins: number;
  losses: number;
}

function getPhase(now: number, fallbackStart: number, marketCloseTime: number): 'phase1' | 'phase2' | 'retry' {
  if (now < fallbackStart) return 'phase1';
  if (now < marketCloseTime) return 'phase2';
  return 'retry';
}

/**
 * Check if we're in the stats collection window (last 5 minutes before close + retry period)
 */
function isInStatsWindow(window: MarketWindow, now: number): boolean {
  const statsWindowStart = window.marketCloseTime - STATS_WINDOW_SECS;
  return now >= statsWindowStart && now < window.endTime;
}

interface MarketWindow {
  slug: string;
  startTime: number;
  marketCloseTime: number;
  endTime: number;
  tradingWindowStart: number;
}

/**
 * Save window stats to PostgreSQL database
 */
async function saveWindowStatsToDb(
  windowStats: WindowStats,
  eventSlug: string,
  crypto: string,
  interval: string
): Promise<void> {
  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx: any) => {
      // 1. Create the window record
      const window = await tx.statsWindow.create({
        data: {
          marketSlug: windowStats.slug,
          eventSlug,
          crypto: crypto.toUpperCase(),
          interval,
          startTime: new Date(windowStats.startTime),
          endTime: new Date(windowStats.endTime),
          sideFlips: windowStats.sideFlips,
          flipsAt98: windowStats.flipsAt98,
          phase1FinalSide: windowStats.phase1FinalSide,
          phase2FinalSide: windowStats.phase2FinalSide,
          finalSide: windowStats.finalSide,
          wouldHaveWon: windowStats.wouldHaveWon,
          beatPrice: windowStats.beatPrice,
          finalPrice: windowStats.finalPrice,
          priceChange: windowStats.priceChange,
        },
      });

      // 2. Create price snapshots in bulk
      if (windowStats.snapshots.length > 0) {
        await tx.statsPriceSnapshot.createMany({
          data: windowStats.snapshots.map((s) => ({
            windowId: window.id,
            timestamp: new Date(s.timestamp * 1000),
            timeLeft: s.timeLeft,
            upPrice: s.upPrice,
            downPrice: s.downPrice,
            higherSide: s.higherSide,
            phase: s.phase,
            tokenPrice: s.tokenPrice,
            beatPrice: s.beatPrice,
          })),
        });
      }

      // 3. Create side flip records from flipEvents
      for (const flip of windowStats.flipEvents) {
        await tx.statsSideFlip.create({
          data: {
            windowId: window.id,
            timestamp: new Date(flip.timestamp * 1000),
            timeLeft: flip.timeLeft,
            fromSide: flip.fromSide,
            toSide: flip.toSide,
            priceAtFlip: flip.priceAtFlip,
            wasAt98: flip.wasAt98,
          },
        });
      }

      // 4. Create simulated trade record if applicable
      if (windowStats.simulatedTrade) {
        await tx.statsSimulatedTrade.create({
          data: {
            windowId: window.id,
            marketSlug: windowStats.slug,
            eventSlug,
            crypto: crypto.toUpperCase(),
            side: windowStats.simulatedTrade.side,
            entryPrice: windowStats.simulatedTrade.entryPrice,
            exitPrice: windowStats.simulatedTrade.exitPrice,
            won: windowStats.simulatedTrade.won,
            profitPercent: windowStats.simulatedTrade.profitPercent,
            amount: windowStats.simulatedTrade.amount,
            shares: windowStats.simulatedTrade.shares,
            payout: windowStats.simulatedTrade.payout,
            profitUsd: windowStats.simulatedTrade.profitUsd,
          },
        });
      }
    });

    logger.info({ slug: windowStats.slug }, 'Window stats saved to database');
  } catch (error: any) {
    // Handle duplicate key error gracefully
    if (error?.code === 'P2002') {
      logger.warn({ slug: windowStats.slug }, 'Window stats already exists in database');
    } else {
      logger.error({ error, slug: windowStats.slug }, 'Failed to save window stats to database');
    }
  }
}

async function collectWindowStats(
  marketClient: MarketClient,
  rtdsClient: RTDSClient,
  eventConfig: any
): Promise<WindowStats | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  if (!isInStatsWindow(window, now)) {
    return null;
  }

  // Fetch market data
  const marketData = await marketClient.getMarketTokenIds(window.slug);
  if (!marketData) {
    logger.warn({ slug: window.slug }, 'Could not fetch market data');
    return null;
  }

  const tokenIds = marketData.tokenIds;
  const fallbackStart = window.marketCloseTime - FALLBACK_WINDOW_SECS;
  const retryDeadline = window.marketCloseTime + RETRY_AFTER_CLOSE_SECS;

  const stats: WindowStats = {
    slug: window.slug,
    startTime: new Date(window.startTime * 1000).toISOString(),
    endTime: new Date(window.endTime * 1000).toISOString(),
    snapshots: [],
    sideFlips: 0,
    flipsAt98: 0,
    flipTimestamps: [],
    flipEvents: [],
    finalSide: null,
    phase1FinalSide: null,
    phase2FinalSide: null,
    wouldHaveWon: null,
    simulatedTrade: null,
    beatPrice: null,
    finalPrice: null,
    priceChange: null,
  };

  let lastSide: 'UP' | 'DOWN' | null = null;
  let lastHigherPrice: number = 0;
  let phase1LastSide: 'UP' | 'DOWN' | null = null;

  // Track max price ever seen for each side
  let maxPriceEver: { UP: number; DOWN: number } = { UP: 0, DOWN: 0 };

  // Simulated trade tracking
  let simTradeEntry: { side: 'UP' | 'DOWN'; price: number } | null = null;

  logger.info({ slug: window.slug, window: formatWindowInfo(window, now) }, 'Starting price collection');

  // Fetch beatPrice (Chainlink openPrice) at the start of collection
  // This is the reference price that the market is comparing against
  const initialPriceData = await fetchCryptoPrice(
    eventConfig.crypto,
    new Date(window.startTime * 1000),
    new Date(window.marketCloseTime * 1000),
    eventConfig.interval
  );
  const beatPrice = initialPriceData?.openPrice ?? null;
  stats.beatPrice = beatPrice;

  if (beatPrice) {
    logger.info(
      { slug: window.slug, crypto: eventConfig.crypto.toUpperCase(), beatPrice: beatPrice.toFixed(2) },
      'Fetched beat price at collection start'
    );
  }

  // Collect prices until retry deadline
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = window.marketCloseTime - currentTime;
      const phase = getPhase(currentTime, fallbackStart, window.marketCloseTime);

      const { upPrice, downPrice } = await fetchMarketPrices(tokenIds.up, tokenIds.down);
      const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';

      // Get real-time token price from RTDS WebSocket
      const cryptoSymbol = eventConfig.crypto.toUpperCase();
      const rtdsPrice = rtdsClient.getLatestPrice(cryptoSymbol);
      const tokenPrice = rtdsPrice?.price ?? null;

      const priceSnapshot: PriceSnapshot = {
        timestamp: currentTime,
        timeLeft,
        upPrice,
        downPrice,
        higherSide,
        phase,
        tokenPrice,
        beatPrice,
      };

      stats.snapshots.push(priceSnapshot);

      // Update max price ever seen for each side
      if (upPrice > maxPriceEver.UP) maxPriceEver.UP = upPrice;
      if (downPrice > maxPriceEver.DOWN) maxPriceEver.DOWN = downPrice;

      // Track side flips
      if (lastSide !== null && lastSide !== higherSide) {
        // wasAt98 = true if the LOSING side ever reached 98%+ at any point
        // (the side that was winning but now lost)
        const wasAt98 = maxPriceEver[lastSide] >= 0.98;
        stats.sideFlips++;
        if (wasAt98) {
          stats.flipsAt98++;
        }
        stats.flipTimestamps.push(timeLeft);
        stats.flipEvents.push({
          timestamp: currentTime,
          timeLeft,
          fromSide: lastSide,
          toSide: higherSide,
          priceAtFlip: lastHigherPrice,
          wasAt98,
        });
        logger.info(
          {
            slug: window.slug,
            from: lastSide,
            to: higherSide,
            timeLeft: `${timeLeft}s`,
            up: `${(upPrice * 100).toFixed(2)}%`,
            down: `${(downPrice * 100).toFixed(2)}%`,
            maxPrice: `${(maxPriceEver[lastSide] * 100).toFixed(2)}%`,
            wasAt98,
          },
          wasAt98 ? 'Side FLIP at 98%+!' : 'Side FLIP detected!'
        );
      }

      // Track phase 1 final side
      if (phase === 'phase1') {
        phase1LastSide = higherSide;

        // Simulated trade: buy higher side at phase1 start if >= 60%
        const higherPrice = Math.max(upPrice, downPrice);
        if (simTradeEntry === null && higherPrice >= 0.60) {
          simTradeEntry = { side: higherSide, price: higherPrice };
          logger.info(
            {
              slug: window.slug,
              side: higherSide,
              price: `${(higherPrice * 100).toFixed(2)}%`,
            },
            'Simulated trade entry'
          );
        }
      }

      lastSide = higherSide;
      lastHigherPrice = Math.max(upPrice, downPrice);

      logger.debug(
        {
          slug: window.slug,
          phase,
          timeLeft: `${timeLeft}s`,
          up: `${(upPrice * 100).toFixed(2)}%`,
          down: `${(downPrice * 100).toFixed(2)}%`,
          higher: higherSide,
          tokenPrice: tokenPrice?.toFixed(2) ?? 'N/A',
        },
        'Price snapshot'
      );

      await sleep(POLL_INTERVAL_MS);
    } catch (error) {
      logger.warn({ error }, 'Error fetching prices');
      await sleep(POLL_INTERVAL_MS);
    }
  }

  stats.phase1FinalSide = phase1LastSide;
  stats.phase2FinalSide = lastSide;
  stats.finalSide = lastSide;

  // Final check: if any side reached 98%+ but is NOT the final side, ensure it's counted
  // This handles cases where API errors caused us to miss the actual flip
  if (stats.finalSide) {
    const losingSide = stats.finalSide === 'UP' ? 'DOWN' : 'UP';
    if (maxPriceEver[losingSide] >= 0.98) {
      // Check if we already counted this flip
      const alreadyCounted = stats.flipEvents.some(
        f => f.fromSide === losingSide && f.wasAt98
      );
      if (!alreadyCounted) {
        stats.flipsAt98++;
        logger.info(
          {
            slug: window.slug,
            losingSide,
            maxPrice: `${(maxPriceEver[losingSide] * 100).toFixed(2)}%`,
            finalSide: stats.finalSide,
          },
          'Adding missed flip at 98% (API errors may have caused missed detection)'
        );
      }
    }
  }

  // Calculate simulated trade result
  if (simTradeEntry && stats.finalSide) {
    const won = simTradeEntry.side === stats.finalSide;
    // If won: exit price = 1.0, profit = (1 - entry) * 100
    // If lost: exit price = 0.0, profit = -entry * 100
    const exitPrice = won ? 1.0 : 0.0;
    const profitPercent = won
      ? (1 - simTradeEntry.price) * 100
      : -simTradeEntry.price * 100;

    // Dollar calculations
    const amount = SIM_TRADE_AMOUNT;
    const shares = amount / simTradeEntry.price;  // e.g., $10 / $0.60 = 16.67 shares
    const payout = won ? shares : 0;              // 1 share = $1 if win
    const profitUsd = payout - amount;            // e.g., $16.67 - $10 = $6.67 or $0 - $10 = -$10

    stats.simulatedTrade = {
      side: simTradeEntry.side,
      entryPrice: simTradeEntry.price,
      exitPrice,
      won,
      profitPercent,
      amount,
      shares,
      payout,
      profitUsd,
    };

    logger.info(
      {
        slug: window.slug,
        side: simTradeEntry.side,
        entryPrice: `${(simTradeEntry.price * 100).toFixed(2)}%`,
        finalSide: stats.finalSide,
        won,
        amount: `$${amount.toFixed(2)}`,
        shares: shares.toFixed(2),
        payout: `$${payout.toFixed(2)}`,
        profitUsd: `${profitUsd >= 0 ? '+' : ''}$${profitUsd.toFixed(2)}`,
      },
      won ? 'Simulated trade WON!' : 'Simulated trade LOST'
    );
  }

  // Fetch finalPrice (Chainlink closePrice) with retries
  // beatPrice was already fetched at the start of collection
  // Retry up to 5 times with 5s delay to wait for closePrice to be available
  // (Chainlink price finalization can take 10-20 seconds after window close)
  const MAX_PRICE_RETRIES = 5;
  const PRICE_RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_PRICE_RETRIES; attempt++) {
    const cryptoPriceData = await fetchCryptoPrice(
      eventConfig.crypto,
      new Date(window.startTime * 1000),
      new Date(window.marketCloseTime * 1000),
      eventConfig.interval
    );

    if (cryptoPriceData) {
      // Update beatPrice if we didn't get it earlier (fallback)
      if (stats.beatPrice === null) {
        stats.beatPrice = cryptoPriceData.openPrice;
      }
      stats.finalPrice = cryptoPriceData.closePrice;

      if (stats.beatPrice && stats.finalPrice) {
        stats.priceChange = calculatePriceChange(stats.beatPrice, stats.finalPrice);
      }

      logger.info(
        {
          slug: window.slug,
          crypto: eventConfig.crypto.toUpperCase(),
          beatPrice: stats.beatPrice?.toFixed(2),
          finalPrice: stats.finalPrice?.toFixed(2),
          priceChange: stats.priceChange !== null ? `${stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(4)}%` : 'N/A',
          finalSide: stats.finalSide,
          attempt,
        },
        'Chainlink price comparison'
      );

      // If we got the closePrice, stop retrying
      if (stats.finalPrice !== null) {
        break;
      }
    }

    // If closePrice is null and we have more attempts, wait and retry
    if (attempt < MAX_PRICE_RETRIES && stats.finalPrice === null) {
      logger.info({ attempt, maxRetries: MAX_PRICE_RETRIES }, 'closePrice not yet available, retrying...');
      await sleep(PRICE_RETRY_DELAY_MS);
    }
  }

  logger.info(
    {
      slug: window.slug,
      totalSnapshots: stats.snapshots.length,
      sideFlips: stats.sideFlips,
      flipTimes: stats.flipTimestamps.map(t => `${t}s`),
      phase1Final: stats.phase1FinalSide,
      phase2Final: stats.phase2FinalSide,
    },
    'Window collection complete'
  );

  return stats;
}

function saveStats(sessionStats: SessionStats) {
  const filename = `stats-${sessionStats.crypto}-${sessionStats.interval}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(sessionStats, null, 2));
  logger.info({ filename }, 'Stats saved to file');
}

function printSummary(sessionStats: SessionStats) {
  console.log('\n' + '='.repeat(60));
  console.log('SESSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Crypto: ${sessionStats.crypto}`);
  console.log(`Interval: ${sessionStats.interval}`);
  console.log(`Total Windows: ${sessionStats.totalWindows}`);
  console.log(`Total Side Flips: ${sessionStats.totalFlips}`);
  console.log(`Avg Flips/Window: ${sessionStats.avgFlipsPerWindow.toFixed(2)}`);
  console.log('='.repeat(60));

  // Print flip analysis
  if (sessionStats.windows.length > 0) {
    console.log('\nFLIP ANALYSIS:');
    sessionStats.windows.forEach((w, i) => {
      console.log(`\n[${i + 1}] ${w.slug}`);
      console.log(`    Flips: ${w.sideFlips}`);
      if (w.flipTimestamps.length > 0) {
        console.log(`    Flip times: ${w.flipTimestamps.map(t => `${t}s`).join(', ')}`);
      }
      console.log(`    Phase 1 final: ${w.phase1FinalSide || 'N/A'}`);
      console.log(`    Phase 2 final: ${w.phase2FinalSide || 'N/A'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

async function main() {
  const eventType = process.argv[2];

  if (!eventType) {
    console.error('Usage: node dist/stats.js <event_type>');
    console.error('Example: node dist/stats.js btc_15m');
    process.exit(1);
  }

  const eventConfig = getEventConfig(eventType);
  const cryptoUpper = eventConfig.crypto.toUpperCase();

  logger.info({ crypto: cryptoUpper, interval: eventConfig.interval }, 'Starting price stats collector');

  const marketClient = new MarketClient();

  // Initialize RTDS WebSocket client for real-time Chainlink prices
  const rtdsClient = getRTDSClient();
  rtdsClient.connect();
  rtdsClient.subscribeCryptoPrices([cryptoUpper]);
  logger.info({ crypto: cryptoUpper }, 'Subscribed to RTDS crypto prices');

  const sessionStats: SessionStats = {
    crypto: cryptoUpper,
    interval: `${eventConfig.interval}m`,
    windows: [],
    totalWindows: 0,
    totalFlips: 0,
    avgFlipsPerWindow: 0,
    winRate: 0,
    wins: 0,
    losses: 0,
  };

  const processedWindows = new Set<string>();

  // Graceful shutdown
  let isShuttingDown = false;
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    // Disconnect RTDS WebSocket
    rtdsClient.disconnect();

    // Calculate final stats
    sessionStats.totalWindows = sessionStats.windows.length;
    sessionStats.totalFlips = sessionStats.windows.reduce((sum, w) => sum + w.sideFlips, 0);
    sessionStats.avgFlipsPerWindow = sessionStats.totalWindows > 0
      ? sessionStats.totalFlips / sessionStats.totalWindows
      : 0;

    printSummary(sessionStats);
    saveStats(sessionStats);
    prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Main loop
  while (!isShuttingDown) {
    const now = Math.floor(Date.now() / 1000);
    const window = calculateMarketWindow(eventConfig, now);

    // Check if we should start collecting (last 5 minutes before close)
    if (isInStatsWindow(window, now) && !processedWindows.has(window.slug)) {
      processedWindows.add(window.slug);

      const windowStats = await collectWindowStats(
        marketClient,
        rtdsClient,
        eventConfig
      );

      if (windowStats) {
        sessionStats.windows.push(windowStats);

        // Save to database
        await saveWindowStatsToDb(windowStats, eventType, eventConfig.crypto, `${eventConfig.interval}m`);

        logger.info(
          {
            totalWindows: sessionStats.windows.length,
            totalFlips: sessionStats.windows.reduce((sum, w) => sum + w.sideFlips, 0),
          },
          'Window stats collected'
        );
      }
    } else {
      const statsWindowStart = window.marketCloseTime - STATS_WINDOW_SECS;
      const untilStats = Math.max(0, statsWindowStart - now);
      if (untilStats > 0) {
        logger.info(
          { crypto: cryptoUpper, window: formatWindowInfo(window), untilStats },
          `Waiting for stats window in ${untilStats}s (5 min before close)`
        );
      }
    }

    await sleep(1000);
  }
}

main().catch((error) => {
  logger.fatal({ error: error?.message || error, stack: error?.stack }, 'Fatal error');
  console.error('Full error:', error);
  process.exit(1);
});

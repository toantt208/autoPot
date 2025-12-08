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

import { getConfig } from './config/index.js';
import { getEventConfig } from './config/events.js';
import { TradingClient } from './clients/trading-client.js';
import { MarketClient } from './clients/market-client.js';
import { fetchPrices } from './services/price-monitor.js';
import {
  calculateMarketWindow,
  isInTradingWindow,
  getSecondsUntilTradingWindow,
  formatWindowInfo,
} from './services/market-timing.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';
import * as fs from 'fs';
import { prisma } from './db/index.js';

const FALLBACK_WINDOW_SECS = 10;
const RETRY_AFTER_CLOSE_SECS = 5;
const POLL_INTERVAL_MS = 500;

interface PriceSnapshot {
  timestamp: number;
  timeLeft: number;
  upPrice: number;
  downPrice: number;
  higherSide: 'UP' | 'DOWN';
  phase: 'phase1' | 'phase2' | 'retry';
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
  tradingClient: TradingClient,
  marketClient: MarketClient,
  eventConfig: any,
  config: any
): Promise<WindowStats | null> {
  const now = Math.floor(Date.now() / 1000);
  const window = calculateMarketWindow(eventConfig, now);

  if (!isInTradingWindow(window, now)) {
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
  };

  let lastSide: 'UP' | 'DOWN' | null = null;
  let lastHigherPrice: number = 0;
  let phase1LastSide: 'UP' | 'DOWN' | null = null;

  // Simulated trade tracking
  let simTradeEntry: { side: 'UP' | 'DOWN'; price: number } | null = null;

  logger.info({ slug: window.slug, window: formatWindowInfo(window, now) }, 'Starting price collection');

  // Collect prices until retry deadline
  while (Math.floor(Date.now() / 1000) < retryDeadline) {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = window.marketCloseTime - currentTime;
      const phase = getPhase(currentTime, fallbackStart, window.marketCloseTime);

      const snapshot = await fetchPrices(tradingClient, tokenIds);
      const { upPrice, downPrice } = snapshot;
      const higherSide: 'UP' | 'DOWN' = upPrice >= downPrice ? 'UP' : 'DOWN';

      const priceSnapshot: PriceSnapshot = {
        timestamp: currentTime,
        timeLeft,
        upPrice,
        downPrice,
        higherSide,
        phase,
      };

      stats.snapshots.push(priceSnapshot);

      // Track side flips
      if (lastSide !== null && lastSide !== higherSide) {
        const wasAt98 = lastHigherPrice >= 0.98;
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

  const config = getConfig();
  const eventConfig = getEventConfig(eventType);
  const cryptoUpper = eventConfig.crypto.toUpperCase();

  logger.info({ crypto: cryptoUpper, interval: eventConfig.interval }, 'Starting price stats collector');

  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

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

    // Check if we should start collecting
    if (isInTradingWindow(window, now) && !processedWindows.has(window.slug)) {
      processedWindows.add(window.slug);

      const windowStats = await collectWindowStats(
        tradingClient,
        marketClient,
        eventConfig,
        config
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
      const untilTrading = getSecondsUntilTradingWindow(window);
      if (untilTrading > 0) {
        logger.info(
          { crypto: cryptoUpper, window: formatWindowInfo(window), untilTrading },
          `Waiting for next window in ${untilTrading}s`
        );
      }
    }

    await sleep(1000);
  }
}

main().catch((error) => {
  logger.fatal({ error }, 'Fatal error');
  process.exit(1);
});

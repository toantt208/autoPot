/**
 * Polymarket Trading Scheduler
 *
 * Periodically checks for enabled events and schedules BullMQ jobs
 * for upcoming trading windows.
 */

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@polymarket/db';
import {
  generateSlug,
  getUpcomingMarketWindows,
  getDelayUntilTradingWindow,
  logger,
  createLogger,
  type TradingJobData,
} from '@polymarket/core';

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SCHEDULER_INTERVAL_MS = parseInt(process.env.SCHEDULER_INTERVAL_MS || '10000', 10); // 10 seconds
const SCHEDULE_AHEAD_WINDOWS = parseInt(process.env.SCHEDULE_AHEAD_WINDOWS || '2', 10); // Schedule 2 windows ahead

// Create logger
const log = createLogger({ level: process.env.LOG_LEVEL as any || 'info' });

// Redis connection
const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// BullMQ queue
const tradingQueue = new Queue<TradingJobData>('trading', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 1000, age: 3600 * 24 }, // Keep last 1000 or 24h
    removeOnFail: { count: 5000, age: 3600 * 24 * 7 }, // Keep failed jobs for 7 days
    attempts: 1, // No retries for trading jobs (time-sensitive)
  },
});

// Track scheduled jobs to avoid duplicates
const scheduledJobs = new Set<string>();

/**
 * Schedule a trading job for a specific market window
 */
async function scheduleJob(
  event: { id: string; crypto: string; tradingWindowSeconds: number; threshold: any; betAmountUsdc: any },
  marketSlug: string,
  windowStart: number,
  windowEnd: number
): Promise<boolean> {
  // Create unique job ID
  const jobId = `${event.id}-${marketSlug}`;

  // Skip if already scheduled
  if (scheduledJobs.has(jobId)) {
    return false;
  }

  // Check if job already exists in queue
  const existingJob = await tradingQueue.getJob(jobId);
  if (existingJob) {
    scheduledJobs.add(jobId);
    return false;
  }

  // Calculate delay until trading window starts
  const now = Math.floor(Date.now() / 1000);
  const tradingWindowStart = windowEnd - event.tradingWindowSeconds;
  const delayMs = Math.max(0, (tradingWindowStart - now) * 1000);

  // Don't schedule if window has already passed
  if (now >= windowEnd) {
    log.debug({ jobId, windowEnd }, 'Window already ended, skipping');
    return false;
  }

  const jobData: TradingJobData = {
    eventId: event.id,
    crypto: event.crypto,
    marketSlug,
    windowStart,
    windowEnd,
    tradingWindowSeconds: event.tradingWindowSeconds,
    threshold: parseFloat(event.threshold.toString()),
    betAmountUsdc: parseFloat(event.betAmountUsdc.toString()),
  };

  await tradingQueue.add('execute-trade', jobData, {
    jobId,
    delay: delayMs,
  });

  scheduledJobs.add(jobId);

  log.info(
    {
      jobId,
      crypto: event.crypto,
      marketSlug,
      delaySeconds: Math.floor(delayMs / 1000),
      windowEnd: new Date(windowEnd * 1000).toISOString(),
    },
    'Scheduled trading job'
  );

  return true;
}

/**
 * Main scheduler loop
 */
async function runScheduler(): Promise<void> {
  log.info('Scheduler starting...');

  // Cleanup old scheduled job IDs periodically
  const cleanupInterval = setInterval(() => {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    for (const jobId of scheduledJobs) {
      // Extract timestamp from job ID (format: eventId-crypto-updown-15m-timestamp)
      const parts = jobId.split('-');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (timestamp < cutoffTimestamp) {
        scheduledJobs.delete(jobId);
      }
    }
    log.debug({ scheduledCount: scheduledJobs.size }, 'Cleaned up scheduled jobs cache');
  }, 300000); // Every 5 minutes

  // Main loop
  while (true) {
    try {
      // Get all enabled events
      const events = await prisma.event.findMany({
        where: { enabled: true },
      });

      log.debug({ eventCount: events.length }, 'Fetched enabled events');

      let jobsScheduled = 0;

      for (const event of events) {
        // Get upcoming market windows for this event
        const windows = getUpcomingMarketWindows(
          event.crypto,
          event.tradingWindowSeconds,
          SCHEDULE_AHEAD_WINDOWS
        );

        for (const window of windows) {
          const scheduled = await scheduleJob(
            {
              id: event.id,
              crypto: event.crypto,
              tradingWindowSeconds: event.tradingWindowSeconds,
              threshold: event.threshold,
              betAmountUsdc: event.betAmountUsdc,
            },
            window.slug,
            window.startTime,
            window.endTime
          );
          if (scheduled) jobsScheduled++;
        }
      }

      if (jobsScheduled > 0) {
        log.info({ jobsScheduled }, 'Scheduled new trading jobs');
      }

      // Get queue stats
      const [waiting, active, completed, failed] = await Promise.all([
        tradingQueue.getWaitingCount(),
        tradingQueue.getActiveCount(),
        tradingQueue.getCompletedCount(),
        tradingQueue.getFailedCount(),
      ]);

      log.debug(
        { waiting, active, completed, failed, scheduledCache: scheduledJobs.size },
        'Queue stats'
      );

      await sleep(SCHEDULER_INTERVAL_MS);
    } catch (error) {
      log.error({ error }, 'Scheduler error');
      await sleep(SCHEDULER_INTERVAL_MS * 2); // Wait longer on error
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  log.info('Shutting down scheduler...');
  await tradingQueue.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start scheduler
runScheduler().catch((error) => {
  log.fatal({ error }, 'Scheduler failed to start');
  process.exit(1);
});

/**
 * Polymarket Trading Worker
 *
 * BullMQ worker that processes trading jobs.
 * Executes the 99% strategy for each market window.
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@polymarket/db';
import {
  processMarketJob,
  createLogger,
  type TradingJobData,
  type TradingCredentials,
  type EventConfig,
} from '@polymarket/core';

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '10', 10);
const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;

// Create logger
const log = createLogger({ level: process.env.LOG_LEVEL as any || 'info' });

// Redis connections (separate for pub/sub)
const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const pubRedis = new IORedis(REDIS_URL);

// Trading credentials from environment
function getTradingCredentials(): TradingCredentials {
  const required = [
    'MASTER_PRIVATE_KEY',
    'GNOSIS_SAFE_ADDRESS',
    'CLOB_API_KEY',
    'CLOB_SECRET',
    'CLOB_PASSPHRASE',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    masterPrivateKey: process.env.MASTER_PRIVATE_KEY!,
    gnosisSafeAddress: process.env.GNOSIS_SAFE_ADDRESS!,
    clobApiKey: process.env.CLOB_API_KEY!,
    clobSecret: process.env.CLOB_SECRET!,
    clobPassphrase: process.env.CLOB_PASSPHRASE!,
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    dryRun: process.env.DRY_RUN?.toLowerCase() === 'true',
  };
}

/**
 * Log to database
 */
async function logToDb(
  eventId: string | null,
  jobId: string | null,
  marketSlug: string | null,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.workerLog.create({
      data: {
        eventId,
        workerId: WORKER_ID,
        jobId,
        marketSlug,
        level,
        message,
        metadata: metadata || undefined,
      },
    });
  } catch (error) {
    log.warn({ error }, 'Failed to write log to database');
  }
}

/**
 * Publish event via Redis pub/sub
 */
async function publishEvent(channel: string, data: Record<string, any>): Promise<void> {
  try {
    await pubRedis.publish(channel, JSON.stringify({
      ...data,
      workerId: WORKER_ID,
      timestamp: Date.now(),
    }));
  } catch (error) {
    log.warn({ error, channel }, 'Failed to publish event');
  }
}

/**
 * Process a trading job
 */
async function processJob(job: Job<TradingJobData>): Promise<void> {
  const { eventId, crypto, marketSlug, windowStart, windowEnd, tradingWindowSeconds, threshold, betAmountUsdc } = job.data;

  log.info(
    {
      jobId: job.id,
      eventId,
      crypto,
      marketSlug,
      windowEnd: new Date(windowEnd * 1000).toISOString(),
    },
    'Processing trading job'
  );

  // Update worker status in Redis
  await redis.hset(`worker:${WORKER_ID}`, {
    status: 'running',
    currentJob: job.id,
    marketSlug,
    crypto,
    updatedAt: Date.now(),
  });

  // Publish job started event
  await publishEvent('worker:job:started', {
    jobId: job.id,
    eventId,
    crypto,
    marketSlug,
  });

  await logToDb(eventId, job.id!, marketSlug, 'info', 'Job started');

  try {
    const credentials = getTradingCredentials();

    const eventConfig: EventConfig = {
      id: eventId,
      crypto,
      name: `${crypto.toUpperCase()} Up/Down 15m`,
      slugPattern: `{crypto}-updown-15m-{timestamp}`,
      tradingWindowSeconds,
      threshold,
      betAmountUsdc,
      enabled: true,
    };

    const result = await processMarketJob(
      credentials,
      eventConfig,
      marketSlug,
      windowStart,
      windowEnd
    );

    log.info(
      {
        jobId: job.id,
        marketSlug,
        traded: result.traded,
        success: result.tradeResult?.success,
        skipReason: result.skipReason,
      },
      'Job completed'
    );

    // Save trade to database if traded
    if (result.traded && result.tradeResult) {
      const trade = await prisma.trade.create({
        data: {
          eventId,
          marketSlug,
          windowStart: new Date(windowStart * 1000),
          windowEnd: new Date(windowEnd * 1000),
          side: result.tradeResult.side,
          tokenId: result.tradeResult.side === 'UP' ? 'up-token' : 'down-token', // Placeholder
          betAmount: betAmountUsdc,
          entryPrice: 0, // Will be updated from trade result
          status: result.tradeResult.success ? 'executed' : 'failed',
          orderId: result.tradeResult.orderId,
          transactionHash: result.tradeResult.transactionHash,
          errorMessage: result.tradeResult.error,
          executedAt: new Date(),
        },
      });

      // Publish trade executed event
      await publishEvent('trade:executed', {
        tradeId: trade.id,
        eventId,
        crypto,
        marketSlug,
        side: result.tradeResult.side,
        success: result.tradeResult.success,
        orderId: result.tradeResult.orderId,
        transactionHash: result.tradeResult.transactionHash,
      });

      await logToDb(eventId, job.id!, marketSlug, 'info', 'Trade executed', {
        tradeId: trade.id,
        side: result.tradeResult.side,
        success: result.tradeResult.success,
      });
    } else if (result.skipReason) {
      await logToDb(eventId, job.id!, marketSlug, 'info', `Job skipped: ${result.skipReason}`);
    }

    // Publish job completed event
    await publishEvent('worker:job:completed', {
      jobId: job.id,
      eventId,
      crypto,
      marketSlug,
      traded: result.traded,
      success: result.tradeResult?.success,
    });

  } catch (error: any) {
    log.error({ error, jobId: job.id, marketSlug }, 'Job failed with error');

    await logToDb(eventId, job.id!, marketSlug, 'error', `Job failed: ${error.message}`, {
      stack: error.stack,
    });

    // Publish job failed event
    await publishEvent('worker:job:failed', {
      jobId: job.id,
      eventId,
      crypto,
      marketSlug,
      error: error.message,
    });

    throw error;
  } finally {
    // Update worker status
    await redis.hset(`worker:${WORKER_ID}`, {
      status: 'idle',
      currentJob: '',
      marketSlug: '',
      crypto: '',
      updatedAt: Date.now(),
    });
  }
}

// Create worker
const worker = new Worker<TradingJobData>('trading', processJob, {
  connection: redis,
  concurrency: WORKER_CONCURRENCY,
});

// Worker event handlers
worker.on('ready', () => {
  log.info({ workerId: WORKER_ID, concurrency: WORKER_CONCURRENCY }, 'Worker ready');

  // Register worker in Redis
  redis.hset(`worker:${WORKER_ID}`, {
    status: 'idle',
    concurrency: WORKER_CONCURRENCY,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Set worker to expire after 1 hour of inactivity
  redis.expire(`worker:${WORKER_ID}`, 3600);
});

worker.on('active', (job) => {
  log.debug({ jobId: job.id, marketSlug: job.data.marketSlug }, 'Job active');
});

worker.on('completed', (job) => {
  log.debug({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, error) => {
  log.error({ jobId: job?.id, error: error.message }, 'Job failed');
});

worker.on('error', (error) => {
  log.error({ error }, 'Worker error');
});

// Graceful shutdown
async function shutdown(): Promise<void> {
  log.info('Shutting down worker...');

  // Remove worker from Redis
  await redis.del(`worker:${WORKER_ID}`);

  await worker.close();
  await redis.quit();
  await pubRedis.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Heartbeat to keep worker registered
setInterval(async () => {
  try {
    await redis.hset(`worker:${WORKER_ID}`, 'updatedAt', Date.now());
    await redis.expire(`worker:${WORKER_ID}`, 3600);
  } catch (error) {
    log.warn({ error }, 'Failed to update heartbeat');
  }
}, 30000); // Every 30 seconds

log.info({ workerId: WORKER_ID, concurrency: WORKER_CONCURRENCY }, 'Worker starting...');

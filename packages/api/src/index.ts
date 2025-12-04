/**
 * Polymarket Trading API
 *
 * REST API + WebSocket server for admin panel
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@polymarket/db';
import { createLogger } from '@polymarket/core';

// Configuration
const PORT = parseInt(process.env.PORT || '3001', 10);
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create logger
const log = createLogger({ level: process.env.LOG_LEVEL as any || 'info' });

// Redis connections
const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const subRedis = new IORedis(REDIS_URL);

// BullMQ queue (for reading stats)
const tradingQueue = new Queue('trading', { connection: redis });

// Express app
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// HTTP server
const httpServer = createServer(app);

// Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// ============ REST API Routes ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(events);
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch events');
    res.status(500).json({ error: error.message });
  }
});

// Create event
app.post('/api/events', async (req, res) => {
  try {
    const { crypto, name, tradingWindowSeconds, threshold, betAmountUsdc, enabled } = req.body;

    const event = await prisma.event.create({
      data: {
        crypto: crypto.toLowerCase(),
        name,
        tradingWindowSeconds: tradingWindowSeconds || 10,
        threshold: threshold || 0.99,
        betAmountUsdc: betAmountUsdc || 10,
        enabled: enabled ?? true,
      },
    });

    res.status(201).json(event);
  } catch (error: any) {
    log.error({ error }, 'Failed to create event');
    res.status(500).json({ error: error.message });
  }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { crypto, name, tradingWindowSeconds, threshold, betAmountUsdc, enabled } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(crypto && { crypto: crypto.toLowerCase() }),
        ...(name && { name }),
        ...(tradingWindowSeconds && { tradingWindowSeconds }),
        ...(threshold && { threshold }),
        ...(betAmountUsdc && { betAmountUsdc }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    res.json(event);
  } catch (error: any) {
    log.error({ error }, 'Failed to update event');
    res.status(500).json({ error: error.message });
  }
});

// Toggle event enabled status
app.patch('/api/events/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { enabled: !event.enabled },
    });

    res.json(updated);
  } catch (error: any) {
    log.error({ error }, 'Failed to toggle event');
    res.status(500).json({ error: error.message });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    log.error({ error }, 'Failed to delete event');
    res.status(500).json({ error: error.message });
  }
});

// Get trades with pagination
app.get('/api/trades', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const eventId = req.query.eventId as string;
    const status = req.query.status as string;

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { event: true },
      }),
      prisma.trade.count({ where }),
    ]);

    res.json({
      data: trades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch trades');
    res.status(500).json({ error: error.message });
  }
});

// Get trade statistics
app.get('/api/trades/stats', async (req, res) => {
  try {
    const [total, executed, failed, pending] = await Promise.all([
      prisma.trade.count(),
      prisma.trade.count({ where: { status: 'executed' } }),
      prisma.trade.count({ where: { status: 'failed' } }),
      prisma.trade.count({ where: { status: 'pending' } }),
    ]);

    // Get stats by outcome
    const outcomes = await prisma.trade.groupBy({
      by: ['outcome'],
      _count: true,
      where: { outcome: { not: null } },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.trade.aggregate({
      where: { createdAt: { gte: today } },
      _count: true,
      _sum: { payout: true },
    });

    res.json({
      total,
      executed,
      failed,
      pending,
      outcomes: outcomes.reduce((acc, o) => ({ ...acc, [o.outcome || 'unknown']: o._count }), {}),
      today: {
        count: todayStats._count,
        totalPayout: todayStats._sum.payout || 0,
      },
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch trade stats');
    res.status(500).json({ error: error.message });
  }
});

// Get worker logs
app.get('/api/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '100', 10);
    const level = req.query.level as string;
    const eventId = req.query.eventId as string;

    const where: any = {};
    if (level) where.level = level;
    if (eventId) where.eventId = eventId;

    const [logs, total] = await Promise.all([
      prisma.workerLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workerLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch logs');
    res.status(500).json({ error: error.message });
  }
});

// Get queue stats
app.get('/api/queue/stats', async (req, res) => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      tradingQueue.getWaitingCount(),
      tradingQueue.getActiveCount(),
      tradingQueue.getCompletedCount(),
      tradingQueue.getFailedCount(),
      tradingQueue.getDelayedCount(),
    ]);

    res.json({ waiting, active, completed, failed, delayed });
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch queue stats');
    res.status(500).json({ error: error.message });
  }
});

// Get queue jobs
app.get('/api/queue/jobs', async (req, res) => {
  try {
    const status = (req.query.status as string) || 'waiting';
    const limit = parseInt(req.query.limit as string || '50', 10);

    let jobs;
    switch (status) {
      case 'waiting':
        jobs = await tradingQueue.getWaiting(0, limit);
        break;
      case 'active':
        jobs = await tradingQueue.getActive(0, limit);
        break;
      case 'delayed':
        jobs = await tradingQueue.getDelayed(0, limit);
        break;
      case 'completed':
        jobs = await tradingQueue.getCompleted(0, limit);
        break;
      case 'failed':
        jobs = await tradingQueue.getFailed(0, limit);
        break;
      default:
        jobs = await tradingQueue.getWaiting(0, limit);
    }

    res.json(jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      delay: job.opts?.delay,
      failedReason: job.failedReason,
    })));
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch queue jobs');
    res.status(500).json({ error: error.message });
  }
});

// Get worker statuses
app.get('/api/workers', async (req, res) => {
  try {
    const keys = await redis.keys('worker:*');
    const workers = [];

    for (const key of keys) {
      const data = await redis.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        workers.push({
          id: key.replace('worker:', ''),
          ...data,
          startedAt: data.startedAt ? parseInt(data.startedAt) : null,
          updatedAt: data.updatedAt ? parseInt(data.updatedAt) : null,
        });
      }
    }

    res.json(workers);
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch workers');
    res.status(500).json({ error: error.message });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error: any) {
    log.error({ error }, 'Failed to fetch settings');
    res.status(500).json({ error: error.message });
  }
});

// Update setting
app.put('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json(setting);
  } catch (error: any) {
    log.error({ error }, 'Failed to update setting');
    res.status(500).json({ error: error.message });
  }
});

// ============ WebSocket Events ============

io.on('connection', (socket) => {
  log.info({ socketId: socket.id }, 'Client connected');

  socket.on('subscribe:prices', () => {
    socket.join('prices');
    log.debug({ socketId: socket.id }, 'Subscribed to prices');
  });

  socket.on('subscribe:workers', () => {
    socket.join('workers');
    log.debug({ socketId: socket.id }, 'Subscribed to workers');
  });

  socket.on('subscribe:trades', () => {
    socket.join('trades');
    log.debug({ socketId: socket.id }, 'Subscribed to trades');
  });

  socket.on('subscribe:queue', () => {
    socket.join('queue');
    log.debug({ socketId: socket.id }, 'Subscribed to queue');
  });

  socket.on('disconnect', () => {
    log.debug({ socketId: socket.id }, 'Client disconnected');
  });
});

// Subscribe to Redis pub/sub for real-time updates
subRedis.subscribe('trade:executed', 'worker:job:started', 'worker:job:completed', 'worker:job:failed', 'price:update');

subRedis.on('message', (channel, message) => {
  try {
    const data = JSON.parse(message);

    switch (channel) {
      case 'trade:executed':
        io.to('trades').emit('trade:executed', data);
        break;
      case 'worker:job:started':
      case 'worker:job:completed':
      case 'worker:job:failed':
        io.to('workers').emit(channel, data);
        io.to('queue').emit('queue:update', data);
        break;
      case 'price:update':
        io.to('prices').emit('price:update', data);
        break;
    }
  } catch (error) {
    log.warn({ error, channel }, 'Failed to parse pub/sub message');
  }
});

// Periodic queue stats broadcast
setInterval(async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      tradingQueue.getWaitingCount(),
      tradingQueue.getActiveCount(),
      tradingQueue.getCompletedCount(),
      tradingQueue.getFailedCount(),
      tradingQueue.getDelayedCount(),
    ]);

    io.to('queue').emit('queue:stats', { waiting, active, completed, failed, delayed });
  } catch (error) {
    // Ignore errors in broadcast
  }
}, 5000);

// Graceful shutdown
async function shutdown(): Promise<void> {
  log.info('Shutting down API server...');

  io.close();
  await tradingQueue.close();
  await redis.quit();
  await subRedis.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
httpServer.listen(PORT, () => {
  log.info({ port: PORT }, 'API server started');
});

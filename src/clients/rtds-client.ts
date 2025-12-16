/**
 * Polymarket Real-Time Data Socket (RTDS) Client
 *
 * WebSocket client for streaming real-time Chainlink crypto prices.
 * Documentation: https://docs.polymarket.com/developers/RTDS/RTDS-overview
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

const RTDS_URL = 'wss://ws-live-data.polymarket.com';
const PING_INTERVAL_MS = 10000;
const PONG_TIMEOUT_MS = 30000; // If no pong in 30s, reconnect
const RECONNECT_DELAY_MS = 3000;
const DATA_TIMEOUT_MS = 30000; // If no data in 30s, reconnect

export interface CryptoPriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

interface RTDSMessage {
  topic: string;
  type: string;
  timestamp: number;
  payload: any;
}

interface Subscription {
  topic: string;
  type: string;
  filters?: string;
}

export class RTDSClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private dataCheckInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private autoReconnect = true;
  private subscriptions: Subscription[] = [];
  private latestPrices: Map<string, CryptoPriceUpdate> = new Map();
  private lastDataTime: number = 0;

  constructor() {
    super();
  }

  /**
   * Connect to RTDS WebSocket
   */
  connect(): void {
    if (this.ws) {
      this.disconnect();
    }

    logger.info({ url: RTDS_URL }, 'Connecting to RTDS WebSocket...');

    this.ws = new WebSocket(RTDS_URL);

    this.ws.on('open', () => {
      this.isConnected = true;
      this.lastDataTime = Date.now();
      logger.info('RTDS WebSocket connected');

      // Start ping interval and data check
      this.startPing();
      this.startDataCheck();

      // Re-subscribe if reconnecting
      if (this.subscriptions.length > 0) {
        this.sendSubscribe(this.subscriptions);
      }

      this.emit('connected');
    });

    this.ws.on('pong', () => {
      // Clear pong timeout on pong received
      if (this.pongTimeout) {
        clearTimeout(this.pongTimeout);
        this.pongTimeout = null;
      }
      logger.debug('RTDS pong received');
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const raw = data.toString();
        const message = JSON.parse(raw) as RTDSMessage;

        if (message.topic === 'crypto_prices' || message.topic === 'crypto_prices_chainlink') {
          this.lastDataTime = Date.now();
          this.handleCryptoPriceUpdate(message);
        }

        this.emit('message', message);
      } catch (error) {
        // Ignore non-JSON messages (pong, etc.)
      }
    });

    this.ws.on('error', (error) => {
      logger.error({ error }, 'RTDS WebSocket error');
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.stopPing();
      this.stopDataCheck();
      logger.warn('RTDS WebSocket disconnected');

      this.emit('disconnected');

      // Auto reconnect
      if (this.autoReconnect) {
        this.scheduleReconnect();
      }
    });
  }

  /**
   * Disconnect from RTDS WebSocket
   */
  disconnect(): void {
    this.autoReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }

    this.stopPing();
    this.stopDataCheck();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Subscribe to crypto price updates
   *
   * @param symbols - Array of crypto symbols (BTC, ETH, SOL, XRP) - used for filtering locally
   */
  subscribeCryptoPrices(symbols: string[]): void {
    // Subscribe to both Chainlink and Binance price feeds
    // No filter needed - we'll receive all prices and store them
    const subscriptions: Subscription[] = [
      {
        topic: 'crypto_prices_chainlink',
        type: '*',
      },
      {
        topic: 'crypto_prices',
        type: '*',
      },
    ];

    this.subscriptions = subscriptions;

    if (this.isConnected) {
      this.sendSubscribe(subscriptions);
    }
  }

  /**
   * Get latest price for a symbol
   */
  getLatestPrice(symbol: string): CryptoPriceUpdate | undefined {
    return this.latestPrices.get(symbol.toUpperCase());
  }

  /**
   * Get all latest prices
   */
  getAllLatestPrices(): Map<string, CryptoPriceUpdate> {
    return new Map(this.latestPrices);
  }

  private sendSubscribe(subscriptions: Subscription[]): void {
    if (!this.ws || !this.isConnected) return;

    const message = {
      action: 'subscribe',
      subscriptions,
    };

    this.ws.send(JSON.stringify(message));
    logger.info({ topics: subscriptions.map((s) => s.topic) }, 'Subscribed to RTDS topics');
  }

  private handleCryptoPriceUpdate(message: RTDSMessage): void {
    const { payload, timestamp } = message;

    // Extract symbol and price from payload
    // Formats:
    // - Chainlink: { symbol: "btc/usd", value: 90400.12 }
    // - Binance: { symbol: "btcusdt", value: 90400.12 }
    let symbol: string | undefined;
    let price: number | undefined;

    if (payload.symbol && payload.value !== undefined) {
      // Extract symbol: "btc/usd" -> "BTC", "btcusdt" -> "BTC"
      const rawSymbol = payload.symbol.toLowerCase();
      if (rawSymbol.includes('/')) {
        symbol = rawSymbol.split('/')[0].toUpperCase();
      } else if (rawSymbol.endsWith('usdt')) {
        symbol = rawSymbol.replace('usdt', '').toUpperCase();
      } else if (rawSymbol.endsWith('usd')) {
        symbol = rawSymbol.replace('usd', '').toUpperCase();
      } else {
        symbol = rawSymbol.toUpperCase();
      }
      price = typeof payload.value === 'number' ? payload.value : parseFloat(payload.value);
    }

    if (symbol && price && !isNaN(price)) {
      const update: CryptoPriceUpdate = {
        symbol,
        price,
        timestamp: timestamp || Date.now(),
      };

      this.latestPrices.set(symbol, update);
      this.emit('price', update);

      logger.debug(
        { symbol, price: price.toFixed(2), timestamp: new Date(update.timestamp).toISOString() },
        'RTDS price update'
      );
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.ping();

        // Set pong timeout - if no pong received, reconnect
        if (this.pongTimeout) {
          clearTimeout(this.pongTimeout);
        }
        this.pongTimeout = setTimeout(() => {
          logger.warn('RTDS pong timeout - reconnecting...');
          this.forceReconnect();
        }, PONG_TIMEOUT_MS);
      }
    }, PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private startDataCheck(): void {
    this.dataCheckInterval = setInterval(() => {
      const timeSinceData = Date.now() - this.lastDataTime;
      if (timeSinceData > DATA_TIMEOUT_MS) {
        logger.warn({ timeSinceData: `${Math.floor(timeSinceData / 1000)}s` }, 'RTDS no data timeout - reconnecting...');
        this.forceReconnect();
      }
    }, 10000); // Check every 10s
  }

  private stopDataCheck(): void {
    if (this.dataCheckInterval) {
      clearInterval(this.dataCheckInterval);
      this.dataCheckInterval = null;
    }
  }

  private forceReconnect(): void {
    if (this.ws) {
      this.ws.terminate(); // Force close
      this.ws = null;
    }
    this.isConnected = false;
    this.stopPing();
    this.stopDataCheck();

    if (this.autoReconnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectTimeout = setTimeout(() => {
      logger.info('Attempting RTDS reconnection...');
      this.autoReconnect = true;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }
}

// Singleton instance for shared access
let rtdsClientInstance: RTDSClient | null = null;

export function getRTDSClient(): RTDSClient {
  if (!rtdsClientInstance) {
    rtdsClientInstance = new RTDSClient();
  }
  return rtdsClientInstance;
}

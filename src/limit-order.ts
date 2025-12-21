/**
 * Limit Order Script
 *
 * Places a GTC limit buy order, monitors for fill, then places a GTC limit sell order.
 *
 * Usage: node dist/limit-order.js <tokenId> <buyPrice> <sellPrice> <amount>
 * Example: node dist/limit-order.js "1234..." 0.50 0.55 1
 *
 * This will:
 * 1. Place a GTC limit buy order for $1 at 50 cents
 * 2. Monitor until filled
 * 3. Place a GTC limit sell order at 55 cents
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import type { ApiKeyCreds, TickSize } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { Wallet } from '@ethersproject/wallet';
import { getConfig } from './config/index.js';
import { logger } from './utils/logger.js';
import { sleep } from './utils/retry.js';

const POLYGON_CHAIN_ID = 137;
const CLOB_HOST = 'https://clob.polymarket.com';

// CLI arguments
const TOKEN_ID = process.argv[2];
const BUY_PRICE = parseFloat(process.argv[3]);
const SELL_PRICE = parseFloat(process.argv[4]);
const AMOUNT = parseFloat(process.argv[5]) || 1;
const TICK_SIZE = (process.argv[6] || '0.01') as TickSize;
const NEG_RISK = process.argv[7] === 'true';

// Poll interval for checking order status
const POLL_INTERVAL_MS = 5000;

interface OrderResult {
  orderID: string;
  status: string;
  transactionsHashes?: string[];
}

async function main(): Promise<void> {
  // Validate arguments
  if (!TOKEN_ID || isNaN(BUY_PRICE) || isNaN(SELL_PRICE)) {
    console.log('Usage: node dist/limit-order.js <tokenId> <buyPrice> <sellPrice> [amount] [tickSize] [negRisk]');
    console.log('Example: node dist/limit-order.js "1234..." 0.50 0.55 1 0.01 false');
    process.exit(1);
  }

  if (SELL_PRICE <= BUY_PRICE) {
    console.log('Error: sellPrice must be greater than buyPrice');
    process.exit(1);
  }

  const config = getConfig();

  logger.info({
    tokenId: TOKEN_ID.slice(0, 20) + '...',
    buyPrice: BUY_PRICE,
    sellPrice: SELL_PRICE,
    amount: AMOUNT,
    tickSize: TICK_SIZE,
    negRisk: NEG_RISK,
    profit: `${((SELL_PRICE - BUY_PRICE) / BUY_PRICE * 100).toFixed(1)}%`,
  }, 'Starting Limit Order Bot');

  // Initialize CLOB client
  const wallet = new Wallet(config.MASTER_PRIVATE_KEY);
  const creds: ApiKeyCreds = {
    key: config.CLOB_API_KEY,
    secret: config.CLOB_SECRET,
    passphrase: config.CLOB_PASSPHRASE,
  };

  const client = new ClobClient(
    CLOB_HOST,
    POLYGON_CHAIN_ID,
    wallet,
    creds,
    SignatureType.POLY_GNOSIS_SAFE,
    config.GNOSIS_SAFE_ADDRESS
  );

  // Step 1: Place GTC limit buy order
  logger.info({ price: BUY_PRICE, amount: AMOUNT }, 'Placing GTC limit buy order...');

  const buyOrder = await client.createOrder({
    tokenID: TOKEN_ID,
    price: BUY_PRICE,
    size: AMOUNT / BUY_PRICE, // Convert USDC amount to token size
    side: Side.BUY,
    expiration: 0, // No expiration for GTC
  }, {
    negRisk: NEG_RISK,
    tickSize: TICK_SIZE,
  });

  const buyResult = await client.postOrder(buyOrder, OrderType.GTC) as OrderResult;

  logger.info({
    orderId: buyResult.orderID,
    status: buyResult.status,
  }, 'Buy order placed');

  if (!buyResult.orderID) {
    logger.error('Failed to place buy order');
    process.exit(1);
  }

  // Step 2: Monitor buy order until filled
  logger.info('Monitoring buy order for fill...');

  let buyFilled = false;
  let filledSize = 0;

  while (!buyFilled) {
    try {
      const order = await client.getOrder(buyResult.orderID);

      if (!order) {
        logger.warn('Order not found, may have been cancelled');
        process.exit(1);
      }

      const sizeFilled = parseFloat((order as any).size_matched || '0');
      const originalSize = parseFloat((order as any).original_size || '0');
      const status = (order as any).status;

      logger.debug({
        orderId: buyResult.orderID.slice(0, 20) + '...',
        status,
        filled: `${sizeFilled}/${originalSize}`,
      }, 'Order status');

      if (status === 'MATCHED' || status === 'FILLED' || sizeFilled >= originalSize) {
        buyFilled = true;
        filledSize = sizeFilled;
        logger.info({
          orderId: buyResult.orderID,
          filledSize,
        }, 'Buy order FILLED!');
      } else if (status === 'CANCELLED' || status === 'EXPIRED') {
        logger.warn({ status }, 'Buy order cancelled/expired');
        process.exit(1);
      }

      if (!buyFilled) {
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Error checking order status');
      await sleep(POLL_INTERVAL_MS);
    }
  }

  // Step 3: Place GTC limit sell order
  logger.info({
    price: SELL_PRICE,
    size: filledSize,
  }, 'Placing GTC limit sell order...');

  const sellOrder = await client.createOrder({
    tokenID: TOKEN_ID,
    price: SELL_PRICE,
    size: filledSize,
    side: Side.SELL,
    expiration: 0,
  }, {
    negRisk: NEG_RISK,
    tickSize: TICK_SIZE,
  });

  const sellResult = await client.postOrder(sellOrder, OrderType.GTC) as OrderResult;

  logger.info({
    orderId: sellResult.orderID,
    status: sellResult.status,
  }, 'Sell order placed');

  // Step 4: Monitor sell order
  logger.info('Monitoring sell order for fill...');

  let sellFilled = false;

  while (!sellFilled) {
    try {
      const order = await client.getOrder(sellResult.orderID);

      if (!order) {
        logger.warn('Sell order not found');
        break;
      }

      const sizeFilled = parseFloat((order as any).size_matched || '0');
      const originalSize = parseFloat((order as any).original_size || '0');
      const status = (order as any).status;

      logger.debug({
        orderId: sellResult.orderID.slice(0, 20) + '...',
        status,
        filled: `${sizeFilled}/${originalSize}`,
      }, 'Sell order status');

      if (status === 'MATCHED' || status === 'FILLED' || sizeFilled >= originalSize) {
        sellFilled = true;
        const profit = (SELL_PRICE - BUY_PRICE) * filledSize;
        logger.info({
          orderId: sellResult.orderID,
          filledSize: sizeFilled,
          buyPrice: BUY_PRICE,
          sellPrice: SELL_PRICE,
          profit: `$${profit.toFixed(4)}`,
        }, 'Sell order FILLED! Trade complete.');
      } else if (status === 'CANCELLED' || status === 'EXPIRED') {
        logger.warn({ status }, 'Sell order cancelled/expired');
        break;
      }

      if (!sellFilled) {
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Error checking sell order status');
      await sleep(POLL_INTERVAL_MS);
    }
  }

  logger.info('Limit order bot finished');
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

main().catch((error) => {
  logger.error({ error: error.message }, 'Limit order bot failed');
  process.exit(1);
});

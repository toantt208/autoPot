/**
 * Manual Buy Script
 *
 * Buys the higher-priced side of a market.
 * Usage: node dist/buy.js <event_slug> <price>
 * Example: node dist/buy.js btc-updown-15m-1764690300 0.95
 */

import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';
import { MarketClient } from './clients/market-client.js';
import { logger } from './utils/logger.js';

const betAmount = 1 // 1 USDC

async function main() {
  const slug = process.argv[2];
  const priceArg = process.argv[3];

  if (!slug || !priceArg) {
    console.error('Usage: node dist/buy.js <event_slug> <price>');
    console.error('Example: node dist/buy.js btc-updown-15m-1764690300 0.95');
    process.exit(1);
  }

  const price = parseFloat(priceArg);
  if (isNaN(price) || price <= 0 || price >= 1) {
    console.error('Price must be a number between 0 and 1');
    process.exit(1);
  }

  logger.info({ slug, price }, 'Starting manual buy');

  // Load config
  const config = getConfig();

  if (config.DRY_RUN) {
    logger.warn('DRY RUN MODE - No real trades will be executed');
  }

  // Initialize clients
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

  // Fetch market data
  logger.info({ slug }, 'Fetching market data...');
  const marketData = await marketClient.getMarketTokenIds(slug);

  if (!marketData) {
    logger.error({ slug }, 'Could not fetch market data');
    process.exit(1);
  }

  const { tokenIds } = marketData;

  // Get live prices from CLOB
  logger.info('Fetching live prices...');
  const [upPrice, downPrice] = await Promise.all([
    tradingClient.getBuyPrice(tokenIds.up),
    tradingClient.getBuyPrice(tokenIds.down),
  ]);

  logger.info(
    {
      up: `${(upPrice * 100).toFixed(2)}%`,
      down: `${(downPrice * 100).toFixed(2)}%`,
    },
    'Current prices'
  );

  // Determine higher side
  const higherSide = upPrice >= downPrice ? 'UP' : 'DOWN';
  const higherTokenId = upPrice >= downPrice ? tokenIds.up : tokenIds.down;
  const higherPrice = Math.max(upPrice, downPrice);

  logger.info(
    {
      side: higherSide,
      price: `${(higherPrice * 100).toFixed(2)}%`,
      amount: betAmount,
    },
    `Buying ${higherSide} side`
  );

  // Execute market buy
  try {
    const result = await tradingClient.marketBuy({
      tokenId: higherTokenId,
      amount: betAmount,
      negRisk: tokenIds.negRisk,
      tickSize: tokenIds.tickSize,
    });

    logger.info(
      {
        orderId: result.orderID,
        status: result.status,
        side: higherSide,
        slug,
      },
      'Order placed successfully'
    );
  } catch (error: any) {
    logger.error({ error: error?.message || error }, 'Failed to place order');
    process.exit(1);
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error');
  process.exit(1);
});

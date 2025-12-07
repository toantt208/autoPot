/**
 * Fetch Prices Script
 *
 * Fetches current prices for an event by slug.
 *
 * Usage: npx tsx scripts/fetch-prices.ts <event_slug>
 */

import { TradingClient } from '../src/clients/trading-client.js';
import { MarketClient } from '../src/clients/market-client.js';
import { getConfig } from '../src/config/index.js';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/fetch-prices.ts <event_slug>');
    console.error('Example: npx tsx scripts/fetch-prices.ts btc-updown-15m-1733317500');
    process.exit(1);
  }

  const config = getConfig();
  const tradingClient = new TradingClient(config);
  const marketClient = new MarketClient();

  console.log(`Fetching market: ${slug}`);

  const marketData = await marketClient.getMarketTokenIds(slug);
  if (!marketData) {
    console.error('Market not found:', slug);
    process.exit(1);
  }

  const { upPrice, downPrice } = await tradingClient.getBatchPrices(
    marketData.tokenIds.up,
    marketData.tokenIds.down
  );

  console.log({
    slug,
    up: `${(upPrice * 100).toFixed(2)}%`,
    down: `${(downPrice * 100).toFixed(2)}%`,
    negRisk: marketData.tokenIds.negRisk,
    tickSize: marketData.tokenIds.tickSize,
  });
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

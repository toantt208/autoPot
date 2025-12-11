/**
 * Fetch Crypto Prices from Polymarket API
 *
 * Fetches all 15-minute window prices for BTC, ETH, SOL, XRP
 * from a date range and saves to Redis + JSON files.
 *
 * Uses Redis to cache results so retries skip already-fetched windows.
 *
 * Usage: node scripts/fetch-crypto-prices.cjs [startDate] [endDate]
 * Example: node scripts/fetch-crypto-prices.cjs 2025-11-11 2025-12-09
 */

const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const CRYPTO_PRICE_API = 'https://polymarket.com/api/crypto/crypto-price';
const CRYPTOS = ['BTC', 'ETH', 'SOL', 'XRP'];
const INTERVAL_MINUTES = 15;

// Rate limiting: 500ms delay every 10 requests
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

// Redis key prefix
const REDIS_PREFIX = 'crypto-price:';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate Redis key for a window
 */
function getRedisKey(symbol, startTime) {
  return `${REDIS_PREFIX}${symbol}:${startTime}`;
}

/**
 * Generate all 15-minute windows between two dates
 */
function generateWindows(startDate, endDate) {
  const windows = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Align to 15-minute boundary (00, 15, 30, 45)
  start.setMinutes(Math.floor(start.getMinutes() / 15) * 15, 0, 0);

  let current = new Date(start);
  while (current < end) {
    const windowStart = new Date(current);
    const windowEnd = new Date(current.getTime() + INTERVAL_MINUTES * 60 * 1000);

    // Remove milliseconds
    const startTime = windowStart.toISOString().replace('.000Z', 'Z');
    const endTime = windowEnd.toISOString().replace('.000Z', 'Z');

    windows.push({ startTime, endTime });

    current = windowEnd;
  }

  return windows;
}

/**
 * Fetch price data for a single window
 */
async function fetchWindowPrice(symbol, startTime, endTime) {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    eventStartTime: startTime,
    variant: 'fifteen',
    endDate: endTime,
  });

  const url = `${CRYPTO_PRICE_API}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      return null;
    }

    return {
      symbol,
      startTime,
      endTime,
      openPrice: data.openPrice,
      closePrice: data.closePrice,
      completed: data.completed,
      timestamp: data.timestamp,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Determine winner based on price change
 * UP = price went up, DOWN = price went down
 */
function determineWinner(openPrice, closePrice) {
  if (openPrice == null || closePrice == null) return null;
  if (closePrice > openPrice) return 'UP';
  if (closePrice < openPrice) return 'DOWN';
  return 'TIE';
}

/**
 * Check if window is already cached in Redis
 */
async function getCachedResult(symbol, startTime) {
  const key = getRedisKey(symbol, startTime);
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

/**
 * Save result to Redis (expires in 7 days)
 */
async function cacheResult(symbol, startTime, data) {
  const key = getRedisKey(symbol, startTime);
  await redis.set(key, JSON.stringify(data), 'EX', 7 * 24 * 60 * 60);
}

async function main() {
  const startDateArg = process.argv[2] || '2025-11-11';
  const endDateArg = process.argv[3] || '2025-12-09';

  const startDate = new Date(startDateArg + 'T00:00:00Z');
  const endDate = new Date(endDateArg + 'T23:59:59Z');

  console.log(`\nFetching crypto prices from ${startDateArg} to ${endDateArg}`);
  console.log(`Cryptos: ${CRYPTOS.join(', ')}`);
  console.log(`Using Redis cache at localhost:6379`);

  const windows = generateWindows(startDate, endDate);
  console.log(`Total windows per crypto: ${windows.length}`);
  console.log(`Rate limit: ${BATCH_DELAY_MS}ms delay every ${BATCH_SIZE} requests`);
  console.log('');

  const results = {};

  for (const crypto of CRYPTOS) {
    console.log(`\nProcessing ${crypto}...`);
    results[crypto] = [];

    let cached = 0;
    let fetched = 0;
    let errors = 0;
    let requestCount = 0;

    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];

      // Check Redis cache first
      let data = await getCachedResult(crypto, window.startTime);

      if (data) {
        // Already cached
        cached++;
      } else {
        // Fetch from API
        data = await fetchWindowPrice(crypto, window.startTime, window.endTime);
        requestCount++;

        if (data && data.completed) {
          // Add winner info and cache it
          const winner = determineWinner(data.openPrice, data.closePrice);
          data = {
            ...data,
            winner,
            priceChange: data.closePrice - data.openPrice,
            priceChangePercent: ((data.closePrice - data.openPrice) / data.openPrice) * 100,
          };
          await cacheResult(crypto, window.startTime, data);
          fetched++;
        } else {
          errors++;
          data = null;
        }

        // Rate limiting: delay every BATCH_SIZE requests
        if (requestCount % BATCH_SIZE === 0) {
          await sleep(BATCH_DELAY_MS);
        }
      }

      // Add to results if we have data
      if (data) {
        results[crypto].push(data);
      }

      // Progress indicator every 100 windows
      if ((i + 1) % 100 === 0) {
        console.log(`  ${crypto}: ${i + 1}/${windows.length} | cached: ${cached} | fetched: ${fetched} | errors: ${errors}`);
      }
    }

    console.log(`  ${crypto}: Done! Total: ${results[crypto].length} | cached: ${cached} | fetched: ${fetched} | errors: ${errors}`);
  }

  // Save results to JSON
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save individual crypto files
  for (const crypto of CRYPTOS) {
    const filename = path.join(outputDir, `crypto-prices-${crypto.toLowerCase()}-${startDateArg}-to-${endDateArg}.json`);
    fs.writeFileSync(filename, JSON.stringify(results[crypto], null, 2));
    console.log(`Saved: ${filename} (${results[crypto].length} records)`);
  }

  // Save combined file
  const combinedFilename = path.join(outputDir, `crypto-prices-all-${startDateArg}-to-${endDateArg}.json`);
  fs.writeFileSync(combinedFilename, JSON.stringify(results, null, 2));
  console.log(`Saved: ${combinedFilename}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  for (const crypto of CRYPTOS) {
    const data = results[crypto];
    if (data.length === 0) {
      console.log(`${crypto}: No data`);
      continue;
    }
    const upCount = data.filter(d => d.winner === 'UP').length;
    const downCount = data.filter(d => d.winner === 'DOWN').length;
    console.log(`${crypto}: ${data.length} windows | UP: ${upCount} (${(upCount/data.length*100).toFixed(1)}%) | DOWN: ${downCount} (${(downCount/data.length*100).toFixed(1)}%)`);
  }

  await redis.quit();
}

main().catch(async (err) => {
  console.error(err);
  await redis.quit();
  process.exit(1);
});

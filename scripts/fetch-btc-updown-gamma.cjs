/**
 * Fetch BTC UP/DOWN results from Gamma API
 *
 * Uses the gamma-api.polymarket.com to get market outcomes.
 * outcomePrices "[\"1\", \"0\"]" with outcomes "[\"Up\", \"Down\"]" means UP won.
 *
 * Usage: node scripts/fetch-btc-updown-gamma.cjs [startDate] [endDate]
 * Example: node scripts/fetch-btc-updown-gamma.cjs 2025-09-13 2025-12-10
 */

const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const GAMMA_API = 'https://gamma-api.polymarket.com/markets/slug';
const INTERVAL_MINUTES = 15;

// Rate limiting
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

// Redis key prefix
const REDIS_PREFIX = 'btc-updown:';

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
function getRedisKey(timestamp) {
  return `${REDIS_PREFIX}${timestamp}`;
}

/**
 * Generate all 15-minute window timestamps between two dates
 */
function generateWindows(startDate, endDate) {
  const windows = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Align to 15-minute boundary (00, 15, 30, 45)
  start.setMinutes(Math.floor(start.getMinutes() / 15) * 15, 0, 0);

  let current = new Date(start);
  while (current < end) {
    const timestamp = Math.floor(current.getTime() / 1000);
    const startTime = current.toISOString();

    windows.push({ timestamp, startTime });

    current = new Date(current.getTime() + INTERVAL_MINUTES * 60 * 1000);
  }

  return windows;
}

/**
 * Fetch market data from Gamma API
 */
async function fetchMarket(timestamp, verbose = false) {
  const slug = `btc-up-or-down-15m-${timestamp}`;
  const url = `${GAMMA_API}/${slug}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (verbose) {
        console.error(`  [${response.status}] ${slug}`);
      }
      return null;
    }

    const data = await response.json();

    if (!data || !data.outcomePrices || !data.outcomes) {
      if (verbose) {
        console.error(`  [NO DATA] ${slug} - missing outcomePrices/outcomes`);
      }
      return null;
    }

    // Parse outcomes and prices
    const outcomes = JSON.parse(data.outcomes); // ["Up", "Down"]
    const prices = JSON.parse(data.outcomePrices); // ["1", "0"] or ["0", "1"]

    // Determine winner: price "1" means that outcome won
    let winner = null;
    for (let i = 0; i < outcomes.length; i++) {
      if (prices[i] === '1') {
        winner = outcomes[i].toUpperCase(); // "UP" or "DOWN"
        break;
      }
    }

    // If no clear winner (still trading or tie)
    if (!winner) {
      // Check if market is closed/resolved
      if (data.closed || data.resolved) {
        // Tie or error
        winner = 'TIE';
      } else {
        // Still active
        return null;
      }
    }

    return {
      timestamp,
      startTime: new Date(timestamp * 1000).toISOString(),
      slug,
      winner,
      outcomes,
      prices,
      closed: data.closed,
      resolved: data.resolved,
    };
  } catch (error) {
    if (verbose) {
      console.error(`  [ERROR] ${slug} - ${error.message}`);
    }
    return null;
  }
}

/**
 * Check if window is already cached in Redis
 */
async function getCachedResult(timestamp) {
  const key = getRedisKey(timestamp);
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

/**
 * Save result to Redis (expires in 30 days)
 */
async function cacheResult(timestamp, data) {
  const key = getRedisKey(timestamp);
  await redis.set(key, JSON.stringify(data), 'EX', 30 * 24 * 60 * 60);
}

async function main() {
  const startDateArg = process.argv[2] || '2025-09-13';
  const endDateArg = process.argv[3] || '2025-12-10';
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  const startDate = new Date(startDateArg + 'T00:00:00Z');
  const endDate = new Date(endDateArg + 'T23:59:59Z');

  console.log(`\nFetching BTC UP/DOWN results from ${startDateArg} to ${endDateArg}`);
  console.log(`Using Gamma API: ${GAMMA_API}`);
  console.log(`Using Redis cache at localhost:6379`);

  const windows = generateWindows(startDate, endDate);
  console.log(`Total windows: ${windows.length}`);
  console.log(`Rate limit: ${BATCH_DELAY_MS}ms delay every ${BATCH_SIZE} requests`);
  console.log('');

  const results = [];
  let cached = 0;
  let fetched = 0;
  let errors = 0;
  let requestCount = 0;

  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];

    // Check Redis cache first
    let data = await getCachedResult(window.timestamp);

    if (data) {
      cached++;
      results.push(data);
    } else {
      // Fetch from API
      data = await fetchMarket(window.timestamp, verbose);
      requestCount++;

      if (data && data.winner) {
        await cacheResult(window.timestamp, data);
        fetched++;
        results.push(data);
      } else {
        errors++;
      }

      // Rate limiting
      if (requestCount % BATCH_SIZE === 0) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // Progress every 100 windows
    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${windows.length} | cached: ${cached} | fetched: ${fetched} | errors: ${errors}`);
    }
  }

  console.log(`\nDone! Total: ${results.length} | cached: ${cached} | fetched: ${fetched} | errors: ${errors}`);

  // Sort by timestamp
  results.sort((a, b) => a.timestamp - b.timestamp);

  // Save to JSON
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `btc-updown-gamma-${startDateArg}-to-${endDateArg}.json`);
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`Saved: ${filename}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const upCount = results.filter(r => r.winner === 'UP').length;
  const downCount = results.filter(r => r.winner === 'DOWN').length;
  const tieCount = results.filter(r => r.winner === 'TIE').length;

  console.log(`Total windows: ${results.length}`);
  console.log(`UP wins: ${upCount} (${(upCount / results.length * 100).toFixed(1)}%)`);
  console.log(`DOWN wins: ${downCount} (${(downCount / results.length * 100).toFixed(1)}%)`);
  if (tieCount > 0) {
    console.log(`TIE: ${tieCount}`);
  }

  // Date range
  if (results.length > 0) {
    console.log(`\nDate range: ${results[0].startTime.split('T')[0]} to ${results[results.length - 1].startTime.split('T')[0]}`);
  }

  await redis.quit();
}

main().catch(async (err) => {
  console.error(err);
  await redis.quit();
  process.exit(1);
});

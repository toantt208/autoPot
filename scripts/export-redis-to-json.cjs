/**
 * Export cached crypto prices from Redis to JSON
 *
 * Usage: node scripts/export-redis-to-json.cjs
 */

const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const REDIS_PREFIX = 'crypto-price:';
const CRYPTOS = ['BTC', 'ETH', 'SOL', 'XRP'];

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

async function main() {
  console.log('Exporting cached crypto prices from Redis...\n');

  const results = {};

  for (const crypto of CRYPTOS) {
    const pattern = `${REDIS_PREFIX}${crypto}:*`;
    const keys = await redis.keys(pattern);

    console.log(`${crypto}: Found ${keys.length} cached entries`);

    results[crypto] = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        results[crypto].push(JSON.parse(data));
      }
    }

    // Sort by startTime
    results[crypto].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  // Save to JSON
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `crypto-prices-partial-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\nSaved: ${filename}`);

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
    const firstDate = data[0]?.startTime?.split('T')[0] || 'N/A';
    const lastDate = data[data.length - 1]?.startTime?.split('T')[0] || 'N/A';
    console.log(`${crypto}: ${data.length} windows (${firstDate} to ${lastDate}) | UP: ${upCount} | DOWN: ${downCount}`);
  }

  await redis.quit();
}

main().catch(async (err) => {
  console.error(err);
  await redis.quit();
  process.exit(1);
});

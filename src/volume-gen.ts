/**
 * Volume Generator Script
 *
 * Buys and sells on a specific market to generate trading volume.
 * Uses market orders for instant execution, no delay between trades.
 *
 * Usage: DOTENV_CONFIG_PATH=.env.xxx node dist/volume-gen.js <tokenId> <loops> [amount]
 * Example:
 *   DOTENV_CONFIG_PATH=.env.scale node dist/volume-gen.js 883513... 100 5
 */

import { getConfig } from './config/index.js';
import { TradingClient } from './clients/trading-client.js';

// CLI arguments
const TOKEN_ID = "102504892414163237174864879683522880588750452841477290216845150938663289742135";
const LOOPS = 1;
const TRADE_AMOUNT = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function main(): Promise<void> {
  if (!TOKEN_ID) {
    console.error('Usage: DOTENV_CONFIG_PATH=.env.xxx node dist/volume-gen.js <tokenId> <loops> [amount]');
    console.error('Example:');
    console.error('  DOTENV_CONFIG_PATH=.env.scale node dist/volume-gen.js 883513... 100 5');
    process.exit(1);
  }

  const config = getConfig();

  console.log({
    config,
  })
  console.log(`Volume Generator Started`);
  console.log(`Token: ${TOKEN_ID.slice(0, 20)}...`);
  console.log(`Loops: ${LOOPS}`);
  console.log(`Amount: $${TRADE_AMOUNT}`);
  console.log(`Dry Run: ${config.DRY_RUN}\n`);

  const tradingClient = new TradingClient(config);

  let successCount = 0;

  for (let i = 1; i <= LOOPS; i++) {
    try {
      // Market Buy
      // const buyResult = await tradingClient.marketBuy({
      //   tokenId: TOKEN_ID,
      //   amount: TRADE_AMOUNT,
      //   negRisk: true,
      //   tickSize: '0.001',
      // });
      //
      // if (!buyResult.success && buyResult.status !== 'matched') {
      //   console.log(`#${i}/${LOOPS} | Buy failed: ${(buyResult as any).errorMsg || buyResult.status}`);
      //   continue;
      // }
      //
      // const tokensReceived = parseFloat((buyResult as any).takingAmount || '0');
      // if (tokensReceived <= 0) {
      //   console.log(`#${i}/${LOOPS} | Buy: no tokens received`);
      //   continue;
      // }

      // await sleep(2000)
      const tokensReceived = 2000
      // Market Sell immediately
      const sellResult = await tradingClient.marketSell({
        tokenId: TOKEN_ID,
        amount: tokensReceived,
        negRisk: true,
        tickSize: '0.001',
      });

      if (sellResult.success || sellResult.status === 'matched') {
        successCount++;
        console.log(`#${i}/${LOOPS} | Buy: ${tokensReceived.toFixed(2)} tokens | Sell: done`);
      } else {
        console.log(`#${i}/${LOOPS} | Sell failed: ${(sellResult as any).errorMsg || sellResult.status}`);
      }
    } catch (error: any) {
      console.log(`#${i}/${LOOPS} | Error: ${error.message}`);
    }
  }

  console.log(`\nDone! Success: ${successCount}/${LOOPS}`);
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});

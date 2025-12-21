import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/redeem.ts',
    'src/buy.ts',
    'src/post-buy.ts',
    'src/approve-all.ts',
    'src/stats.ts',
    'src/stats-view.ts',
    'src/stoploss.ts',
    'src/price-tracker.ts',
    'src/xrp-price-logger.ts',
    'src/price-diff-trader.ts',
    'src/limit-order.ts',
    'src/scalp-market.ts',
    'src/volume-gen.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
});

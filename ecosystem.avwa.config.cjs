/**
 * PM2 Ecosystem Config - AVWA V2 (Adaptive Volume-Weighted Arbitrage)
 *
 * Dual-side entry strategy for safer arbitrage on Polymarket BTC up/down markets.
 *
 * V2 Key Changes:
 *   - INITIAL: Buy BOTH sides weighted by price (equal tokens from start)
 *   - DCA: Rebalance imbalance (buy weaker side) instead of one-sided DCA
 *   - RESERVE: Emergency/final lock (renamed from SNIPER)
 *
 * Capital Allocation (40/40/20):
 *   Tier 1 (Initial): 40% = $2,000 - Buy BOTH sides weighted by price
 *   Tier 2 (DCA Pool): 40% = $2,000 - Rebalance imbalance
 *   Tier 3 (Reserve): 20% = $1,000 - Emergency/final lock
 *
 * Commands:
 *   Start:  pm2 start ecosystem.avwa.config.cjs
 *   Stop:   pm2 stop pm-avwa-btc
 *   Logs:   pm2 logs pm-avwa-btc --lines 100
 *   Status: pm2 list
 */

module.exports = {
  apps: [
    {
      name: 'pm-avwa-btc',
      script: 'dist/avwa.js',
      args: 'btc',
      env: {
        DOTENV_CONFIG_PATH: '.env',

        // V2: Capital allocation (40/40/20)
        TOTAL_CAPITAL: '5000',
        INITIAL_POOL_PCT: '0.40', // 40% = $2,000 - buy BOTH sides
        DCA_POOL_PCT: '0.40', // 40% = $2,000 - rebalance imbalance
        RESERVE_POOL_PCT: '0.20', // 20% = $1,000 - emergency/final lock

        // V2: Entry conditions - based on individual prices
        ENTRY_MIN: '0.05', // 5% min probability to enter
        ENTRY_MAX: '0.80', // 80% max probability to enter

        // V2: DCA/Rebalance triggers
        IMBALANCE_THRESHOLD: '0.05', // 5% imbalance triggers rebalance
        DCA_AMOUNT: '200', // $200 per rebalance operation

        // Reserve trigger
        RESERVE_WINDOW_SECONDS: '120', // Last 2 minutes

        // Anti-slippage
        MAX_SLIPPAGE_PCT: '0.005', // 0.5% max slippage
        ICEBERG_THRESHOLD: '100', // Use iceberg for orders > $100
        ICEBERG_CHUNK_SIZE: '50', // $50 per chunk

        // Execution mode
        DRY_RUN: 'true', // Set to 'false' for live trading
      },
      node_args: '-r dotenv/config',
      output: './logs/avwa-btc-out.log',
      error: './logs/avwa-btc-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,

      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};

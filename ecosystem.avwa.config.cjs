/**
 * PM2 Ecosystem Config - AVWA (Adaptive Volume-Weighted Arbitrage)
 *
 * Institutional-grade algorithm for $5,000+ capital on Polymarket BTC up/down markets.
 *
 * Capital Allocation:
 *   Tier 1 (Initial): 20% = $1,000 - Base position on higher probability side
 *   Tier 2 (DCA Pool): 50% = $2,500 - 5 levels x $500, triggered at 4% drops
 *   Tier 3 (Sniper): 30% = $1,500 - Lock arbitrage when avgPrice + hedgePrice < 0.985
 *
 * Key Features:
 *   - Anti-slippage: Iceberg orders for amounts > $100
 *   - Orderbook depth checking before trades
 *   - DCA with recalculated trigger prices
 *   - 1.5% guaranteed profit target
 *   - Dual persistence (Redis + PostgreSQL)
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

        // Capital allocation
        TOTAL_CAPITAL: '5000',
        INITIAL_POOL_PCT: '0.20', // 20% = $1,000
        DCA_POOL_PCT: '0.50', // 50% = $2,500
        SNIPER_POOL_PCT: '0.30', // 30% = $1,500

        // DCA config
        DCA_LEVELS: '5', // 5 DCA levels
        DCA_TRIGGER_PCT: '0.04', // 4% drop triggers DCA

        // Entry config
        ENTRY_MIN: '0.05', // Min 5% to enter
        ENTRY_MAX: '0.80', // Max 80% to enter

        // Arbitrage config
        ARBITRAGE_THRESHOLD: '0.985', // Lock at 1.5%+ profit
        SNIPER_WINDOW_SECONDS: '180', // Last 3 minutes

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

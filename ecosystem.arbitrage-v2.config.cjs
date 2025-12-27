/**
 * PM2 Ecosystem Config - Arbitrage V2 (Profit-Based Strategy)
 *
 * Strategy:
 * 1. Buy higher side when price in 5%-80% range ($5 per buy)
 * 2. Calculate profit if UP wins, profit if DOWN wins
 * 3. Buy weaker side to improve lower profit scenario
 * 4. Stop buying when BOTH scenarios reach $5 profit OR $30 max spent
 * 5. Emergency balance with 60s left if still unbalanced
 *
 * Example:
 *   - Buy UP at 50% for $5 → 10 tokens
 *   - profitIfUpWins = 10 - 5 = $5, profitIfDownWins = 0 - 5 = -$5
 *   - Buy DOWN at 40% for $5 → 12.5 tokens
 *   - profitIfUpWins = 10 - 10 = $0, profitIfDownWins = 12.5 - 10 = $2.50
 *   - Keep buying until both scenarios >= $5
 *
 * Start: pm2 start ecosystem.arbitrage-v2.config.cjs
 * Stop: pm2 stop pm-arb2-btc
 * Logs: pm2 logs pm-arb2-btc --lines 50
 * Stats: node scripts/arb2-stats.cjs
 */

module.exports = {
  apps: [
    {
      name: 'pm-arb2-btc',
      script: 'dist/arbitrage-v2.js',
      args: 'btc',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        ENTRY_MIN: '0.05',          // Buy when higher side >= 5%
        ENTRY_MAX: '0.80',          // Buy when higher side <= 80%
        BET_AMOUNT: '5',            // Initial position size (per buy)
        TARGET_PROFIT: '5',         // $5 profit target per window
        MAX_SPEND: '30',            // Max $30 per window
        EMERGENCY_SECONDS: '60',    // Force balance with 60s left
        PROFIT_THRESHOLD: '5',      // Stop session when $5 cumulative profit
        DRY_RUN: 'true',            // Dry run mode (log only)
      },
      node_args: '-r dotenv/config',
      output: './logs/arb2-btc-out.log',
      error: './logs/arb2-btc-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // {
    //   name: 'pm-arb2-eth',
    //   script: 'dist/arbitrage-v2.js',
    //   args: 'eth',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //     ENTRY_THRESHOLD: '0.51',
    //     MIN_PROFIT: '0.05',
    //     BET_AMOUNT: '10',
    //     PROFIT_THRESHOLD: '5',
    //     DRY_RUN: 'true',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/arb2-eth-out.log',
    //   error: './logs/arb2-eth-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
  ],
};

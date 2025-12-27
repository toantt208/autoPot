/**
 * PM2 Ecosystem Config - Arbitrage Strategy (Equal Token)
 *
 * Strategy:
 * - Monitor UP + DOWN prices
 * - When total < 95% (5% profit), buy EQUAL TOKENS on both sides
 * - Split budget proportionally: UP spend = Budget × (UP/Total)
 * - Guaranteed profit since one side always wins
 *
 * DRY_RUN mode (default): Logs to DB without executing trades
 * Set DRY_RUN=false for live trading
 *
 * Example: UP=55%, DOWN=40%, Total=95%, Budget=$20
 *   UP spend = $11.58 → 21.05 tokens
 *   DOWN spend = $8.42 → 21.05 tokens
 *   Winner pays $1/token → Return $21.05
 *   Profit = $1.05 (5.26% return)
 *
 * Start all: pm2 start ecosystem.arbitrage.config.cjs
 * Start one: pm2 start ecosystem.arbitrage.config.cjs --only pm-arb-btc
 * Logs: pm2 logs pm-arb-btc
 */

module.exports = {
  apps: [
    {
      name: 'pm-arb-btc',
      script: 'dist/arbitrage.js',
      args: 'btc 0.05',  // crypto, min profit (5%)
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        BET_AMOUNT: '20',  // Total budget for both sides
        DRY_RUN: 'true',   // Dry run mode (log only, no trades)
      },
      node_args: '-r dotenv/config',
      output: './logs/arb-btc-out.log',
      error: './logs/arb-btc-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // {
    //   name: 'pm-arb-eth',
    //   script: 'dist/arbitrage.js',
    //   args: 'eth 0.05',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //     BET_AMOUNT: '20',
    //     DRY_RUN: 'true',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/arb-eth-out.log',
    //   error: './logs/arb-eth-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
    // {
    //   name: 'pm-arb-sol',
    //   script: 'dist/arbitrage.js',
    //   args: 'sol 0.05',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //     BET_AMOUNT: '20',
    //     DRY_RUN: 'true',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/arb-sol-out.log',
    //   error: './logs/arb-sol-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
    // {
    //   name: 'pm-arb-xrp',
    //   script: 'dist/arbitrage.js',
    //   args: 'xrp 0.05',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //     BET_AMOUNT: '20',
    //     DRY_RUN: 'true',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/arb-xrp-out.log',
    //   error: './logs/arb-xrp-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
  ],
};

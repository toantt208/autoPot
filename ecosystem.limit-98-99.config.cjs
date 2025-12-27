/**
 * PM2 Ecosystem Config - Limit 98-99 Strategy
 *
 * Strategy:
 * - Place limit buy orders at 98% for both UP and DOWN
 * - When filled, place limit sell at 99%
 * - Profit: 1.02% per win (~$0.10 per $10 bet)
 * - Based on Dec 22 analysis: 99.2% win rate
 *
 * Start all: pm2 start ecosystem.limit-98-99.config.cjs
 * Start one: pm2 start ecosystem.limit-98-99.config.cjs --only pm-limit-btc
 * Stop: pm2 stop pm-limit-btc pm-limit-eth pm-limit-sol pm-limit-xrp
 * Logs: pm2 logs pm-limit-btc
 */

module.exports = {
  apps: [
    {
      name: 'pm-limit-btc',
      script: 'dist/limit-98-99.js',
      args: 'btc',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        BET_AMOUNT: '10',
      },
      node_args: '-r dotenv/config',
      output: './logs/limit-btc-out.log',
      error: './logs/limit-btc-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-limit-eth',
      script: 'dist/limit-98-99.js',
      args: 'eth',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        BET_AMOUNT: '10',
      },
      node_args: '-r dotenv/config',
      output: './logs/limit-eth-out.log',
      error: './logs/limit-eth-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-limit-sol',
      script: 'dist/limit-98-99.js',
      args: 'sol',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        BET_AMOUNT: '10',
      },
      node_args: '-r dotenv/config',
      output: './logs/limit-sol-out.log',
      error: './logs/limit-sol-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-limit-xrp',
      script: 'dist/limit-98-99.js',
      args: 'xrp',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        BET_AMOUNT: '10',
      },
      node_args: '-r dotenv/config',
      output: './logs/limit-xrp-out.log',
      error: './logs/limit-xrp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

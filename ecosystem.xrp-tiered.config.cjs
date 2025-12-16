/**
 * PM2 Ecosystem Config - XRP Tiered Price Diff Strategy
 *
 * Tiered thresholds:
 * - Last 10min (600s): threshold 0.006
 * - Last 5min (300s): threshold 0.004
 * - Last 150s: threshold 0.002
 *
 * Start: pm2 start ecosystem.xrp-tiered.config.cjs
 * Stop: pm2 stop all
 * Logs: pm2 logs
 */

module.exports = {
  apps: [
    // {
    //   name: 'pm-price-tracker',
    //   script: 'dist/price-tracker.js',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/price-tracker-out.log',
    //   error: './logs/price-tracker-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    //   cron_restart: '*/5 * * * *', // Restart every 5 minutes for reliability
    // },
    // {
    //   name: 'pm-xrp-price-logger',
    //   script: 'dist/xrp-price-logger.js',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //   },
    //   node_args: '-r dotenv/config',
    //   output: './logs/xrp-price-logger-out.log',
    //   error: './logs/xrp-price-logger-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
    {
      name: 'pm-xrp-tiered-trader',
      script: 'dist/price-diff-trader.js',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
      },
      node_args: '-r dotenv/config',
      output: './logs/xrp-tiered-trader-out.log',
      error: './logs/xrp-tiered-trader-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

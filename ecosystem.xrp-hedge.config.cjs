/**
 * PM2 Ecosystem Config - XRP Hedge Strategy
 *
 * Strategy:
 * - When event starts, place limit buy for UP and DOWN at 98 cents ($5 each)
 * - When filled, place limit sell at 99 cents
 *
 * Start: pm2 start ecosystem.xrp-hedge.config.cjs
 * Stop: pm2 stop pm-xrp-hedge
 * Logs: pm2 logs pm-xrp-hedge
 */

module.exports = {
  apps: [
    {
      name: 'pm-xrp-hedge',
      script: 'dist/xrp-hedge.js',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
      },
      node_args: '-r dotenv/config',
      output: './logs/xrp-hedge-out.log',
      error: './logs/xrp-hedge-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

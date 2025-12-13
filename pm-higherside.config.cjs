module.exports = {
  apps: [
    {
      name: 'pm-higherside-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m higherside',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
      },
      out_file: './logs/xrp-15m-higherside-out.log',
      error_file: './logs/xrp-15m-higherside-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-higherside-redeem',
      script: 'dist/redeem.js',
      env: {
        DOTENV_CONFIG_PATH: '.env.xrp_higher',
        RUN_ONCE: 'true',
      },
      cron_restart: '5 * * * *', // Run every hour at minute 5
      autorestart: false,
      out_file: './logs/higherside-redeem-out.log',
      error_file: './logs/higherside-redeem-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // {
    //   name: 'pm-stoploss-xrp',
    //   script: 'dist/stoploss.js',
    //   args: 'xrp',
    //   cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    //   env: {
    //     DOTENV_CONFIG_PATH: '.env.xrp_higher',
    //   },
    //   out_file: './logs/stoploss-xrp-out.log',
    //   error_file: './logs/stoploss-xrp-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
  ],
};

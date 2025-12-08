module.exports = {
  apps: [
    // Stats collectors - 15-minute markets
    {
      name: 'pm-stats-btc-15m',
      script: 'dist/stats.js',
      args: 'btc_15m',
      output: './logs/stats-btc-15m-out.log',
      error: './logs/stats-btc-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-stats-eth-15m',
      script: 'dist/stats.js',
      args: 'eth_15m',
      output: './logs/stats-eth-15m-out.log',
      error: './logs/stats-eth-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-stats-sol-15m',
      script: 'dist/stats.js',
      args: 'sol_15m',
      output: './logs/stats-sol-15m-out.log',
      error: './logs/stats-sol-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-stats-xrp-15m',
      script: 'dist/stats.js',
      args: 'xrp_15m',
      output: './logs/stats-xrp-15m-out.log',
      error: './logs/stats-xrp-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'pm-fb-redeem',
      script: 'dist/redeem.js',
      output: './logs/fb-redeem-out.log',
      error: './logs/fb-redeem-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // 15-minute markets - fallback strategy
    {
      name: 'pm-fb-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m fallback',
      output: './logs/fb-btc-15m-out.log',
      error: './logs/fb-btc-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-fb-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m fallback',
      output: './logs/fb-eth-15m-out.log',
      error: './logs/fb-eth-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-fb-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m fallback',
      output: './logs/fb-sol-15m-out.log',
      error: './logs/fb-sol-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-fb-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m fallback',
      output: './logs/fb-xrp-15m-out.log',
      error: './logs/fb-xrp-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

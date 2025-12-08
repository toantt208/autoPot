module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'pm-99-redeem',
      script: 'dist/redeem.js',
      output: './logs/99-redeem-out.log',
      error: './logs/99-redeem-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // 15-minute markets - ninetynine strategy
    {
      name: 'pm-99-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m ninetynine',
      output: './logs/99-btc-15m-out.log',
      error: './logs/99-btc-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-99-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m ninetynine',
      output: './logs/99-eth-15m-out.log',
      error: './logs/99-eth-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-99-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m ninetynine',
      output: './logs/99-sol-15m-out.log',
      error: './logs/99-sol-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'pm-99-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m ninetynine',
      output: './logs/99-xrp-15m-out.log',
      error: './logs/99-xrp-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'polymarket-redeem',
      script: 'dist/redeem.js',
      output: './logs/redeem-out.log',
      error: './logs/redeem-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // 15-minute markets
    {
      name: 'polymarket-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m',
      output: './logs/btc-15m-out.log',
      error: './logs/btc-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'polymarket-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m',
      output: './logs/eth-15m-out.log',
      error: './logs/eth-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'polymarket-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m',
      output: './logs/sol-15m-out.log',
      error: './logs/sol-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    {
      name: 'polymarket-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m',
      output: './logs/xrp-15m-out.log',
      error: './logs/xrp-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // 1-hour markets
    // {
    //   name: 'polymarket-btc-1h',
    //   script: 'dist/index.js',
    //   args: 'btc_1h',
    // },
    // {
    //   name: 'polymarket-eth-1h',
    //   script: 'dist/index.js',
    //   args: 'eth_1h',
    // },
    // {
    //   name: 'polymarket-sol-1h',
    //   script: 'dist/index.js',
    //   args: 'sol_1h',
    // },
    // {
    //   name: 'polymarket-xrp-1h',
    //   script: 'dist/index.js',
    //   args: 'xrp_1h',
    // },
    // // Post-event buyers (buy after event ends but before market closes)
    // {
    //   name: 'polymarket-btc-15m-post',
    //   script: 'dist/post-buy.js',
    //   args: 'btc_15m',
    //
    // },
    // {
    //   name: 'polymarket-eth-15m-post',
    //   script: 'dist/post-buy.js',
    //   args: 'eth_15m',
    //
    // },
    // {
    //   name: 'polymarket-sol-15m-post',
    //   script: 'dist/post-buy.js',
    //   args: 'sol_15m',
    //
    // },
    // {
    //   name: 'polymarket-xrp-15m-post',
    //   script: 'dist/post-buy.js',
    //   args: 'xrp_15m',
    //
    // },
    // {
    //   name: 'polymarket-btc-1h-post',
    //   script: 'dist/post-buy.js',
    //   args: 'btc_1h',
    //
    // },
    // {
    //   name: 'polymarket-eth-1h-post',
    //   script: 'dist/post-buy.js',
    //   args: 'eth_1h',
    //
    // },
    // {
    //   name: 'polymarket-sol-1h-post',
    //   script: 'dist/post-buy.js',
    //   args: 'sol_1h',
    //
    // },
    // {
    //   name: 'polymarket-xrp-1h-post',
    //   script: 'dist/post-buy.js',
    //   args: 'xrp_1h',
    //
    // },
  ],
};

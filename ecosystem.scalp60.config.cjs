module.exports = {
  apps: [
    {
      name: 'scalp60-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m scalp60',
      env: {
        DOTENV_CONFIG_PATH: '.env.scale',
      },
      output: './logs/scalp60-btc-15m-out.log',
      error: './logs/scalp60-btc-15m-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // Uncomment to enable other markets
    // {
    //   name: 'scalp60-eth-15m',
    //   script: 'dist/index.js',
    //   args: 'eth_15m scalp60',
    //   output: './logs/scalp60-eth-15m-out.log',
    //   error: './logs/scalp60-eth-15m-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
    // {
    //   name: 'scalp60-sol-15m',
    //   script: 'dist/index.js',
    //   args: 'sol_15m scalp60',
    //   output: './logs/scalp60-sol-15m-out.log',
    //   error: './logs/scalp60-sol-15m-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
    // {
    //   name: 'scalp60-xrp-15m',
    //   script: 'dist/index.js',
    //   args: 'xrp_15m scalp60',
    //   output: './logs/scalp60-xrp-15m-out.log',
    //   error: './logs/scalp60-xrp-15m-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   time: true,
    // },
  ],
};

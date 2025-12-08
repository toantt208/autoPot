module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'pm-99-redeem',
      script: 'dist/redeem.js',
    },
    // 15-minute markets - ninetynine strategy
    {
      name: 'pm-99-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m ninetynine',
    },
    {
      name: 'pm-99-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m ninetynine',
    },
    {
      name: 'pm-99-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m ninetynine',
    },
    {
      name: 'pm-99-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m ninetynine',
    },
  ],
};

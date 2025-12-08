module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'polymarket-redeem',
      script: 'dist/redeem.js',
    },
    // 15-minute markets - ninetynine strategy
    {
      name: 'polymarket-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m ninetynine',
    },
    {
      name: 'polymarket-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m ninetynine',
    },
    {
      name: 'polymarket-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m ninetynine',
    },
    {
      name: 'polymarket-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m ninetynine',
    },
  ],
};

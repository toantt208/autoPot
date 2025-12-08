module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'polymarket-redeem',
      script: 'dist/redeem.js',
    },
    // 15-minute markets - fallback strategy
    {
      name: 'polymarket-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m fallback',
    },
    {
      name: 'polymarket-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m fallback',
    },
    {
      name: 'polymarket-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m fallback',
    },
    {
      name: 'polymarket-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m fallback',
    },
  ],
};

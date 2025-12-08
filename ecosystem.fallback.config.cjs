module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'pm-fb-redeem',
      script: 'dist/redeem.js',
    },
    // 15-minute markets - fallback strategy
    {
      name: 'pm-fb-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m fallback',
    },
    {
      name: 'pm-fb-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m fallback',
    },
    {
      name: 'pm-fb-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m fallback',
    },
    {
      name: 'pm-fb-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m fallback',
    },
  ],
};

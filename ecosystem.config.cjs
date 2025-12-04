module.exports = {
  apps: [
    // Redeem service - runs every minute
    {
      name: 'polymarket-redeem',
      script: 'dist/redeem.js',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    // 15-minute markets
    {
      name: 'polymarket-btc-15m',
      script: 'dist/index.js',
      args: 'btc_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-eth-15m',
      script: 'dist/index.js',
      args: 'eth_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-sol-15m',
      script: 'dist/index.js',
      args: 'sol_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-xrp-15m',
      script: 'dist/index.js',
      args: 'xrp_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    // 1-hour markets
    {
      name: 'polymarket-btc-1h',
      script: 'dist/index.js',
      args: 'btc_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-eth-1h',
      script: 'dist/index.js',
      args: 'eth_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-sol-1h',
      script: 'dist/index.js',
      args: 'sol_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-xrp-1h',
      script: 'dist/index.js',
      args: 'xrp_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    // Post-event buyers (buy after event ends but before market closes)
    {
      name: 'polymarket-btc-15m-post',
      script: 'dist/post-buy.js',
      args: 'btc_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-eth-15m-post',
      script: 'dist/post-buy.js',
      args: 'eth_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-sol-15m-post',
      script: 'dist/post-buy.js',
      args: 'sol_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-xrp-15m-post',
      script: 'dist/post-buy.js',
      args: 'xrp_15m',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-btc-1h-post',
      script: 'dist/post-buy.js',
      args: 'btc_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-eth-1h-post',
      script: 'dist/post-buy.js',
      args: 'eth_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-sol-1h-post',
      script: 'dist/post-buy.js',
      args: 'sol_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
    {
      name: 'polymarket-xrp-1h-post',
      script: 'dist/post-buy.js',
      args: 'xrp_1h',
      cwd: '/Users/toantt/www/toantt/polymarket-autotrade',
    },
  ],
};

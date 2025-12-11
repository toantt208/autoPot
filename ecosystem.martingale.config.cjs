module.exports = {
  apps: [
    // BTC - Martingale UP with $1 base bet
    {
      name: 'pm-martingale-btc-up',
      script: 'dist/index.js',
      args: 'btc_15m martingale UP 1',
      node_args: '--env-file=.env.martingale',
      output: './logs/martingale-btc-up-out.log',
      error: './logs/martingale-btc-up-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // ETH - Martingale UP with $1 base bet
    {
      name: 'pm-martingale-eth-up',
      script: 'dist/index.js',
      args: 'eth_15m martingale UP 1',
      node_args: '--env-file=.env.martingale',
      output: './logs/martingale-eth-up-out.log',
      error: './logs/martingale-eth-up-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // SOL - Martingale UP with $1 base bet
    {
      name: 'pm-martingale-sol-up',
      script: 'dist/index.js',
      args: 'sol_15m martingale UP 1',
      node_args: '--env-file=.env.martingale',
      output: './logs/martingale-sol-up-out.log',
      error: './logs/martingale-sol-up-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
    // XRP - Martingale UP with $1 base bet
    {
      name: 'pm-martingale-xrp-up',
      script: 'dist/index.js',
      args: 'xrp_15m martingale UP 1',
      node_args: '--env-file=.env.martingale',
      output: './logs/martingale-xrp-up-out.log',
      error: './logs/martingale-xrp-up-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,
    },
  ],
};

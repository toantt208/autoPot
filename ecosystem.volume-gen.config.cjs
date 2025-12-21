/**
 * Volume Generator PM2 Ecosystem
 *
 * Schedule: 3pm - 8pm Vietnam time (UTC+7)
 * Server: UTC (GMT+0)
 *
 * 3pm VN = 8:00 UTC
 * 8pm VN = 13:00 UTC
 *
 * Runs every hour: 8:00, 9:00, 10:00, 11:00, 12:00, 13:00 UTC
 */

module.exports = {
  apps: [
    {
      name: 'volume-gen',
      script: 'dist/volume-gen.js',
      env: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: '.env.scale',
      },
      // Restart every hour from 8am to 1pm UTC (3pm-8pm VN)
      cron_restart: '0 8,9,10,11,12,13 * * *',
      // Don't auto-restart when script finishes
      autorestart: false,
      watch: false,
      max_memory_restart: '200M',
      error_file: './logs/volume-gen-error.log',
      out_file: './logs/volume-gen-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};

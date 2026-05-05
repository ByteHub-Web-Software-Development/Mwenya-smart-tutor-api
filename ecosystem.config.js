module.exports = {
  apps: [
    {
      name: 'smart-tutor-api',
      script: 'dist/main.js',
      instances: 'max',       // Utilize all CPU cores
      exec_mode: 'cluster',   // Enable cluster mode for load balancing
      watch: false,           // Set to true in dev if desired
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5180,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      autorestart: true,
    },
  ],
};

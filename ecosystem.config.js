/**
 * PM2 ecosystem — basepulse-web (Next.js, :3200) + basepulse-cache (Fastify, :4000).
 * Same resilience pattern as bot-core-base/ecosystem.config.js:
 * autorestart, memory cap, exponential backoff, separate stdout/stderr logs.
 *
 *   pm2 start ecosystem.config.js
 *   pm2 logs basepulse-web
 *   pm2 save   (persist across VPS reboot)
 */
module.exports = {
  apps: [
    {
      name: 'basepulse-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3200',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 25,
      max_memory_restart: '500M',
      exp_backoff_restart_delay: 100,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'basepulse-cache',
      cwd: './services/cache',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 25,
      max_memory_restart: '300M',
      exp_backoff_restart_delay: 100,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

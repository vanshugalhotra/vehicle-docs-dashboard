module.exports = {
  apps: [
    {
      name: "dashboard-backend",
      script: "dist/src/main.js",
      cwd: "/home/ustaadji/vehicle-docs-dashboard/apps/backend",
      exec_mode: "fork",
      node_args: "--max-old-space-size=512",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "512M",
      error_file:
        "/home/ustaadji/deploy/vehicle_dashboard/logs/backend-error.log",
      out_file: "/home/ustaadji/deploy/vehicle_dashboard/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "dashboard-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/ustaadji/vehicle-docs-dashboard/apps/frontend",
      exec_mode: "fork",
      node_args: "--max-old-space-size=512",
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      max_restarts: 10,
      error_file:
        "/home/ustaadji/deploy/vehicle_dashboard/logs/frontend-error.log",
      out_file: "/home/ustaadji/deploy/vehicle_dashboard/logs/frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

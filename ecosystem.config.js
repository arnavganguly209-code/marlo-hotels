/**
 * PM2 process definition for Marlo Hotels ONLY.
 *
 * Marlo must always listen on port 3001 (Hotel Thamel Park owns 3000).
 * The port is pinned two ways so no restart path can fall back to 3000:
 *   - `--port 3001` CLI arg passed to `next start`
 *   - `PORT` env
 * This file defines a single app named "marlo-hotels" and therefore never
 * touches the hotel-thamel-park PM2 process. Runs on the Linux VPS, so the
 * script path uses POSIX separators.
 */
module.exports = {
  apps: [
    {
      name: "marlo-hotels",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3001",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};

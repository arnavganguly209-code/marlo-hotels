#!/usr/bin/env bash
# Deploy Marlo Hotels + Orbit Visual Media CMS on the Hostinger VPS.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/marlo-hotels}"
MEDIA_DIR="${ORBIT_UPLOAD_DIR:-/srv/marlo-media}"
APP_USER="${APP_USER:-$(whoami)}"

cd "$APP_DIR"

echo "==> Fetching latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Ensuring persistent media directory"
sudo mkdir -p "$MEDIA_DIR"/{hero,general,brand,imported,video,trash}
sudo chown -R "$APP_USER":"$APP_USER" "$MEDIA_DIR"
sudo chmod -R u+rwX,g+rX,o+rX "$MEDIA_DIR"

if [[ -z "${ORBIT_UPLOAD_DIR:-}" ]]; then
  echo "NOTE: Set ORBIT_UPLOAD_DIR=$MEDIA_DIR in the PM2/runtime environment."
fi

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Seeding media placements (idempotent)"
node --env-file=.env scripts/seed-media.mjs || echo "WARN: media seed skipped (non-fatal if already seeded)"

echo "==> Building Next.js"
npm run build

echo "==> Reloading PM2"
pm2 reload marlo-hotels --update-env || pm2 start npm --name marlo-hotels -- start
pm2 save
pm2 status marlo-hotels

cat <<'NGINX'

==> Nginx checklist (apply once if not already configured):

location /media/ {
    alias /srv/marlo-media/;
    access_log off;
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri @next_media;
}

location @next_media {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}

# Raise upload body size above Orbit image/video limits
client_max_body_size 220m;

NGINX

echo "Deploy complete."
echo "Verify: https://marlo.theglobalorbit.com/"
echo "Verify Orbit: https://marlo.theglobalorbit.com/orbit"
echo "Verify Media: https://marlo.theglobalorbit.com/orbit/media-library"

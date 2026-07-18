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
rm -rf .next
npm run build
test -f .next/BUILD_ID || { echo "FATAL: .next/BUILD_ID missing after build"; exit 1; }

echo "==> (Re)starting ONLY the marlo-hotels PM2 app on port 3001"
# Marlo must always bind 3001 (Hotel Thamel Park owns 3000). Recreate just
# the marlo-hotels process from its dedicated ecosystem file. This never
# references hotel-thamel-park, so that process stays untouched.
if pm2 describe marlo-hotels >/dev/null 2>&1; then
  pm2 delete marlo-hotels
fi
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 status marlo-hotels

echo "==> Smoke check Marlo on port 3001"
sleep 3
curl -fsS -o /dev/null -w "marlo_local_status=%{http_code}\n" http://127.0.0.1:3001/ \
  || { echo "FATAL: Marlo not answering on 127.0.0.1:3001"; pm2 logs marlo-hotels --lines 40 --nostream || true; exit 1; }

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
    proxy_pass http://127.0.0.1:3001;   # Marlo listens on 3001 (Thamel = 3000)
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

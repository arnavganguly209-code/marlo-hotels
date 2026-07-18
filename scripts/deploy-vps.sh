#!/usr/bin/env bash
# Run on the Hostinger VPS to deploy the latest Orbit fixes.
set -euo pipefail
cd /var/www/marlo-hotels
git fetch origin main
git reset --hard origin/main
npm ci
npx prisma generate
npx prisma migrate deploy || npx prisma db push || true
npm run build
pm2 reload marlo-hotels --update-env || pm2 start npm --name marlo-hotels -- start
pm2 save
pm2 status marlo-hotels
echo "Deploy complete. Verify https://marlo.theglobalorbit.com/orbit"

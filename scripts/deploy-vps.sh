#!/usr/bin/env bash
# Enterprise auto-deploy for Marlo Hotels ONLY.
# Never touches Hotel Thamel Park (PM2 process or nginx).
#
# Safe order:
#   1) pull + install + migrate + build
#   2) only if BUILD_ID exists, reload marlo-hotels on PORT=3001
#   3) health-check local :3001 and public URL
#   4) on post-reload failure, restore previous .next and reload again
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/marlo-hotels}"
PUBLIC_URL="${PUBLIC_URL:-https://marlo.theglobalorbit.com}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3001/}"
BACKUP_DIR=""

die() {
  echo "::error::$*" >&2
  echo "FATAL: $*" >&2
  exit 1
}

rollback() {
  local reason="$1"
  echo "==> ROLLBACK: $reason"
  if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" && -f "$BACKUP_DIR/BUILD_ID" ]]; then
    echo "==> Restoring previous .next from $BACKUP_DIR"
    rm -rf "$APP_DIR/.next"
    mv "$BACKUP_DIR" "$APP_DIR/.next"
    if pm2 describe marlo-hotels >/dev/null 2>&1; then
      pm2 reload ecosystem.config.js --update-env || pm2 restart marlo-hotels --update-env || true
      pm2 save || true
    fi
    echo "==> Rollback complete. Previous build restored."
  else
    echo "==> No previous .next backup available to restore."
  fi
  die "$reason"
}

cd "$APP_DIR" || die "Cannot cd to $APP_DIR (Marlo app root)."

echo "==> Deploying Marlo Hotels in $APP_DIR (Thamel Park untouched)"
echo "==> Recording previous build for rollback"
if [[ -f .next/BUILD_ID ]]; then
  BACKUP_DIR=".next.bak.$(cat .next/BUILD_ID).$$"
  rm -rf "$BACKUP_DIR"
  cp -a .next "$BACKUP_DIR"
  echo "    backed up BUILD_ID=$(cat .next/BUILD_ID) -> $BACKUP_DIR"
else
  echo "    no existing .next (first deploy or clean tree)"
fi

echo "==> Fetching origin/main"
git fetch origin main || die "git fetch origin main failed"
git reset --hard origin/main || die "git reset --hard origin/main failed"
echo "    HEAD=$(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"

echo "==> npm ci"
npm ci || die "npm ci failed"

echo "==> prisma generate"
npx prisma generate || die "prisma generate failed"

echo "==> prisma migrate deploy"
if [[ -n "${DATABASE_URL:-}" ]] || grep -qE '^DATABASE_URL=.+' .env 2>/dev/null; then
  npx prisma migrate deploy || die "prisma migrate deploy failed"
else
  echo "WARN: DATABASE_URL not set — skipping migrate (Orbit login may still work)."
fi

echo "==> Building production artifacts (PM2 not touched yet)"
rm -rf .next
npm run build || {
  # Restore previous build so the running process keeps serving
  if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
    mv "$BACKUP_DIR" .next
    echo "==> Build failed — previous .next restored; PM2 was not restarted."
  fi
  die "npm run build failed — PM2 left untouched"
}

[[ -f .next/BUILD_ID ]] || {
  if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
    rm -rf .next
    mv "$BACKUP_DIR" .next
  fi
  die ".next/BUILD_ID missing after build — PM2 left untouched"
}
echo "    BUILD_ID=$(cat .next/BUILD_ID)"

echo "==> Reloading ONLY marlo-hotels (PORT=3001 via ecosystem.config.js)"
if pm2 describe marlo-hotels >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env \
    || pm2 startOrReload ecosystem.config.js --update-env \
    || rollback "pm2 reload marlo-hotels failed"
else
  pm2 start ecosystem.config.js --update-env \
    || rollback "pm2 start marlo-hotels failed"
fi
pm2 save || echo "WARN: pm2 save failed (non-fatal)"
pm2 status marlo-hotels || true

echo "==> Health check: local $LOCAL_URL"
sleep 3
local_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$LOCAL_URL" || true)"
echo "    local_status=$local_code"
[[ "$local_code" == "200" ]] || {
  pm2 logs marlo-hotels --lines 50 --nostream || true
  rollback "Local health check failed (got HTTP $local_code from $LOCAL_URL)"
}

echo "==> Health check: public $PUBLIC_URL"
public_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$PUBLIC_URL" || true)"
echo "    public_status=$public_code"
[[ "$public_code" == "200" ]] || {
  pm2 logs marlo-hotels --lines 50 --nostream || true
  rollback "Public health check failed (got HTTP $public_code from $PUBLIC_URL)"
}

echo "==> PM2 online check"
pm2 describe marlo-hotels | grep -qiE 'status[ ]+online' \
  || rollback "PM2 marlo-hotels is not online after deploy"

# Cleanup successful backup
if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
  rm -rf "$BACKUP_DIR"
fi

echo "==> Deploy OK"
echo "    commit=$(git rev-parse --short HEAD)"
echo "    local=$LOCAL_URL -> 200"
echo "    public=$PUBLIC_URL -> 200"
echo "    pm2=marlo-hotels online on PORT=3001"

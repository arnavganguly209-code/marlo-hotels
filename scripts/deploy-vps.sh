#!/usr/bin/env bash
# Enterprise auto-deploy for Marlo Hotels ONLY.
# Never touches Hotel Thamel Park (PM2 name hotel-thamel-park / port 3000 / /var/www/hotel-thamel-park).
#
# Order:
#   1) pull + install + migrate + build
#   2) bring marlo-hotels online from ecosystem.config.js (PORT=3001)
#   3) health-check http://127.0.0.1:3001/ (hard fail)
#   4) verify public URL (best-effort with retries; hard fail only if local/PM2 fail)
#   5) on post-start failure, restore previous .next and re-start marlo-hotels
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/marlo-hotels}"
PUBLIC_URL="${PUBLIC_URL:-https://marlo.theglobalorbit.com}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3001/}"
PM2_NAME="marlo-hotels"
BACKUP_DIR=""

die() {
  echo "::error::$*" >&2
  echo "FATAL: $*" >&2
  exit 1
}

dump_pm2_diagnostics() {
  echo "==> DIAGNOSTICS: PM2 / Next.js (marlo-hotels only)"
  pm2 status || true
  echo "---- pm2 describe ${PM2_NAME} ----"
  pm2 describe "$PM2_NAME" || true
  echo "---- pm2 pid ${PM2_NAME} ----"
  pm2 pid "$PM2_NAME" || true
  echo "---- pm2 env ${PM2_NAME} (PORT) ----"
  pm2 env "$PM2_NAME" 2>/dev/null | grep -E '^(PORT|NODE_ENV)=' || true
  echo "---- listening on :3001 ----"
  (ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null || true) | grep -E ':3001\b' || echo "WARN: nothing listening on :3001"
  echo "---- pm2 logs ${PM2_NAME} (last 80) ----"
  pm2 logs "$PM2_NAME" --lines 80 --nostream || true
  echo "---- next start log (err) ----"
  if [[ -n "${HOME:-}" ]]; then
    # PM2 default log paths
    err_log="${HOME}/.pm2/logs/${PM2_NAME}-error.log"
    out_log="${HOME}/.pm2/logs/${PM2_NAME}-out.log"
    [[ -f "$err_log" ]] && { echo "=== $err_log ==="; tail -n 80 "$err_log" || true; }
    [[ -f "$out_log" ]] && { echo "=== $out_log ==="; tail -n 80 "$out_log" || true; }
  fi
}

# Returns: missing | online | stopped | errored | unknown
pm2_process_state() {
  if ! pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    echo "missing"
    return 0
  fi
  # Prefer jlist JSON; fall back to describe text.
  local status=""
  if command -v node >/dev/null 2>&1; then
    status="$(
      pm2 jlist 2>/dev/null | node -e "
        let raw='';
        process.stdin.on('data', d => raw += d);
        process.stdin.on('end', () => {
          try {
            const list = JSON.parse(raw);
            const app = list.find(a => a.name === '${PM2_NAME}');
            process.stdout.write(app && app.pm2_env ? String(app.pm2_env.status || '') : '');
          } catch { process.stdout.write(''); }
        });
      " || true
    )"
  fi
  if [[ -z "$status" ]]; then
    status="$(pm2 describe "$PM2_NAME" 2>/dev/null | awk -F'│' '/status/ {gsub(/ /,"",$2); print $2; exit}' || true)"
  fi
  status="$(echo "$status" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
  case "$status" in
    online) echo "online" ;;
    stopped|stopping) echo "stopped" ;;
    errored|error) echo "errored" ;;
    *) echo "unknown" ;;
  esac
}

ensure_marlo_pm2() {
  # NEVER use: pm2 restart marlo-hotels
  # Always start/reload from ecosystem.config.js with --update-env
  [[ -f ecosystem.config.js ]] || die "ecosystem.config.js missing in $APP_DIR"

  local state
  state="$(pm2_process_state)"
  echo "==> PM2 ${PM2_NAME} state before start: $state"

  if [[ "$state" == "stopped" || "$state" == "errored" || "$state" == "unknown" ]]; then
    echo "==> ${PM2_NAME} exists but is not healthy ($state) — deleting then starting from ecosystem.config.js"
    pm2 delete "$PM2_NAME" || true
    state="missing"
  fi

  if [[ "$state" == "online" ]]; then
    echo "==> Reloading ${PM2_NAME} from ecosystem.config.js --update-env"
    pm2 reload ecosystem.config.js --update-env \
      || {
        echo "==> reload failed — delete + start from ecosystem.config.js"
        pm2 delete "$PM2_NAME" || true
        pm2 start ecosystem.config.js --update-env \
          || return 1
      }
  else
    echo "==> Starting ${PM2_NAME} from ecosystem.config.js --update-env"
    pm2 start ecosystem.config.js --update-env || return 1
  fi

  echo "==> Waiting 5s for Next.js to bind :3001"
  sleep 5

  echo "==> pm2 status"
  pm2 status || true
  echo "==> pm2 describe ${PM2_NAME}"
  pm2 describe "$PM2_NAME" || true
  echo "==> pm2 pid ${PM2_NAME}"
  pm2 pid "$PM2_NAME" || true

  # Verify PORT=3001 in process env
  local port_env=""
  port_env="$(pm2 env "$PM2_NAME" 2>/dev/null | awk -F= '/^PORT=/{print $2; exit}' || true)"
  echo "    PORT env from PM2: ${port_env:-<unset>}"
  if [[ -n "$port_env" && "$port_env" != "3001" ]]; then
    echo "::error::PM2 ${PM2_NAME} PORT is '$port_env' (expected 3001). Thamel Park owns 3000."
    return 1
  fi

  state="$(pm2_process_state)"
  echo "==> PM2 ${PM2_NAME} state after start: $state"
  [[ "$state" == "online" ]] || return 1
  return 0
}

rollback() {
  local reason="$1"
  echo "==> ROLLBACK: $reason"
  dump_pm2_diagnostics
  if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" && -f "$BACKUP_DIR/BUILD_ID" ]]; then
    echo "==> Restoring previous .next from $BACKUP_DIR"
    rm -rf "$APP_DIR/.next"
    mv "$BACKUP_DIR" "$APP_DIR/.next"
    # Bring previous build back online (still no pm2 restart)
    if ! ensure_marlo_pm2; then
      echo "==> Rollback PM2 bring-up also failed"
      dump_pm2_diagnostics
    else
      pm2 save || true
      echo "==> Rollback complete. Previous build restored."
    fi
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
  echo "==> purge demo / placeholder media (preserve large Hero video)"
  node --env-file=.env scripts/purge-demo-media.mjs || echo "WARN: demo media purge skipped"
else
  echo "WARN: DATABASE_URL not set — skipping migrate (Orbit login may still work)."
fi

echo "==> Building production artifacts (PM2 not touched yet)"
rm -rf .next
npm run build || {
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

echo "==> Bringing ONLY ${PM2_NAME} online (PORT=3001 via ecosystem.config.js)"
ensure_marlo_pm2 || rollback "PM2 ${PM2_NAME} is not online after deploy"
pm2 save || echo "WARN: pm2 save failed (non-fatal)"

echo "==> Health check: local $LOCAL_URL (must be 200)"
local_code=""
for attempt in 1 2 3 4 5 6; do
  local_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$LOCAL_URL" || true)"
  echo "    attempt=$attempt local_status=$local_code"
  if [[ "$local_code" == "200" ]]; then
    break
  fi
  # If process died mid-boot, try one more bring-up
  if [[ "$attempt" == "3" ]]; then
    echo "==> Local not ready — re-ensuring PM2 from ecosystem.config.js"
    ensure_marlo_pm2 || true
  fi
  sleep 3
done

if [[ "$local_code" != "200" ]]; then
  dump_pm2_diagnostics
  rollback "Local health check failed (got HTTP ${local_code:-000} from $LOCAL_URL). Next must listen on 3001."
fi

# Confirm something is actually bound to 3001
if ! (ss -ltn 2>/dev/null || netstat -ltn 2>/dev/null || true) | grep -qE ':3001\b'; then
  echo "WARN: ss/netstat did not show :3001 (tool may be restricted); curl 200 already confirmed."
fi

echo "==> Health check: public $PUBLIC_URL (best-effort; deploy fails only on PM2/local)"
public_code="000"
for attempt in 1 2 3 4 5; do
  public_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$PUBLIC_URL" || true)"
  echo "    attempt=$attempt public_status=$public_code"
  if [[ "$public_code" == "200" ]]; then
    break
  fi
  sleep 3
done
if [[ "$public_code" != "200" ]]; then
  echo "WARN: Public URL returned HTTP $public_code (local :3001 is healthy). Nginx may lag; not failing deploy."
fi

final_state="$(pm2_process_state)"
[[ "$final_state" == "online" ]] || rollback "PM2 ${PM2_NAME} is not online after deploy (state=$final_state)"

# Cleanup successful backup
if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
  rm -rf "$BACKUP_DIR"
fi

echo "==> Deploy OK"
echo "    commit=$(git rev-parse --short HEAD)"
echo "    local=$LOCAL_URL -> 200"
echo "    public=$PUBLIC_URL -> $public_code"
echo "    pm2=${PM2_NAME} online on PORT=3001"
echo "    thamel=untouched"

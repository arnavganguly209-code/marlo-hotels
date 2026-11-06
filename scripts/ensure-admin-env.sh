#!/usr/bin/env bash
# Upsert hotel /admin login keys into the runtime .env (VPS PM2).
set -euo pipefail

ENV_FILE="${1:-/var/www/marlo-hotels/.env}"
mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"

upsert() {
  local key="$1"
  local value="$2"
  local line="${key}=\"${value}\""
  if grep -qE "^${key}=" "$ENV_FILE"; then
    awk -v k="$key" -v line="$line" '
      index($0, k"=")==1 { print line; next }
      { print }
    ' "$ENV_FILE" > "${ENV_FILE}.tmp"
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
  else
    printf '%s\n' "$line" >> "$ENV_FILE"
  fi
}

upsert "ADMIN_USER_ID" "Marlohotel"
upsert "ADMIN_PASSWORD" "@marlohotels01#"

if ! grep -qE '^ADMIN_SESSION_SECRET=.+' "$ENV_FILE"; then
  secret="$(node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64url'))")"
  upsert "ADMIN_SESSION_SECRET" "$secret"
fi

echo "OK: hotel /admin env keys written to $ENV_FILE"

#!/usr/bin/env bash
# Upsert non-secret SMTP keys into /var/www/marlo-hotels/.env
# NEVER writes SMTP_PASSWORD. Operator must set that manually.
set -euo pipefail

ENV_FILE="${1:-/var/www/marlo-hotels/.env}"
mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"

upsert() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    # Portable in-place replace without printing secrets
    awk -v k="$key" -v v="$value" '
      BEGIN { FS=OFS="=" }
      $1==k { print k"="v; next }
      { print }
    ' "$ENV_FILE" > "${ENV_FILE}.tmp"
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

upsert "SMTP_HOST" "mail.theglobalorbit.com"
upsert "SMTP_PORT" "587"
upsert "SMTP_ENCRYPTION" "tls"
upsert "SMTP_USER" "booking@marlohotels.com"
upsert "SMTP_FROM" "booking@marlohotels.com"
upsert "BOOKING_NOTIFICATION_EMAIL" "booking@marlohotels.com"

if ! grep -qE '^SMTP_PASSWORD=' "$ENV_FILE"; then
  printf 'SMTP_PASSWORD=\n' >> "$ENV_FILE"
fi

echo "OK: non-secret SMTP keys written to $ENV_FILE"
echo "ACTION REQUIRED: set SMTP_PASSWORD in that file (or PM2 env), then:"
echo "  cd /var/www/marlo-hotels && pm2 reload ecosystem.config.js --update-env"
echo "  node --env-file=.env scripts/verify-smtp-config.mjs --connect"

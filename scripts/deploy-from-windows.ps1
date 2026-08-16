# Manual Marlo deploy from Windows → Hostinger VPS
# Bypasses GitHub Actions. Runs the same remote script Actions uses.
#
# REQUIRED (single missing piece if deploy fails):
#   Private key file at ONE of:
#     C:\Users\Admin\.ssh\marlo_vps
#     C:\Users\Admin\.ssh\marlo_vps.pem
#     C:\Users\Admin\.ssh\id_ed25519
#     C:\Users\Admin\.ssh\id_rsa
#
# Usage (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\deploy-from-windows.ps1
#
# Optional env overrides:
#   $env:VPS_HOST = "200.97.170.235"
#   $env:VPS_USERNAME = "root"
#   $env:VPS_PORT = "22"
#   $env:VPS_SSH_KEY = "C:\Users\Admin\.ssh\marlo_vps"

$ErrorActionPreference = "Stop"

$hostName = if ($env:VPS_HOST) { $env:VPS_HOST } else { "200.97.170.235" }
$user = if ($env:VPS_USERNAME) { $env:VPS_USERNAME } else { "root" }
$port = if ($env:VPS_PORT) { $env:VPS_PORT } else { "22" }

$keyCandidates = @(
  $env:VPS_SSH_KEY,
  "$env:USERPROFILE\.ssh\marlo_vps",
  "$env:USERPROFILE\.ssh\marlo_vps.pem",
  "$env:USERPROFILE\.ssh\id_ed25519",
  "$env:USERPROFILE\.ssh\id_rsa"
) | Where-Object { $_ -and $_.Trim() }

$keyPath = $null
foreach ($candidate in $keyCandidates) {
  if (Test-Path -LiteralPath $candidate) {
    $keyPath = (Resolve-Path -LiteralPath $candidate).Path
    break
  }
}

if (-not $keyPath) {
  Write-Host @"

DEPLOY BLOCKED — private SSH key not found on this machine.

Place the VPS private key (the same content as GitHub secret VPS_SSH_KEY) at:

  C:\Users\Admin\.ssh\marlo_vps

Then re-run:

  powershell -ExecutionPolicy Bypass -File scripts\deploy-from-windows.ps1

Also accepted:
  C:\Users\Admin\.ssh\marlo_vps.pem
  C:\Users\Admin\.ssh\id_ed25519
  C:\Users\Admin\.ssh\id_rsa
  or set `$env:VPS_SSH_KEY to the full path

Host: $hostName
User: $user (override with `$env:VPS_USERNAME if different)

"@
  exit 2
}

Write-Host "==> Using key: $keyPath"
Write-Host "==> SSH $user@${hostName}:$port → bash scripts/deploy-vps.sh"

# Match GitHub Actions remote steps exactly.
$remote = @'
set -euo pipefail
cd /var/www/marlo-hotels
git fetch origin main
git reset --hard origin/main
chmod +x scripts/deploy-vps.sh
bash scripts/deploy-vps.sh
'@ -replace "`r", ""

ssh -i $keyPath `
  -p $port `
  -o IdentitiesOnly=yes `
  -o StrictHostKeyChecking=accept-new `
  -o BatchMode=yes `
  "${user}@${hostName}" `
  $remote

if ($LASTEXITCODE -ne 0) {
  Write-Host "Remote deploy failed (exit $LASTEXITCODE)."
  exit $LASTEXITCODE
}

Write-Host "==> Verifying live homepage..."
$code = (Invoke-WebRequest -Uri "https://marlohotels.com/" -UseBasicParsing -TimeoutSec 30).StatusCode
Write-Host "Live HTTP $code"
Write-Host "Deploy finished."

# Regenerate the stream-optimized homepage hero video.
# Usage (PowerShell, from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts\optimize-hero-video.ps1
#
# Requires: npm package @ffmpeg-installer/ffmpeg (dev) OR ffmpeg on PATH.
# Source defaults to the live Orbit hero URL; override with $env:HERO_SOURCE_URL.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$sourceUrl = if ($env:HERO_SOURCE_URL) {
  $env:HERO_SOURCE_URL
} else {
  "https://marlo.theglobalorbit.com/media/video/1784832179111-81063490-a.mp4"
}

$ff = $null
try {
  $ff = (node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)")
} catch {}
if (-not $ff) {
  $ff = (Get-Command ffmpeg -ErrorAction SilentlyContinue)?.Source
}
if (-not $ff -or -not (Test-Path $ff)) {
  throw "ffmpeg not found. Install @ffmpeg-installer/ffmpeg or add ffmpeg to PATH."
}

New-Item -ItemType Directory -Force -Path "tmp", "public\videos" | Out-Null
$src = "tmp\hero-source.mp4"
$out = "public\videos\hero-loop.mp4"

Write-Host "==> Downloading source..."
Invoke-WebRequest -Uri $sourceUrl -OutFile $src -UseBasicParsing
Write-Host ("    source: {0:N2} MB" -f ((Get-Item $src).Length / 1MB))

Write-Host "==> Compressing stream cut (1280p H.264, no audio, faststart)..."
& $ff -y -i $src -an `
  -vf "scale='min(1280,iw)':-2" `
  -c:v libx264 -preset veryfast -profile:v main -level 3.1 -pix_fmt yuv420p `
  -crf 28 -movflags +faststart -g 48 -keyint_min 48 -sc_threshold 0 `
  -maxrate 2M -bufsize 4M `
  $out

Write-Host ("==> Done: {0:N2} MB -> {1}" -f ((Get-Item $out).Length / 1MB), $out)

# إعداد Resend على Vercel — شغّل مرة واحدة بعد: npx vercel login
param(
  [string]$ApiKey = $env:RESEND_API_KEY,
  [string]$FromEmail = "Alkhedr Cars <noreply@alkhodercar.com>",
  [switch]$Production
)

if (-not $ApiKey) {
  $envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^RESEND_API_KEY=(.+)$') { $ApiKey = $matches[1].Trim() }
    }
  }
}

if (-not $ApiKey) {
  Write-Host "Missing RESEND_API_KEY in .env"
  exit 1
}

Set-Location (Join-Path $PSScriptRoot "..")

if (-not $Production) {
  $FromEmail = "onboarding@resend.dev"
  Write-Host "Test mode: onboarding@resend.dev"
  Write-Host "After domain verify run: npm run email:setup-vercel -- -Production"
} else {
  Write-Host "Production mode: noreply@alkhodercar.com"
}

Write-Host "Adding Resend env vars on Vercel..."
$ApiKey | npx vercel env add RESEND_API_KEY production
$FromEmail | npx vercel env add RESEND_FROM_EMAIL production
if ($Production) {
  "true" | npx vercel env add RESEND_USE_PRODUCTION production
}

Write-Host "Done. Redeploy on Vercel Dashboard, then: npm run email:test"
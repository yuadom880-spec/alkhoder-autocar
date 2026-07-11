# إعداد Resend على Vercel — شغّل مرة واحدة بعد: npx vercel login
param(
  [string]$ApiKey = $env:RESEND_API_KEY,
  [string]$FromEmail = "onboarding@resend.dev"
)

if (-not $ApiKey) {
  $envFile = Join-Path $PSScriptRoot ".." ".env"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^RESEND_API_KEY=(.+)$') { $ApiKey = $matches[1].Trim() }
    }
  }
}

if (-not $ApiKey) {
  Write-Host "❌ ضع RESEND_API_KEY في .env أو مرّره كمعامل"
  exit 1
}

Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "إضافة RESEND_API_KEY و RESEND_FROM_EMAIL على Vercel..."
$ApiKey | npx vercel env add RESEND_API_KEY production
$FromEmail | npx vercel env add RESEND_FROM_EMAIL production

Write-Host "✅ تم — اعمل Redeploy من Vercel Dashboard"
Write-Host "ثم شغّل: npm run email:test"
# إعداد Resend على Vercel — شغّل مرة واحدة بعد: npx vercel login
param(
  [string]$ApiKey = $env:RESEND_API_KEY,
  [string]$FromEmail = "Alkhedr Cars <Alkhedr.qa@alkhedrcars.com>",
  [switch]$Production
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

if (-not $Production) {
  $FromEmail = "onboarding@resend.dev"
  Write-Host "وضع الاختبار — الإيميل يصل فقط لـ yuadom14@gmail.com"
  Write-Host "بعد تحقق الدومين شغّل: npm run email:setup-vercel -Production"
} else {
  Write-Host "وضع الإنتاج — إرسال لأي عميل وأي فرع"
}

Write-Host "إضافة متغيرات Resend على Vercel..."
$ApiKey | npx vercel env add RESEND_API_KEY production
$FromEmail | npx vercel env add RESEND_FROM_EMAIL production
if ($Production) {
  "true" | npx vercel env add RESEND_USE_PRODUCTION production
}

Write-Host "✅ تم — اعمل Redeploy من Vercel Dashboard"
Write-Host "ثم شغّل: npm run email:test"
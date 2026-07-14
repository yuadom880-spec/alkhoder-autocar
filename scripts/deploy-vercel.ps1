# نشر يدوي على Vercel — شغّل مرة واحدة بعد: npx vercel login
param(
  [switch]$Setup
)

Set-Location (Join-Path $PSScriptRoot "..")

if ($Setup) {
  Write-Host "=== إعداد النشر التلقائي ===" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "1) ادخل: https://vercel.com/account/tokens"
  Write-Host "2) أنشئ Token وسمّه: alkhoder-deploy"
  Write-Host "3) من المشروع alkhoder-autocar-rental → Settings → General:"
  Write-Host "   انسخ Project ID و Team/Org ID"
  Write-Host "4) في GitHub → alkhoder-autocar → Settings → Secrets:"
  Write-Host "   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
  Write-Host ""
  Write-Host "5) GitHub → Settings → Integrations → Vercel → Configure"
  Write-Host "   تأكد إن alkhoder-autocar مفعّل"
  exit 0
}

Write-Host "Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Deploying to production..." -ForegroundColor Yellow
npx vercel deploy --prebuilt --prod --yes
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "لو فشل: npx vercel login" -ForegroundColor Red
  Write-Host "ثم: npx vercel link --project alkhoder-autocar-rental"
  exit 1
}

Write-Host "Done! Check https://alkhodercar.com" -ForegroundColor Green
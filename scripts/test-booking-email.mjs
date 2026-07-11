/**
 * اختبار Resend + Edge Function لإشعارات الحجز
 * الاستخدام: node scripts/test-booking-email.mjs
 * المتغيرات (من .env أو سطر الأوامر):
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL (افتراضي: Alkhedr Cars <yuadom14@gmail.com>)
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(root, '.env')
  if (!existsSync(envPath)) return {}
  const vars = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0) vars[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return vars
}

const env = { ...loadEnv(), ...process.env }
const RESEND_API_KEY = env.RESEND_API_KEY
const RESEND_FROM = env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const SITE_URL = (env.VITE_SITE_URL ?? 'https://alkhodercar.com').replace(/\/$/, '')
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY
const TEST_TO = env.TEST_EMAIL_TO ?? 'yuadom14@gmail.com'

if (!RESEND_API_KEY) {
  console.error('❌ ضع RESEND_API_KEY في .env')
  process.exit(1)
}

const sampleHtml = `<h2>اختبار إشعار حجز — الخضر للسيارات</h2>
<p>تم استلام طلب حجز تجريبي بنجاح.</p>
<p><strong>الفرع:</strong> الفرع الرئيسي — طريق المطار</p>`

async function testResendDirect() {
  console.log('\n📧 1) اختبار Resend مباشرة...')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [TEST_TO],
      subject: 'اختبار Resend — عبدالمجيد الخضر لتأجير السيارات',
      html: sampleHtml,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('   ✗ فشل:', JSON.stringify(data, null, 2))
    return false
  }
  console.log('   ✓ نجح — id:', data.id)
  return true
}

async function testVercelApi() {
  console.log('\n📧 2) اختبار Vercel API /api/send-booking-email...')
  const res = await fetch(`${SITE_URL}/api/send-booking-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: TEST_TO,
      subject: 'اختبار Vercel API — حجز الخضر',
      html: sampleHtml,
    }),
  })
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    console.error('   ✗ استجابة غير JSON (status', res.status, ') — انتظر deploy Vercel أو أضف RESEND_API_KEY')
    return false
  }
  if (data?.ok) {
    console.log('   ✓ نجح — id:', data.id)
    return true
  }
  console.error('   ✗ فشل:', JSON.stringify(data, null, 2))
  if (data?.error === 'resend_not_configured') {
    console.log('   → أضف RESEND_API_KEY في Vercel → Environment Variables')
  }
  return false
}

async function testEdgeFunction() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.log('\n⏭ تخطي Supabase Edge Function')
    return null
  }

  console.log('\n📧 3) اختبار Supabase Edge Function...')
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
    body: JSON.stringify({
      to: TEST_TO,
      subject: 'اختبار Edge Function — حجز الخضر',
      html: sampleHtml,
    }),
  })
  const data = await res.json()
  if (data?.ok) {
    console.log('   ✓ نجح — id:', data.id)
    return true
  }
  console.error('   ✗ فشل:', JSON.stringify(data, null, 2))
  if (data?.error === 'resend_not_configured') {
    console.log('   → أضف RESEND_API_KEY في Supabase Edge Functions → Secrets')
  }
  return false
}

const direct = await testResendDirect()
const vercel = await testVercelApi()
const edge = await testEdgeFunction()

console.log('\n─── ملخص ───')
console.log('Resend مباشر:', direct ? '✓' : '✗')
console.log('Vercel API:', vercel ? '✓' : '✗')
console.log('Supabase Edge:', edge === null ? '—' : edge ? '✓' : '✗')
process.exit(direct && vercel ? 0 : direct ? 0 : 1)
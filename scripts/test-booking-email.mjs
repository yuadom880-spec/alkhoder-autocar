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
const TEST_CUSTOMER = env.TEST_EMAIL_CUSTOMER ?? 'customer-test@example.com'
const TEST_BRANCH_MAKKAH = env.TEST_EMAIL_BRANCH_MAKKAH ?? 'makkah@alkhedrcars.com'

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

async function testVercelCustomerEmail() {
  console.log('\n📧 3) اختبار إيميل عميل (بريد مختلف عن الأدمن)...')
  const res = await fetch(`${SITE_URL}/api/send-booking-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: TEST_CUSTOMER,
      subject: 'اختبار إيميل عميل — حجز الخضر',
      html: sampleHtml,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (data?.ok) {
    console.log('   ✓ نجح — الإيميل يصل لأي عميل — id:', data.id)
    return true
  }
  const msg = data?.error?.message ?? JSON.stringify(data?.error ?? data)
  console.error('   ✗ فشل:', msg)
  if (String(msg).includes('only send testing emails')) {
    console.log('   → الدومين alkhedrcars.com لم يُتحقق بعد — شغّل: npm run email:check-domain')
  }
  return false
}

async function testVercelBranchEmail() {
  console.log('\n📧 4) اختبار إيميل فرع مكة (توجيه الفروع)...')
  const res = await fetch(`${SITE_URL}/api/send-booking-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: TEST_BRANCH_MAKKAH,
      subject: 'اختبار إشعار فرع مكة — حجز الخضر',
      html: sampleHtml,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (data?.ok) {
    console.log('   ✓ نجح — إيميل فرع مكة:', TEST_BRANCH_MAKKAH, '— id:', data.id)
    return true
  }
  const msg = data?.error?.message ?? JSON.stringify(data?.error ?? data)
  console.error('   ✗ فشل:', msg)
  if (String(msg).includes('only send testing emails')) {
    console.log('   → بعد تحقق الدومين، كل فرع يستلم على بريده من لوحة الإدارة')
  }
  return false
}

async function testEdgeFunction() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.log('\n⏭ تخطي Supabase Edge Function')
    return null
  }

  console.log('\n📧 5) اختبار Supabase Edge Function...')
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
const customer = await testVercelCustomerEmail()
const branch = await testVercelBranchEmail()
const edge = await testEdgeFunction()

console.log('\n─── ملخص ───')
console.log('Resend مباشر:', direct ? '✓' : '✗')
console.log('Vercel API (أدمن):', vercel ? '✓' : '✗')
console.log('إيميل عميل (بريد مختلف):', customer ? '✓' : '✗ (يحتاج تحقق دومين)')
console.log('إيميل فرع مكة:', branch ? '✓' : '✗ (يحتاج تحقق دومين)')
console.log('Supabase Edge:', edge === null ? '—' : edge ? '✓' : '✗')
process.exit(direct && vercel ? 0 : direct ? 0 : 1)
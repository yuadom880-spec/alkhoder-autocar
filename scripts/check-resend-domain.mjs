/**
 * فحص تحقق دومين Resend وعرض سجلات DNS المطلوبة
 * الاستخدام: npm run email:check-domain
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
const API_KEY = env.RESEND_API_KEY
const DOMAIN = env.RESEND_DOMAIN ?? 'alkhedrcars.com'
const PRODUCTION_FROM = env.RESEND_FROM_EMAIL_PROD ?? 'Alkhedr Cars <Alkhedr.qa@alkhedrcars.com>'

if (!API_KEY) {
  console.error('❌ ضع RESEND_API_KEY في .env')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${API_KEY}` }

async function main() {
  console.log(`\n🔍 فحص دومين Resend: ${DOMAIN}\n`)

  const listRes = await fetch('https://api.resend.com/domains', { headers })
  const list = await listRes.json()
  const domain = list?.data?.find((d) => d.name === DOMAIN)

  if (!domain) {
    console.log('❌ الدومين غير مضاف على Resend')
    console.log('   → ادخل https://resend.com/domains وأضف', DOMAIN)
    process.exit(1)
  }

  const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers })
  const detail = await detailRes.json()

  console.log('الحالة:', detail.status === 'verified' ? '✅ verified' : `⏳ ${detail.status}`)

  if (detail.status !== 'verified') {
    console.log('\n📋 أضف هذه السجلات في DNS (عند مسجّل الدومين):\n')
    for (const r of detail.records ?? []) {
      const host = r.name === '@' ? DOMAIN : `${r.name}.${DOMAIN}`
      console.log(`  [${r.record}] ${r.type}`)
      console.log(`    Host: ${host}`)
      console.log(`    Value: ${r.value}${r.priority != null ? ` (priority ${r.priority})` : ''}`)
      console.log(`    Status: ${r.status}\n`)
    }

    console.log('بعد الإضافة انتظر 5–30 دقيقة ثم شغّل: npm run email:check-domain')
    console.log('أو اضغط Verify في لوحة Resend\n')
  }

  const testTo = env.TEST_EMAIL_OTHER ?? 'test-customer@example.com'
  const from = detail.status === 'verified' ? PRODUCTION_FROM : 'onboarding@resend.dev'

  console.log(`📧 اختبار إرسال من ${from} إلى ${testTo}...`)
  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [testTo],
      subject: 'اختبار دومين — الخضر للسيارات',
      html: '<p>اختبار إرسال لعميل ببريد مختلف</p>',
    }),
  })
  const sendData = await sendRes.json()

  if (sendRes.ok) {
    console.log('✅ الإرسال لأي بريد يعمل — id:', sendData.id)
    console.log('\n── إعداد Vercel (Production) ──')
    console.log('RESEND_FROM_EMAIL =', PRODUCTION_FROM)
    console.log('RESEND_USE_PRODUCTION = true')
    console.log('ثم Redeploy')
  } else {
    const msg = sendData?.message ?? JSON.stringify(sendData)
    console.log('✗ فشل:', msg)
    if (msg.includes('only send testing emails')) {
      console.log('\n💡 السبب: الدومين لم يُتحقق بعد — الإيميل يصل فقط لبريد حساب Resend (yuadom14@gmail.com)')
      console.log('   بعد تحقق الدومين سيصل إيميل العميل وأيميل كل فرع على بريده الخاص')
    }
    if (msg.includes('not verified')) {
      console.log('\n💡 أكمل سجلات DNS أعلاه ثم أعد الفحص')
    }
  }

  console.log('\n── توجيه الفروع ──')
  console.log('كل فرع يستلم على البريد المُدخل في لوحة الإدارة → الفروع')
  console.log('حجز فرع مكة → إيميل فرع مكة | حجز الفرع الرئيسي → إيميل الفرع الرئيسي')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
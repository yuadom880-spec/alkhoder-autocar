/**
 * تحديث قالب تأكيد التسجيل في Supabase (كود OTP عربي بدل رابط Confirm)
 *
 * 1) أنشئ Access Token: https://supabase.com/dashboard/account/tokens
 * 2) ضعه في .env: SUPABASE_ACCESS_TOKEN=sbp_...
 * 3) شغّل: npm run auth:setup-email-template
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
const token = env.SUPABASE_ACCESS_TOKEN
const supabaseUrl = env.VITE_SUPABASE_URL ?? ''
const projectRef =
  env.SUPABASE_PROJECT_REF ??
  supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

const SUBJECT = 'رمز التحقق — عبدالمجيد الخضر لتأجير السيارات'
const templatePath = resolve(root, 'supabase/email-templates/confirm-signup.html')
const templateContent = readFileSync(templatePath, 'utf8').trim()

if (!token) {
  console.error('❌ ضع SUPABASE_ACCESS_TOKEN في .env')
  console.error('   أنشئه من: https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

if (!projectRef) {
  console.error('❌ لم يُعثر على مرجع المشروع — ضع VITE_SUPABASE_URL في .env')
  process.exit(1)
}

const body = {
  mailer_subjects_confirmation: SUBJECT,
  mailer_templates_confirmation_content: templateContent,
}

console.log(`\n📧 تحديث قالب Confirm signup للمشروع ${projectRef}...\n`)

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

const data = await res.json().catch(() => ({}))

if (!res.ok) {
  console.error('❌ فشل التحديث:', data?.message ?? JSON.stringify(data))
  process.exit(1)
}

console.log('✅ تم تحديث قالب الإيميل بنجاح')
console.log('   Subject:', SUBJECT)
console.log('   يحتوي على {{ .Token }} — كود التحقق')
console.log('\nجرّب تسجيل حساب جديد على الموقع للتأكد.\n')
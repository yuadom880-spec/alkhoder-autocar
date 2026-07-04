import { createClient } from '@supabase/supabase-js'
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

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('❌ ملف .env ناقص')
  process.exit(1)
}

const supabase = createClient(url, key)

console.log('🔍 فحص الاتصال بـ Supabase...\n')

const { data: cars, error: carsErr } = await supabase.from('cars').select('id, name').limit(3)
if (carsErr) {
  console.error('❌ جدول cars:', carsErr.message)
  console.log('\n💡 شغّل: npm run db:setup (بعد إضافة SUPABASE_DB_PASSWORD في .env)')
  console.log('   أو نفّذ supabase/schema.sql في SQL Editor\n')
  process.exit(1)
}

console.log(`✅ جدول cars: ${cars?.length ?? 0} سيارات`)
cars?.forEach((c) => console.log(`   - ${c.name}`))

const { error: authErr } = await supabase.auth.signInWithPassword({
  email: 'yuadom880@gmail.com',
  password: '090909',
})
if (authErr) {
  console.warn('\n⚠️  تسجيل دخول الأدمن:', authErr.message)
  console.log('   أنشئ المستخدم في: Authentication → Users → Add user')
  console.log('   Email: yuadom880@gmail.com | Password: 090909 | Auto Confirm: ✅')
} else {
  console.log('\n✅ تسجيل دخول الأدمن يعمل')
  await supabase.auth.signOut()
}

console.log('\n🎉 Supabase جاهز!\n')
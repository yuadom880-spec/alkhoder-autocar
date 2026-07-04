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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const EMAIL = 'yuadom880@gmail.com'
const PASSWORD = '090909'

console.log('🔐 إنشاء حساب الأدمن...\n')

// محاولة تسجيل الدخول أولاً
const { data: login } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
if (login?.user) {
  console.log('✅ الحساب موجود ويعمل!')
  await supabase.auth.signOut()
  process.exit(0)
}

// محاولة التسجيل
const { data: signup, error } = await supabase.auth.signUp({
  email: EMAIL,
  password: PASSWORD,
  options: { data: { role: 'admin' } },
})

if (error) {
  console.error('❌', error.message)
  console.log('\n📋 أنشئ الحساب يدوياً:')
  console.log('   Supabase → Authentication → Users → Add user')
  console.log(`   Email: ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)
  console.log('   ✅ Auto Confirm User\n')
  process.exit(1)
}

if (signup?.user) {
  console.log('✅ تم إنشاء الحساب!')
  if (!signup.session) {
    console.log('⚠️  فعّل "Auto Confirm" في Supabase أو أكّد الإيميل')
    console.log('   Authentication → Providers → Email → Confirm email: OFF\n')
  } else {
    console.log('✅ تسجيل الدخول يعمل!\n')
    await supabase.auth.signOut()
  }
}
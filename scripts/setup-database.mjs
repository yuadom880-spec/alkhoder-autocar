/**
 * إعداد قاعدة بيانات Supabase
 * أضف SUPABASE_DB_PASSWORD في .env من: Settings → Database
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

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
const projectRef = (env.VITE_SUPABASE_URL ?? '').replace('https://', '').split('.')[0]
const password = env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.error('\n❌ أضف SUPABASE_DB_PASSWORD في ملف .env')
  console.error('   من: Supabase Dashboard → Settings → Database → Database password\n')
  process.exit(1)
}

const schema = readFileSync(resolve(root, 'supabase/schema.sql'), 'utf8')

const urls = [
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
]

let connected = false
for (const connectionString of urls) {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    console.log('🔗 محاولة الاتصال...')
    await client.connect()
    console.log('✅ متصل!')
    await client.query(schema)
    await client.end()
    connected = true
    console.log('✅ تم إنشاء الجداول والسياسات والبيانات التجريبية!')
    break
  } catch (err) {
    await client.end().catch(() => {})
    console.log(`   ↪️  ${err.message?.slice(0, 80)}`)
  }
}

if (!connected) {
  console.error('\n❌ فشل الاتصال — تأكد من كلمة مرور قاعدة البيانات')
  console.log('   أو نفّذ supabase/schema.sql يدوياً في SQL Editor\n')
  process.exit(1)
}
/**
 * إضافة عمود branch_phone لجدول الحجوزات
 * نفّذ: npm run db:migrate-branch-phone
 * أو انسخ SQL إلى Supabase SQL Editor
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

const SQL =
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_phone TEXT DEFAULT NULL;'

const env = loadEnv()
const projectRef = (env.VITE_SUPABASE_URL ?? '').replace('https://', '').split('.')[0]
const password = env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.log('\n📋 نفّذ هذا الأمر في Supabase → SQL Editor:\n')
  console.log(SQL)
  console.log('')
  process.exit(0)
}

const urls = [
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
]

for (const connectionString of urls) {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query(SQL)
    await client.end()
    console.log('✅ تم إضافة عمود branch_phone')
    process.exit(0)
  } catch (err) {
    await client.end().catch(() => {})
    console.log(`↪️  ${err.message?.slice(0, 100)}`)
  }
}

console.error('\n❌ فشل الاتصال — نفّذ SQL يدوياً في Supabase')
console.log(SQL)
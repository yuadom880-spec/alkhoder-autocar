/**
 * تشغيل ملفات SQL في supabase/migrations/ على قاعدة البيانات
 */
import { readFileSync, existsSync, readdirSync } from 'fs'
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
const password = env.SUPABASE_DB_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.error('\n❌ أضف SUPABASE_DB_PASSWORD في .env')
  process.exit(1)
}

const migrationsDir = resolve(root, 'supabase/migrations')
if (!existsSync(migrationsDir)) {
  console.log('✅ لا توجد migrations')
  process.exit(0)
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

const urls = [
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
]

let client = null
for (const connectionString of urls) {
  const c = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    console.log('🔗 محاولة الاتصال...')
    await c.connect()
    client = c
    console.log('✅ متصل بقاعدة البيانات')
    break
  } catch {
    await c.end().catch(() => {})
  }
}

if (!client) {
  console.error('❌ فشل الاتصال بقاعدة البيانات')
  process.exit(1)
}

try {
  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
    console.log(`▶️  ${file}`)
    await client.query(sql)
    console.log(`   ✅ تم`)
  }
  console.log('\n🎉 اكتملت كل الـ migrations\n')
} catch (err) {
  console.error('❌', err.message)
  process.exit(1)
} finally {
  await client.end()
}
/**
 * تشغيل supabase/schema.sql على قاعدة البيانات (ملف واحد شامل)
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
const password = env.SUPABASE_DB_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.error('\n❌ أضف SUPABASE_DB_PASSWORD في .env')
  process.exit(1)
}

const schemaPath = resolve(root, 'supabase/schema.sql')
if (!existsSync(schemaPath)) {
  console.error('\n❌ الملف غير موجود: supabase/schema.sql')
  process.exit(1)
}

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
  const sql = readFileSync(schemaPath, 'utf8')
  console.log('▶️  supabase/schema.sql')
  await client.query(sql)
  console.log('   ✅ تم')
  console.log('\n🎉 اكتمل تنفيذ schema.sql\n')
} catch (err) {
  console.error('❌', err.message)
  process.exit(1)
} finally {
  await client.end()
}
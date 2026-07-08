/**
 * تحديث مواعيد عمل كل الفروع
 * نفّذ: npm run db:migrate-branch-hours
 * أو انسخ SQL إلى Supabase SQL Editor
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const NEW_HOURS = 'السبت - الخميس: 8 ص - 12 م | الجمعة: 4 م - 12 م'
const OLD_HOURS = 'السبت - الخميس: 8 ص - 11 م | الجمعة: 4 م - 11 م'

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

const SQL = `
UPDATE branches
SET hours = '${NEW_HOURS}'
WHERE hours = '${OLD_HOURS}' OR hours IS NULL OR TRIM(hours) = '';
`

const env = loadEnv()
const projectRef = (env.VITE_SUPABASE_URL ?? '').replace('https://', '').split('.')[0]
const password = env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.log('\n📋 نفّذ هذا الأمر في Supabase → SQL Editor:\n')
  console.log(SQL.trim())
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
    const result = await client.query(SQL)
    console.log(`✅ تم تحديث مواعيد ${result.rowCount ?? 0} فرع`)
    await client.end()
    process.exit(0)
  } catch (err) {
    await client.end().catch(() => {})
    if (connectionString === urls[urls.length - 1]) {
      console.error('❌ فشل التحديث:', err.message)
      console.log('\n📋 نفّذ يدوياً في Supabase → SQL Editor:\n')
      console.log(SQL.trim())
      process.exit(1)
    }
  }
}
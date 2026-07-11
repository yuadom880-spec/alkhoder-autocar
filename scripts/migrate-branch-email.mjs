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

const SQL = readFileSync(resolve(__dirname, '../supabase/migrations/004_branch_email.sql'), 'utf8')

const env = loadEnv()
const projectRef = (env.VITE_SUPABASE_URL ?? '').replace('https://', '').split('.')[0]
const password = env.SUPABASE_DB_PASSWORD

if (!projectRef || !password) {
  console.log('\n📋 نفّذ هذا الملف في Supabase → SQL Editor:\n')
  console.log('supabase/migrations/004_branch_email.sql')
  console.log('')
  process.exit(0)
}

const client = new pg.Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: `postgres.${projectRef}`,
  password,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(SQL)
  console.log('✅ تم — email للفروع و branch_email للحجوزات')
} catch (e) {
  console.error('❌', e.message)
  process.exit(1)
} finally {
  await client.end()
}
/**
 * يزامن SQL تلقائياً:
 * 1) schema.sql = المصدر الرئيسي
 * 2) أي محتوى في migrations/*.sql غير موجود في schema → يُدمج في schema.sql
 * 3) migrations المعرّفة + RUN-IN-SUPABASE.sql ← تُستخرج من schema.sql
 *
 * شغّل بعد أي تعديل SQL: npm run db:sync-schema
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const schemaPath = resolve(root, 'supabase/schema.sql')
const migrationsDir = resolve(root, 'supabase/migrations')
const runInPath = resolve(root, 'supabase/RUN-IN-SUPABASE.sql')

/** migrations قديمة — مُدمجة مسبقاً في schema.sql ولا تُعاد دمجها */
const LEGACY_MIGRATIONS = new Set([
  '001_branch_availability.sql',
  '002_featured_offer_branch_disable.sql',
  '003_car_branch_availability.sql',
  '004_branch_email.sql',
  '005_drop_profiles_phone_unique.sql',
])

/** أقسام تُستخرج إلى ملفات migration منفصلة */
const PATCH_MIGRATIONS = [
  {
    file: '006_delete_customer_account.sql',
    sectionMarker: 'القسم 14: حذف حساب العميل',
    fileHeader: [
      '-- حذف حساب العميل — مُستخرج تلقائياً من supabase/schema.sql (القسم 14)',
      '-- المصدر الرئيسي: schema.sql — عدّل هناك ثم شغّل: npm run db:sync-schema',
      '',
    ].join('\n'),
  },
  {
    file: '007_realtime_sync.sql',
    sectionMarker: 'القسم 15: Supabase Realtime',
    fileHeader: [
      '-- Supabase Realtime — مُستخرج تلقائياً من supabase/schema.sql (القسم 15)',
      '-- المصدر الرئيسي: schema.sql — عدّل هناك ثم شغّل: npm run db:sync-schema',
      '',
    ].join('\n'),
  },
]

const NOTIFY_LINE = "NOTIFY pgrst, 'reload schema';"
const SECTION_DIVIDER = /^-- ┌─/

function normalizeSql(sql) {
  return sql
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripMigrationComments(content) {
  return content
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      return !t.startsWith('--') || t.includes('NOTIFY')
    })
    .join('\n')
    .trim()
}

function extractSectionBody(schema, sectionMarker) {
  const lines = schema.split('\n')
  let start = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(sectionMarker)) {
      start = i
      break
    }
  }
  if (start < 0) return null

  let bodyStart = start + 1
  while (bodyStart < lines.length && lines[bodyStart].trim().startsWith('--')) {
    bodyStart++
  }

  const body = []
  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i]
    if (SECTION_DIVIDER.test(line) && i > bodyStart) break
    if (line.includes('نهاية الملف')) break
    body.push(line)
  }

  let sql = body.join('\n').trim()
  const notifyIdx = sql.lastIndexOf(NOTIFY_LINE)
  if (notifyIdx >= 0) {
    sql = sql.slice(0, notifyIdx).trim()
  }
  return sql
}

function insertBeforeFinalNotify(schema, sqlBlock, sectionLabel) {
  const marker =
    '-- ┌──────────────────────────────────────────────────────────────────────────┐\n-- │ القسم 16: إعادة تحميل schema cache'
  const idx = schema.indexOf(marker)
  if (idx < 0) {
    throw new Error('لم يُعثر على قسم 16 (reload schema) في schema.sql')
  }

  const block = [
    '',
    '-- ┌──────────────────────────────────────────────────────────────────────────┐',
    `-- │ ${sectionLabel}`,
    '-- └──────────────────────────────────────────────────────────────────────────┘',
    '',
    sqlBlock.trim(),
    '',
  ].join('\n')

  return schema.slice(0, idx) + block + schema.slice(idx)
}

function migrationStatementsInSchema(migSql, schema) {
  const normSchema = normalizeSql(schema)
  const statements = migSql
    .split(';')
    .map((s) => normalizeSql(s))
    .filter((s) => s.length > 12)
  if (statements.length === 0) return true
  return statements.every((stmt) => normSchema.includes(stmt))
}

function mergeMissingMigrationsIntoSchema(schema) {
  if (!existsSync(migrationsDir)) return schema

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let updated = schema

  for (const file of files) {
    if (PATCH_MIGRATIONS.some((p) => p.file === file)) continue
    if (LEGACY_MIGRATIONS.has(file)) continue

    const migPath = resolve(migrationsDir, file)
    const migSql = stripMigrationComments(readFileSync(migPath, 'utf8'))
    if (!migSql) continue

    if (migrationStatementsInSchema(migSql, updated)) continue

    const label = `مُدمج من migration: ${file}`
    console.log(`➕ دمج ${file} في schema.sql`)
    updated = insertBeforeFinalNotify(updated, migSql, label)
  }

  return updated
}

function writePatchMigration({ file, sectionMarker, fileHeader }, schema) {
  const body = extractSectionBody(schema, sectionMarker)
  if (!body) {
    console.warn(`⚠️  لم يُعثر على "${sectionMarker}" في schema.sql — تخطّي ${file}`)
    return
  }

  const out = `${fileHeader}\n${body}\n\n${NOTIFY_LINE}\n`
  writeFileSync(resolve(migrationsDir, file), out, 'utf8')
  console.log(`✅ حدّث ${file}`)
}

function patchRunInSupabase(schema) {
  if (!existsSync(runInPath)) return

  let runIn = readFileSync(runInPath, 'utf8')
  const deleteSql = extractSectionBody(schema, 'القسم 14: حذف حساب العميل')
  const realtimeSql = extractSectionBody(schema, 'القسم 15: Supabase Realtime')

  const deleteMarker = '-- │ القسم 7ب: حذف حساب العميل'
  if (deleteSql && !runIn.includes('delete_customer_account')) {
    const block = [
      '',
      '-- ┌──────────────────────────────────────────────────────────────────────────┐',
      '-- │ القسم 7ب: حذف حساب العميل (Google Play)                                  │',
      '-- └──────────────────────────────────────────────────────────────────────────┘',
      '',
      deleteSql,
      '',
    ].join('\n')
    const rlsMarker = '-- ┌──────────────────────────────────────────────────────────────────────────┐\n-- │ القسم 8: Row Level Security'
    if (runIn.includes(rlsMarker) && !runIn.includes(deleteMarker)) {
      runIn = runIn.replace(rlsMarker, block + rlsMarker)
    }
  }

  const realtimeMarker = '-- │ القسم 10ب: Supabase Realtime'
  if (realtimeSql && !runIn.includes(realtimeMarker)) {
    const block = [
      '',
      '-- ┌──────────────────────────────────────────────────────────────────────────┐',
      '-- │ القسم 10ب: Supabase Realtime — تحديث تلقائي                            │',
      '-- └──────────────────────────────────────────────────────────────────────────┘',
      '',
      realtimeSql,
      '',
    ].join('\n')
    const notifyMarker =
      '-- ┌──────────────────────────────────────────────────────────────────────────┐\n-- │ القسم 11: إعادة تحميل schema cache'
    if (runIn.includes(notifyMarker)) {
      runIn = runIn.replace(notifyMarker, block + notifyMarker)
    }
  } else if (realtimeSql && runIn.includes(realtimeMarker)) {
    const start = runIn.indexOf(realtimeMarker)
    const endMarker =
      '-- ┌──────────────────────────────────────────────────────────────────────────┐\n-- │ القسم 11:'
    const end = runIn.indexOf(endMarker, start)
    if (end > start) {
      const block = [
        '-- ┌──────────────────────────────────────────────────────────────────────────┐',
        '-- │ القسم 10ب: Supabase Realtime — تحديث تلقائي                            │',
        '-- └──────────────────────────────────────────────────────────────────────────┘',
        '',
        realtimeSql,
        '',
      ].join('\n')
      runIn = runIn.slice(0, start) + block + runIn.slice(end)
    }
  }

  writeFileSync(runInPath, runIn, 'utf8')
  console.log('✅ حدّث RUN-IN-SUPABASE.sql')
}

function bumpSchemaVersion(schema) {
  const today = new Date().toISOString().slice(0, 10)
  return schema
    .replace(/الإصدار: [\d.]+ \| التاريخ: [\d-]+/, `الإصدار: 4.7 | التاريخ: ${today}`)
    .replace(/نهاية الملف — الإصدار [\d.]+/, 'نهاية الملف — الإصدار 4.7')
}

function main() {
  if (!existsSync(schemaPath)) {
    console.error('❌ supabase/schema.sql غير موجود')
    process.exit(1)
  }

  let schema = readFileSync(schemaPath, 'utf8')

  if (!schema.includes('npm run db:sync-schema')) {
    schema = schema.replace(
      '-- آمن للتشغيل المتكرر — لن يحذف بياناتك',
      [
        '-- آمن للتشغيل المتكرر — لن يحذف بياناتك',
        '--',
        '-- ⚠️ قاعدة SQL: schema.sql هو المصدر الرئيسي الوحيد.',
        '--    أي تعديل SQL → هنا أولاً → ثم: npm run db:sync-schema',
        '--    (يُحدّث migrations/*.sql و RUN-IN-SUPABASE.sql تلقائياً)',
      ].join('\n'),
    )
  }

  schema = mergeMissingMigrationsIntoSchema(schema)
  schema = bumpSchemaVersion(schema)
  writeFileSync(schemaPath, schema, 'utf8')
  console.log('✅ schema.sql')

  for (const patch of PATCH_MIGRATIONS) {
    writePatchMigration(patch, schema)
  }

  patchRunInSupabase(schema)
  console.log('\n🎉 اكتملت مزامنة SQL — المصدر: supabase/schema.sql\n')
}

main()
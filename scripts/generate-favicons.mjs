/**
 * أيقونات مربعة من لوجو الخضر — مطلوبة لظهور اللوجو في نتائج جوجل
 * يستخدم sharp (بدون متصفح) ليعمل على Vercel
 */
import { existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const logoPath = resolve(root, 'public/logo.png')

if (!existsSync(logoPath)) {
  console.error('❌ logo.png غير موجود في public/')
  process.exit(1)
}

const SIZES = [
  { name: 'favicon-48.png', size: 48 },
  { name: 'favicon-96.png', size: 96 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

async function generateSquareIcon(size) {
  return sharp(logoPath)
    .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer()
}

for (const { name, size } of SIZES) {
  const buf = await generateSquareIcon(size)
  writeFileSync(resolve(root, 'public', name), buf)
  console.log(`✓ public/${name}`)
}

const ico48 = await generateSquareIcon(48)
writeFileSync(resolve(root, 'public', 'favicon.ico'), ico48)
console.log('✓ public/favicon.ico')

console.log('\n✅ أيقونات جوجل جاهزة\n')
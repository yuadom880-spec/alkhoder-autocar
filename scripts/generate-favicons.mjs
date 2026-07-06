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
  { name: 'apple-touch-icon.png', size: 180 },
]

async function generateSquareIcon(size) {
  const pad = Math.round(size * 0.08)
  const inner = size - pad * 2

  const resizedLogo = await sharp(logoPath)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resizedLogo, gravity: 'center' }])
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
/**
 * ضغط صور الموقع وتحويل BMP إلى WebP
 * نفّذ: npm run images:optimize
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { resolve, dirname, join, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')
const profileDir = join(publicDir, 'profile')

const BANNER_MAX = 1280
const THUMB_MAX = 520
const HERO_MAX = 1600
const HERO_MOBILE_MAX = 800
const DEFAULT_QUALITY = 80

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`
}

function decodeBmp(buffer) {
  const width = buffer.readInt32LE(18)
  const heightField = buffer.readInt32LE(22)
  const topDown = heightField < 0
  const height = Math.abs(heightField)
  const bpp = buffer.readUInt16LE(28)
  const offset = buffer.readUInt32LE(10)

  if (bpp !== 24) throw new Error(`unsupported BMP bpp: ${bpp}`)

  const rowSize = Math.ceil((width * 3) / 4) * 4
  const rgba = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    const srcY = topDown ? y : height - 1 - y
    for (let x = 0; x < width; x++) {
      const srcOff = offset + srcY * rowSize + x * 3
      const dstOff = (y * width + x) * 4
      rgba[dstOff] = buffer[srcOff + 2]
      rgba[dstOff + 1] = buffer[srcOff + 1]
      rgba[dstOff + 2] = buffer[srcOff]
      rgba[dstOff + 3] = 255
    }
  }

  return { width, height, data: rgba }
}

async function writeWebp(input, output, maxWidth, quality = DEFAULT_QUALITY) {
  const before = statSync(input).size
  const ext = extname(input).toLowerCase()
  let pipeline

  if (ext === '.bmp') {
    const decoded = decodeBmp(readFileSync(input))
    pipeline = sharp(decoded.data, {
      raw: { width: decoded.width, height: decoded.height, channels: 4 },
    })
  } else {
    pipeline = sharp(input).rotate()
  }

  await pipeline
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(output)

  const after = statSync(output).size
  const saved = Math.round((1 - after / before) * 100)
  console.log(`✓ ${basename(output)}  ${formatKb(before)} → ${formatKb(after)}  (-${saved}%)`)
}

async function optimizeProfileBmps() {
  if (!existsSync(profileDir)) return
  const bmps = readdirSync(profileDir).filter((f) => f.endsWith('.bmp'))
  console.log(`\n📁 profile: ${bmps.length} BMP\n`)

  for (const file of bmps) {
    const input = join(profileDir, file)
    const output = join(profileDir, file.replace(/\.bmp$/i, '.webp'))
    const decoded = decodeBmp(readFileSync(input))
    const maxWidth = decoded.width > 900 ? BANNER_MAX : THUMB_MAX
    await writeWebp(input, output, maxWidth)
  }
}

async function optimizeHero() {
  const heroJpg = join(publicDir, 'hero-patrol-black.jpg')
  if (!existsSync(heroJpg)) return

  console.log('\n🖼️  hero\n')
  await writeWebp(heroJpg, join(publicDir, 'hero-patrol-black.webp'), HERO_MAX, 82)
  await writeWebp(heroJpg, join(publicDir, 'hero-patrol-black-mobile.webp'), HERO_MOBILE_MAX, 78)
}

async function optimizePublicImages() {
  const targets = [
    { file: 'logo.png', max: 256, quality: 90 },
    { file: 'شركاء النجاح.png', max: 1200, quality: 82 },
    { file: 'تيجو 7 برو.jpeg', max: 900, quality: 82 },
    { file: 'عروض-التوفير.jpg.jpeg', max: 1000, quality: 82 },
  ]

  console.log('\n📦 public images\n')
  for (const { file, max, quality } of targets) {
    const input = join(publicDir, file)
    if (!existsSync(input)) {
      console.log(`⊘ skip ${file}`)
      continue
    }
    const output = join(publicDir, `${basename(file, extname(file))}.webp`)
    await writeWebp(input, output, max, quality)
  }
}

await optimizeProfileBmps()
await optimizeHero()
await optimizePublicImages()
console.log('\n✅ تحسين الصور اكتمل\n')
/**
 * أيقونات مربعة من لوجو الخضر — مطلوبة لظهور اللوجو في نتائج جوجل
 */
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const logoPath = resolve(root, 'public/logo.png')

if (!existsSync(logoPath)) {
  console.error('❌ logo.png غير موجود في public/')
  process.exit(1)
}

const logoUri = `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`

const SIZES = [
  { name: 'favicon-48.png', size: 48 },
  { name: 'favicon-96.png', size: 96 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
]

function iconHtml(px) {
  const pad = Math.round(px * 0.08)
  const radius = Math.round(px * 0.14)
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:${px}px; height:${px}px; background:#fff; }
    .box {
      width:${px}px; height:${px}px;
      padding:${pad}px;
      background:#fff;
      border-radius:${radius}px;
      display:flex; align-items:center; justify-content:center;
    }
    img { width:100%; height:100%; object-fit:contain; display:block; border-radius:${Math.round(px * 0.08)}px; }
  </style></head><body>
    <div class="box"><img src="${logoUri}" alt=""/></div>
  </body></html>`
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  for (const { name, size } of SIZES) {
    const page = await browser.newPage()
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 })
    await page.setContent(iconHtml(size), { waitUntil: 'load' })
    const buf = await page.screenshot({ type: 'png', omitBackground: false })
    await page.close()
    writeFileSync(resolve(root, 'public', name), buf)
    console.log(`✓ public/${name}`)
  }

  // favicon.ico = نسخة 48px (بعض المتصفحات تفضّلها)
  const ico48 = readFileSync(resolve(root, 'public', 'favicon-48.png'))
  writeFileSync(resolve(root, 'public', 'favicon.ico'), ico48)
  console.log('✓ public/favicon.ico')
} finally {
  await browser.close()
}

console.log('\n✅ أيقونات جوجل جاهزة\n')
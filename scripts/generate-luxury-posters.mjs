/**
 * ملصقات إعلانية فاخرة للفروع — 3 تصاميم + PNG عالي الدقة
 * التشغيل: npm run poster:luxury
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outDir = resolve(desktop, 'alkhoder-luxury-posters')

const SITE_URL = 'https://alkhodercar.com'
const SITE_HOST = 'alkhodercar.com'
const COMPANY = 'شركة عبدالمجيد الخضر لتأجير السيارات'
const TOLL_FREE = '920018216'
const PATROL_IMAGE_PATH = resolve(root, 'public/hero-patrol-black.jpg')

const CAR_STOCK = {
  patrol: {
    path: PATROL_IMAGE_PATH,
    label: 'نيسان باترول أسود',
  },
}

const VARIATIONS = [
  {
    id: '01-suv-gold',
    name: 'فاخر — باترول',
    carImageKey: 'patrol',
    carImagePosition: 'center 42%',
    accent: '#d4af37',
    accentSoft: '#f0d78c',
    bg: '#0a0a0f',
    badge: 'عروض حصرية',
    headline: 'احجز سيارتك أونلاين من موقعنا الإلكتروني ولا تفوتك عروضنا',
    subline: 'إيجار يومي وشهري — حجز سريع وأسعار مميزة',
    features: ['حجز من الجوال أو الكمبيوتر', 'عروض محدثة على الموقع', 'فروع في كل أنحاء المملكة'],
    cta: 'امسح الكود وادخل الموقع الآن',
    qrLabel: 'احجز أونلاين',
  },
  {
    id: '02-sedan-executive',
    name: 'تنفيذي — باترول',
    carImageKey: 'patrol',
    carImagePosition: 'center 50%',
    accent: '#c9a227',
    accentSoft: '#e8c96a',
    bg: '#0d1117',
    badge: 'وفر وقتك',
    headline: 'زور موقعنا الإلكتروني',
    subline: 'شوف عروضنا',
    features: [
      'احجز سيارتك أونلاين بسهولة وبدون تعقيدات',
      'حجز من الجوال أو الكمبيوتر',
      'فروع في كل أنحاء المملكة',
    ],
    cta: 'امسح الكود وادخل الموقع الآن',
    qrLabel: 'احجز أونلاين',
  },
  {
    id: '03-night-premium',
    name: 'بريميوم — باترول ليلي',
    carImageKey: 'patrol',
    carImagePosition: 'center 58%',
    accent: '#d4af37',
    accentSoft: '#f5e6b8',
    bg: '#050508',
    badge: 'الخضر لتأجير السيارات',
    headline: 'عروضنا على الموقع — والسيارة عندك بأسرع وقت',
    subline: 'تأجير يومي وشهري مع أسطول متنوع يناسب كل احتياجك',
    features: ['أكثر من 35 فرعاً', `الرقم الموحد ${TOLL_FREE}`, 'حجز أونلاين بدون تعقيد'],
    cta: 'امسح الكود — ادخل الموقع واحجز الآن',
    qrLabel: 'ادخل الموقع',
  },
]

function toDataUri(filePath) {
  if (!existsSync(filePath)) return ''
  const buf = readFileSync(filePath)
  const ext = filePath.endsWith('.png') ? 'png' : 'jpeg'
  return `data:image/${ext};base64,${buf.toString('base64')}`
}

async function ensureCarImage(key) {
  const asset = CAR_STOCK[key]
  if (!asset) throw new Error(`صورة غير معروفة: ${key}`)
  if (!existsSync(asset.path)) throw new Error(`صورة السيارة غير موجودة: ${asset.path}`)
  return asset.path
}

async function loadCarImageUris() {
  const uris = {}
  for (const key of Object.keys(CAR_STOCK)) {
    const path = await ensureCarImage(key)
    const uri = toDataUri(path)
    if (!uri) throw new Error(`تعذر قراءة صورة: ${key}`)
    uris[key] = uri
  }
  return uris
}

async function buildQrDataUri() {
  return QRCode.toDataURL(SITE_URL, {
    width: 520,
    margin: 1,
    color: { dark: '#0a0a0f', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
}

function buildPosterHtml({ theme, qrDataUri, logoUri, carImageUri }) {
  const carPosition = theme.carImagePosition ?? 'center 40%'
  const layout =
    theme.id === '03-night-premium'
      ? 'layout-split'
      : theme.id === '02-sedan-executive'
        ? 'layout-frame'
        : 'layout-hero'

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm;
      height: 297mm;
      font-family: 'Tajawal', 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
      background: ${theme.bg};
    }

    .poster {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      color: #fff;
    }

    .bg-car {
      position: absolute;
      inset: 0;
      background: url('${carImageUri}') ${carPosition} / cover no-repeat;
      transform: scale(1.04);
      opacity: 0.42;
      filter: brightness(0.95) saturate(0.9);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg,
          rgba(12,12,18,0.55) 0%,
          rgba(12,12,18,0.22) 40%,
          rgba(12,12,18,0.48) 68%,
          rgba(12,12,18,0.82) 100%),
        radial-gradient(ellipse 90% 50% at 50% 20%, rgba(212,175,55,0.1), transparent 65%);
    }

    .gold-line-top {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: linear-gradient(90deg, transparent, ${theme.accent}, ${theme.accentSoft}, ${theme.accent}, transparent);
      z-index: 5;
    }

    .gold-corner {
      position: absolute;
      width: 48mm;
      height: 48mm;
      border: 2px solid ${theme.accent};
      opacity: 0.55;
      z-index: 4;
    }
    .gold-corner.tl { top: 10mm; left: 10mm; border-right: none; border-bottom: none; }
    .gold-corner.br { bottom: 10mm; right: 10mm; border-left: none; border-top: none; }

    .content {
      position: relative;
      z-index: 6;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 14mm 14mm 12mm;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 10mm;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      direction: rtl;
      flex: 1;
      min-width: 0;
    }
    .brand img {
      width: 128px;
      height: 128px;
      flex-shrink: 0;
      object-fit: contain;
      filter: drop-shadow(0 4px 14px rgba(0,0,0,0.45));
    }
    .brand .company {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.55;
      color: #fff;
      max-width: 108mm;
    }
    .brand .company span {
      display: block;
      color: ${theme.accentSoft};
      font-size: 13px;
      font-weight: 700;
      margin-top: 6px;
      direction: ltr;
      text-align: right;
      letter-spacing: 0.3px;
    }

    .badge {
      background: linear-gradient(135deg, ${theme.accent}, ${theme.accentSoft});
      color: #1a1200;
      font-size: 11px;
      font-weight: 800;
      padding: 8px 14px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 4px 20px rgba(212,175,55,0.35);
    }

    .hero-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 5mm;
      max-width: 100%;
    }

    .hero-panel {
      background: rgba(16, 16, 22, 0.88);
      border: 1.5px solid rgba(212,175,55,0.45);
      border-radius: 20px;
      padding: 22px 24px 20px;
      box-shadow: 0 10px 32px rgba(0,0,0,0.28);
    }

    .headline {
      font-size: 36px;
      font-weight: 900;
      line-height: 1.4;
      margin-bottom: 14px;
      color: #ffffff;
      text-shadow: none;
      letter-spacing: 0;
    }
    .headline em {
      font-style: normal;
      color: ${theme.accentSoft};
    }

    .subline {
      font-size: 22px;
      font-weight: 800;
      color: ${theme.accentSoft};
      margin-bottom: 18px;
      line-height: 1.55;
      padding-inline-start: 14px;
      border-inline-start: 4px solid ${theme.accent};
    }

    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 2px;
    }
    .feature-pill {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      background: rgba(28, 26, 20, 0.92);
      border: 1px solid rgba(212,175,55,0.5);
      border-radius: 999px;
      padding: 11px 18px;
      line-height: 1.4;
    }

    .footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10mm;
      margin-top: auto;
      padding-top: 8mm;
    }

    .cta-box {
      flex: 1;
      background: rgba(16, 16, 22, 0.9);
      border: 1.5px solid rgba(212,175,55,0.45);
      border-radius: 16px;
      padding: 14px 18px;
      direction: rtl;
    }
    .cta-box .scan {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }
    .cta-box .url {
      font-size: 20px;
      font-weight: 900;
      color: ${theme.accentSoft};
      direction: ltr;
      text-align: right;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .cta-box .phone {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      direction: ltr;
      text-align: right;
    }

    .qr-block {
      flex-shrink: 0;
      text-align: center;
    }
    .qr-frame {
      background: #fff;
      padding: 10px;
      border-radius: 16px;
      border: 3px solid ${theme.accent};
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.2);
    }
    .qr-frame img {
      width: 42mm;
      height: 42mm;
      display: block;
    }
    .qr-label {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 800;
      color: ${theme.accentSoft};
    }

    /* تخطيط 2: إطار ذهبي */
    .layout-frame .overlay {
      background:
        linear-gradient(180deg, rgba(12,12,18,0.6) 0%, rgba(12,12,18,0.28) 44%, rgba(12,12,18,0.84) 100%);
    }
    .layout-frame .hero-text {
      justify-content: center;
      padding-top: 8mm;
      padding-bottom: 2mm;
    }
    .layout-frame .hero-panel { text-align: center; }
    .layout-frame .headline { font-size: 40px; line-height: 1.3; }
    .layout-frame .subline {
      font-size: 22px;
      border-inline-start: none;
      padding-inline-start: 0;
      padding-top: 4px;
      border-top: 2px solid rgba(212,175,55,0.35);
      margin-top: 4px;
      padding-top: 14px;
    }
    .layout-frame .features { justify-content: center; }

    /* تخطيط 3: نص علوي */
    .layout-split .bg-car { background-position: ${theme.carImagePosition ?? 'center 60%'}; }
    .layout-split .hero-text { justify-content: flex-start; padding-top: 4mm; }
    .layout-split .headline { font-size: 33px; }
    .layout-split .subline { font-size: 19px; }
    .layout-split .footer { border-top: 1px solid rgba(212,175,55,0.25); padding-top: 10mm; }

    /* تخطيط 1: هيرو */
    .layout-hero .headline { font-size: 34px; }
    .layout-hero .hero-panel { max-width: 152mm; }

    .watermark {
      position: absolute;
      bottom: 3mm;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px;
      color: rgba(255,255,255,0.35);
      z-index: 6;
      direction: ltr;
    }
  </style>
</head>
<body>
  <div class="poster ${layout}">
    <div class="bg-car"></div>
    <div class="overlay"></div>
    <div class="gold-line-top"></div>
    <div class="gold-corner tl"></div>
    <div class="gold-corner br"></div>

    <div class="content">
      <div class="header">
        <div class="brand">
          ${logoUri ? `<img src="${logoUri}" alt="logo" />` : ''}
          <div class="company">
            ${COMPANY}
            <span>${SITE_HOST}</span>
          </div>
        </div>
        <div class="badge">${theme.badge}</div>
      </div>

      <div class="hero-text">
        <div class="hero-panel">
          <h1 class="headline">${theme.headline}</h1>
          <p class="subline">${theme.subline}</p>
          <div class="features">
            ${theme.features.map((f) => `<span class="feature-pill">${f}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="cta-box">
          <div class="scan">${theme.cta}</div>
          <div class="url">${SITE_URL}</div>
          <div class="phone">${TOLL_FREE}</div>
        </div>
        <div class="qr-block">
          <div class="qr-frame">
            <img src="${qrDataUri}" alt="QR Code" />
          </div>
          <div class="qr-label">${theme.qrLabel}</div>
        </div>
      </div>
    </div>

    <div class="watermark">${theme.name}</div>
  </div>
</body>
</html>`
}

async function renderPoster(browser, theme, qrDataUri, logoUri, carImageUri) {
  const page = await browser.newPage()
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3 })
  await page.setContent(buildPosterHtml({ theme, qrDataUri, logoUri, carImageUri }), {
    waitUntil: 'networkidle0',
    timeout: 90000,
  })
  await page.evaluate(() => document.fonts.ready)
  const pngPath = resolve(outDir, `poster-${theme.id}.png`)
  await page.screenshot({
    path: pngPath,
    type: 'png',
    fullPage: false,
    omitBackground: false,
  })
  const pdfPath = resolve(outDir, `poster-${theme.id}.pdf`)
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  })
  await page.close()
  return { pngPath, pdfPath }
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  console.log('\n🎨 جاري إنشاء 3 ملصقات فاخرة...\n')

  const logoUri = toDataUri(resolve(root, 'public/logo.png'))
  const carImageUris = await loadCarImageUris()
  const qrDataUri = await buildQrDataUri()

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const manifest = []

  try {
    for (const theme of VARIATIONS) {
      console.log(`   ▶ ${theme.name}...`)
      const carImageUri = carImageUris[theme.carImageKey]
      if (!carImageUri) throw new Error(`صورة التاهو غير متوفرة للتصميم: ${theme.id}`)
      const paths = await renderPoster(browser, theme, qrDataUri, logoUri, carImageUri)
      manifest.push({ ...theme, ...paths })
      console.log(`     ✅ PNG: ${paths.pngPath}`)
      console.log(`     ✅ PDF: ${paths.pdfPath}`)
    }

    const readme = `# ملصقات عبدالمجيد الخضر لتأجير السيارات

الموقع: ${SITE_URL}

## الملفات
${manifest.map((m) => `- poster-${m.id}.png / .pdf — ${m.name}`).join('\n')}

## الطباعة
- مقاس A4 عمودي
- جودة عالية (300 DPI تقريباً)
- QR Code يوجّه إلى ${SITE_URL}

تم الإنشاء: ${new Date().toLocaleString('ar-SA')}
`
    writeFileSync(resolve(outDir, 'README.txt'), readme, 'utf8')

    console.log(`\n✅ تم حفظ كل الملصقات في:\n   ${outDir}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('❌ فشل:', err.message)
  process.exit(1)
})
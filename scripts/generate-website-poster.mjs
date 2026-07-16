/**
 * بوستر الموقع الإلكتروني — QR لـ alkhodercar.com
 * التشغيل: npm run poster:website
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outDir = resolve(desktop, 'alkhoder-website-poster')

const SITE_URL = 'https://alkhodercar.com'
const SITE_HOST = 'alkhodercar.com'
const COMPANY = 'شركة عبدالمجيد الخضر لتأجير السيارات'
const TOLL_FREE = '920018216'

const LOGO_PATH = resolve(root, 'public/logo.png')
const CAR_PATH = resolve(root, 'public/hero-patrol-black.jpg')

function toDataUri(filePath) {
  if (!existsSync(filePath)) return ''
  const buf = readFileSync(filePath)
  const ext = filePath.endsWith('.png')
    ? 'png'
    : filePath.endsWith('.webp')
      ? 'webp'
      : 'jpeg'
  return `data:image/${ext};base64,${buf.toString('base64')}`
}

async function buildQrDataUri() {
  return QRCode.toDataURL(SITE_URL, {
    width: 560,
    margin: 1,
    color: { dark: '#0a1628', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
}

function buildHtml({ qrDataUri, logoUri, carUri }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800;900&display=swap" rel="stylesheet" />
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
      background: #050a12;
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
      background: url('${carUri}') center 52% / cover no-repeat;
      opacity: 0.4;
      filter: brightness(0.9) saturate(0.9);
      transform: scale(1.06);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(200deg,
          rgba(5,10,18,0.78) 0%,
          rgba(10,31,61,0.3) 42%,
          rgba(5,10,18,0.5) 65%,
          rgba(3,8,14,0.94) 100%),
        radial-gradient(ellipse 70% 50% at 20% 15%, rgba(212,168,83,0.16), transparent 58%),
        radial-gradient(ellipse 55% 45% at 85% 80%, rgba(13,122,74,0.14), transparent 52%);
    }

    .gold-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, transparent, #c9a227, #f0d78c, #d4a853, transparent);
      z-index: 5;
    }

    .frame {
      position: absolute;
      inset: 9mm;
      border: 2px solid rgba(201,162,39,0.5);
      border-radius: 18px;
      pointer-events: none;
      z-index: 4;
    }

    .corner {
      position: absolute;
      width: 22mm;
      height: 22mm;
      border: 2px solid rgba(212,168,83,0.4);
      z-index: 4;
    }
    .corner.tl { top: 12mm; left: 12mm; border-right: none; border-bottom: none; }
    .corner.br { bottom: 12mm; right: 12mm; border-left: none; border-top: none; }

    .content {
      position: relative;
      z-index: 6;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16mm 15mm 13mm;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 9mm;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }
    .brand img {
      width: 108px;
      height: 108px;
      object-fit: contain;
      filter: drop-shadow(0 6px 18px rgba(0,0,0,0.45));
    }
    .brand h2 {
      font-size: 17px;
      font-weight: 900;
      line-height: 1.45;
    }
    .brand p {
      font-size: 12px;
      font-weight: 700;
      color: #1fe07a;
      margin-top: 5px;
    }

    .site-chip {
      flex-shrink: 0;
      background: linear-gradient(135deg, rgba(15,39,68,0.95), rgba(10,22,40,0.98));
      border: 2px solid rgba(212,168,83,0.55);
      border-radius: 16px;
      padding: 12px 16px;
      text-align: center;
      box-shadow: 0 10px 28px rgba(0,0,0,0.35);
      direction: ltr;
    }
    .site-chip .globe {
      font-size: 26px;
      line-height: 1;
      margin-bottom: 4px;
    }
    .site-chip .host {
      font-size: 15px;
      font-weight: 900;
      color: #f0d78c;
      letter-spacing: 0.4px;
    }

    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3mm 0;
    }

    .hero-card {
      background: rgba(8, 18, 32, 0.9);
      border: 1.5px solid rgba(212,168,83,0.45);
      border-radius: 22px;
      padding: 24px 26px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.32);
    }

    .tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #1a1200;
      background: linear-gradient(135deg, #c9a227, #f0d78c);
      padding: 7px 14px;
      border-radius: 999px;
      margin-bottom: 14px;
    }

    .headline {
      font-size: 36px;
      font-weight: 900;
      line-height: 1.38;
      margin-bottom: 10px;
    }
    .headline em {
      font-style: normal;
      color: #f0d78c;
    }

    .subline {
      font-size: 19px;
      font-weight: 800;
      color: #1fe07a;
      line-height: 1.5;
      margin-bottom: 16px;
      padding-inline-start: 12px;
      border-inline-start: 4px solid #0d7a4a;
    }

    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .feat {
      font-size: 13px;
      font-weight: 700;
      background: rgba(12, 28, 48, 0.82);
      border: 1px solid rgba(212,168,83,0.38);
      border-radius: 12px;
      padding: 11px 14px;
      line-height: 1.4;
    }
    .feat::before {
      content: '✦ ';
      color: #f0d78c;
      font-weight: 900;
    }

    .url-banner {
      margin-top: 14px;
      text-align: center;
      background: linear-gradient(90deg, transparent, rgba(13,122,74,0.22), transparent);
      border-top: 1px solid rgba(212,168,83,0.25);
      border-bottom: 1px solid rgba(212,168,83,0.25);
      padding: 12px 8px;
      direction: ltr;
    }
    .url-banner span {
      font-size: 28px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1px;
      text-shadow: 0 2px 12px rgba(31,224,122,0.25);
    }

    .footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10mm;
      margin-top: auto;
    }

    .cta {
      flex: 1;
      background: rgba(8, 18, 32, 0.92);
      border: 1.5px solid rgba(212,168,83,0.42);
      border-radius: 18px;
      padding: 16px 18px;
    }
    .cta .scan {
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .cta .hint {
      font-size: 13px;
      font-weight: 700;
      color: #1fe07a;
      margin-bottom: 10px;
      line-height: 1.45;
    }
    .cta .url-big {
      font-size: 22px;
      font-weight: 900;
      color: #f0d78c;
      direction: ltr;
      text-align: right;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }
    .cta .phone {
      font-size: 22px;
      font-weight: 900;
      color: #fff;
      direction: ltr;
      text-align: right;
      letter-spacing: 1px;
    }

    .qr-wrap {
      flex-shrink: 0;
      text-align: center;
    }
    .qr-box {
      background: #fff;
      padding: 11px;
      border-radius: 18px;
      border: 3px solid #c9a227;
      box-shadow: 0 14px 36px rgba(0,0,0,0.45), 0 0 28px rgba(201,162,39,0.2);
      position: relative;
    }
    .qr-box img.qr {
      width: 46mm;
      height: 46mm;
      display: block;
    }
    .qr-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14mm;
      height: 14mm;
      background: #fff;
      border-radius: 8px;
      padding: 2px;
    }
    .qr-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-caption {
      margin-top: 9px;
      font-size: 12px;
      font-weight: 800;
      color: #f0d78c;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="bg-car"></div>
    <div class="overlay"></div>
    <div class="gold-bar"></div>
    <div class="frame"></div>
    <div class="corner tl"></div>
    <div class="corner br"></div>

    <div class="content">
      <div class="header">
        <div class="brand">
          ${logoUri ? `<img src="${logoUri}" alt="الخضر" />` : ''}
          <div>
            <h2>${COMPANY}</h2>
            <p>الموقع الرسمي للحجز</p>
          </div>
        </div>
        <div class="site-chip">
          <div class="globe">🌐</div>
          <div class="host">${SITE_HOST}</div>
        </div>
      </div>

      <div class="hero">
        <div class="hero-card">
          <span class="tag">حجز أونلاين</span>
          <h1 class="headline">احجز سيارتك من<br/><em>موقعنا الإلكتروني</em></h1>
          <p class="subline">إيجار يومي وشهري — عروض محدثة — فروع في كل أنحاء المملكة</p>
          <div class="features">
            <div class="feat">حجز من الجوال أو الكمبيوتر</div>
            <div class="feat">عروض شهرية مميزة</div>
            <div class="feat">أسعار واضحة تشمل الضريبة</div>
            <div class="feat">اختر أقرب فرع واحجز فوراً</div>
          </div>
          <div class="url-banner"><span>${SITE_HOST}</span></div>
        </div>
      </div>

      <div class="footer">
        <div class="cta">
          <div class="scan">امسح الكود وادخل الموقع الآن</div>
          <div class="hint">من أي جوال — بدون تحميل تطبيق</div>
          <div class="url-big">${SITE_URL}</div>
          <div class="phone">${TOLL_FREE}</div>
        </div>
        <div class="qr-wrap">
          <div class="qr-box">
            <img class="qr" src="${qrDataUri}" alt="QR الموقع" />
            ${logoUri ? `<div class="qr-logo"><img src="${logoUri}" alt="" /></div>` : ''}
          </div>
          <div class="qr-caption">امسح للدخول</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  const logoUri = toDataUri(LOGO_PATH)
  const carUri = toDataUri(CAR_PATH)
  if (!carUri) throw new Error('صورة السيارة غير موجودة')
  const qrDataUri = await buildQrDataUri()

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3 })
    await page.setContent(buildHtml({ qrDataUri, logoUri, carUri }), {
      waitUntil: 'networkidle0',
      timeout: 90000,
    })
    await page.evaluate(() => document.fonts.ready)

    const pngMain = resolve(outDir, 'بوستر-الموقع-الخضر.png')
    const pdfMain = resolve(outDir, 'بوستر-الموقع-الخضر.pdf')
    const pngDesktop = resolve(desktop, 'بوستر-الموقع-الخضر.png')
    const pdfDesktop = resolve(desktop, 'بوستر-الموقع-الخضر.pdf')

    const pngBuf = await page.screenshot({ type: 'png', fullPage: false })
    writeFileSync(pngMain, pngBuf)
    writeFileSync(pngDesktop, pngBuf)

    const pdfBuf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    })
    writeFileSync(pdfMain, pdfBuf)
    writeFileSync(pdfDesktop, pdfBuf)

    writeFileSync(
      resolve(outDir, 'README.txt'),
      `بوستر الموقع الإلكتروني — الخضر\n\nQR يوجّه إلى:\n${SITE_URL}\n\nالطباعة: A4 عمودي\n`,
      'utf8',
    )

    console.log(`\n✅ PNG: ${pngDesktop}`)
    console.log(`✅ PDF: ${pdfDesktop}`)
    console.log(`📁 مجلد إضافي: ${outDir}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})
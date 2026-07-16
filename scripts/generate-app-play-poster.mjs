/**
 * بوستر تطبيق الخضر — QR لتحميل Google Play
 * التشغيل: npm run poster:app
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outDir = resolve(desktop, 'alkhoder-app-poster')

const PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.alkhedrcars.alkhedr_cars_app'
const COMPANY = 'شركة عبدالمجيد الخضر لتأجير السيارات'
const TOLL_FREE = '920018216'
const SITE_HOST = 'alkhodercar.com'

const LOGO_PATH = resolve(root, 'public/logo.png')
const PLAY_BADGE_PATH = resolve(root, 'public/google-play-badge-ar.png')
const CAR_PATH = resolve(root, 'public/hero-patrol-black.jpg')
const APP_CAR_FALLBACK = resolve(root, '../alkhedr_cars_app/assets/splash_car.webp')

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
  return QRCode.toDataURL(PLAY_URL, {
    width: 560,
    margin: 1,
    color: { dark: '#0a1628', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
}

function buildHtml({ qrDataUri, logoUri, carUri, playBadgeUri }) {
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
      background: #07111f;
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
      background: url('${carUri}') center 45% / cover no-repeat;
      opacity: 0.38;
      filter: brightness(0.88) saturate(0.85);
      transform: scale(1.05);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(165deg,
          rgba(7,17,31,0.72) 0%,
          rgba(10,31,61,0.35) 38%,
          rgba(7,17,31,0.55) 62%,
          rgba(5,10,18,0.92) 100%),
        radial-gradient(ellipse 80% 45% at 75% 12%, rgba(31,224,122,0.14), transparent 60%),
        radial-gradient(ellipse 60% 40% at 15% 85%, rgba(212,168,83,0.12), transparent 55%);
    }

    .gold-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, transparent, #d4a853, #f0d78c, #d4a853, transparent);
      z-index: 5;
    }

    .frame {
      position: absolute;
      inset: 9mm;
      border: 2px solid rgba(212,168,83,0.45);
      border-radius: 18px;
      pointer-events: none;
      z-index: 4;
    }

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
      color: #fff;
    }
    .brand p {
      font-size: 12px;
      font-weight: 700;
      color: #1fe07a;
      margin-top: 5px;
      direction: ltr;
      text-align: right;
    }

    .play-badge-official {
      flex-shrink: 0;
      filter: drop-shadow(0 8px 20px rgba(0,0,0,0.45));
    }
    .play-badge-official img {
      height: 54px;
      width: auto;
      display: block;
    }
    .play-badge-large {
      margin-top: 12px;
    }
    .play-badge-large img {
      height: 62px;
      width: auto;
      display: block;
      filter: drop-shadow(0 6px 16px rgba(0,0,0,0.35));
    }

    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 14px;
      padding: 4mm 0;
    }

    .hero-card {
      background: rgba(10, 22, 40, 0.88);
      border: 1.5px solid rgba(212,168,83,0.42);
      border-radius: 22px;
      padding: 22px 24px;
      box-shadow: 0 14px 40px rgba(0,0,0,0.28);
    }

    .tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #1a1200;
      background: linear-gradient(135deg, #d4a853, #f0d78c);
      padding: 7px 14px;
      border-radius: 999px;
      margin-bottom: 14px;
    }

    .headline {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.35;
      color: #fff;
      margin-bottom: 10px;
    }
    .headline em {
      font-style: normal;
      color: #1fe07a;
    }

    .subline {
      font-size: 20px;
      font-weight: 800;
      color: #f0d78c;
      line-height: 1.5;
      margin-bottom: 16px;
      padding-inline-start: 12px;
      border-inline-start: 4px solid #d4a853;
    }

    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .feat {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      background: rgba(15,39,68,0.75);
      border: 1px solid rgba(31,224,122,0.35);
      border-radius: 12px;
      padding: 11px 14px;
      line-height: 1.4;
    }
    .feat::before {
      content: '✓ ';
      color: #1fe07a;
      font-weight: 900;
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
      background: rgba(10, 22, 40, 0.9);
      border: 1.5px solid rgba(212,168,83,0.4);
      border-radius: 18px;
      padding: 16px 18px;
    }
    .cta .scan {
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
    }
    .cta .store {
      font-size: 13px;
      font-weight: 700;
      color: #1fe07a;
      margin-bottom: 6px;
    }
    .cta .phone {
      font-size: 22px;
      font-weight: 900;
      color: #f0d78c;
      direction: ltr;
      text-align: right;
      letter-spacing: 1px;
    }
    .cta .web {
      font-size: 14px;
      font-weight: 700;
      color: rgba(255,255,255,0.75);
      direction: ltr;
      text-align: right;
      margin-top: 4px;
    }

    .qr-wrap {
      flex-shrink: 0;
      text-align: center;
    }
    .qr-box {
      background: #fff;
      padding: 11px;
      border-radius: 18px;
      border: 3px solid #d4a853;
      box-shadow: 0 14px 36px rgba(0,0,0,0.45), 0 0 28px rgba(212,168,83,0.18);
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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

    <div class="content">
      <div class="header">
        <div class="brand">
          ${logoUri ? `<img src="${logoUri}" alt="الخضر" />` : ''}
          <div>
            <h2>${COMPANY}</h2>
            <p>${SITE_HOST}</p>
          </div>
        </div>
        ${playBadgeUri ? `<div class="play-badge-official"><img src="${playBadgeUri}" alt="Google Play" /></div>` : ''}
      </div>

      <div class="hero">
        <div class="hero-card">
          <span class="tag">التطبيق الرسمي</span>
          <h1 class="headline">حمّل تطبيق <em>الخضر</em><br/>لتأجير السيارات</h1>
          <p class="subline">احجز من جوالك — عروض يومية وشهرية — فروع في كل أنحاء المملكة</p>
          <div class="features">
            <div class="feat">حجز سريع من التطبيق</div>
            <div class="feat">عروض شهرية مميزة</div>
            <div class="feat">اختر أقرب فرع لك</div>
            <div class="feat">متابعة حجوزاتك بسهولة</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="cta">
          <div class="scan">امسح الكود وحمّل التطبيق الآن</div>
          <div class="store">متوفر على متجر Google Play</div>
          ${playBadgeUri ? `<div class="play-badge-large"><img src="${playBadgeUri}" alt="احصل عليه من Google Play" /></div>` : ''}
          <div class="phone">${TOLL_FREE}</div>
          <div class="web">${SITE_HOST}</div>
        </div>
        <div class="qr-wrap">
          <div class="qr-box">
            <img class="qr" src="${qrDataUri}" alt="QR Google Play" />
            ${logoUri ? `<div class="qr-logo"><img src="${logoUri}" alt="" /></div>` : ''}
          </div>
          <div class="qr-caption">امسح للتحميل</div>
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
  const playBadgeUri = toDataUri(PLAY_BADGE_PATH)
  const carUri = toDataUri(existsSync(CAR_PATH) ? CAR_PATH : APP_CAR_FALLBACK)
  if (!carUri) throw new Error('صورة السيارة غير موجودة')
  if (!playBadgeUri) throw new Error('شعار Google Play غير موجود — شغّل poster:app مرة أخرى')
  const qrDataUri = await buildQrDataUri()

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3 })
    await page.setContent(buildHtml({ qrDataUri, logoUri, carUri, playBadgeUri }), {
      waitUntil: 'networkidle0',
      timeout: 90000,
    })
    await page.evaluate(() => document.fonts.ready)

    const pngMain = resolve(outDir, 'بوستر-تطبيق-الخضر-جوجل-بلاي.png')
    const pdfMain = resolve(outDir, 'بوستر-تطبيق-الخضر-جوجل-بلاي.pdf')
    const pngDesktop = resolve(desktop, 'بوستر-تطبيق-الخضر-جوجل-بلاي.png')
    const pdfDesktop = resolve(desktop, 'بوستر-تطبيق-الخضر-جوجل-بلاي.pdf')

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
      `بوستر تطبيق الخضر — Google Play\n\nQR يوجّه إلى:\n${PLAY_URL}\n\nالطباعة: A4 عمودي\n\n${new Date().toLocaleString('ar-SA')}\n`,
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
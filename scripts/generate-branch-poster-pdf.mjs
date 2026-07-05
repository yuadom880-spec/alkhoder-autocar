/**
 * ملصق طباعة للفروع — تصميم ثالث (تفاصيل قليلة + QR بلون مختلف)
 * التشغيل: npm run poster:pdf
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')

const SITE_URL = 'https://alkhodercar.com'
const SITE_HOST = 'alkhodercar.com'
const SITE_NAME = 'عبدالمجيد الخضر لتأجير السيارات'
const TOLL_FREE = '920018216'
const OUTPUT = resolve(desktop, 'ملصق-حجز-أونلاين-عبدالمجيد-الخضر.pdf')

/** لون نقاط الـ QR — كحلي غامق (مش أخضر) */
const QR_DARK = '#0f2744'
const QR_LIGHT = '#ffffff'

const DETAILS = [
  'احجز سيارتك أونلاين في دقائق',
  'إيجار يومي وشهري — أسعار واضحة',
  'أكثر من 35 فرعاً في المملكة',
]

function toDataUri(filePath) {
  if (!existsSync(filePath)) return ''
  const buf = readFileSync(filePath)
  const ext = filePath.endsWith('.png') ? 'png' : 'jpeg'
  return `data:image/${ext};base64,${buf.toString('base64')}`
}

async function buildStyledQrHtml(logoUri) {
  const size = 900
  const qrDataUri = await QRCode.toDataURL(SITE_URL, {
    width: size,
    margin: 1,
    color: { dark: QR_DARK, light: QR_LIGHT },
    errorCorrectionLevel: 'H',
  })

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:${size}px; height:${size}px; background:transparent; }
  .frame {
    width: ${size}px; height: ${size}px;
    padding: 18px;
    background: linear-gradient(135deg, #c41e3a 0%, #e63946 50%, #9b1b30 100%);
    border-radius: 40px;
    box-shadow: 0 12px 40px rgba(196,30,58,0.35);
  }
  .wrap {
    position: relative;
    width: 100%; height: 100%;
    background: #fff;
    border-radius: 28px;
    overflow: hidden;
  }
  .wrap img.qr { width:100%; height:100%; display:block; }
  .logo-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 148px; height: 148px;
    background: #fff;
    padding: 6px;
  }
  .logo-center img { width:100%; height:100%; object-fit:contain; display:block; }
</style></head><body>
  <div class="frame">
    <div class="wrap">
      <img class="qr" src="${qrDataUri}" alt="qr" />
      <div class="logo-center"><img src="${logoUri}" alt="logo" /></div>
    </div>
  </div>
</body></html>`
}

async function renderQrWithLogo(browser, logoUri) {
  const page = await browser.newPage()
  await page.setViewport({ width: 900, height: 900, deviceScaleFactor: 2 })
  await page.setContent(await buildStyledQrHtml(logoUri), { waitUntil: 'load' })
  const buf = await page.screenshot({ type: 'png', omitBackground: true })
  await page.close()
  return `data:image/png;base64,${buf.toString('base64')}`
}

function detailsHtml() {
  return DETAILS.map(
    (text) => `
    <div class="detail-card">
      <span class="dot"></span>
      <p>${text}</p>
    </div>`,
  ).join('')
}

async function buildHtml(qrUri, logoUri) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; height: 297mm;
      font-family: 'Tajawal', 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
    }
    .poster {
      width: 210mm; height: 297mm;
      background: linear-gradient(180deg, #f8f6f2 0%, #fff 45%, #f0f4f8 100%);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* شريط علوي أحمر من اللوجو */
    .top-bar {
      height: 6mm;
      background: linear-gradient(90deg, #9b1b30, #c41e3a, #e63946, #c41e3a, #9b1b30);
    }

    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 12mm 14mm 10mm;
      gap: 6mm;
    }

    .header-block {
      width: 100%;
      text-align: center;
      direction: rtl;
    }
    .logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 14px;
    }
    .logo-row img {
      height: 78px;
      display: block;
      border: none;
      outline: none;
      box-shadow: none;
    }
    .logo-row .name {
      font-size: 20px;
      font-weight: 800;
      color: ${QR_DARK};
      line-height: 1.45;
      text-align: right;
      direction: rtl;
    }

    .headline h1 {
      font-size: 40px;
      font-weight: 800;
      color: ${QR_DARK};
      margin-bottom: 8px;
      direction: rtl;
      unicode-bidi: plaintext;
    }
    .headline p {
      font-size: 19px;
      color: #c41e3a;
      font-weight: 700;
      direction: rtl;
    }

    .qr-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .qr-wrap img {
      width: 265px;
      height: 265px;
      display: block;
    }
    .qr-hint {
      font-size: 18px;
      font-weight: 800;
      color: ${QR_DARK};
      direction: rtl;
    }

    .details-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      width: 100%;
    }
    .detail-card {
      background: #fff;
      border-radius: 16px;
      padding: 16px 12px;
      border: 1px solid rgba(15,39,68,0.08);
      box-shadow: 0 6px 20px rgba(15,39,68,0.06);
      text-align: center;
      direction: rtl;
    }
    .detail-card .dot {
      display: block;
      width: 10px; height: 10px;
      background: #c41e3a;
      border-radius: 50%;
      margin: 0 auto 10px;
    }
    .detail-card p {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      line-height: 1.55;
    }

    .cta-strip {
      width: 100%;
      background: ${QR_DARK};
      color: #fff;
      border-radius: 18px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .cta-strip .left {
      text-align: right;
      direction: rtl;
    }
    .cta-strip .scan-label {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .cta-strip .url {
      font-size: 24px;
      font-weight: 800;
      color: #f0d78c;
      direction: ltr;
      text-align: right;
    }
    .cta-strip .phone-block {
      text-align: center;
      background: rgba(255,255,255,0.12);
      border-radius: 14px;
      padding: 12px 22px;
      flex-shrink: 0;
      direction: rtl;
    }
    .cta-strip .phone-block .lbl {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 600;
    }
    .cta-strip .phone-block .num {
      font-size: 26px;
      font-weight: 800;
      direction: ltr;
      letter-spacing: 0.5px;
    }

    .bottom-bar {
      height: 4mm;
      background: ${QR_DARK};
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="top-bar"></div>

    <div class="body">
      <div class="header-block">
        <div class="logo-row">
          ${logoUri ? `<img src="${logoUri}" alt="logo" />` : ''}
          <div class="name">${SITE_NAME}</div>
        </div>
        <div class="headline">
          <h1>زور موقعنا الإلكتروني</h1>
          <p>احجز سيارتك من جوالك — بسرعة وسهولة</p>
        </div>
      </div>

      <div class="qr-wrap">
        <img src="${qrUri}" alt="QR" />
        <div class="qr-hint">امسح الكود بالجوال</div>
      </div>

      <div class="details-row">
        ${detailsHtml()}
      </div>

      <div class="cta-strip">
        <div class="left">
          <div class="scan-label">امسح الكود أو ادخل الموقع</div>
          <div class="url">${SITE_HOST}</div>
        </div>
        <div class="phone-block">
          <div class="lbl">الرقم الموحد</div>
          <div class="num">${TOLL_FREE}</div>
        </div>
      </div>
    </div>

    <div class="bottom-bar"></div>
  </div>
</body>
</html>`
}

async function main() {
  console.log('\n🖨️  جاري إنشاء ملصق الفروع (تصميم 3)...\n')

  const logoUri = toDataUri(resolve(root, 'public/logo.png'))
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const qrUri = await renderQrWithLogo(browser, logoUri)
    const page = await browser.newPage()
    await page.setContent(await buildHtml(qrUri, logoUri), {
      waitUntil: 'networkidle0',
      timeout: 60000,
    })
    await page.pdf({
      path: OUTPUT,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    })
    console.log(`✅ تم حفظ الملصق على سطح المكتب:\n   ${OUTPUT}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('❌ فشل إنشاء PDF:', err.message)
  process.exit(1)
})
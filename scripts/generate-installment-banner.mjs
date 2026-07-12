/**
 * بانر التقسيط — 3 مقاسات: ديسكتوب / موبايل+تطبيق / كارت عروض
 * التشغيل: node scripts/generate-installment-banner.mjs
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outDir = resolve(desktop, 'alkhoder-installment-banner')

const COMPANY = 'شركة عبدالمجيد الخضر لتأجير السيارات'
const SITE = 'alkhodercar.com'

const VARIANTS = [
  {
    id: '01-desktop',
    name: 'موقع — ديسكتوب',
    width: 1200,
    height: 420,
    scale: 2,
    use: 'شريط عريض للموقع على الكمبيوتر (نسبة 20:7)',
    layout: 'desktop',
  },
  {
    id: '02-mobile-app',
    name: 'تطبيق + موبايل',
    width: 390,
    height: 520,
    scale: 3,
    use: 'الصفحة الرئيسية في التطبيق والموقع على الجوال',
    layout: 'mobile',
  },
  {
    id: '03-card-grid',
    name: 'كارت عروض',
    width: 800,
    height: 600,
    scale: 2,
    use: 'شبكة العروض في الموقع (نسبة 4:3 مثل باقي البانرات)',
    layout: 'card',
  },
]

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

const TABBY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56" role="img" aria-label="Tabby">
  <rect width="200" height="56" rx="12" fill="#3BFFC1"/>
  <text x="100" y="38" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="900" fill="#111111" letter-spacing="-1">tabby</text>
</svg>`

const TAMARA_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56" role="img" aria-label="Tamara">
  <defs>
    <linearGradient id="tamaraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B5CF0"/>
      <stop offset="100%" stop-color="#D946EF"/>
    </linearGradient>
  </defs>
  <rect width="220" height="56" rx="12" fill="#F8F5FF"/>
  <text x="110" y="38" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="url(#tamaraGrad)" letter-spacing="1">tamara</text>
</svg>`

function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

const sharedStyles = (w, h) => `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${w}px; height: ${h}px; overflow: hidden;
    font-family: 'Tajawal', sans-serif; background: #0a1628;
  }
  .banner {
    position: relative; width: ${w}px; height: ${h}px; overflow: hidden;
    background: linear-gradient(135deg, #061018 0%, #0a1628 40%, #0d2a1f 100%);
  }
  .bg-car {
    position: absolute; inset: 0;
    background-size: cover; background-position: center 55%;
    opacity: 0.2; filter: saturate(0.65) brightness(0.5);
  }
  .overlay { position: absolute; inset: 0; }
  .accent-line {
    position: absolute; top: 0; right: 0; left: 0; height: 3px; z-index: 3;
    background: linear-gradient(90deg, #0D7A4A, #3BFFC1, #7B5CF0, #0D7A4A);
  }
  .pill {
    background: rgba(13,122,74,0.22);
    border: 1px solid rgba(59,255,193,0.35);
    color: #7dffc8; border-radius: 999px; font-weight: 800; white-space: nowrap;
  }
  .partner-card {
    background: rgba(255,255,255,0.97); border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
  }
  .partner-card img { height: 32px; width: auto; max-width: 140px; object-fit: contain; }
  .partner-card .label { font-weight: 800; color: #0a1628; }
  .partner-card .hint { font-weight: 600; color: #64748b; text-align: center; line-height: 1.4; }
  .partner-card.tabby { border-bottom: 3px solid #3BFFC1; }
  .partner-card.tamara { border-bottom: 3px solid #7B5CF0; }
  h1 em { font-style: normal; color: #3BFFC1; }
  .sub strong { color: #3BFFC1; font-weight: 800; }
`

function partnerCards(tabbyUri, tamaraUri, compact = false) {
  const pad = compact ? '14px 12px 12px' : '18px 16px 14px'
  const labelSize = compact ? '12px' : '13px'
  const hintSize = compact ? '10px' : '11px'
  return `
    <div class="partner-card tabby" style="padding:${pad}">
      <img src="${tabbyUri}" alt="Tabby" />
      <div class="label" style="font-size:${labelSize};margin-top:8px">قسّط مع تابي</div>
      <div class="hint" style="font-size:${hintSize};margin-top:4px">4 دفعات بدون فوائد</div>
    </div>
    <div class="partner-card tamara" style="padding:${pad}">
      <img src="${tamaraUri}" alt="Tamara" />
      <div class="label" style="font-size:${labelSize};margin-top:8px">قسّط مع تمارا</div>
      <div class="hint" style="font-size:${hintSize};margin-top:4px">تقسيط مرن عند الدفع</div>
    </div>`
}

function buildDesktopHtml({ logoUri, carUri, tabbyUri, tamaraUri, w, h }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    ${sharedStyles(w, h)}
    .bg-car { background-image: url('${carUri}'); }
    .overlay {
      background:
        radial-gradient(ellipse 70% 90% at 70% 50%, rgba(13,122,74,0.25) 0%, transparent 60%),
        linear-gradient(90deg, rgba(6,16,24,0.96) 0%, rgba(6,16,24,0.75) 50%, rgba(6,16,24,0.4) 100%);
    }
    .content {
      position: relative; z-index: 2; height: 100%;
      padding: 28px 48px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .top { display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 44px; height: 44px; border-radius: 10px; }
    .brand-text { color: #fff; font-size: 14px; font-weight: 800; line-height: 1.3; }
    .brand-text span { display: block; font-size: 11px; color: rgba(255,255,255,0.5); direction: ltr; text-align: right; }
    .pill { padding: 7px 16px; font-size: 12px; }
    .main { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 28px; align-items: center; flex: 1; }
    h1 { font-size: 42px; font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 10px; }
    .sub { font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.5; margin-bottom: 14px; }
    .features { display: flex; flex-wrap: wrap; gap: 8px; }
    .feature {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
      color: #e8f5ef; padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700;
    }
    .partners-title { text-align: center; color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 700; margin-bottom: 10px; }
    .partner-row { display: flex; gap: 12px; }
    .partner-card { flex: 1; }
    .bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); }
    .cta { font-size: 15px; font-weight: 900; color: #fff; }
    .cta span { color: #3BFFC1; }
    .note { font-size: 10px; color: rgba(255,255,255,0.45); }
  </style>
</head>
<body>
  <div class="banner">
    <div class="bg-car"></div><div class="overlay"></div><div class="accent-line"></div>
    <div class="content">
      <div class="top">
        <div class="brand">
          ${logoUri ? `<img src="${logoUri}" alt="" />` : ''}
          <div class="brand-text">${COMPANY}<span>${SITE}</span></div>
        </div>
        <div class="pill">متاح التقسيط</div>
      </div>
      <div class="main">
        <div>
          <h1>استأجر سيارتك <em>الآن</em></h1>
          <p class="sub">وأدفع على راحتك — قسّط إيجار سيارتك مع تابي وتمارا <strong>بدون فوائد</strong></p>
          <div class="features">
            <span class="feature">✓ بدون فوائد</span>
            <span class="feature">✓ موافقة سريعة</span>
            <span class="feature">✓ يومي وشهري</span>
          </div>
        </div>
        <div>
          <div class="partners-title">طرق الدفع</div>
          <div class="partner-row">${partnerCards(tabbyUri, tamaraUri)}</div>
        </div>
      </div>
      <div class="bottom">
        <div class="cta">احجز على <span>${SITE}</span></div>
        <div class="note">شروط تابي وتمارا تنطبق</div>
      </div>
    </div>
  </div>
</body></html>`
}

function buildMobileHtml({ logoUri, carUri, tabbyUri, tamaraUri, w, h }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    ${sharedStyles(w, h)}
    .bg-car { background-image: url('${carUri}'); opacity: 0.16; }
    .overlay {
      background:
        linear-gradient(180deg, rgba(6,16,24,0.92) 0%, rgba(6,16,24,0.88) 55%, rgba(13,42,31,0.9) 100%);
    }
    .content {
      position: relative; z-index: 2; height: 100%; padding: 18px 16px 16px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .brand { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .brand img { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
    .brand-text { color: #fff; font-size: 11px; font-weight: 800; line-height: 1.25; }
    .pill { padding: 5px 12px; font-size: 10px; flex-shrink: 0; }
    h1 { font-size: 26px; font-weight: 900; color: #fff; line-height: 1.25; }
    .sub { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.55; margin-top: 8px; }
    .partner-row { display: flex; gap: 10px; margin-top: 4px; }
    .partner-card { flex: 1; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px; }
    .feature {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
      color: #d8f5e8; padding: 6px 8px; border-radius: 8px; font-size: 9px; font-weight: 700; text-align: center;
    }
    .cta {
      margin-top: auto; text-align: center; font-size: 12px; font-weight: 800; color: #fff;
      padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);
    }
    .cta span { color: #3BFFC1; }
  </style>
</head>
<body>
  <div class="banner">
    <div class="bg-car"></div><div class="overlay"></div><div class="accent-line"></div>
    <div class="content">
      <div class="top">
        <div class="brand">
          ${logoUri ? `<img src="${logoUri}" alt="" />` : ''}
          <div class="brand-text">${COMPANY}</div>
        </div>
        <div class="pill">متاح التقسيط</div>
      </div>
      <div>
        <h1>استأجر سيارتك <em>الآن</em></h1>
        <p class="sub">وأدفع على راحتك — قسّط إيجار سيارتك مع تابي وتمارا <strong>بدون فوائد</strong></p>
      </div>
      <div class="partner-row">${partnerCards(tabbyUri, tamaraUri, true)}</div>
      <div class="features">
        <span class="feature">✓ بدون فوائد</span>
        <span class="feature">✓ موافقة سريعة</span>
        <span class="feature">✓ يومي وشهري</span>
        <span class="feature">✓ +35 فرعاً</span>
      </div>
      <div class="cta">احجز على <span>${SITE}</span></div>
    </div>
  </div>
</body></html>`
}

function buildCardHtml({ logoUri, carUri, tabbyUri, tamaraUri, w, h }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    ${sharedStyles(w, h)}
    .bg-car { background-image: url('${carUri}'); opacity: 0.18; }
    .overlay {
      background:
        radial-gradient(ellipse 90% 80% at 50% 100%, rgba(13,122,74,0.3) 0%, transparent 55%),
        linear-gradient(180deg, rgba(6,16,24,0.94) 0%, rgba(6,16,24,0.82) 100%);
    }
    .content {
      position: relative; z-index: 2; height: 100%; padding: 32px 28px;
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px;
    }
    .pill { padding: 8px 18px; font-size: 13px; }
    h1 { font-size: 36px; font-weight: 900; color: #fff; line-height: 1.25; }
    .sub { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.55; max-width: 90%; }
    .partner-row { display: flex; gap: 14px; width: 100%; max-width: 520px; }
    .partner-card { flex: 1; padding: 20px 14px 16px !important; }
    .partner-card img { height: 38px; }
    .logo-sm { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="banner">
    <div class="bg-car"></div><div class="overlay"></div><div class="accent-line"></div>
    <div class="content">
      ${logoUri ? `<img class="logo-sm" src="${logoUri}" alt="" />` : ''}
      <div class="pill">متاح التقسيط</div>
      <h1>استأجر سيارتك <em>الآن</em></h1>
      <p class="sub">وأدفع على راحتك — قسّط إيجار سيارتك مع تابي وتمارا <strong>بدون فوائد</strong></p>
      <div class="partner-row">${partnerCards(tabbyUri, tamaraUri)}</div>
    </div>
  </div>
</body></html>`
}

function buildHtml(variant, assets) {
  const { width: w, height: h, layout } = variant
  const ctx = { ...assets, w, h }
  if (layout === 'mobile') return buildMobileHtml(ctx)
  if (layout === 'card') return buildCardHtml(ctx)
  return buildDesktopHtml(ctx)
}

async function renderVariant(browser, variant, assets) {
  const page = await browser.newPage()
  await page.setViewport({
    width: variant.width,
    height: variant.height,
    deviceScaleFactor: variant.scale,
  })
  await page.setContent(buildHtml(variant, assets), {
    waitUntil: 'networkidle0',
    timeout: 60000,
  })
  await page.evaluate(() => document.fonts.ready)
  const pngPath = resolve(outDir, `banner-${variant.id}.png`)
  await page.screenshot({ path: pngPath, type: 'png' })
  await page.close()
  return pngPath
}

function buildPreviewHtml(manifest) {
  const items = manifest
    .map(
      (m) => `
    <section>
      <h2>${m.name} — ${m.width}×${m.height}</h2>
      <p>${m.use}</p>
      <img src="banner-${m.id}.png" alt="${m.name}" />
    </section>`,
    )
    .join('')
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family:Segoe UI,Tahoma,sans-serif; background:#f1f5f9; padding:24px; }
    section { background:#fff; border-radius:16px; padding:20px; margin-bottom:24px; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    h2 { margin:0 0 6px; color:#0a1628; }
    p { margin:0 0 14px; color:#64748b; font-size:14px; }
    img { max-width:100%; height:auto; border-radius:12px; border:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <h1>معاينة مقاسات بانر التقسيط</h1>
  ${items}
</body></html>`
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  const assets = {
    logoUri: toDataUri(resolve(root, 'public/logo.png')),
    carUri: toDataUri(
      [resolve(root, 'public/candidate-suv-luxury.jpg'), resolve(root, 'public/hero-patrol-black.jpg')]
        .find((p) => existsSync(p)) ?? resolve(root, 'public/hero-patrol-black.jpg'),
    ),
    tabbyUri: svgDataUri(TABBY_LOGO_SVG),
    tamaraUri: svgDataUri(TAMARA_LOGO_SVG),
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const manifest = []

  try {
    console.log('\n🎨 جاري إنشاء 3 مقاسات للبانر...\n')
    for (const variant of VARIANTS) {
      console.log(`   ▶ ${variant.name} (${variant.width}×${variant.height})...`)
      const path = await renderVariant(browser, variant, assets)
      manifest.push({ ...variant, path })
      console.log(`     ✅ ${path}`)
    }

    const previewPath = resolve(outDir, 'preview-all-sizes.html')
    writeFileSync(previewPath, buildPreviewHtml(manifest), 'utf8')

    const readme = `بانر التقسيط — تابي وتمارا (3 مقاسات)
${COMPANY}

لماذا 3 مقاسات؟
- صورة واحدة عريضة (1920×600) لا تناسب الموبايل والتطبيق
- كل منصة لها نسبة عرض/ارتفاع مختلفة

الملفات:
${manifest.map((m) => `- banner-${m.id}.png → ${m.width}×${m.height} — ${m.use}`).join('\n')}

معاينة: افتح preview-all-sizes.html في المتصفح

تم الإنشاء: ${new Date().toLocaleString('ar-SA')}
`
    writeFileSync(resolve(outDir, 'README.txt'), readme, 'utf8')

    console.log(`\n✅ تم الحفظ في:\n   ${outDir}`)
    console.log(`   📋 معاينة: ${previewPath}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('❌ فشل:', err.message)
  process.exit(1)
})
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const cvDir = resolve(desktop, 'youssef-essam-cv')
const shotsDir = resolve(cvDir, 'assets')
const skipCapture = process.argv.includes('--pdf-only')

const OUTPUT = resolve(desktop, 'يوسف-عصام-بورتفوليو-خمسات.pdf')

const ALKHODER = 'http://localhost:5173'
const LY_PERFUM = 'http://localhost:5174'
const ZOOSKA = 'http://localhost:5175'
const MIN_SHOT_BYTES = 35_000

mkdirSync(resolve(shotsDir, 'zooska'), { recursive: true })

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function isValidShot(filePath) {
  if (!existsSync(filePath)) return false
  try {
    const size = statSync(filePath).size
    if (size < MIN_SHOT_BYTES) return false
    const buf = readFileSync(filePath)
    if (buf.length < 100) return false
    const unique = new Set(buf.slice(0, 500))
    return unique.size > 8
  } catch {
    return false
  }
}

function toDataUri(filePath) {
  if (!isValidShot(filePath)) return null
  const buf = readFileSync(filePath)
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function screenshot(page, url, outPath, { waitMs = 2500, waitSelector = null } = {}) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 20000 }).catch(() => {})
    }
    await sleep(waitMs)
    await page.evaluate(() => window.scrollTo(0, 0))
    await sleep(300)
    await page.screenshot({
      path: outPath,
      type: 'png',
      fullPage: false,
      captureBeyondViewport: false,
    })
    if (!isValidShot(outPath)) {
      console.warn(`  ✗ ${outPath}: صورة فارغة أو صغيرة`)
      return false
    }
    console.log(`  ✓ ${outPath}`)
    return true
  } catch (e) {
    console.warn(`  ✗ ${outPath}: ${e.message}`)
    return false
  }
}

async function startDev(cwd, port, label) {
  const base = `http://localhost:${port}`
  try {
    const res = await fetch(`${base}/`)
    if (res.ok) {
      console.log(`  ✓ ${label} يعمل بالفعل على ${port}`)
      return null
    }
  } catch {}

  const isWin = process.platform === 'win32'
  const child = spawn(
    isWin ? 'cmd.exe' : 'npm',
    isWin
      ? ['/c', 'npm', 'run', 'dev', '--', '--port', String(port), '--strictPort', 'false']
      : ['run', 'dev', '--', '--port', String(port), '--strictPort', 'false'],
    { cwd, stdio: 'ignore', detached: true, windowsHide: true },
  )
  child.unref()

  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${base}/`)
      if (res.ok) {
        console.log(`  ✓ ${label} بدأ على ${port}`)
        return child
      }
    } catch {}
    await sleep(1000)
  }
  throw new Error(`لم يبدأ سيرفر ${label} على المنفذ ${port}`)
}

async function setReactInput(page, selector, value) {
  await page.$eval(
    selector,
    (el, val) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, val)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    },
    value,
  )
}

async function loginAlkhoder(page) {
  await page.goto(`${ALKHODER}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#phone')
  await page.evaluate(() => {
    document.querySelector('#phone').value = ''
    document.querySelector('#password').value = ''
  })
  await page.type('#phone', '0554032228', { delay: 20 })
  await page.type('#password', '090909a', { delay: 20 })
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await sleep(2000)
}

async function loginLyPerfum(page) {
  await page.goto(`${LY_PERFUM}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type="password"]')
  await setReactInput(page, 'input[type="email"]', 'yuadom880@gmail.com')
  await setReactInput(page, 'input[type="password"]', '09090909')
  await page.click('button[type="submit"]')
  await page.waitForFunction(
    () =>
      window.location.pathname === '/admin' &&
      (document.body.innerText.includes('خروج') || document.body.innerText.includes('إضافة عطر')),
    { timeout: 30000 },
  )
  await sleep(3500)
}

async function loginZooska(page) {
  await page.goto(`${ZOOSKA}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.setItem('zooska_admin', 'true'))
  await page.goto(`${ZOOSKA}/admin`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('aside, nav, h1, h2', { timeout: 20000 })
  await sleep(2500)
}

const SHOT_MAP = {
  alkhoder: {
    home: 'alkhoder/home.png',
    cars: 'alkhoder/cars.png',
    'car-detail': 'alkhoder/car-detail.png',
    booking: 'alkhoder/booking.png',
    offers: 'alkhoder/offers.png',
    branches: 'alkhoder/branches.png',
    'admin-dashboard': 'alkhoder/admin-dashboard.png',
    'admin-cars': 'alkhoder/admin-cars.png',
    'admin-bookings': 'alkhoder/admin-bookings.png',
    'admin-offers': 'alkhoder/admin-offers.png',
  },
  ly: {
    home: 'ly-perfum/home.png',
    shop: 'ly-perfum/shop.png',
    'perfume-detail': 'ly-perfum/perfume-detail.png',
    cart: 'ly-perfum/cart.png',
    checkout: 'ly-perfum/checkout.png',
    contact: 'ly-perfum/contact.png',
    'admin-dashboard': 'ly-perfum/admin-dashboard.png',
    'admin-orders': 'ly-perfum/admin-orders.png',
  },
  zooska: {
    home: 'zooska/home.png',
    products: 'zooska/products.png',
    'product-detail': 'zooska/product-detail.png',
    cart: 'zooska/cart.png',
    checkout: 'zooska/checkout.png',
    'admin-dashboard': 'zooska/admin-dashboard.png',
    'admin-products': 'zooska/admin-products.png',
    'admin-orders': 'zooska/admin-orders.png',
  },
}

function shotPath(project, key) {
  return resolve(shotsDir, SHOT_MAP[project][key])
}

async function captureMissingShots() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

  const needAlkhoder = Object.keys(SHOT_MAP.alkhoder).some((k) => !isValidShot(shotPath('alkhoder', k)))
  const needLy = Object.keys(SHOT_MAP.ly).some((k) => !isValidShot(shotPath('ly', k)))
  const needZooska = Object.keys(SHOT_MAP.zooska).some((k) => !isValidShot(shotPath('zooska', k)))

  if (needAlkhoder) {
    console.log('\n📸 التقاط صور الخضر للسيارات...')
    try {
      await fetch(`${ALKHODER}/`)
    } catch {
      await startDev(resolve(desktop, 'alkhoder-autocar'), 5173, 'alkhoder-autocar')
    }

    const publicShots = [
      ['home', '/'],
      ['cars', '/cars'],
      ['car-detail', '/cars/1'],
      ['booking', '/book/1'],
      ['offers', '/offers'],
      ['branches', '/branches'],
    ]
    for (const [key, path] of publicShots) {
      if (!isValidShot(shotPath('alkhoder', key))) {
        await screenshot(page, `${ALKHODER}${path}`, shotPath('alkhoder', key), { waitMs: 3000 })
      }
    }

    const adminNeeded = ['admin-dashboard', 'admin-cars', 'admin-bookings', 'admin-offers'].some(
      (k) => !isValidShot(shotPath('alkhoder', k)),
    )
    if (adminNeeded) {
      await loginAlkhoder(page)
      const adminShots = [
        ['admin-dashboard', '/admin'],
        ['admin-cars', '/admin/cars'],
        ['admin-bookings', '/admin/bookings'],
        ['admin-offers', '/admin/offers'],
      ]
      for (const [key, path] of adminShots) {
        if (!isValidShot(shotPath('alkhoder', key))) {
          await screenshot(page, `${ALKHODER}${path}`, shotPath('alkhoder', key), { waitMs: 3000 })
        }
      }
    }
  } else {
    console.log('\n✓ صور الخضر للسيارات موجودة')
  }

  if (needLy) {
    console.log('\n📸 التقاط صور LY Perfum...')
    await startDev(resolve(desktop, 'ly-perfum'), 5174, 'ly-perfum')

    const lyPublic = [
      ['home', '/'],
      ['shop', '/shop'],
      ['contact', '/contact'],
    ]
    for (const [key, path] of lyPublic) {
      if (!isValidShot(shotPath('ly', key))) {
        await screenshot(page, `${LY_PERFUM}${path}`, shotPath('ly', key))
      }
    }

    if (!isValidShot(shotPath('ly', 'perfume-detail'))) {
      await page.goto(`${LY_PERFUM}/shop`, { waitUntil: 'domcontentloaded' })
      await sleep(2500)
      const href = await page.$eval('a[href^="/perfume/"]', (a) => a.getAttribute('href')).catch(() => null)
      if (href) {
        await screenshot(page, `${LY_PERFUM}${href}`, shotPath('ly', 'perfume-detail'))
      }
    }

    if (!isValidShot(shotPath('ly', 'cart')) || !isValidShot(shotPath('ly', 'checkout'))) {
      await page.goto(`${LY_PERFUM}/shop`, { waitUntil: 'domcontentloaded' })
      await sleep(2000)
      const href = await page.$eval('a[href^="/perfume/"]', (a) => a.getAttribute('href')).catch(() => null)
      if (href) {
        await page.goto(`${LY_PERFUM}${href}`, { waitUntil: 'domcontentloaded' })
        await sleep(1500)
        const buttons = await page.$$('button')
        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent?.trim() ?? '', btn)
          if (text.includes('إضافة للسلة')) {
            await btn.click()
            await sleep(1000)
            break
          }
        }
      }
      if (!isValidShot(shotPath('ly', 'cart'))) {
        await screenshot(page, `${LY_PERFUM}/cart`, shotPath('ly', 'cart'))
      }
      if (!isValidShot(shotPath('ly', 'checkout'))) {
        await screenshot(page, `${LY_PERFUM}/checkout`, shotPath('ly', 'checkout'))
      }
    }

    if (!isValidShot(shotPath('ly', 'admin-dashboard')) || !isValidShot(shotPath('ly', 'admin-orders'))) {
      try {
        await loginLyPerfum(page)
        if (!isValidShot(shotPath('ly', 'admin-dashboard'))) {
          await screenshot(page, `${LY_PERFUM}/admin`, shotPath('ly', 'admin-dashboard'), { waitMs: 4000 })
        }
        if (!isValidShot(shotPath('ly', 'admin-orders'))) {
          await page.evaluate(() => {
            const ordersTab = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('الطلبات'))
            ordersTab?.click()
          })
          await sleep(3000)
          await screenshot(page, `${LY_PERFUM}/admin`, shotPath('ly', 'admin-orders'))
        }
      } catch (e) {
        console.warn(`  ✗ ly admin: ${e.message}`)
      }
    }
  } else {
    console.log('\n✓ صور LY Perfum موجودة')
  }

  if (needZooska) {
    console.log('\n📸 التقاط صور ZOOSKA STORE...')
    await startDev(resolve(desktop, 'zooska-store'), 5175, 'zooska-store')

    const zooskaPublic = [
      ['home', '/'],
      ['products', '/products'],
    ]
    for (const [key, path] of zooskaPublic) {
      await screenshot(page, `${ZOOSKA}${path}`, shotPath('zooska', key), { waitMs: 3000 })
    }

    await page.goto(`${ZOOSKA}/products`, { waitUntil: 'domcontentloaded' })
    await sleep(2500)
    const productHref = await page
      .$eval('a[href^="/products/"]', (a) => a.getAttribute('href'))
      .catch(() => null)
    if (productHref) {
      await screenshot(page, `${ZOOSKA}${productHref}`, shotPath('zooska', 'product-detail'), { waitMs: 2500 })
      await page.goto(`${ZOOSKA}${productHref}`, { waitUntil: 'domcontentloaded' })
      await sleep(1500)
      const buttons = await page.$$('button')
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent?.trim() ?? '', btn)
        if (text.includes('إضافة') || text.includes('السلة')) {
          await btn.click()
          await sleep(1000)
          break
        }
      }
    }

    await screenshot(page, `${ZOOSKA}/cart`, shotPath('zooska', 'cart'), { waitMs: 2000 })
    await screenshot(page, `${ZOOSKA}/checkout`, shotPath('zooska', 'checkout'), { waitMs: 2000 })

    try {
      await loginZooska(page)
      await screenshot(page, `${ZOOSKA}/admin`, shotPath('zooska', 'admin-dashboard'), { waitMs: 3000 })
      await screenshot(page, `${ZOOSKA}/admin/products`, shotPath('zooska', 'admin-products'), { waitMs: 3000 })
      await screenshot(page, `${ZOOSKA}/admin/orders`, shotPath('zooska', 'admin-orders'), { waitMs: 3000 })
    } catch (e) {
      console.warn(`  ✗ zooska admin: ${e.message}`)
    }
  } else {
    console.log('\n✓ صور ZOOSKA STORE موجودة')
  }

  await browser.close()
}

function renderShots(project, items) {
  const figures = items
    .map(([key, caption]) => {
      const path = shotPath(project, key)
      const uri = toDataUri(path)
      if (!uri) return ''
      return `<figure class="shot">
        <div class="img-wrap"><img src="${uri}" alt="${caption}" /></div>
        <figcaption>${caption}</figcaption>
      </figure>`
    })
    .filter(Boolean)

  if (!figures.length) return '<p class="no-shots">—</p>'
  return `<div class="shots-grid">${figures.join('')}</div>`
}

function buildHtml() {
  const profilePath = resolve(shotsDir, 'profile.jpg')
  const profileUri = existsSync(profilePath)
    ? `data:image/jpeg;base64,${readFileSync(profilePath).toString('base64')}`
    : null

  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.65;
      font-size: 12px;
      margin: 0;
    }
    .cover {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: center;
      padding: 22px 20px;
      background: linear-gradient(135deg, #0c1222 0%, #1a2744 50%, #0f3d2e 100%);
      color: #fff;
      border-radius: 12px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }
    .cover-text h1 { font-size: 26px; margin: 0 0 4px; }
    .cover-text .role { font-size: 14px; color: #86efac; font-weight: 700; margin-bottom: 6px; }
    .cover-text .meta { font-size: 11.5px; color: #cbd5e1; line-height: 1.7; }
    .cover-text .pitch {
      margin-top: 10px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      font-size: 11.5px;
      color: #e2e8f0;
    }
    .cover-text .pitch strong { color: #fbbf24; }
    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.25);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .badge-row { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .badge {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.18);
      padding: 3px 9px;
      border-radius: 14px;
      font-size: 9.5px;
    }
    .khamsat-banner {
      background: linear-gradient(90deg, #059669, #0d9488);
      color: #fff;
      text-align: center;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 14px;
      page-break-after: avoid;
    }
    h2 {
      color: #0f172a;
      font-size: 16px;
      margin: 16px 0 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #16a34a;
      page-break-after: avoid;
    }
    h3 { color: #166534; font-size: 13px; margin: 10px 0 6px; page-break-after: avoid; }
    h4 { color: #475569; font-size: 11px; margin: 12px 0 6px; font-weight: 700; page-break-after: avoid; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 8px; padding-right: 18px; }
    li { margin-bottom: 3px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      page-break-inside: avoid;
    }
    .card h3 { margin-top: 0; color: #0f172a; font-size: 12px; }
    .card.highlight-card {
      background: #fffbeb;
      border-color: #fcd34d;
    }
    .project-header {
      padding: 10px 12px;
      border-radius: 0 8px 8px 0;
      margin: 12px 0 8px;
      page-break-inside: avoid;
      border-right: 4px solid #16a34a;
      background: #f0fdf4;
    }
    .project-header.ly { border-right-color: #d97706; background: #fffbeb; }
    .project-header.zooska { border-right-color: #7c3aed; background: #faf5ff; }
    .project-header h2 { border: none; margin: 0 0 3px; padding: 0; font-size: 15px; }
    .project-header .sub { font-size: 11px; color: #64748b; margin-bottom: 3px; }
    .tech { font-size: 10px; color: #64748b; margin-bottom: 4px; }
    .shots-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 8px 0 12px;
    }
    .shot {
      margin: 0;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
      background: #fff;
    }
    .shot .img-wrap {
      height: 130px;
      overflow: hidden;
      background: #f1f5f9;
    }
    .shot img {
      width: 100%;
      height: 130px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .shot figcaption {
      padding: 4px 5px;
      font-size: 9px;
      text-align: center;
      background: #f8fafc;
      color: #475569;
      border-top: 1px solid #e2e8f0;
    }
    .contact-box {
      background: #0f172a;
      color: #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 12px;
      page-break-inside: avoid;
    }
    .contact-box h2 { color: #86efac; border-bottom-color: #86efac; margin-top: 0; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .contact-item {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 11px;
    }
    .contact-item .label { color: #94a3b8; font-size: 9.5px; }
    .contact-item .value { color: #f1f5f9; font-weight: 700; direction: ltr; text-align: right; }
    .contact-cta {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .contact-cta h2 { margin-top: 0; font-size: 15px; }
    .contact-cta p { color: #475569; font-size: 11px; margin-bottom: 10px; }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 700;
      text-decoration: none;
      color: #fff;
    }
    .btn-whatsapp { background: #25d366; }
    .btn-email { background: #2563eb; }
    .btn-instagram {
      background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
    }
    .contact-links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 10.5px;
      color: #64748b;
    }
    .contact-links span { direction: ltr; unicode-bidi: embed; font-weight: 700; color: #0f172a; }
    .cover-text .headline {
      font-size: 15px;
      color: #fbbf24;
      font-weight: 800;
      margin: 0 0 6px;
      line-height: 1.4;
    }
    .page-break { page-break-before: always; }
    .footer {
      margin-top: 14px;
      text-align: center;
      color: #94a3b8;
      font-size: 9.5px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    .no-shots { color: #94a3b8; font-size: 10px; }
  </style>
</head>
<body>

  <div class="khamsat-banner">
    أبني لك موقعك الاحترافي في 3 أيام — باستخدام React + Supabase ومساعدة AI
  </div>

  <div class="cover">
    <div class="cover-text">
      <h1>يوسف عصام</h1>
      <p class="headline">أبني لك موقعك الاحترافي في 3 أيام</p>
      <p class="role">مطور ويب Full Stack | React + Supabase</p>
      <p class="meta" style="font-size:11px;color:#94a3b8;">Youssef ESSAM</p>
      <p class="meta">
        25 سنة · خريج كلية الهندسة — جامعة بدر بالقاهرة · قسم حاسبات ونظم
      </p>
      <div class="pitch">
        أبني <strong>مواقع وتطبيقات ويب احترافية</strong> بالكامل — واجهة عربية، متجر إلكتروني، نظام حجز، أو لوحة إدارة —
        مع الاستفادة من <strong>الذكاء الاصطناعي</strong> لتسريع التطوير والتسليم في <strong>يومين إلى 3 أيام</strong> بجودة إنتاجية.
      </div>
      <div class="badge-row">
        <span class="badge">React</span>
        <span class="badge">TypeScript</span>
        <span class="badge">Supabase</span>
        <span class="badge">Tailwind CSS</span>
        <span class="badge">RTL عربي</span>
        <span class="badge">لوحات إدارة</span>
        <span class="badge">متاجر إلكترونية</span>
        <span class="badge">تسليم سريع</span>
      </div>
    </div>
    ${profileUri ? `<img class="avatar" src="${profileUri}" alt="يوسف عصام" />` : ''}
  </div>

  <div class="contact-cta">
    <h2>تواصل معي</h2>
    <p>جاهز لبدء مشروعك على خمسات — راسلني الآن:</p>
    <div class="btn-row">
      <a class="btn btn-whatsapp" href="https://wa.me/201010494117">واتساب — +201010494117</a>
      <a class="btn btn-email" href="mailto:yuadom880@gmail.com">إيميل — yuadom880@gmail.com</a>
      <a class="btn btn-instagram" href="https://www.instagram.com/youss2.s">إنستغرام — youss2.s</a>
    </div>
    <div class="contact-links">
      <span>واتساب: +201010494117</span>
      <span>إيميل: yuadom880@gmail.com</span>
      <span>إنستغرام: youss2.s</span>
    </div>
  </div>

  <h2>لماذا تختارني على خمسات؟</h2>
  <div class="three-col">
    <div class="card highlight-card">
      <h3>⚡ سرعة التسليم</h3>
      <ul>
        <li>موقع كامل خلال 2–3 أيام</li>
        <li>تحديثات سريعة حسب ملاحظاتك</li>
        <li>جاهز للنشر والاستخدام فوراً</li>
      </ul>
    </div>
    <div class="card highlight-card">
      <h3>🤖 AI + خبرة تقنية</h3>
      <ul>
        <li>تطوير ذكي بمساعدة AI</li>
        <li>كود نظيف TypeScript</li>
        <li>أداء عالي وتصميم متجاوب</li>
      </ul>
    </div>
    <div class="card highlight-card">
      <h3>📦 حل متكامل</h3>
      <ul>
        <li>واجهة زوار + لوحة إدارة</li>
        <li>قاعدة بيانات سحابية</li>
        <li>واتساب، إيميل، SEO</li>
      </ul>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <h3>الخدمات التي أقدمها</h3>
      <ul>
        <li>مواقع شركات وصفحات هبوط احترافية</li>
        <li>متاجر إلكترونية كاملة (سلة + طلبات + أدمن)</li>
        <li>أنظمة حجز أونلاين مع التحقق من التوفر</li>
        <li>لوحات تحكم لإدارة المحتوى والطلبات</li>
        <li>ربط Supabase وإرسال إيميلات تأكيد</li>
        <li>واجهات عربية RTL مناسبة للسوق العربي</li>
      </ul>
    </div>
    <div class="card">
      <h3>المهارات التقنية</h3>
      <ul>
        <li><strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind, Framer Motion</li>
        <li><strong>Backend:</strong> Supabase (Auth, PostgreSQL, Storage, RLS)</li>
        <li><strong>State:</strong> React Router, Zustand, Context API</li>
        <li><strong>Tools:</strong> Git, Node.js, Puppeteer, Resend</li>
      </ul>
    </div>
  </div>

  <h2>نماذج من أعمالي — 3 مشاريع حقيقية</h2>
  <p>مواقع كاملة جاهزة للإنتاج مع واجهة عامة ولوحة إدارة — كلها من تطويري الشخصي.</p>

  <div class="project-header">
    <h2>الخضر للسيارات — Alkhoder AutoCar</h2>
    <p class="sub">موقع تأجير سيارات سعودي</p>
    <p class="tech">React · TypeScript · Supabase · Tailwind · Framer Motion</p>
    <p>نظام حجز أونلاين متكامل: تصفح الأسطول، حجز بثلاث خطوات، عروض يومية وشهرية، فروع مع خرائط، ولوحة إدارة كاملة.</p>
  </div>
  <h4>لقطات واجهة الزوار</h4>
  ${renderShots('alkhoder', [
    ['home', 'الصفحة الرئيسية'],
    ['cars', 'صفحة السيارات'],
    ['car-detail', 'تفاصيل السيارة'],
    ['booking', 'نظام الحجز'],
    ['offers', 'العروض'],
    ['branches', 'الفروع'],
  ])}
  <h4>لقطات لوحة الإدارة</h4>
  ${renderShots('alkhoder', [
    ['admin-dashboard', 'لوحة التحكم'],
    ['admin-cars', 'إدارة السيارات'],
    ['admin-bookings', 'إدارة الحجوزات'],
    ['admin-offers', 'إدارة العروض'],
  ])}

  <div class="page-break"></div>

  <div class="project-header ly">
    <h2>LY Perfum — متجر عطور فاخر</h2>
    <p class="sub">متجر إلكتروني للعطور الفاخرة</p>
    <p class="tech">React · TypeScript · Supabase · Zustand · Resend</p>
    <p>تجربة تسوق فاخرة: متجر مع فلترة، سلة وCheckout، إيميل تأكيد، ولوحة Admin لإدارة العطور والطلبات.</p>
  </div>
  <h4>لقطات واجهة الزوار</h4>
  ${renderShots('ly', [
    ['home', 'الصفحة الرئيسية'],
    ['shop', 'متجر العطور'],
    ['perfume-detail', 'تفاصيل العطر'],
    ['cart', 'سلة التسوق'],
    ['checkout', 'إتمام الطلب'],
    ['contact', 'تواصل معنا'],
  ])}
  <h4>لقطات لوحة الإدارة</h4>
  ${renderShots('ly', [
    ['admin-dashboard', 'لوحة تحكم العطور'],
    ['admin-orders', 'إدارة الطلبات'],
  ])}

  <div class="page-break"></div>

  <div class="project-header zooska">
    <h2>ZOOSKA STORE — متجر أدوات منزلية</h2>
    <p class="sub">متجر إلكتروني لأدوات المنزل</p>
    <p class="tech">React · TypeScript · Supabase · Tailwind v4 · Resend</p>
    <p>متجر أدوات منزلية بتصميم عصري: تصفح المنتجات، سلة وطلبات، إدارة منتجات وفئات وطلبات من لوحة تحكم احترافية.</p>
  </div>
  <h4>لقطات واجهة الزوار</h4>
  ${renderShots('zooska', [
    ['home', 'الصفحة الرئيسية'],
    ['products', 'صفحة المنتجات'],
    ['product-detail', 'تفاصيل المنتج'],
    ['cart', 'سلة التسوق'],
    ['checkout', 'إتمام الطلب'],
  ])}
  <h4>لقطات لوحة الإدارة</h4>
  ${renderShots('zooska', [
    ['admin-dashboard', 'لوحة التحكم'],
    ['admin-products', 'إدارة المنتجات'],
    ['admin-orders', 'إدارة الطلبات'],
  ])}

  <div class="contact-box">
    <h2>تواصل معي</h2>
    <p style="margin-bottom:12px;color:#cbd5e1;">متاح للعمل على خمسات والمشاريع الحرة. حدّد نوع موقعك — أرسل لك عرضاً ومدة التسليم خلال ساعات.</p>
    <div class="btn-row" style="margin-bottom:12px;">
      <a class="btn btn-whatsapp" href="https://wa.me/201010494117">واتساب</a>
      <a class="btn btn-email" href="mailto:yuadom880@gmail.com">إيميل</a>
      <a class="btn btn-instagram" href="https://www.instagram.com/youss2.s">إنستغرام</a>
    </div>
    <div class="contact-grid">
      <div class="contact-item">
        <div class="label">واتساب / هاتف</div>
        <div class="value">+201010494117</div>
      </div>
      <div class="contact-item">
        <div class="label">البريد الإلكتروني</div>
        <div class="value">yuadom880@gmail.com</div>
      </div>
      <div class="contact-item">
        <div class="label">إنستغرام</div>
        <div class="value">youss2.s</div>
      </div>
      <div class="contact-item">
        <div class="label">التسليم المتوقع</div>
        <div class="value" style="direction:rtl;text-align:right;">3 أيام عمل</div>
      </div>
    </div>
  </div>

  <div class="footer">
    يوسف عصام · Youssef ESSAM · مطور ويب Full Stack | React + Supabase · بورتفوليو خمسات · ${year}
  </div>

</body>
</html>`
}

async function generatePdf(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load', timeout: 180000 })
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' },
  })
  await browser.close()
}

console.log('🚀 إنشاء بورتفوليو خمسات ليوسف عصام...\n')

if (!skipCapture) {
  await captureMissingShots()
} else {
  console.log('⏭ تخطي التقاط الصور — استخدام الصور الموجودة')
}

console.log('\n📄 توليد PDF...')
const html = buildHtml()
const htmlPath = resolve(cvDir, 'khamsat-portfolio.html')
writeFileSync(htmlPath, html, 'utf8')
await generatePdf(html, OUTPUT)
console.log(`\n✅ تم الحفظ: ${OUTPUT}\n`)
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const shotsDir = resolve(__dirname, 'portfolio-screenshots')
const skipCapture = process.argv.includes('--pdf-only')

const OUTPUT = {
  ar: resolve(desktop, 'يوسف-عصام-Portfolio-CV-AR.pdf'),
  en: resolve(desktop, 'Youssef-Essam-Portfolio-CV-EN.pdf'),
}

const ALKHODER = 'http://localhost:5173'
const LY_PERFUM = 'http://localhost:5174'
const MIN_SHOT_BYTES = 35_000

mkdirSync(shotsDir, { recursive: true })

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

async function screenshot(page, url, name, { waitMs = 2500, waitSelector = null } = {}) {
  const out = resolve(shotsDir, `${name}.png`)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 20000 }).catch(() => {})
    }
    await sleep(waitMs)
    await page.evaluate(() => window.scrollTo(0, 0))
    await sleep(300)
    await page.screenshot({
      path: out,
      type: 'png',
      fullPage: false,
      captureBeyondViewport: false,
    })
    if (!isValidShot(out)) {
      console.warn(`  ✗ ${name}: صورة فارغة أو صغيرة`)
      return null
    }
    console.log(`  ✓ ${name}`)
    return out
  } catch (e) {
    console.warn(`  ✗ ${name}: ${e.message}`)
    return null
  }
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

async function setReactInput(page, selector, value) {
  await page.$eval(
    selector,
    (el, val) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, val)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    },
    value,
  )
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
      (document.body.innerText.includes('خروج') ||
        document.body.innerText.includes('إضافة عطر')),
    { timeout: 30000 },
  )
  await sleep(3500)
}

async function startLyPerfumDev() {
  const lyDir = resolve(desktop, 'ly-perfum')
  try {
    const res = await fetch(`${LY_PERFUM}/`)
    if (res.ok) {
      console.log('  ✓ ly-perfum يعمل بالفعل على 5174')
      return null
    }
  } catch {}

  const isWin = process.platform === 'win32'
  const child = spawn(
    isWin ? 'cmd.exe' : 'npm',
    isWin
      ? ['/c', 'npm', 'run', 'dev', '--', '--port', '5174', '--strictPort', 'false']
      : ['run', 'dev', '--', '--port', '5174', '--strictPort', 'false'],
    { cwd: lyDir, stdio: 'ignore', detached: true, windowsHide: true },
  )
  child.unref()

  for (let i = 0; i < 45; i++) {
    try {
      const res = await fetch(`${LY_PERFUM}/`)
      if (res.ok) return child
    } catch {}
    await sleep(1000)
  }
  throw new Error('لم يبدأ سيرفر ly-perfum على المنفذ 5174')
}

async function prepareLyCart(page) {
  await page.goto(`${LY_PERFUM}/shop`, { waitUntil: 'domcontentloaded' })
  await sleep(2500)
  const detailHref = await page.$eval('a[href^="/perfume/"]', (a) => a.getAttribute('href')).catch(() => null)
  if (!detailHref) return
  await page.goto(`${LY_PERFUM}${detailHref}`, { waitUntil: 'domcontentloaded' })
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

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

  console.log('\n📸 التقاط صور موقع الخضر للسيارات...')
  const alkhoderPublic = [
    ['alkhoder-home', '/', null, 3000],
    ['alkhoder-cars', '/cars', 'img, h1', 3000],
    ['alkhoder-car-detail', '/cars/1', 'img, h1, h2', 3500],
    ['alkhoder-booking', '/book/1', 'form, h1, h2, button', 3500],
    ['alkhoder-offers', '/offers', 'h1, img', 3000],
    ['alkhoder-branches', '/branches', 'h1, img', 3000],
  ]
  for (const [name, path, sel, wait] of alkhoderPublic) {
    await screenshot(page, `${ALKHODER}${path}`, name, { waitMs: wait, waitSelector: sel })
  }

  await screenshot(page, `${ALKHODER}/admin/login`, 'alkhoder-admin-login')

  await loginAlkhoder(page)
  const alkhoderAdmin = [
    ['alkhoder-admin-dashboard', '/admin', 'h1, h2, table, [class*="dashboard"]'],
    ['alkhoder-admin-cars', '/admin/cars', 'table, h1, h2'],
    ['alkhoder-admin-bookings', '/admin/bookings', 'table, h1, h2'],
    ['alkhoder-admin-offers', '/admin/offers', 'table, h1, h2'],
    ['alkhoder-admin-branches', '/admin/branches', 'table, h1, h2'],
  ]
  for (const [name, path, sel] of alkhoderAdmin) {
    await screenshot(page, `${ALKHODER}${path}`, name, { waitMs: 3000, waitSelector: sel })
  }

  console.log('\n📸 تشغيل ly-perfum والتقاط الصور...')
  await startLyPerfumDev()

  const lyPublic = [
    ['ly-home', '/'],
    ['ly-shop', '/shop'],
    ['ly-contact', '/contact'],
    ['ly-admin-login', '/admin/login'],
  ]
  for (const [name, path] of lyPublic) {
    await screenshot(page, `${LY_PERFUM}${path}`, name)
  }

  await page.goto(`${LY_PERFUM}/shop`, { waitUntil: 'domcontentloaded' })
  await sleep(2500)
  const detailHref = await page.$eval('a[href^="/perfume/"]', (a) => a.getAttribute('href')).catch(() => null)
  if (detailHref) {
    await screenshot(page, `${LY_PERFUM}${detailHref}`, 'ly-perfume-detail')
  }

  await prepareLyCart(page)
  await screenshot(page, `${LY_PERFUM}/cart`, 'ly-cart', { waitMs: 2000 })
  await screenshot(page, `${LY_PERFUM}/checkout`, 'ly-checkout', { waitMs: 2000 })

  try {
    await loginLyPerfum(page)
    await screenshot(page, `${LY_PERFUM}/admin`, 'ly-admin-dashboard', {
      waitMs: 4000,
      waitSelector: 'h1, table, button',
    })

    await page.evaluate(() => {
      const ordersTab = [...document.querySelectorAll('button')].find((b) =>
        b.textContent?.includes('الطلبات'),
      )
      ordersTab?.click()
    })
    await sleep(3000)
    const ordersOut = resolve(shotsDir, 'ly-admin-orders.png')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: ordersOut, type: 'png', fullPage: false })
    if (isValidShot(ordersOut)) console.log('  ✓ ly-admin-orders')
    else console.warn('  ✗ ly-admin-orders: صورة فارغة أو صغيرة')
  } catch (e) {
    console.warn(`  ✗ ly-perfum admin: ${e.message}`)
  }

  await browser.close()
}

const CONTENT = {
  ar: {
    lang: 'ar',
    dir: 'rtl',
    cover: {
      name: 'يوسف عصام',
      role: 'مطوّر ويب Full Stack',
      meta: '25 سنة<br />بكالوريوس هندسة حاسبات — جامعة بدر بالقاهرة',
      badges: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'واجهات عربية RTL', 'لوحات إدارة', 'متاجر إلكترونية'],
    },
    aboutTitle: 'نبذة عني',
    about:
      'مطوّر ويب متخصص في بناء مواقع وتطبيقات احترافية باللغة العربية، مع خبرة عملية في متاجر إلكترونية وأنظمة حجز ولوحات إدارة متكاملة. أهتم بتجربة المستخدم، الأداء، والتصميم المتجاوب.',
    servicesTitle: 'الخدمات التي أقدمها',
    services: [
      'تصميم وتطوير مواقع ويب احترافية متجاوبة',
      'متاجر إلكترونية كاملة مع سلة ودفع وإدارة طلبات',
      'أنظمة حجز أونلاين مع التحقق من التوفر',
      'لوحات تحكم Admin لإدارة المحتوى والطلبات',
      'ربط قواعد بيانات سحابية (Supabase)',
      'واجهات عربية RTL مناسبة للسوق العربي',
      'تكامل واتساب، بريد إلكتروني، وخرائط جوجل',
    ],
    skillsTitle: 'المهارات التقنية',
    skills: [
      '<strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind CSS, Framer Motion',
      '<strong>Backend & DB:</strong> Supabase (Auth, PostgreSQL, Storage, RLS)',
      '<strong>State & Routing:</strong> React Router, Zustand, Context API',
      '<strong>Tools:</strong> Git, Node.js, Puppeteer, Resend/Nodemailer',
    ],
    projectsTitle: 'المشاريع',
    projectsIntro: 'نماذج من أعمالي الفعلية — مواقع كاملة جاهزة للإنتاج مع واجهة عامة ولوحة إدارة.',
    publicShots: 'لقطات واجهة الزوار',
    adminShots: 'لقطات لوحة الإدارة',
    whyTitle: 'لماذا تختار العمل معي؟',
    why: [
      'أبني حلولاً متكاملة من الواجهة حتى قاعدة البيانات والإدارة',
      'خبرة عملية في مشروعين حقيقيين جاهزين للاستخدام',
      'اهتمام بالتفاصيل العربية: RTL وتجربة مستخدم محلية',
      'كود منظم بـ TypeScript يسهل الصيانة والتوسع',
    ],
    footer: `Portfolio & CV — يوسف عصام · مطوّر ويب Full Stack · ${new Date().getFullYear()}`,
    alkhoder: {
      title: 'الخضر للسيارات',
      subtitle: 'Alkhoder AutoCar',
      desc: 'موقع تأجير سيارات سعودي متكامل مع نظام حجز أونلاين وإدارة أسطول وفروع وعروض.',
      featuresTitle: 'مميزات الموقع',
      features: [
        'صفحة رئيسية مع بحث سريع للحجز وعروض مميزة وتواصل واتساب',
        'تصفح الأسطول مع فلترة والتحقق من التوفر الحقيقي بالتواريخ',
        'حجز أونلاين بثلاث خطوات (تواريخ + موعد استلام + بيانات العميل)',
        'صفحة عروض يومية وشهرية قابلة للحجز مباشرة',
        'صفحة فروع ديناميكية مع خرائط وأرقام تواصل',
        'لوحة إدارة: سيارات، حجوزات، عروض، فروع مع رفع صور',
        'منع الحجز المزدوج تلقائياً للحجوزات المعلقة والمؤكدة',
      ],
      public: [
        ['alkhoder-home', 'الصفحة الرئيسية'],
        ['alkhoder-cars', 'صفحة السيارات'],
        ['alkhoder-car-detail', 'تفاصيل السيارة'],
        ['alkhoder-booking', 'نظام الحجز'],
        ['alkhoder-offers', 'العروض'],
        ['alkhoder-branches', 'الفروع'],
      ],
      admin: [
        ['alkhoder-admin-login', 'تسجيل دخول الإدارة'],
        ['alkhoder-admin-dashboard', 'لوحة التحكم'],
        ['alkhoder-admin-cars', 'إدارة السيارات'],
        ['alkhoder-admin-bookings', 'إدارة الحجوزات'],
        ['alkhoder-admin-offers', 'إدارة العروض'],
        ['alkhoder-admin-branches', 'إدارة الفروع'],
      ],
    },
    ly: {
      title: 'LY Perfum',
      subtitle: 'متجر عطور فاخر',
      desc: 'متجر إلكتروني للعطور الفاخرة مع تجربة تسوق كاملة وإدارة منتجات وطلبات.',
      featuresTitle: 'مميزات الموقع',
      features: [
        'صفحة رئيسية فاخرة: Hero، الأكثر مبيعاً، لماذا نحن، آراء العملاء، FAQ',
        'متجر عطور مع بحث وفلترة (ماركة، نوع، سعر)',
        'صفحة تفاصيل لكل عطر مع إضافة للسلة',
        'سلة تسوق وصفحة Checkout مع التحقق من البيانات',
        'حفظ الطلبات في Supabase وإرسال إيميل تأكيد',
        'لوحة Admin: إدارة العطور والطلبات ورفع الصور',
        'تحديثات فورية Realtime وتصميم Luxury متجاوب',
      ],
      public: [
        ['ly-home', 'الصفحة الرئيسية'],
        ['ly-shop', 'متجر العطور'],
        ['ly-perfume-detail', 'تفاصيل العطر'],
        ['ly-cart', 'سلة التسوق'],
        ['ly-checkout', 'إتمام الطلب'],
        ['ly-contact', 'تواصل معنا'],
      ],
      admin: [
        ['ly-admin-login', 'تسجيل دخول الإدارة'],
        ['ly-admin-dashboard', 'لوحة تحكم العطور'],
        ['ly-admin-orders', 'إدارة الطلبات'],
      ],
    },
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    cover: {
      name: 'Youssef Essam',
      role: 'Full Stack Web Developer',
      meta: '25 years old<br />B.Sc. Computer Engineering — Badr University, Cairo',
      badges: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Arabic RTL UI', 'Admin Panels', 'E-Commerce'],
    },
    aboutTitle: 'About Me',
    about:
      'Web developer specialized in building professional Arabic-first web applications, with hands-on experience in e-commerce stores, booking systems, and full admin dashboards. Focused on UX, performance, and responsive design.',
    servicesTitle: 'Services I Offer',
    services: [
      'Professional responsive website design & development',
      'Full e-commerce with cart, checkout & order management',
      'Online booking systems with real availability checks',
      'Admin dashboards for content and orders',
      'Cloud database integration (Supabase)',
      'Arabic RTL interfaces for MENA markets',
      'WhatsApp, email & Google Maps integrations',
    ],
    skillsTitle: 'Technical Skills',
    skills: [
      '<strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind CSS, Framer Motion',
      '<strong>Backend & DB:</strong> Supabase (Auth, PostgreSQL, Storage, RLS)',
      '<strong>State & Routing:</strong> React Router, Zustand, Context API',
      '<strong>Tools:</strong> Git, Node.js, Puppeteer, Resend/Nodemailer',
    ],
    projectsTitle: 'Projects',
    projectsIntro: 'Real production-ready projects with public interfaces and admin panels.',
    publicShots: 'Public Interface Screenshots',
    adminShots: 'Admin Panel Screenshots',
    whyTitle: 'Why Work With Me?',
    why: [
      'End-to-end solutions from UI to database and admin — not just design',
      'Proven delivery on two real, usable projects',
      'Strong Arabic UX expertise: RTL, localization, and cultural fit',
      'Clean TypeScript codebase that scales and is easy to maintain',
    ],
    footer: `Portfolio & CV — Youssef Essam · Full Stack Web Developer · ${new Date().getFullYear()}`,
    alkhoder: {
      title: 'Alkhoder AutoCar',
      subtitle: 'Car Rental Platform',
      desc: 'Saudi car rental website with online booking, fleet management, branches, and promotional offers.',
      featuresTitle: 'Key Features',
      features: [
        'Homepage with quick booking search, featured offers & WhatsApp contact',
        'Fleet browsing with filters and real date-based availability',
        '3-step online booking (dates + pickup time + customer details)',
        'Daily & monthly offers bookable directly from promo pages',
        'Dynamic branches page with maps and contact numbers',
        'Admin panel: cars, bookings, offers, branches with image upload',
        'Automatic double-booking prevention for pending/confirmed orders',
      ],
      public: [
        ['alkhoder-home', 'Homepage'],
        ['alkhoder-cars', 'Cars Listing'],
        ['alkhoder-car-detail', 'Car Details'],
        ['alkhoder-booking', 'Booking Flow'],
        ['alkhoder-offers', 'Offers Page'],
        ['alkhoder-branches', 'Branches Page'],
      ],
      admin: [
        ['alkhoder-admin-login', 'Admin Login'],
        ['alkhoder-admin-dashboard', 'Dashboard'],
        ['alkhoder-admin-cars', 'Cars Management'],
        ['alkhoder-admin-bookings', 'Bookings Management'],
        ['alkhoder-admin-offers', 'Offers Management'],
        ['alkhoder-admin-branches', 'Branches Management'],
      ],
    },
    ly: {
      title: 'LY Perfum',
      subtitle: 'Luxury Perfume Store',
      desc: 'Luxury perfume e-commerce with full shopping experience, product management, and order handling.',
      featuresTitle: 'Key Features',
      features: [
        'Premium homepage: Hero, bestsellers, why us, testimonials, FAQ',
        'Perfume shop with search & filters (brand, type, price)',
        'Product detail pages with add-to-cart',
        'Shopping cart & checkout with form validation',
        'Orders stored in Supabase with confirmation emails',
        'Admin panel: perfumes CRUD, image upload, order status',
        'Realtime product updates & responsive luxury design',
      ],
      public: [
        ['ly-home', 'Homepage'],
        ['ly-shop', 'Perfume Shop'],
        ['ly-perfume-detail', 'Product Details'],
        ['ly-cart', 'Shopping Cart'],
        ['ly-checkout', 'Checkout'],
        ['ly-contact', 'Contact Page'],
      ],
      admin: [
        ['ly-admin-login', 'Admin Login'],
        ['ly-admin-dashboard', 'Admin Dashboard'],
        ['ly-admin-orders', 'Orders Management'],
      ],
    },
  },
}

function shotFingerprint(filePath) {
  const buf = readFileSync(filePath)
  const sample = buf.slice(0, 4000)
  return `${buf.length}:${sample.toString('base64').slice(0, 120)}`
}

function renderShots(items, dir) {
  const seen = new Set()
  const figures = items
    .map(([file, caption]) => {
      const path = resolve(shotsDir, `${file}.png`)
      const uri = toDataUri(path)
      if (!uri) return ''
      const fp = shotFingerprint(path)
      if (seen.has(fp)) return ''
      seen.add(fp)
      return `<figure class="shot">
        <div class="img-wrap"><img src="${uri}" alt="${caption}" /></div>
        <figcaption>${caption}</figcaption>
      </figure>`
    })
    .filter(Boolean)

  if (!figures.length) return ''
  return `<div class="shots-grid" dir="${dir}">${figures.join('')}</div>`
}

function buildHtml(c) {
  const borderSide = c.dir === 'rtl' ? 'right' : 'left'
  const listPad = c.dir === 'rtl' ? 'padding-right' : 'padding-left'

  const alkhoderPublic = renderShots(c.alkhoder.public, c.dir)
  const alkhoderAdmin = renderShots(c.alkhoder.admin, c.dir)
  const lyPublic = renderShots(c.ly.public, c.dir)
  const lyAdmin = renderShots(c.ly.admin, c.dir)

  return `<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.65;
      font-size: 12.5px;
      margin: 0;
    }
    .cover {
      text-align: center;
      padding: 32px 20px 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #14532d 100%);
      color: #fff;
      border-radius: 10px;
      margin-bottom: 20px;
      page-break-after: avoid;
    }
    .cover h1 { font-size: 28px; margin: 0 0 4px; }
    .cover .role { font-size: 15px; color: #86efac; margin-bottom: 10px; }
    .cover .meta { font-size: 12.5px; color: #cbd5e1; line-height: 1.8; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 14px; }
    .badge {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 10.5px;
    }
    h2 {
      color: #0f172a;
      font-size: 17px;
      margin: 20px 0 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #16a34a;
      page-break-after: avoid;
    }
    h3 { color: #166534; font-size: 13.5px; margin: 12px 0 6px; page-break-after: avoid; }
    h4 { color: #475569; font-size: 12px; margin: 14px 0 8px; font-weight: 600; page-break-after: avoid; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 10px; ${listPad}: 18px; }
    li { margin-bottom: 4px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      page-break-inside: avoid;
    }
    .card h3 { margin-top: 0; color: #0f172a; font-size: 13px; }
    .project-header {
      background: #f0fdf4;
      border-${borderSide}: 4px solid #16a34a;
      padding: 12px 14px;
      border-radius: ${c.dir === 'rtl' ? '0 8px 8px 0' : '8px 0 0 8px'};
      margin: 14px 0 10px;
      page-break-inside: avoid;
    }
    .project-header.ly { background: #fffbeb; border-${borderSide}-color: #d97706; }
    .project-header h2 { border: none; margin: 0 0 4px; padding: 0; font-size: 16px; }
    .project-header .sub { font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .tech { font-size: 10.5px; color: #64748b; margin-bottom: 4px; }
    .shots-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 10px 0 16px;
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
      height: 155px;
      overflow: hidden;
      background: #f1f5f9;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .shot img {
      width: 100%;
      height: 155px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .shot figcaption {
      padding: 5px 6px;
      font-size: 10px;
      text-align: center;
      background: #f8fafc;
      color: #475569;
      border-top: 1px solid #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .page-break { page-break-before: always; }
    .footer {
      margin-top: 20px;
      text-align: center;
      color: #94a3b8;
      font-size: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    .features-block { page-break-inside: avoid; margin-bottom: 6px; }
  </style>
</head>
<body>

  <div class="cover">
    <h1>${c.cover.name}</h1>
    <p class="role">${c.cover.role}</p>
    <p class="meta">${c.cover.meta}</p>
    <div class="badge-row">
      ${c.cover.badges.map((b) => `<span class="badge">${b}</span>`).join('')}
    </div>
  </div>

  <h2>${c.aboutTitle}</h2>
  <p>${c.about}</p>

  <div class="two-col">
    <div class="card">
      <h3>${c.servicesTitle}</h3>
      <ul>${c.services.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <h3>${c.skillsTitle}</h3>
      <ul>${c.skills.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>
  </div>

  <h2>${c.projectsTitle}</h2>
  <p>${c.projectsIntro}</p>

  <div class="project-header">
    <h2>${c.alkhoder.title}</h2>
    <p class="sub">${c.alkhoder.subtitle}</p>
    <p class="tech">React · TypeScript · Vite · Tailwind · Supabase · Framer Motion</p>
    <p>${c.alkhoder.desc}</p>
  </div>
  <div class="features-block">
    <h3>${c.alkhoder.featuresTitle}</h3>
    <ul>${c.alkhoder.features.map((f) => `<li>${f}</li>`).join('')}</ul>
  </div>
  <h4>${c.publicShots}</h4>
  ${alkhoderPublic}
  <h4>${c.adminShots}</h4>
  ${alkhoderAdmin}

  <div class="page-break"></div>

  <div class="project-header ly">
    <h2>${c.ly.title}</h2>
    <p class="sub">${c.ly.subtitle}</p>
    <p class="tech">React · TypeScript · Vite · Tailwind · Supabase · Zustand · Resend</p>
    <p>${c.ly.desc}</p>
  </div>
  <div class="features-block">
    <h3>${c.ly.featuresTitle}</h3>
    <ul>${c.ly.features.map((f) => `<li>${f}</li>`).join('')}</ul>
  </div>
  <h4>${c.publicShots}</h4>
  ${lyPublic}
  <h4>${c.adminShots}</h4>
  ${lyAdmin}

  <h2>${c.whyTitle}</h2>
  <ul>${c.why.map((w) => `<li>${w}</li>`).join('')}</ul>

  <div class="footer">${c.footer}</div>

</body>
</html>`
}

async function generatePdf(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 })
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  })
  await browser.close()
}

console.log('🚀 إنشاء Portfolio CV (عربي + إنجليزي)...\n')

if (!skipCapture) {
  try {
    await fetch(`${ALKHODER}/`)
    console.log('✓ سيرفر الخضر للسيارات يعمل على 5173')
  } catch {
    console.error('❌ شغّل alkhoder-autocar أولاً: npm run dev')
    process.exit(1)
  }
  await captureScreenshots()
} else {
  console.log('⏭ تخطي التقاط الصور — استخدام الصور الموجودة')
}

console.log('\n📄 توليد ملفات PDF...')
for (const [lang, content] of Object.entries(CONTENT)) {
  const html = buildHtml(content)
  const htmlPath = resolve(__dirname, `portfolio-temp-${lang}.html`)
  writeFileSync(htmlPath, html, 'utf8')
  await generatePdf(html, OUTPUT[lang])
  console.log(`  ✓ ${OUTPUT[lang]}`)
}

console.log('\n✅ تم إنشاء النسختين بنجاح!\n')
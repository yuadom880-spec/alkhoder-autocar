import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const screenshotsDir = join(projectRoot, 'public', 'الموظفين')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outputPath = resolve(desktop, 'دليل-الموظفين-لوحة-الإدارة-الخضر.pdf')

const sections = [
  {
    title: '١ — الدخول',
    lines: [
      'ادخل <strong>alkhodercar.com/admin</strong> وسجّل دخولك',
      'القائمة: لوحة التحكم — السيارات — العروض — الحجوزات',
    ],
    images: [{ file: 'بداية الدخول في لوحة الادارة .png' }],
  },
  {
    title: '٢ — زر «فرعي» (مهم)',
    lines: [
      'اضغط <strong>فرعي</strong> → اختر فرعك → كل شي يصير خاص بفرعك',
      'للخروج: اضغط الزر مرة ثانية → عرض الكل',
    ],
    images: [{ file: 'الدخول الى وضع فرعي (فرع تبوك مثلا) وشرح لوحه التحكم .png' }],
  },
  {
    title: '٣ — السيارات',
    lines: [
      '<strong>+ إضافة سيارة:</strong> صورة + سعر + فروع',
      '<strong>تعديل / إيقاف:</strong> من نفس الصفحة — إيقاف التوفر يخفي السيارة من الموقع',
    ],
    images: [{ file: 'ادارة السيارات .png' }],
  },
  {
    title: '٤ — العروض',
    lines: [
      'عروض تظهر للعملاء في الموقع',
      '<strong>إضافة عرض:</strong> عنوان + صورة + سعر + اربطه بسيارة فرعك',
    ],
    images: [{ file: 'العروض المميزة .png' }],
  },
  {
    title: '٥ — الحجوزات (أهم شي)',
    lines: [
      'افتح <strong>طلبات الحجز</strong> — راجع الجديد (بانتظار المراجعة)',
      'اضغط على الطلب → تشوف التفاصيل: عميل، سيارة، تواريخ، فرع',
      '<strong>تأكيد</strong> = واتساب للعميل تلقائياً &nbsp;|&nbsp; <strong>رفض</strong> = يُبلّغ العميل',
    ],
    images: [
      { file: 'طلبات الحجز .png', label: 'قائمة الطلبات' },
      { file: 'بعد الدخول الى عرض الطلبات.png', label: 'تفاصيل الطلب' },
    ],
  },
]

function imgDataUri(filename) {
  const buf = readFileSync(join(screenshotsDir, filename))
  return `data:image/png;base64,${buf.toString('base64')}`
}

function renderSection({ title, lines, images }) {
  const bullets = lines.map((l) => `<li>${l}</li>`).join('')
  const pics = images
    .map(
      ({ file, label }) => `
      <div class="pic">
        ${label ? `<p class="pic-label">${label}</p>` : ''}
        <img src="${imgDataUri(file)}" alt="${label ?? title}" />
      </div>`,
    )
    .join('')
  return `
    <div class="block">
      <h2>${title}</h2>
      <ul>${bullets}</ul>
      <div class="pics">${pics}</div>
    </div>
  `
}

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { margin: 10mm 9mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      font-size: 14px;
      margin: 0;
    }
    .head {
      text-align: center;
      padding: 12px 6px 14px;
      border-bottom: 3px solid #16a34a;
      margin-bottom: 16px;
    }
    .head h1 { color: #14532d; font-size: 20px; margin: 0 0 4px; }
    .head p { margin: 0; color: #64748b; font-size: 13px; }
    .block { margin-bottom: 18px; page-break-inside: avoid; }
    h2 {
      color: #fff;
      background: #16a34a;
      font-size: 15px;
      margin: 0 0 8px;
      padding: 7px 12px;
      border-radius: 6px;
    }
    ul { margin: 0 0 8px; padding-right: 18px; }
    li { margin-bottom: 4px; }
    .pics { display: flex; flex-direction: column; gap: 8px; }
    .pic {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
    }
    .pic-label {
      margin: 0;
      padding: 5px 10px;
      font-size: 12px;
      color: #64748b;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
    }
    .pic img { display: block; width: 100%; height: auto; }
    .end {
      margin-top: 12px;
      padding: 9px 11px;
      background: #f0fdf4;
      border-right: 3px solid #16a34a;
      font-size: 13px;
      border-radius: 0 6px 6px 0;
    }
    .foot {
      margin-top: 14px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="head">
    <h1>شرح لوحة الإدارة للموظفين</h1>
    <p>alkhodercar.com/admin</p>
  </div>

  ${sections.map(renderSection).join('')}

  <div class="end">
    كل يوم: ادخل → فرعي → راجع الحجوزات → أكّد أو ارفض
  </div>
  <p class="foot">عبدالمجيد الخضر لتأجير السيارات</p>

</body>
</html>`

writeFileSync(resolve(__dirname, 'employee-guide-temp.html'), html, 'utf8')

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load', timeout: 120000 })
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '8mm', bottom: '8mm', left: '7mm', right: '7mm' },
})
await browser.close()

console.log(`\n✅ تم إنشاء الدليل على سطح المكتب:\n${outputPath}\n`)
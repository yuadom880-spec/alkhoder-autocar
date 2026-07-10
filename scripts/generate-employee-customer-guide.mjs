import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const screenshotsDir = join(projectRoot, 'public', 'العملاء')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outputPath = resolve(desktop, 'دليل-الموظفين-موقع-العملاء-الخضر.pdf')

const sections = [
  {
    title: '١ — الصفحة الرئيسية',
    intro: 'هذا أول ما يشوفه العميل لما يفتح الموقع — من هنا يبدأ التصفح أو الحجز.',
    lines: [
      'العنوان: <strong>alkhodercar.com</strong>',
      'أزرار رئيسية: <strong>احجز سيارتك الآن</strong> و<strong>تصفح السيارات</strong> و<strong>تواصل واتساب</strong>',
      'القائمة العلوية: الرئيسية، السيارات، العروض، من نحن، الفروع',
      'الرقم الموحد <strong>920018216</strong> ظاهر دائماً للتواصل السريع',
      'الموقع يدعم <strong>إيجار يومي وشهري</strong> — العميل يختار لاحقاً حسب احتياجه',
    ],
    images: [{ file: 'بداية الدخول على الموقع.png' }],
  },
  {
    title: '٢ — اختيار الفرع',
    intro: 'العميل يقدر يختار فرعه عشان يشوف السيارات والعروض المتاحة في فرعه — الاختيار اختياري.',
    lines: [
      'قسم <strong>اختر فرعك</strong> يظهر في الصفحة الرئيسية (قابل للطي)',
      'كل بطاقة فرع فيها: الاسم، المدينة، ورقم التواصل',
      'لو اختار فرع → يشوف <strong>سيارات وعروض فرعه فقط</strong>',
      'لو ما اختار فرع → يشوف <strong>كل السيارات والعروض</strong> في الموقع',
      'العروض والأسعار قد تختلف من فرع لفرع — لذلك ننصح العميل يختار فرعه',
      'زر <strong>إخفاء الفروع</strong> يطوي القسم بدون ما يمسح الاختيار',
    ],
    note: 'أي سيارة أو عرض تضيفه في لوحة الإدارة وربطته بفرع = يظهر لعملاء ذلك الفرع فقط.',
    images: [{ file: 'اختار فرعك .png' }],
  },
  {
    title: '٣ — العروض المميزة',
    intro: 'العروض اللي تضيفها من لوحة الإدارة تظهر هنا بشكل بارز للعملاء.',
    lines: [
      'قسم <strong>العروض المميزة</strong> في الصفحة الرئيسية وصفحة العروض',
      'فلتر: الكل / إيجار يومي / إيجار شهري',
      'كل بطاقة عرض: صورة، عنوان، سعر العرض، وزر <strong>احجز العرض</strong>',
      'العميل يضغط «احجز العرض» → ينتقل مباشرة لصفحة الحجز مع تطبيق سعر العرض',
      'العروض المربوطة بسيارة فرع = تظهر لعملاء ذلك الفرع فقط',
      'الأسعار المعروضة <strong>شاملة ضريبة القيمة المضافة 15%</strong>',
    ],
    images: [{ file: 'قسم العروض المميزة .png' }],
  },
  {
    title: '٤ — أسطول السيارات',
    intro: 'هنا العميل يتصفح كل السيارات المتاحة ويختار اللي تناسبه.',
    lines: [
      'قسم <strong>أسطول السيارات</strong> يعرض بطاقات السيارات مع الصورة والسعر',
      'تبديل <strong>إيجار يومي / شهري</strong> يغيّر الأسعار المعروضة',
      'كل بطاقة: اسم السيارة، السعر، وزر <strong>احجز الآن</strong>',
      'العميل يقدر يفلتر ويبحث من صفحة السيارات الكاملة',
      'لو السيارة عليها عرض → يظهر السعر المخفّض بلون مميز',
      'الضغط على السيارة يفتح <strong>صفحة التفاصيل</strong> ثم الحجز',
    ],
    images: [
      { file: 'قسم اسطول السيارات .png', label: 'قائمة السيارات في الصفحة الرئيسية' },
      { file: 'قسم اسطول السيارات 2.png', label: 'بطاقة سيارة — السعر وزر الحجز' },
    ],
  },
  {
    title: '٥ — صفحة الحجز (الخطوة ١: التواريخ والاستلام)',
    intro: 'بعد ما العميل يختار سيارة، يدخل صفحة الحجز على ٣ خطوات.',
    lines: [
      '<strong>الخطوة ١ — التواريخ والاستلام:</strong> يحدد من وإلى + موعد وفرع الاستلام',
      'إيجار شهري: خيار <strong>شهر واحد تلقائياً</strong> أو <strong>تواريخ مخصصة</strong>',
      'الشهر الكامل يُحسب بالسعر الشهري — والأيام الزائدة بالسعر اليومي',
      'مثال: شهر + ٢ يوم = ٢,١٠٠ + (٩٢ × ٢) = ٢,٢٨٤ ر.س',
      'يختار <strong>يوم الاستلام، الساعة، والفترة</strong> (صباحاً / مساءً)',
      'يختار <strong>فرع الاستلام</strong> من القائمة — إجباري قبل الإرسال',
      'على اليسار: <strong>ملخص السعر</strong> يتحدّث تلقائياً مع كل اختيار',
    ],
    images: [
      { file: 'مكان حجز السيارة.png', label: 'بداية صفحة الحجز — اختيار التواريخ' },
      {
        file: 'مكان حجز السيارة2 وتفاصيل الاستلام.png',
        label: 'تفاصيل الاستلام + ملخص السعر',
      },
    ],
  },
  {
    title: '٦ — صفحة الحجز (الخطوة ٢: بيانات العميل)',
    intro: 'العميل يدخل بياناته — نفس البيانات اللي تشوفها أنت في لوحة الإدارة.',
    lines: [
      '<strong>الخطوة ٢ — بياناتك:</strong> الاسم الكامل ورقم الجوال (إجباري)',
      'البريد الإلكتروني ورقم الهوية والملاحظات (اختياري)',
      'رقم الجوال بصيغة دولية — النظام يتحقق من صحته',
      'ملخص السعر يبقى ظاهر على اليسار طوال الخطوات',
      'العميل يضغط <strong>التالي</strong> للمراجعة النهائية',
    ],
    images: [{ file: 'بيانات العميل وملخص السعر.png' }],
  },
  {
    title: '٧ — إرسال الطلب والتأكيد',
    intro: 'بعد الإرسال الطلب يوصلك في لوحة الإدارة — العميل يشوف هذه الشاشة.',
    lines: [
      '<strong>الخطوة ٣ — تأكيد:</strong> العميل يراجع البيانات ثم يضغط <strong>تأكيد وإرسال</strong>',
      'بعد الإرسال: رسالة <strong>تم إرسال طلبك!</strong> — الطلب قيد المراجعة',
      'يظهر للعميل <strong>فرع الاستلام ورقمه</strong> للتواصل المباشر',
      'زر <strong>تواصل مع الفرع عبر واتساب</strong> — لتسريع التأكيد',
      'الطلب يصلك في <strong>طلبات الحجز</strong> بحالة «بانتظار المراجعة»',
      'عند التأكيد من لوحتك → العميل يستلم <strong>رسالة واتساب تلقائياً</strong>',
      'عند الرفض → يُبلّغ العميل برسالة واتساب أيضاً',
    ],
    note: 'سرعة ردّك على الطلبات الجديدة مهمة — العميل ينتظر التأكيد بعد الإرسال مباشرة.',
    images: [{ file: 'ارسال وتاكيد الطلب .png' }],
  },
]

function imgDataUri(filename) {
  const buf = readFileSync(join(screenshotsDir, filename))
  return `data:image/png;base64,${buf.toString('base64')}`
}

function renderSection({ title, intro, lines, note, images }) {
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
      ${intro ? `<p class="intro">${intro}</p>` : ''}
      <ul>${bullets}</ul>
      ${note ? `<p class="note">${note}</p>` : ''}
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
      line-height: 1.65;
      font-size: 13.5px;
      margin: 0;
    }
    .head {
      text-align: center;
      padding: 12px 6px 14px;
      border-bottom: 3px solid #16a34a;
      margin-bottom: 14px;
    }
    .head h1 { color: #14532d; font-size: 20px; margin: 0 0 6px; }
    .head .lead {
      margin: 0 auto;
      max-width: 500px;
      color: #475569;
      font-size: 13px;
      line-height: 1.7;
    }
    .head .url { margin-top: 6px; color: #64748b; font-size: 12px; }
    .link-box {
      margin: 10px auto 0;
      max-width: 420px;
      padding: 8px 12px;
      background: #f0fdf4;
      border-radius: 8px;
      font-size: 12.5px;
      color: #166534;
      line-height: 1.6;
    }
    .block { margin-bottom: 20px; }
    h2 {
      color: #fff;
      background: #16a34a;
      font-size: 15px;
      margin: 0 0 8px;
      padding: 7px 12px;
      border-radius: 6px;
      page-break-after: avoid;
    }
    .intro {
      margin: 0 0 8px;
      color: #334155;
      font-size: 13px;
      font-weight: 600;
    }
    ul { margin: 0 0 8px; padding-right: 18px; }
    li { margin-bottom: 5px; }
    .note {
      margin: 0 0 10px;
      padding: 8px 10px;
      background: #fffbeb;
      border-right: 3px solid #f59e0b;
      font-size: 12.5px;
      border-radius: 0 6px 6px 0;
      color: #92400e;
    }
    .pics { display: flex; flex-direction: column; gap: 8px; }
    .pic {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
      page-break-inside: avoid;
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
      margin-top: 14px;
      padding: 10px 12px;
      background: #f0fdf4;
      border-right: 3px solid #16a34a;
      font-size: 13px;
      border-radius: 0 6px 6px 0;
      line-height: 1.7;
    }
    .foot {
      margin-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="head">
    <h1>شرح موقع العملاء — للموظفين</h1>
    <p class="lead">دليل مختصر يشرح رحلة العميل من فتح الموقع لحد إرسال طلب الحجز — اقرأ كل قسم وشوف الصورة تحته</p>
    <p class="url">alkhodercar.com</p>
    <p class="link-box">
      هذا الدليل يكمّل دليل <strong>لوحة الإدارة</strong> — الأول للعميل، والثاني لإدارة الطلبات والسيارات
    </p>
  </div>

  ${sections.map(renderSection).join('')}

  <div class="end">
    <strong>ملخص سريع للموظف:</strong> العميل يتصفح → يختار فرع (اختياري) → يشوف السيارات والعروض → يحجز ويدخل بياناته → الطلب يصلك في «طلبات الحجز» → أنت تؤكد أو ترفض ويردّ له واتساب تلقائياً.
  </div>

  <p class="foot">عبدالمجيد الخضر لتأجير السيارات</p>

</body>
</html>`

writeFileSync(resolve(__dirname, 'customer-guide-temp.html'), html, 'utf8')

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

console.log(`\n✅ تم إنشاء دليل موقع العملاء على سطح المكتب:\n${outputPath}\n`)
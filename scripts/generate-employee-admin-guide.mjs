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
    title: '١ — الدخول للوحة',
    intro: 'من هنا تدير السيارات والعروض وطلبات الحجز اللي يجيها من موقع العملاء.',
    lines: [
      'افتح المتصفح وادخل: <strong>alkhodercar.com/admin</strong>',
      'سجّل دخولك بالإيميل وكلمة المرور (الإدارة تعطيك إياها)',
      '<strong>لوحة التحكم:</strong> ملخص سريع وأرقام مهمة',
      '<strong>إدارة السيارات:</strong> إضافة وتعديل السيارات والأسعار',
      '<strong>العروض المميزة:</strong> عروض خاصة تظهر للعملاء',
      '<strong>طلبات الحجز:</strong> مراجعة طلبات العملاء وتأكيدها',
      'من أسفل القائمة: <strong>عرض الموقع</strong> (تشوف الموقع كما يراه العميل) و<strong>تسجيل الخروج</strong>',
    ],
    images: [{ file: 'بداية الدخول في لوحة الادارة .png' }],
  },
  {
    title: '٢ — زر «فرعي» (مهم لكل موظف فرع)',
    intro: 'كل موظف يشتغل على فرعه — اضغط الزر الأخضر «فرعي» في أعلى الصفحة.',
    lines: [
      'اضغط <strong>فرعي</strong> → اختر فرعك (مثلاً تبوك) → <strong>دخول وضع فرعي</strong>',
      'بعدها تشوف <strong>سيارات فرعك</strong> و<strong>حجوزات فرعك</strong> و<strong>عروض فرعك</strong> فقط',
      'للخروج والعودة لكل الفروع: اضغط الزر مرة ثانية → <strong>عرض الكل</strong>',
      '<strong>إجمالي السيارات:</strong> كم سيارة مسجّلة في فرعك',
      '<strong>سيارات متاحة:</strong> السيارات اللي العميل يقدر يحجزها الآن',
      '<strong>بانتظار المراجعة:</strong> طلبات جديدة — ركّز عليها وراجعها بسرعة',
    ],
    note: 'أي تعديل في اللوحة ينعكس مباشرة على موقع العملاء — تأكد قبل الحفظ.',
    images: [{ file: 'الدخول الى وضع فرعي (فرع تبوك مثلا) وشرح لوحه التحكم .png' }],
  },
  {
    title: '٣ — إدارة السيارات',
    intro: 'هنا تضيف سيارات جديدة أو تعدّل الأسعار والصور وتوفر السيارة.',
    lines: [
      '<strong>إضافة سيارة:</strong> زر + إضافة سيارة → اسم + صورة واضحة + سعر يومي وشهري',
      '<strong>الفروع المتاحة:</strong> حدد فروع السيارة — أو اتركه فارغ = تظهر في كل الفروع',
      'في وضع فرعي: السيارة الجديدة تتربط <strong>بفرعك تلقائياً</strong> وتظهر لعملاء فرعك',
      '<strong>تعديل:</strong> اضغط على السيارة وغيّر السعر أو الصورة أو البيانات',
      '<strong>تبديل التوفر:</strong> إيقاف السيارة مؤقتاً من الموقع (بدون حذفها)',
      'أعمدة <strong>الحجوزات النشطة</strong> و<strong>التواريخ المحجوزة</strong> توضح لك متى السيارة مشغولة',
    ],
    images: [{ file: 'ادارة السيارات .png' }],
  },
  {
    title: '٤ — العروض المميزة',
    intro: 'عروض وباقات خاصة تظهر بشكل بارز للعملاء في الصفحة الرئيسية وصفحة العروض.',
    lines: [
      'اضغط <strong>+ إضافة عرض</strong> → عنوان جذاب + صورة + سعر العرض',
      'حدد نوع الإيجار: <strong>يومي</strong> أو <strong>شهري</strong>',
      'اربط العرض <strong>بسيارة من فرعك</strong> — عشان يظهر لعملاء فرعك فقط',
      'فعّل العرض (نشط) واحفظ — يظهر للعملاء مباشرة',
      'عرض <strong>بدون سيارة</strong> = يظهر لكل الفروع (استخدمه للعروض العامة فقط)',
    ],
    images: [{ file: 'العروض المميزة .png' }],
  },
  {
    title: '٥ — طلبات الحجز (أهم شي يومياً)',
    intro: 'هنا تجي طلبات العملاء من الموقع — مهمتك تراجعها وترد بسرعة.',
    lines: [
      'افتح <strong>طلبات الحجز</strong> من القائمة — الرقم الأحمر = طلبات جديدة',
      'فلتر <strong>بانتظار المراجعة</strong> يعرض الطلبات اللي تحتاج ردّك',
      'اقرأ: اسم العميل، الجوال، السيارة، التواريخ، <strong>فرع الاستلام</strong>، المبلغ',
      'تأكد إن السيارة <strong>متاحة</strong> في التواريخ المطلوبة قبل التأكيد',
      'اضغط على الطلب لفتح <strong>تفاصيل الطلب</strong> — فيها واتساب وإيميل للتواصل',
      '<strong>تأكيد الحجز:</strong> العميل يستلم رسالة واتساب تلقائياً',
      '<strong>رفض:</strong> يُبلّغ العميل — استخدمه لو السيارة مش متاحة أو البيانات غير مناسبة',
      'تقدر تبحث بالاسم أو الجوال من خانة البحث',
    ],
    images: [
      { file: 'طلبات الحجز .png', label: 'قائمة الطلبات' },
      { file: 'بعد الدخول الى عرض الطلبات.png', label: 'تفاصيل طلب واحد — تأكيد أو رفض' },
    ],
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
      max-width: 480px;
      color: #475569;
      font-size: 13px;
      line-height: 1.7;
    }
    .head .url { margin-top: 6px; color: #64748b; font-size: 12px; }
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
    <h1>شرح لوحة الإدارة — للموظفين</h1>
    <p class="lead">دليل مختصر يشرح أهم الأقسام — اقرأ كل قسم وشوف الصورة تحته</p>
    <p class="url">alkhodercar.com/admin</p>
  </div>

  ${sections.map(renderSection).join('')}

  <div class="end">
    <strong>روتين يومي:</strong><br />
    ١) ادخل اللوحة &nbsp; ٢) اضغط فرعي واختر فرعك &nbsp; ٣) راجع طلبات الحجز الجديدة<br />
    ٤) أكّد أو ارفض بسرعة &nbsp; ٥) حدّث السيارات والعروض عند الحاجة &nbsp; ٦) اضغط عرض الموقع للتأكد
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
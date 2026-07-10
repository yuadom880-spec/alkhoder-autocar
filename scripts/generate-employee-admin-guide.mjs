import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const screenshotsDir = join(projectRoot, 'public', 'الموظفين')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outputPath = resolve(desktop, 'دليل-الموظفين-لوحة-الإدارة-الخضر.pdf')

const shots = [
  {
    file: 'بداية الدخول في لوحة الادارة .png',
    title: '١ — الدخول إلى لوحة الإدارة',
    caption: 'شاشة تسجيل الدخول ولوحة التحكم العامة',
  },
  {
    file: 'الدخول الى وضع فرعي (فرع تبوك مثلا) وشرح لوحه التحكم .png',
    title: '٢ — وضع «فرعي» ولوحة التحكم',
    caption: 'بعد اختيار فرع تبوك — كل الأرقام خاصة بفرعك فقط',
  },
  {
    file: 'ادارة السيارات .png',
    title: '٣ — إدارة السيارات',
    caption: 'عرض السيارات، التوفر، والحجوزات النشطة لكل سيارة',
  },
  {
    file: 'العروض المميزة .png',
    title: '٤ — العروض المميزة',
    caption: 'إضافة وتعديل العروض الظاهرة للعملاء',
  },
  {
    file: 'طلبات الحجز .png',
    title: '٥ — طلبات الحجز',
    caption: 'مراجعة طلبات العملاء وتأكيدها أو رفضها',
  },
]

function imgDataUri(filename) {
  const path = join(screenshotsDir, filename)
  const buf = readFileSync(path)
  return `data:image/png;base64,${buf.toString('base64')}`
}

function shotBlock({ file, title, caption }) {
  const src = imgDataUri(file)
  return `
    <div class="shot-block">
      <h2>${title}</h2>
      <p class="shot-caption">${caption}</p>
      <div class="shot-frame">
        <img src="${src}" alt="${caption}" />
      </div>
    </div>
  `
}

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { margin: 14mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
      color: #1e293b;
      line-height: 1.8;
      font-size: 13.5px;
      margin: 0;
      padding: 0;
    }
    .cover {
      text-align: center;
      padding: 28px 12px 24px;
      border-bottom: 4px solid #16a34a;
      margin-bottom: 22px;
      page-break-after: avoid;
    }
    .cover h1 {
      color: #14532d;
      font-size: 26px;
      margin: 0 0 10px;
      line-height: 1.45;
    }
    .cover .sub {
      color: #475569;
      font-size: 14px;
      max-width: 520px;
      margin: 0 auto;
      line-height: 1.75;
    }
    .cover .meta {
      margin-top: 14px;
      font-size: 12px;
      color: #64748b;
    }
    h2 {
      color: #14532d;
      font-size: 17px;
      margin: 0 0 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #bbf7d0;
      page-break-after: avoid;
    }
    h3 {
      color: #166534;
      font-size: 14.5px;
      margin: 18px 0 8px;
      page-break-after: avoid;
    }
    p { margin: 0 0 10px; }
    ul, ol { margin: 0 0 12px; padding-right: 22px; }
    li { margin-bottom: 6px; }
    .section { margin-bottom: 18px; }
    .tip {
      background: #f0fdf4;
      border-right: 4px solid #16a34a;
      padding: 12px 14px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
    }
    .warn {
      background: #fffbeb;
      border-right: 4px solid #f59e0b;
      padding: 12px 14px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      font-size: 12.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: right;
      vertical-align: top;
    }
    th {
      background: #ecfdf5;
      color: #14532d;
      font-weight: 700;
    }
    .shot-block {
      margin: 22px 0;
      page-break-inside: avoid;
    }
    .shot-caption {
      color: #64748b;
      font-size: 12px;
      margin-bottom: 10px !important;
    }
    .shot-frame {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background: #f8fafc;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
    }
    .shot-frame img {
      display: block;
      width: 100%;
      height: auto;
    }
    .toc {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .toc li { margin-bottom: 4px; }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>

  <div class="cover">
    <h1>دليل الموظفين<br />لوحة إدارة موقع الخضر لتأجير السيارات</h1>
    <p class="sub">
      شرح مبسّط لطريقة استخدام لوحة الإدارة — للموظفين في الفروع
    </p>
    <p class="meta">الموقع: alkhodercar.com/admin &nbsp;|&nbsp; يوليو 2026</p>
  </div>

  <div class="section toc">
    <h2>محتويات الدليل</h2>
    <ol>
      <li>كيف تدخل لوحة الإدارة</li>
      <li>شرح القائمة الجانبية</li>
      <li>وضع «فرعي» — أهم ميزة للموظف</li>
      <li>لوحة التحكم</li>
      <li>إدارة السيارات</li>
      <li>العروض المميزة</li>
      <li>طلبات الحجز (الأهم يومياً)</li>
      <li>ملخص سريع</li>
    </ol>
  </div>

  <div class="section">
    <h2>مقدمة</h2>
    <p>
      لوحة الإدارة هي المكان اللي تدير منه السيارات والعروض وطلبات الحجز اللي يجيها من الموقع.
      كل موظف فرع يقدر يشتغل على <strong>فرعه فقط</strong> عن طريق زر <strong>«فرعي»</strong> في الأعلى.
    </p>
    <div class="tip">
      <strong>تذكّر:</strong> أي تعديل تعمله في اللوحة ينعكس مباشرة على موقع العملاء — تأكد قبل الحفظ.
    </div>
  </div>

  <div class="section">
    <h2>١ — كيف تدخل لوحة الإدارة</h2>
    <ol>
      <li>افتح المتصفح وادخل على: <strong>alkhodercar.com/admin</strong></li>
      <li>أدخل <strong>البريد الإلكتروني</strong> و<strong>كلمة المرور</strong> اللي أعطاك إياها الإدارة</li>
      <li>اضغط <strong>تسجيل الدخول</strong></li>
      <li>بعد الدخول تظهر لك <strong>لوحة التحكم</strong> مع القائمة على اليمين</li>
    </ol>
    ${shotBlock(shots[0])}
  </div>

  <div class="section">
    <h2>٢ — شرح القائمة الجانبية</h2>
    <table>
      <thead>
        <tr><th>القسم</th><th>وش يسوي؟</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>لوحة التحكم</strong></td><td>ملخص سريع: عدد السيارات، الحجوزات، والطلبات اللي تنتظر مراجعتك</td></tr>
        <tr><td><strong>إدارة السيارات</strong></td><td>إضافة سيارة، تعديل السعر، رفع صور، تحديد الفروع، إيقاف/تشغيل التوفر</td></tr>
        <tr><td><strong>العروض المميزة</strong></td><td>عروض خاصة تظهر للعملاء في الصفحة الرئيسية وصفحة العروض</td></tr>
        <tr><td><strong>الفروع</strong></td><td>إدارة بيانات الفروع (للإدارة العامة — يختفي في وضع فرعي)</td></tr>
        <tr><td><strong>طلبات الحجز</strong></td><td>مراجعة طلبات العملاء — تأكيد أو رفض — مع إشعار واتساب تلقائي</td></tr>
      </tbody>
    </table>
    <p>في أسفل القائمة: <strong>عرض الموقع</strong> (تشوف الموقع كما يراه العميل) و<strong>تسجيل الخروج</strong>.</p>
  </div>

  <div class="section page-break">
    <h2>٣ — وضع «فرعي» ⭐ (مهم جداً)</h2>
    <p>
      الزر الأخضر <strong>«فرعي»</strong> في أعلى الصفحة يخليك تشوف وتعدّل بيانات <strong>فرعك فقط</strong>
      — سيارات فرعك، حجوزات فرعك، وعروض سيارات فرعك.
    </p>
    <h3>طريقة الاستخدام</h3>
    <ol>
      <li>اضغط زر <strong>فرعي</strong> في الأعلى</li>
      <li>اختر فرعك من القائمة (مثلاً: فرع تبوك)</li>
      <li>اضغط <strong>دخول وضع فرعي</strong></li>
      <li>يتحول الزر ويظهر اسم فرعك — وكل الصفحات تتفلتر تلقائياً</li>
    </ol>
    <p>للخروج من وضع الفرع وعرض كل الفروع: اضغط الزر مرة ثانية → <strong>عرض الكل</strong>.</p>
    <div class="warn">
      <strong>عند إضافة سيارة في وضع فرعي:</strong> السيارة تُربط بفرعك تلقائياً وتظهر لعملاء فرعك فقط (إلا إذا اخترت «كل الفروع»).
    </div>
    ${shotBlock(shots[1])}
  </div>

  <div class="section">
    <h2>٤ — لوحة التحكم</h2>
    <p>أول ما تدخل تشوف ٤ أرقام مهمة:</p>
    <ul>
      <li><strong>إجمالي السيارات</strong> — كم سيارة مسجّلة في فرعك (أو الكل)</li>
      <li><strong>سيارات متاحة</strong> — السيارات اللي العميل يقدر يحجزها الآن</li>
      <li><strong>إجمالي الحجوزات</strong> — كل الحجوزات</li>
      <li><strong>بانتظار المراجعة</strong> — طلبات جديدة تحتاج ردّك <span style="color:#ea580c">(ركّز عليها!)</span></li>
    </ul>
    <p>تحت الأرقام تشوف <strong>آخر الحجوزات</strong> و<strong>إدارة الحجوزات</strong> بشكل سريع.</p>
  </div>

  <div class="section page-break">
    <h2>٥ — إدارة السيارات</h2>
    <h3>وش تسوي هنا؟</h3>
    <ul>
      <li><strong>عرض كل السيارات</strong> مع السعر والتصنيف وحالة التوفر (متاحة / محجوزة / موقوفة)</li>
      <li><strong>إضافة سيارة جديدة</strong> — زر «+ إضافة سيارة»</li>
      <li><strong>تعديل سيارة</strong> — اضغط على السيارة أو زر التعديل</li>
      <li><strong>تبديل التوفر</strong> — إيقاف سيارة مؤقتاً من الموقع بدون حذفها</li>
    </ul>
    <h3>عند إضافة أو تعديل سيارة</h3>
    <ul>
      <li>ارفع <strong>صورة واضحة</strong> للسيارة (مهمة للعميل)</li>
      <li>حدّد <strong>السعر اليومي والشهري</strong></li>
      <li>في قسم <strong>الفروع المتاحة</strong>: حدد فروع السيارة — أو اتركه فارغاً = تظهر في كل الفروع</li>
      <li>يمكنك إضافة <strong>عرض خصم</strong> على السيارة (يومي أو شهري)</li>
    </ul>
    <p>الأعمدة <strong>الحجوزات النشطة</strong> و<strong>التواريخ المحجوزة</strong> تساعدك تعرف متى السيارة مشغولة.</p>
    ${shotBlock(shots[2])}
  </div>

  <div class="section page-break">
    <h2>٦ — العروض المميزة</h2>
    <p>
      العروض هي باقات أو أسعار خاصة تظهر بشكل بارز للعملاء في الصفحة الرئيسية وصفحة العروض.
    </p>
    <h3>خطوات إضافة عرض</h3>
    <ol>
      <li>ادخل <strong>العروض المميزة</strong> من القائمة</li>
      <li>اضغط <strong>إضافة عرض</strong></li>
      <li>اكتب عنوان العرض وارفع صورة جذابة</li>
      <li>حدد نوع الإيجار: <strong>يومي</strong> أو <strong>شهري</strong></li>
      <li>اربط العرض <strong>بسيارة</strong> من فرعك — عشان يظهر لعملاء فرعك فقط</li>
      <li>فعّل العرض واحفظ</li>
    </ol>
    <div class="tip">
      <strong>نصيحة:</strong> العرض المربوط بسيارة فرعك يظهر لعملاء هذا الفرع فقط. عرض بدون سيارة يظهر لكل الفروع.
    </div>
    ${shotBlock(shots[3])}
  </div>

  <div class="section page-break">
    <h2>٧ — طلبات الحجز 📋 (أهم قسم يومياً)</h2>
    <p>هنا تجي طلبات العملاء من الموقع. مهمتك تراجعها وترد بسرعة.</p>
    <h3>حالات الطلب</h3>
    <table>
      <thead>
        <tr><th>الحالة</th><th>معناها</th><th>ماذا تفعل؟</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>بانتظار المراجعة</strong></td><td>طلب جديد من العميل</td><td>راجع البيانات ثم <strong>أكّد</strong> أو <strong>ارفض</strong></td></tr>
        <tr><td><strong>مؤكد</strong></td><td>وافقت على الحجز</td><td>العميل يستلم رسالة واتساب تلقائياً</td></tr>
        <tr><td><strong>مرفوض</strong></td><td>الطلب غير مناسب</td><td>العميل يُبلّغ برسالة واتساب</td></tr>
        <tr><td><strong>مكتمل</strong></td><td>انتهى الإيجار</td><td>للأرشفة والمتابعة</td></tr>
        <tr><td><strong>ملغي</strong></td><td>العميل أو الإدارة ألغت</td><td>—</td></tr>
      </tbody>
    </table>
    <h3>خطوات مراجعة طلب</h3>
    <ol>
      <li>افتح <strong>طلبات الحجز</strong> — رقم أحمر على القائمة = طلبات جديدة</li>
      <li>اقرأ: اسم العميل، الجوال، السيارة، التواريخ، <strong>الفرع</strong></li>
      <li>تأكد إن السيارة متاحة في التواريخ المطلوبة</li>
      <li>اضغط <strong>تأكيد</strong> → يُرسل واتساب للعميل تلقائياً</li>
      <li>أو <strong>رفض</strong> مع ذكر السبب إن أمكن</li>
    </ol>
    <p>تقدر تبحث بالاسم أو الجوال أو اسم السيارة من خانة البحث.</p>
    ${shotBlock(shots[4])}
  </div>

  <div class="section page-break">
    <h2>٨ — ملخص سريع (خلاصة)</h2>
    <div class="tip">
      <ol style="margin:0;padding-right:20px;">
        <li>ادخل <strong>alkhodercar.com/admin</strong></li>
        <li>اضغط <strong>فرعي</strong> واختر فرعك</li>
        <li>راجع <strong>طلبات الحجز</strong> أول شي كل يوم</li>
        <li>حدّث <strong>السيارات</strong> (أسعار، صور، توفر)</li>
        <li>أضف <strong>عروض</strong> مربوطة بسيارات فرعك</li>
        <li>اضغط <strong>عرض الموقع</strong> للتأكد إن كل شي يظهر صح للعميل</li>
      </ol>
    </div>
    <h3>محتاج مساعدة؟</h3>
    <p>تواصل مع إدارة الشركة أو الدعم الفني — واحتفظ بهذا الدليل للرجوع إليه.</p>
  </div>

  <div class="footer">
    عبدالمجيد الخضر لتأجير السيارات — دليل الموظفين — لوحة الإدارة<br />
    alkhodercar.com &nbsp;|&nbsp; يوليو 2026
  </div>

</body>
</html>`

const htmlPath = resolve(__dirname, 'employee-guide-temp.html')
writeFileSync(htmlPath, html, 'utf8')

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load', timeout: 120000 })
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' },
})
await browser.close()

console.log(`\n✅ تم إنشاء دليل الموظفين على سطح المكتب:\n${outputPath}\n`)
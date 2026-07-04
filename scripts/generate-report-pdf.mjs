import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outputPath = resolve(desktop, 'تقرير-موقع-عبدالمجيد-الخضر-لتأجير-السيارات.pdf')

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { margin: 1.8cm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.85;
      font-size: 13px;
    }
    .cover {
      text-align: center;
      padding: 40px 16px 32px;
      border-bottom: 3px solid #16a34a;
      margin-bottom: 24px;
    }
    .cover h1 {
      color: #14532d;
      font-size: 24px;
      margin: 0 0 8px;
      line-height: 1.5;
    }
    .cover .en {
      color: #166534;
      font-size: 15px;
      margin-bottom: 12px;
    }
    .cover .sub {
      color: #64748b;
      font-size: 13px;
      line-height: 1.7;
    }
    .meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      margin-top: 16px;
      font-size: 12px;
      color: #475569;
    }
    h2 {
      color: #14532d;
      font-size: 17px;
      margin: 24px 0 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #bbf7d0;
      page-break-after: avoid;
    }
    h3 {
      color: #166534;
      font-size: 14px;
      margin: 16px 0 6px;
      page-break-after: avoid;
    }
    p { margin: 0 0 10px; }
    ul, ol { margin: 0 0 12px; padding-right: 20px; }
    li { margin-bottom: 5px; }
    .highlight {
      background: #f0fdf4;
      border-right: 4px solid #16a34a;
      padding: 12px 14px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: right;
      vertical-align: top;
    }
    th {
      background: #f0fdf4;
      color: #14532d;
      font-weight: 600;
    }
    .tag {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 10px;
    }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>

  <div class="cover">
    <h1>تقرير مميزات وفوائد الموقع</h1>
    <p class="en">عبدالمجيد الخضر لتأجير السيارات</p>
    <p class="en">Abdulmjeed Alkhoder Car Rental</p>
    <p class="sub">شرح شامل لمميزات الموقع، فوائده التجارية، وطريقة استخدامه<br />للعملاء ولإدارة الشركة</p>
    <div class="meta">
      <span>التاريخ: 3 يوليو 2026</span>
      <span>الجوال: 050 459 0002</span>
      <span>8 فروع</span>
    </div>
  </div>

  <div class="section">
    <h2>نبذة عن الموقع</h2>
    <p>
      موقع <strong>عبدالمجيد الخضر لتأجير السيارات</strong> هو منصة رقمية متكاملة لتأجير السيارات في المملكة العربية السعودية.
      يجمع بين واجهة عربية سهلة للعملاء ولوحة إدارة احترافية للشركة، مع ربط مباشر بالحجوزات والفروع والعروض وإشعارات واتساب.
    </p>
    <div class="highlight">
      <strong>الهدف الأساسي:</strong> تمكين العميل من تصفح الأسطول وحجز السيارة أونلاين في أي وقت،
      وتمكين الإدارة من استقبال الطلبات ومراجعتها وتأكيدها من مكان واحد — مع تقليل الاعتماد على المكالمات اليدوية.
    </div>
  </div>

  <div class="section">
    <h2>فوائد الموقع للشركة</h2>
    <table>
      <thead>
        <tr>
          <th style="width:28%">الفائدة</th>
          <th>الشرح</th>
          <th style="width:22%">الاستخدام العملي</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>حضور رقمي احترافي</strong></td>
          <td>موقع عصري يعكس هوية الشركة ويثقّف العميل بالخدمة قبل التواصل.</td>
          <td>جذب عملاء جدد من جوجل ووسائل التواصل.</td>
        </tr>
        <tr>
          <td><strong>حجز 24/7</strong></td>
          <td>العميل يرسل طلب الحجز في أي وقت حتى خارج ساعات العمل.</td>
          <td>لا تضيع طلبات ليلاً أو في العطل.</td>
        </tr>
        <tr>
          <td><strong>تقليل المكالمات</strong></td>
          <td>الأسعار والمواصفات والفروع والعروض واضحة أونلاين.</td>
          <td>الموظف يركز على التأكيد والخدمة لا على الرد على أسئلة متكررة.</td>
        </tr>
        <tr>
          <td><strong>إدارة مركزية</strong></td>
          <td>كل الحجوزات والسيارات والفروع والعروض في لوحة واحدة.</td>
          <td>متابعة الطلبات والإحصائيات من الجوال أو الكمبيوتر.</td>
        </tr>
        <tr>
          <td><strong>توفر حقيقي</strong></td>
          <td>النظام يمنع الحجز المزدوج على نفس السيارة في نفس التواريخ.</td>
          <td>تقليل الأخطاء والتعارض مع العملاء.</td>
        </tr>
        <tr>
          <td><strong>تسويق العروض</strong></td>
          <td>عروض يومية وشهرية معروضة وقابلة للحجز مباشرة.</td>
          <td>زيادة المبيعات في المواسم (الصيف، الحج، العمرة).</td>
        </tr>
        <tr>
          <td><strong>ظهور في جوجل (SEO)</strong></td>
          <td>كلمات مفتاحية، وصف الموقع، خريطة الموقع، وبيانات منظمة لجوجل.</td>
          <td>الظهور عند البحث عن «ايجار سيارات» في السعودية والمدن.</td>
        </tr>
        <tr>
          <td><strong>واتساب تلقائي</strong></td>
          <td>رسالة للعميل عند إرسال الطلب وعند التأكيد من الإدارة.</td>
          <td>تجربة احترافية وتقليل «هل وصل طلبي؟».</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>مميزات واجهة العملاء</h2>

    <h3>1. الصفحة الرئيسية</h3>
    <ul>
      <li>عرض هوية الشركة والشعار والعنوان التسويقي.</li>
      <li><strong>بحث سريع:</strong> اختيار تاريخ الاستلام والتسليم والفرع والانتقال مباشرة للسيارات المتاحة.</li>
      <li>عرض <strong>السيارات المميزة</strong> و<strong>العروض الصيفية</strong>.</li>
      <li>قسم الفرع الرئيسي مع العنوان والجوال وساعات العمل وخرائط جوجل.</li>
      <li>أزرار تواصل مباشر: <strong>واتساب</strong> و<strong>اتصال</strong>.</li>
    </ul>

    <h3>2. صفحة السيارات</h3>
    <ul>
      <li>تصفح كامل الأسطول مع صور وأسعار يومية.</li>
      <li>فلترة حسب <strong>الفرع</strong> — يظهر فقط السيارات المتاحة في الفرع المختار.</li>
      <li>فلترة حسب التصنيف (اقتصادية، عائلية، SUV، فاخرة...).</li>
      <li>ترتيب حسب السعر.</li>
      <li>تحديد تواريخ الحجز ومشاهدة السيارات <strong>المتاحة فعلياً</strong> في تلك الفترة.</li>
    </ul>

    <h3>3. صفحة تفاصيل السيارة</h3>
    <ul>
      <li>معرض صور كامل للسيارة.</li>
      <li>مواصفات تفصيلية: ناقل الحركة، الوقود، المقاعد، التكييف، وغيرها.</li>
      <li>السعر اليومي وحالة التوفر والعروض المرتبطة.</li>
      <li>زر مباشر للحجز.</li>
    </ul>

    <h3>4. نظام الحجز أونلاين <span class="tag">3 خطوات</span></h3>
    <ol>
      <li><strong>التواريخ وموعد الاستلام:</strong> تاريخ البداية والنهاية، يوم الاستلام، الساعة، صباحاً/مساءً، و<strong>فرع الاستلام</strong>.</li>
      <li><strong>بيانات العميل:</strong> الاسم، الجوال (سعودي +966 أو مصري +20)، البريد (اختياري)، الهوية (اختياري)، ملاحظات.</li>
      <li><strong>التأكيد:</strong> مراجعة السعر الإجمالي وعدد الأيام وإرسال الطلب.</li>
    </ol>
    <p>بعد الإرسال: يصل الطلب للإدارة بحالة «قيد الانتظار» ويُرسل للعميل <strong>إشعار واتساب</strong> بتفاصيل طلبه.</p>

    <h3>5. صفحة العروض</h3>
    <ul>
      <li>عروض يومية وشهرية بأسعار واضحة وشارات مميزة.</li>
      <li>حجز مباشر من العرض مع ربط السيارة والسعر المخفّض.</li>
    </ul>

    <h3>6. صفحة فروعنا</h3>
    <ul>
      <li>عرض جميع الفروع النشطة (8 فروع).</li>
      <li>لكل فرع: الاسم، المدينة، العنوان، الجوال، ساعات العمل، صورة، ورابط خرائط جوجل.</li>
      <li>زر «احجز من هذا الفرع» يفتح السيارات مفلترة حسب الفرع.</li>
    </ul>

    <h3>7. صفحة من نحن</h3>
    <ul>
      <li>تعريف بالشركة ورؤيتها ومهمتها ونقاط التميز.</li>
    </ul>

    <h3>8. تجربة المستخدم</h3>
    <ul>
      <li>تصميم متجاوب — يعمل على الجوال والتابلت والكمبيوتر.</li>
      <li>واجهة عربية كاملة (RTL) مناسبة للسوق السعودي.</li>
      <li>تنقل سلس بين الصفحات مع شريط علوي وروابط سريعة في الفوتر.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2>مميزات لوحة الإدارة</h2>
    <p>الدخول عبر <strong>/admin</strong> برقم جوال المسؤول وكلمة مرور. جميع الصفحات محمية ولا تُفتح بدون تسجيل دخول.</p>

    <h3>1. لوحة التحكم</h3>
    <ul>
      <li>إحصائيات فورية: إجمالي السيارات، المتاحة، إجمالي الحجوزات، الطلبات المعلقة.</li>
      <li>تنبيه عند وجود حجوزات جديدة بانتظار المراجعة.</li>
      <li>مراجعة سريعة لآخر الطلبات مع <strong>تأكيد</strong> أو <strong>رفض</strong> من نفس الشاشة.</li>
      <li>عند التأكيد: إرسال <strong>رسالة واتساب</strong> للعميل تلقائياً (أو فتح واتساب برسالة جاهزة).</li>
    </ul>

    <h3>2. إدارة السيارات</h3>
    <ul>
      <li>إضافة / تعديل / حذف سيارات.</li>
      <li>رفع صور متعددة لكل سيارة.</li>
      <li>تحديد السعر اليومي، التصنيف، المواصفات، والوصف.</li>
      <li>تفعيل أو إيقاف توفر السيارة.</li>
      <li>تحديد السيارات <strong>المميزة</strong> للصفحة الرئيسية.</li>
      <li>ربط السيارة بـ<strong>فروع محددة</strong> (أو إظهارها في كل الفروع).</li>
      <li>إضافة عروض على السيارة (خصم، شارة، تاريخ انتهاء).</li>
    </ul>

    <h3>3. إدارة الحجوزات</h3>
    <ul>
      <li>عرض كل الطلبات: الاسم، الجوال، السيارة، التواريخ، موعد الاستلام، الفرع، السعر.</li>
      <li>تغيير الحالة: قيد الانتظار ← مؤكد / مرفوض / مكتمل / ملغي.</li>
      <li>بحث بالاسم أو الجوال أو السيارة.</li>
      <li>فلترة حسب الحالة والفرع.</li>
      <li>اتصال أو واتساب مباشر من بطاقة كل طلب.</li>
    </ul>

    <h3>4. إدارة العروض المميزة</h3>
    <ul>
      <li>إنشاء عروض يومية أو شهرية مرتبطة بسيارة.</li>
      <li>صورة، سعر، سعر قبل الخصم، شارة، وتاريخ انتهاء.</li>
      <li>تفعيل/إيقاف وتحديد الظهور في الرئيسية.</li>
    </ul>

    <h3>5. إدارة الفروع</h3>
    <ul>
      <li>إضافة فرع: الاسم، المدينة، العنوان، الجوال، الصورة، الخريطة، ساعات العمل.</li>
      <li>تعديل أو حذف أو إخفاء فرع.</li>
      <li>تحديد الفرع الرئيسي.</li>
      <li>أي فرع يُضاف يظهر تلقائياً في «فروعنا» وللفلترة في الحجز.</li>
    </ul>
  </div>

  <div class="section">
    <h2>إشعارات واتساب</h2>
    <table>
      <thead>
        <tr>
          <th>الحدث</th>
          <th>ماذا يحدث</th>
          <th>الفائدة</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>عميل يرسل حجزاً</td>
          <td>رسالة «قيد الانتظار» بتفاصيل السيارة والتواريخ والفرع والسعر.</td>
          <td>العميل يطمئن أن طلبه وصل.</td>
        </tr>
        <tr>
          <td>الإدارة تؤكد الحجز</td>
          <td>رسالة تأكيد رسمية باسم الشركة.</td>
          <td>تجربة احترافية وتقليل المتابعة اليدوية.</td>
        </tr>
        <tr>
          <td>بدون API واتساب</td>
          <td>يفتح واتساب برسالة جاهزة للإرسال اليدوي.</td>
          <td>يعمل فوراً بدون إعدادات معقدة.</td>
        </tr>
        <tr>
          <td>مع API واتساب (اختياري)</td>
          <td>إرسال تلقائي كامل عبر Supabase Edge Function.</td>
          <td>أتمتة كاملة بدون تدخل يدوي.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>تحسين محركات البحث (SEO)</h2>
    <ul>
      <li>عنوان ووصف الموقع محسّنان لكلمات: ايجار سيارات، يومي، شهري، السعودية.</li>
      <li>كلمات مفتاحية شاملة (مكة، تبوك، ينبع، املج، الطائف، المدينة المنورة...).</li>
      <li>بيانات منظمة JSON-LD من نوع CarRental لجوجل.</li>
      <li>ملفات robots.txt و sitemap.xml للفهرسة.</li>
      <li>وسوم Open Graph للمشاركة على واتساب ووسائل التواصل.</li>
    </ul>
  </div>

  <div class="section">
    <h2>البنية التقنية</h2>
    <table>
      <thead>
        <tr><th>المكوّن</th><th>التقنية</th><th>الفائدة</th></tr>
      </thead>
      <tbody>
        <tr><td>الواجهة الأمامية</td><td>React + TypeScript + Vite + Tailwind CSS</td><td>سرعة، أمان في الكود، تصميم عصري</td></tr>
        <tr><td>قاعدة البيانات</td><td>Supabase (PostgreSQL سحابي)</td><td>حفظ آمن للسيارات والحجوزات والفروع</td></tr>
        <tr><td>الصور</td><td>رفع وتخزين على Supabase Storage</td><td>صور حقيقية قابلة للتحديث من الإدارة</td></tr>
        <tr><td>النشر</td><td>Vercel</td><td>موقع سريع ومتاح على الإنترنت 24/7</td></tr>
        <tr><td>الواتساب</td><td>Edge Function + WhatsApp Business API (اختياري)</td><td>إشعارات تلقائية للعملاء</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>قبل الموقع وبعده</h2>
    <table>
      <thead>
        <tr><th>الموقف</th><th>قبل الموقع</th><th>بعد الموقع</th></tr>
      </thead>
      <tbody>
        <tr><td>العميل</td><td>يتصل ويسأل عن كل سيارة وسعرها</td><td>يشوف كل شي ويحجز بنفسه أونلاين</td></tr>
        <tr><td>الموظف</td><td>يسجل الطلب يدوياً في ورقة أو واتساب</td><td>يستلم طلباً جاهزاً بكل التفاصيل</td></tr>
        <tr><td>التوفر</td><td>صعب معرفة السيارات المحجوزة</td><td>النظام يحسب التوفر تلقائياً</td></tr>
        <tr><td>العروض</td><td>على واتساب أو ورق</td><td>صفحة عروض منظمة قابلة للحجز</td></tr>
        <tr><td>الفروع</td><td>العميل يتشتت بين العناوين</td><td>صفحة فروع واحدة بخرائط وأرقام</td></tr>
        <tr><td>التسويق</td><td>يعتمد على السمعة فقط</td><td>ظهور في جوجل + حضور رقمي</td></tr>
        <tr><td>المتابعة</td><td>«هل وصل طلبي؟» عبر مكالمات</td><td>إشعار واتساب فوري عند الحجز والتأكيد</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>ملخص سريع للاستخدام</h2>
    <div class="highlight">
      <strong>للعميل:</strong> ادخل الموقع ← اختر السيارة أو العرض ← حدد التواريخ والفرع وموعد الاستلام ← أدخل بياناتك ← أرسل الطلب ← انتظر تأكيد واتساب.<br /><br />
      <strong>للإدارة:</strong> ادخل /admin ← راجع الحجوزات المعلقة ← أكّد أو ارفض ← حدّث السيارات والعروض والفروع حسب الحاجة.
    </div>
  </div>

  <div class="footer">
    عبدالمجيد الخضر لتأجير السيارات — Abdulmjeed Alkhoder Car Rental<br />
    تقرير مميزات وفوائد الموقع — يوليو 2026
  </div>

</body>
</html>`

const htmlPath = resolve(__dirname, 'report-temp.html')
writeFileSync(htmlPath, html, 'utf8')

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'networkidle0' })
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
})
await browser.close()

console.log(`\n✅ تم إنشاء التقرير على سطح المكتب:\n${outputPath}\n`)
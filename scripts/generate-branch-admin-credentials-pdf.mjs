import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const desktop = resolve(process.env.USERPROFILE ?? '', 'Desktop')
const outputPath = resolve(desktop, 'بيانات الدخول لوحة الادارة للفروع.pdf')

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  return phone
}

function loadAccounts() {
  const src = readFileSync(join(projectRoot, 'src/lib/branchAdmin.ts'), 'utf8')
  const accounts = []
  const re =
    /phone:\s*'([^']+)',\s*\n\s*password:\s*'([^']+)',\s*\n\s*label:\s*'([^']+)'/g
  let match
  while ((match = re.exec(src)) !== null) {
    accounts.push({ phone: match[1], password: match[2], label: match[3] })
  }
  if (accounts.length === 0) throw new Error('لم يتم العثور على حسابات الفروع في branchAdmin.ts')
  return accounts
}

const accounts = loadAccounts()

const rows = accounts
  .map(
    (account, index) => `
    <tr>
      <td class="num">${index + 1}</td>
      <td class="branch">${account.label}</td>
      <td><span class="mono">${formatPhone(account.phone)}</span></td>
      <td><span class="mono">${account.password}</span></td>
    </tr>`,
  )
  .join('')

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { margin: 14mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.6;
      font-size: 12.5px;
      margin: 0;
    }
    .head {
      text-align: center;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 3px solid #16a34a;
    }
    .head h1 {
      color: #14532d;
      font-size: 22px;
      margin: 0 0 6px;
    }
    .head .meta {
      color: #64748b;
      font-size: 12px;
    }
    .note {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #92400e;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
    }
    th, td {
      padding: 10px 12px;
      text-align: right;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    th {
      background: #14532d;
      color: #fff;
      font-weight: 600;
      font-size: 12px;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .num { width: 36px; text-align: center; color: #64748b; }
    .branch { font-weight: 600; }
    .mono {
      font-family: Consolas, 'Courier New', monospace;
      direction: ltr;
      unicode-bidi: plaintext;
      letter-spacing: 0.02em;
    }
    .footer {
      margin-top: 16px;
      font-size: 11px;
      color: #64748b;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="head">
    <h1>بيانات تسجيل الدخول — لوحة إدارة الفروع</h1>
    <p class="meta">الخضر للسيارات · رابط الدخول: <span class="mono">https://alkhodercar.com/admin/login</span></p>
  </div>

  <div class="note">
    <strong>طريقة الدخول:</strong> أدخل رقم الجوال في خانة اسم المستخدم وكلمة المرور كما هي بالجدول.
    يمكن إدخال الرقم مع أو بدون مسافات.
  </div>

  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>الفرع</th>
        <th>رقم الجوال (تسجيل الدخول)</th>
        <th>كلمة المرور</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <p class="footer">
    هذه الحسابات خاصة بموظفي الفروع فقط. الإدارة العامة (كل الفروع) لها حساب منفصل.
    احتفظ بهذا الملف في مكان آمن ولا تشاركه علناً.
  </p>
</body>
</html>`

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
})
await browser.close()

console.log(`\n✅ تم إنشاء ملف PDF على سطح المكتب:\n${outputPath}\n`)
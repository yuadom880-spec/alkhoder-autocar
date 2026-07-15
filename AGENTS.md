# قواعد Grok Build — مشروع alkhoder-autocar

## أوامر التيرمنال (إلزامي)

- **ممنوع** `is_background: true` إلا بطلب صريح من المستخدم.
- **ممنوع** `npm run dev` / `serve` / `flutter run` إلا بطلب صريح.
- **ممنوع** `Start-Sleep` — استخدم `AwaitShell` فقط.
- انتظر كل أمر قبل الرد: build 180s+، flutter 300s+، npm install 300s+.
- إذا بقي أمر خلفي: انتظره أو أوقفه قبل الرد النهائي.

## الرد على المستخدم (إلزامي)

- **أول ما تخلص قول "خلصت"** مع ملخص — رد نصي كامل بالعربية.
- لا تكتفي بـ "Worked for Xs".

## سيرفرات localhost (إلزامي)

- بعد التجربة أو أي رسالة جديدة من المستخدم: **أوقف `serve` / `npm run dev` / flutter web** ثم رد.
- أكّد إنك قفلت السيرفر في الرد.
- الموقع: `http://localhost:5173` — التطبيق: `http://localhost:8080`

## المشروع

- `npm run build` قبل كل commit.
- Flutter: `C:\Users\Top10\flutter\bin\flutter.bat`
- PowerShell: `;` بدل `&&`
# قواعد Grok Build — مشروع alkhoder-autocar

## أوامر التيرمنال (إلزامي)

- **ممنوع** `is_background: true` إلا بطلب صريح من المستخدم.
- **ممنوع** `npm run dev` / `serve` / `flutter run` إلا بطلب صريح.
- **ممنوع** `Start-Sleep` — استخدم `AwaitShell` فقط.
- انتظر كل أمر قبل الرد: build 180s+، flutter 300s+، npm install 300s+.
- إذا بقي أمر خلفي: انتظره أو أوقفه قبل الرد النهائي.

## الرد على المستخدم (إلزامي)

- رد نصي كامل بالعربية يشرح ما تم — لا تكتفي بـ "Worked for Xs".

## المشروع

- `npm run build` قبل كل commit.
- Flutter: `C:\Users\Top10\flutter\bin\flutter.bat`
- PowerShell: `;` بدل `&&`
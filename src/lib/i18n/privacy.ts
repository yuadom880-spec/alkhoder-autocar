import { EMAIL_OSAMA, SITE_COMPANY_NAME, SITE_NAME } from '../constants'
import type { Locale } from './index'

const SITE_NAME_EN = 'Abdulmjeed Alkhoder Car Rental'
const SITE_COMPANY_NAME_EN = 'Abdulmjeed Alkhoder Car Rental Company'

export type PrivacySection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const sectionsAr: PrivacySection[] = [
  {
    title: 'مقدمة',
    paragraphs: [
      `مرحباً بك في تطبيق وموقع ${SITE_NAME} (${SITE_COMPANY_NAME}). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفق أنظمة المملكة العربية السعودية والمعايير المعمول بها.`,
      'توضح سياسة الخصوصية هذه كيفية جمع بياناتك واستخدامها وحمايتها عند استخدام تطبيق الجوال (Android) أو الموقع الإلكتروني alkhodercar.com لحجز وتأجير السيارات.',
    ],
  },
  {
    title: 'من نحن (مسؤول البيانات)',
    paragraphs: [
      `المسؤول عن بياناتك هو ${SITE_COMPANY_NAME}.`,
      `للاستفسارات المتعلقة بالخصوصية: ${EMAIL_OSAMA}`,
      'العنوان: المملكة العربية السعودية — المدينة المنورة (الفرع الرئيسي — طريق المطار).',
    ],
  },
  {
    title: 'البيانات التي نجمعها',
    paragraphs: ['قد نجمع الأنواع التالية من البيانات عند استخدامك للخدمة:'],
    bullets: [
      'بيانات الحساب: الاسم الكامل، البريد الإلكتروني، كلمة المرور (مشفّرة — لا نخزّنها بصيغة مقروءة).',
      'بيانات الحجز: رقم الجوال، رقم الهوية (اختياري)، تواريخ الإيجار، فرع الاستلام، السيارة المختارة، ملاحظاتك.',
      'بيانات تقنية: نوع الجهاز والمتصفح، عنوان IP تقريبي، سجلات الاستخدام اللازمة لتشغيل الخدمة ومنع الاحتيال.',
      'تفضيلات محلية: الفرع أو إعدادات البحث المحفوظة على جهازك (Shared Preferences / التخزين المحلي).',
    ],
  },
  {
    title: 'كيف نستخدم بياناتك',
    paragraphs: ['نستخدم بياناتك للأغراض التالية فقط:'],
    bullets: [
      'إنشاء حسابك وتسجيل دخولك وتأكيد بريدك الإلكتروني.',
      'معالجة طلبات حجز السيارات والتواصل معك بخصوص حجزك.',
      'إرسال إشعارات بالبريد الإلكتروني (تأكيد الحساب، تأكيد الحجز، إشعارات الفروع).',
      'تحسين تجربة الاستخدام ودعم العملاء وحل المشكلات الفنية.',
      'الامتثال للأنظمة والمتطلبات القانونية المعمول بها.',
    ],
  },
  {
    title: 'مشاركة البيانات مع أطراف ثالثة',
    paragraphs: [
      'لا نبيع بياناتك الشخصية لأي طرف ثالث. نشارك البيانات فقط مع مزودي الخدمة الضروريين لتشغيل التطبيق:',
    ],
    bullets: [
      'Supabase — استضافة قاعدة البيانات والمصادقة (تسجيل الدخول).',
      'Resend — إرسال رسائل البريد الإلكتروني المتعلقة بالحساب والحجوزات.',
      'Vercel — استضافة الموقع الإلكتروني.',
      'Google Play — عند تنزيل التطبيق من متجر Google (تخضع لسياسة خصوصية Google).',
    ],
  },
  {
    title: 'أمان البيانات',
    paragraphs: [
      'نستخدم اتصالات مشفّرة (HTTPS/TLS) بين التطبيق والخوادم.',
      'كلمات المرور تُدار عبر نظام المصادقة في Supabase ولا تُخزَّن لدينا بنص واضح.',
      'نطبّق صلاحيات وصول (Row Level Security) بحيث يرى كل مستخدم بياناته فقط.',
      'رغم اتخاذنا إجراءات أمنية معقولة، لا يمكن ضمان أمان نقل البيانات عبر الإنترنت بنسبة 100%.',
    ],
  },
  {
    title: 'مدة الاحتفاظ بالبيانات',
    paragraphs: [
      'نحتفظ ببيانات حسابك طالما كان حسابك نشطاً أو حسب ما تقتضيه متطلبات الخدمة والقانون.',
      'بيانات الحجوزات تُحفظ لأغراض تشغيلية ومحاسبية وفق سياسات الشركة والأنظمة السعودية.',
      'يمكنك طلب حذف حسابك أو تصحيح بياناتك عبر التواصل معنا (انظر قسم «حقوقك»).',
    ],
  },
  {
    title: 'حقوقك',
    paragraphs: ['لديك الحق في:'],
    bullets: [
      'الاطلاع على بياناتك الشخصية وتحديثها من داخل التطبيق أو عبر التواصل معنا.',
      'طلب حذف حسابك وبياناتك (ما لم يمنعنا القانون من ذلك).',
      'الاعتراض على معالجة بياناتك أو سحب موافقتك حيث ينطبق ذلك.',
      'تقديم شكوى إلى الجهة المختصة في المملكة إذا رأيت أن حقوقك مُنتهكة.',
    ],
  },
  {
    title: 'الأطفال',
    paragraphs: [
      'الخدمة موجّهة للبالغين (18 عاماً فأكثر) أو من يحجز بموافقة ولي الأمر.',
      'لا نجمع عن قصد بيانات من أطفال دون السن القانوني.',
    ],
  },
  {
    title: 'التخزين المحلي والملفات',
    paragraphs: [
      'قد يخزّن التطبيق تفضيلاتك محلياً على جهازك (مثل الفرع المختار) لتسهيل الاستخدام.',
      'لا نستخدم ملفات تعريف ارتباط إعلانية طرف ثالث في التطبيق.',
      'الموقع قد يستخدم تخزيناً محلياً تقنياً لتشغيل الخدمة (مثل جلسة تسجيل الدخول).',
    ],
  },
  {
    title: 'الروابط الخارجية',
    paragraphs: [
      'قد يحتوي التطبيق على روابط لخدمات خارجية (مثل واتساب، خرائط Google، وسائل التواصل).',
      'هذه الخدمات لها سياسات خصوصية مستقلة ولسنا مسؤولين عن ممارساتها.',
    ],
  },
  {
    title: 'تحديثات هذه السياسة',
    paragraphs: [
      'قد نحدّث سياسة الخصوصية من وقت لآخر. سننشر النسخة المحدّثة على هذه الصفحة مع تاريخ «آخر تحديث».',
      'استمرارك في استخدام التطبيق أو الموقع بعد التحديث يعني موافقتك على السياسة المحدّثة.',
    ],
  },
  {
    title: 'تواصل معنا',
    paragraphs: [
      `لأي استفسار حول الخصوصية أو طلب حذف/تصحيح البيانات، راسلنا على: ${EMAIL_OSAMA}`,
      'أو عبر صفحة «تواصل معنا» في الموقع أو تطبيق الجوال.',
    ],
  },
]

const sectionsEn: PrivacySection[] = [
  {
    title: 'Introduction',
    paragraphs: [
      `Welcome to the ${SITE_NAME_EN} app and website (${SITE_COMPANY_NAME_EN}). We respect your privacy and are committed to protecting your personal data in accordance with Saudi Arabian regulations and applicable standards.`,
      'This privacy policy explains how we collect, use, and protect your data when you use our Android mobile app or the alkhodercar.com website to book and rent cars.',
    ],
  },
  {
    title: 'Who we are (data controller)',
    paragraphs: [
      `The data controller is ${SITE_COMPANY_NAME_EN}.`,
      `For privacy inquiries: ${EMAIL_OSAMA}`,
      'Address: Saudi Arabia — Madinah (main branch — Airport Road).',
    ],
  },
  {
    title: 'Data we collect',
    paragraphs: ['We may collect the following types of data when you use our service:'],
    bullets: [
      'Account data: full name, email, password (encrypted — we do not store it in plain text).',
      'Booking data: mobile number, ID number (optional), rental dates, pickup branch, selected car, your notes.',
      'Technical data: device and browser type, approximate IP address, usage logs required to operate the service and prevent fraud.',
      'Local preferences: selected branch or search settings saved on your device (Shared Preferences / local storage).',
    ],
  },
  {
    title: 'How we use your data',
    paragraphs: ['We use your data only for the following purposes:'],
    bullets: [
      'Creating your account, signing you in, and verifying your email.',
      'Processing car booking requests and communicating with you about your booking.',
      'Sending email notifications (account confirmation, booking confirmation, branch notifications).',
      'Improving user experience, customer support, and resolving technical issues.',
      'Compliance with applicable laws and legal requirements.',
    ],
  },
  {
    title: 'Sharing data with third parties',
    paragraphs: [
      'We do not sell your personal data to any third party. We share data only with service providers necessary to operate the app:',
    ],
    bullets: [
      'Supabase — database hosting and authentication (sign-in).',
      'Resend — sending emails related to accounts and bookings.',
      'Vercel — website hosting.',
      'Google Play — when downloading the app from Google Play (subject to Google\'s privacy policy).',
    ],
  },
  {
    title: 'Data security',
    paragraphs: [
      'We use encrypted connections (HTTPS/TLS) between the app and our servers.',
      'Passwords are managed through Supabase authentication and are not stored by us in plain text.',
      'We apply access controls (Row Level Security) so each user can only see their own data.',
      'Despite reasonable security measures, 100% security of data transmission over the internet cannot be guaranteed.',
    ],
  },
  {
    title: 'Data retention',
    paragraphs: [
      'We retain your account data while your account is active or as required by service and legal requirements.',
      'Booking data is kept for operational and accounting purposes in line with company policies and Saudi regulations.',
      'You may request deletion or correction of your data by contacting us (see "Your rights").',
    ],
  },
  {
    title: 'Your rights',
    paragraphs: ['You have the right to:'],
    bullets: [
      'Access and update your personal data within the app or by contacting us.',
      'Request deletion of your account and data (unless prevented by law).',
      'Object to processing of your data or withdraw consent where applicable.',
      'File a complaint with the competent authority in the Kingdom if you believe your rights have been violated.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'The service is intended for adults (18+) or those booking with parental consent.',
      'We do not knowingly collect data from children below the legal age.',
    ],
  },
  {
    title: 'Local storage and cookies',
    paragraphs: [
      'The app may store your preferences locally on your device (such as selected branch) for convenience.',
      'We do not use third-party advertising cookies in the app.',
      'The website may use technical local storage to operate the service (such as sign-in session).',
    ],
  },
  {
    title: 'External links',
    paragraphs: [
      'The app may contain links to external services (such as WhatsApp, Google Maps, social media).',
      'These services have their own privacy policies and we are not responsible for their practices.',
    ],
  },
  {
    title: 'Updates to this policy',
    paragraphs: [
      'We may update this privacy policy from time to time. We will publish the updated version on this page with a "last updated" date.',
      'Your continued use of the app or website after an update means you accept the updated policy.',
    ],
  },
  {
    title: 'Contact us',
    paragraphs: [
      `For any privacy inquiry or data deletion/correction request, email us at: ${EMAIL_OSAMA}`,
      'Or via the "Contact us" page on the website or mobile app.',
    ],
  },
]

export function getPrivacySections(locale: Locale): PrivacySection[] {
  return locale === 'en' ? sectionsEn : sectionsAr
}

export function getPrivacyLastUpdated(locale: Locale): string {
  return locale === 'en' ? 'July 12, 2026' : '12 يوليو 2026'
}
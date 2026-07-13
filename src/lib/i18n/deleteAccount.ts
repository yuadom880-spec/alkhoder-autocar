import { EMAIL_OSAMA } from '../constants'
import type { Locale } from '../i18n'

type DeleteAccountSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

type DeleteAccountContent = {
  eyebrow: string
  title: string
  appLabel: string
  contactHint: string
  privacyLink: string
  backHome: string
  sections: DeleteAccountSection[]
}

const ar: DeleteAccountContent = {
  eyebrow: 'حذف الحساب والبيانات',
  title: 'طلب حذف حسابك — الخضر لتأجير السيارات',
  appLabel: 'التطبيق',
  contactHint: 'للمساعدة في حذف الحساب أو تصحيح البيانات',
  privacyLink: 'سياسة الخصوصية',
  backHome: 'العودة للرئيسية',
  sections: [
    {
      title: 'من نحن',
      paragraphs: [
        'هذه الصفحة خاصة بتطبيق وموقع الخضر لتأجير السيارات (شركة عبدالمجيد الخضر لتأجير السيارات).',
        'يمكنك حذف حسابك وبياناتك الشخصية بنفسك دون الحاجة للتواصل معنا.',
      ],
    },
    {
      title: 'كيف تحذف حسابك من التطبيق',
      bullets: [
        'افتح تطبيق «الخضر لتأجير السيارات» وسجّل الدخول.',
        'اضغط أيقونة الحساب في الشريط العلوي.',
        'اختر «حذف الحساب».',
        'أكّد الحذف بالضغط على «نعم، احذف حسابي».',
      ],
    },
    {
      title: 'كيف تحذف حسابك من الموقع',
      bullets: [
        'ادخل إلى alkhodercar.com وسجّل الدخول.',
        'افتح قائمة الحساب من الشريط العلوي.',
        'اختر «حذف الحساب» ثم أكّد الحذف.',
      ],
    },
    {
      title: 'البيانات التي تُحذف',
      paragraphs: ['عند تأكيد الحذف، نزيل من أنظمتنا:'],
      bullets: [
        'الاسم الكامل المرتبط بالحساب.',
        'عنوان البريد الإلكتروني.',
        'كلمة المرور وبيانات تسجيل الدخول.',
        'ملف المستخدم الشخصي في التطبيق والموقع.',
      ],
    },
    {
      title: 'البيانات التي قد نحتفظ بها',
      paragraphs: [
        'قد نحتفظ بسجلات الحجوزات السابقة لأغراض تشغيلية ومحاسبية وفق سياسات الشركة والأنظمة السعودية، لكن دون ربطها بحسابك بعد الحذف.',
        'قد نحتفظ بسجلات تقنية أو أمنية لفترة محدودة عند الضرورة القانونية أو لمنع الاحتيال.',
      ],
    },
    {
      title: 'طلب الحذف بالبريد الإلكتروني',
      paragraphs: [
        `إذا لم تتمكن من الدخول إلى حسابك، يمكنك طلب الحذف عبر البريد: ${EMAIL_OSAMA}`,
        'اذكر في رسالتك البريد الإلكتروني المسجّل في الحساب. نرد خلال 7 أيام عمل وننفّذ الحذف عند التحقق من هويتك.',
      ],
    },
  ],
}

const en: DeleteAccountContent = {
  eyebrow: 'Account & data deletion',
  title: 'Request account deletion — Alkhoder Car Rental',
  appLabel: 'App',
  contactHint: 'Need help deleting your account or correcting your data?',
  privacyLink: 'Privacy policy',
  backHome: 'Back to home',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        'This page is for the Alkhoder Car Rental mobile app and website (Abdulmjeed Alkhoder Car Rental Company).',
        'You can delete your account and personal data yourself without contacting us.',
      ],
    },
    {
      title: 'How to delete your account in the app',
      bullets: [
        'Open the Alkhoder Car Rental app and sign in.',
        'Tap the account icon in the top bar.',
        'Select "Delete account".',
        'Confirm by tapping "Yes, delete my account".',
      ],
    },
    {
      title: 'How to delete your account on the website',
      bullets: [
        'Go to alkhodercar.com and sign in.',
        'Open the account menu in the top bar.',
        'Select "Delete account" and confirm.',
      ],
    },
    {
      title: 'Data that is deleted',
      paragraphs: ['When you confirm deletion, we remove from our systems:'],
      bullets: [
        'Full name linked to the account.',
        'Email address.',
        'Password and sign-in credentials.',
        'Your user profile in the app and website.',
      ],
    },
    {
      title: 'Data we may retain',
      paragraphs: [
        'We may keep past booking records for operational and accounting purposes under company policies and Saudi regulations, but they are unlinked from your account after deletion.',
        'We may retain limited technical or security logs when required by law or to prevent fraud.',
      ],
    },
    {
      title: 'Request deletion by email',
      paragraphs: [
        `If you cannot access your account, email us at: ${EMAIL_OSAMA}`,
        'Include the email address registered on your account. We respond within 7 business days and complete deletion after verifying your identity.',
      ],
    },
  ],
}

export function getDeleteAccountContent(locale: Locale): DeleteAccountContent {
  return locale === 'en' ? en : ar
}

export const DELETE_ACCOUNT_URL = 'https://alkhodercar.com/delete-account'
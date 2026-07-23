import { copy } from './copy'

export function formatAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes('not_authenticated')) {
      return copy.customerAuth.errors.notAuthenticated
    }
    if (msg.includes('admin_cannot_delete_via_app')) {
      return copy.customerAuth.errors.adminCannotDelete
    }
    if (msg.includes('account_not_found')) {
      return copy.customerAuth.errors.accountNotFound
    }
    if (
      msg.includes('delete_customer_account') &&
      (msg.includes('schema cache') || msg.includes('Could not find'))
    ) {
      return copy.customerAuth.errors.deleteNotEnabled
    }
    if (
      msg.includes('Invalid login credentials') ||
      msg.toLowerCase().includes('invalid login')
    ) {
      return copy.customerAuth.errors.loginFailed
    }
    if (msg.includes('User already registered')) {
      return copy.customerAuth.errors.alreadyRegistered
    }
    if (
      msg.includes('Email not confirmed') ||
      msg.toLowerCase().includes('email not confirmed') ||
      msg.toLowerCase().includes('not confirmed') ||
      msg.includes('تأكيد بريدك')
    ) {
      return copy.customerAuth.errors.emailNotConfirmed
    }
    if (
      msg.includes('email rate limit exceeded') ||
      msg.includes('over_email_send_rate_limit') ||
      msg.includes('429')
    ) {
      return copy.locale === 'en'
        ? 'Email send limit exceeded — wait about an hour or enable custom SMTP in Supabase'
        : 'تم تجاوز حد إرسال الإيميلات (إيميلان فقط في الساعة بدون SMTP مخصص). انتظر نحو ساعة ثم جرّب مرة واحدة — أو فعّل Resend SMTP في Supabase → Authentication → Email → SMTP'
    }
    if (msg.includes('schema cache') || msg.includes('Could not find the table')) {
      return copy.locale === 'en'
        ? 'Database is not ready — run supabase/schema.sql in SQL Editor'
        : 'قاعدة البيانات غير جاهزة — شغّل supabase/schema.sql في SQL Editor'
    }
    if (msg.includes('row-level security') && msg.includes('profiles')) {
      return copy.locale === 'en'
        ? 'Could not save account data — verify your email with the code sent, then try again'
        : 'تعذّر حفظ بيانات الحساب — أكّد بريدك بالكود المرسل ثم حاول مرة أخرى'
    }
    if (msg) return msg
  }
  return copy.locale === 'en'
    ? 'An unexpected error occurred — please try again'
    : 'صار خطأ غير متوقع — حاول مرة ثانية'
}
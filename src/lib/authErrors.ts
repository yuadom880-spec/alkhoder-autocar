export function formatAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes('Invalid login credentials')) {
      return 'البريد أو كلمة المرور غير صحيحة'
    }
    if (msg.includes('User already registered')) {
      return 'هذا البريد مسجّل مسبقاً — سجّل دخولك'
    }
    if (msg.includes('Email not confirmed')) {
      return 'يجب تأكيد بريدك أولاً — أدخل كود التحقق المرسل لإيميلك'
    }
    if (
      msg.includes('email rate limit exceeded') ||
      msg.includes('over_email_send_rate_limit') ||
      msg.includes('429')
    ) {
      return 'تم تجاوز حد إرسال الإيميلات (إيميلان فقط في الساعة بدون SMTP مخصص). انتظر نحو ساعة ثم جرّب مرة واحدة — أو فعّل Resend SMTP في Supabase → Authentication → Email → SMTP'
    }
    if (msg.includes('schema cache') || msg.includes('Could not find the table')) {
      return 'قاعدة البيانات غير جاهزة — شغّل supabase/schema.sql في SQL Editor'
    }
    if (msg.includes('row-level security') && msg.includes('profiles')) {
      return 'تعذّر حفظ بيانات الحساب — أكّد بريدك بالكود المرسل ثم حاول مرة أخرى'
    }
    if (msg) return msg
  }
  return 'صار خطأ غير متوقع — حاول مرة ثانية'
}
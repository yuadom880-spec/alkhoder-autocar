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
      return 'تم تجاوز حد إرسال الإيميلات — انتظر ساعة أو فعّل SMTP مخصص (Resend) في Supabase → Authentication → SMTP'
    }
    if (msg.includes('profiles') || msg.includes('schema cache')) {
      return 'قاعدة البيانات غير جاهزة — شغّل supabase/schema.sql في SQL Editor'
    }
    if (msg) return msg
  }
  return 'صار خطأ غير متوقع — حاول مرة ثانية'
}
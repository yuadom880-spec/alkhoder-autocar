/** بيانات دخول لوحة الإدارة (جوال + كلمة المرور) */
export const ADMIN_PHONE = '0554032228'
export const ADMIN_PASSWORD = '090909a'

/** حساب Supabase الداخلي — للوصول لقاعدة البيانات */
export const ADMIN_EMAIL = 'yuadom880@gmail.com'
/** كلمة مرور حساب Supabase (مختلفة عن كلمة مرور الواجهة) */
export const SUPABASE_ADMIN_PASSWORD = '090909'

const ADMIN_SESSION_KEY = 'alkhoder_admin_session'
const ADMIN_PHONE_KEY = 'alkhoder_admin_phone'

function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

export function formatAdminPhone(phone: string): string {
  const digits = normalizePhoneDigits(phone)
  return digits ? `0${digits}` : ''
}

export function validateAdminCredentials(phone: string, password: string): boolean {
  return (
    normalizePhoneDigits(phone) === normalizePhoneDigits(ADMIN_PHONE) &&
    password === ADMIN_PASSWORD
  )
}

export function setAdminSession(phone: string) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
  sessionStorage.setItem(ADMIN_PHONE_KEY, formatAdminPhone(phone))
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
  sessionStorage.removeItem(ADMIN_PHONE_KEY)
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function getAdminPhone(): string | null {
  return sessionStorage.getItem(ADMIN_PHONE_KEY)
}

/** @deprecated استخدم الدوال الجديدة */
export const setDemoAdminSession = setAdminSession
export const clearDemoAdminSession = clearAdminSession
export const isDemoAdminSession = isAdminSession
export const getDemoAdminPhone = getAdminPhone
/** بيانات دخول لوحة الإدارة (اسم المستخدم + كلمة المرور) */
export const ADMIN_USERNAME = 'kho2er22'
export const ADMIN_PASSWORD = '29985319'

/** حساب Supabase الداخلي — للوصول لقاعدة البيانات */
export const ADMIN_EMAIL = 'yuadom880@gmail.com'
/** كلمة مرور حساب Supabase (مختلفة عن كلمة مرور الواجهة) */
export const SUPABASE_ADMIN_PASSWORD = '090909'

const ADMIN_SESSION_KEY = 'alkhoder_admin_session'
const ADMIN_USERNAME_KEY = 'alkhoder_admin_username'

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return (
    normalizeUsername(username) === normalizeUsername(ADMIN_USERNAME) &&
    password === ADMIN_PASSWORD
  )
}

export function setAdminSession(username: string) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
  sessionStorage.setItem(ADMIN_USERNAME_KEY, normalizeUsername(username))
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
  sessionStorage.removeItem(ADMIN_USERNAME_KEY)
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function getAdminUsername(): string | null {
  return sessionStorage.getItem(ADMIN_USERNAME_KEY)
}

/** @deprecated استخدم getAdminUsername */
export const getAdminPhone = getAdminUsername

/** @deprecated استخدم ADMIN_USERNAME */
export const ADMIN_PHONE = ADMIN_USERNAME

/** @deprecated استخدم setAdminSession */
export const setDemoAdminSession = setAdminSession
/** @deprecated استخدم clearAdminSession */
export const clearDemoAdminSession = clearAdminSession
/** @deprecated استخدم isAdminSession */
export const isDemoAdminSession = isAdminSession
/** @deprecated استخدم getAdminUsername */
export const getDemoAdminPhone = getAdminUsername
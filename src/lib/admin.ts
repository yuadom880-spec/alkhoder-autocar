/** لوحة الإدارة العامة — دخول لكل الفروع */
export const GENERAL_ADMIN_USERNAME = '0554032228'
export const GENERAL_ADMIN_PASSWORD = '20998366'

/** حساب Supabase الداخلي — للوصول لقاعدة البيانات */
export const ADMIN_EMAIL = 'yuadom880@gmail.com'
/** كلمة مرور حساب Supabase (مختلفة عن كلمة مرور الواجهة) */
export const SUPABASE_ADMIN_PASSWORD = '090909'

export type AdminRole = 'general' | 'branch'

const ADMIN_SESSION_KEY = 'alkhoder_admin_session'
const ADMIN_USERNAME_KEY = 'alkhoder_admin_username'
const ADMIN_ROLE_KEY = 'alkhoder_admin_role'
const ADMIN_BRANCH_ID_KEY = 'alkhoder_admin_branch_id'

export function normalizeAdminPhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function validateGeneralAdminCredentials(username: string, password: string): boolean {
  return (
    normalizeAdminPhone(username) === normalizeAdminPhone(GENERAL_ADMIN_USERNAME) &&
    password === GENERAL_ADMIN_PASSWORD
  )
}

export function setAdminSession(
  username: string,
  role: AdminRole = 'general',
  branchId: string | null = null,
) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
  sessionStorage.setItem(
    ADMIN_USERNAME_KEY,
    normalizeAdminPhone(username) || username.trim().toLowerCase(),
  )
  sessionStorage.setItem(ADMIN_ROLE_KEY, role)
  if (role === 'branch' && branchId) {
    sessionStorage.setItem(ADMIN_BRANCH_ID_KEY, branchId)
  } else {
    sessionStorage.removeItem(ADMIN_BRANCH_ID_KEY)
  }
  sessionStorage.removeItem('alkhoder_admin_branch_mode')
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
  sessionStorage.removeItem(ADMIN_USERNAME_KEY)
  sessionStorage.removeItem(ADMIN_ROLE_KEY)
  sessionStorage.removeItem(ADMIN_BRANCH_ID_KEY)
  sessionStorage.removeItem('alkhoder_admin_branch_mode')
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function getAdminRole(): AdminRole {
  return sessionStorage.getItem(ADMIN_ROLE_KEY) === 'branch' ? 'branch' : 'general'
}

export function getAdminBranchId(): string | null {
  return sessionStorage.getItem(ADMIN_BRANCH_ID_KEY)
}

export function getAdminUsername(): string | null {
  return sessionStorage.getItem(ADMIN_USERNAME_KEY)
}

export function isGeneralAdminSession(): boolean {
  return isAdminSession() && getAdminRole() === 'general'
}

/** @deprecated استخدم validateGeneralAdminCredentials */
export function validateAdminCredentials(username: string, password: string): boolean {
  return validateGeneralAdminCredentials(username, password)
}

/** @deprecated استخدم GENERAL_ADMIN_USERNAME */
export const ADMIN_USERNAME = GENERAL_ADMIN_USERNAME
/** @deprecated استخدم GENERAL_ADMIN_PASSWORD */
export const ADMIN_PASSWORD = GENERAL_ADMIN_PASSWORD

/** @deprecated استخدم getAdminUsername */
export const getAdminPhone = getAdminUsername
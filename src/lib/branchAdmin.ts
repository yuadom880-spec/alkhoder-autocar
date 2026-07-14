import { normalizeAdminPhone } from './admin'

/** حساب موظف فرع — رقم جوال + رقم سري + معرّف الفرع في Supabase */
export interface BranchAdminAccount {
  branchId: string
  phone: string
  password: string
  label?: string
}

/**
 * بيانات دخول موظفي الفروع — يُحدَّث عند استلام الأرقام من الشركة.
 * كل موظف يدخل برقم جواله ورقم سري خاص بفرعه فقط.
 */
export const BRANCH_ADMIN_ACCOUNTS: BranchAdminAccount[] = [
  // مثال:
  // { branchId: 'uuid-here', phone: '05xxxxxxxx', password: 'xxxxxxxx', label: 'فرع المطار' },
]

export function validateBranchAdminCredentials(
  phone: string,
  password: string,
): BranchAdminAccount | null {
  const normalized = normalizeAdminPhone(phone)
  return (
    BRANCH_ADMIN_ACCOUNTS.find(
      (account) =>
        normalizeAdminPhone(account.phone) === normalized && account.password === password,
    ) ?? null
  )
}
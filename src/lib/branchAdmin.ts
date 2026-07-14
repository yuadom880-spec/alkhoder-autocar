import { normalizeAdminPhone } from './admin'
import { fetchBranches, isSupabaseConfigured } from './supabase'
import type { BranchRecord } from './types'

/** حساب موظف فرع — رقم جوال + رقم سري */
export interface BranchAdminAccount {
  phone: string
  password: string
  label: string
  /** للتطوير المحلي — معرّف ثابت من DEMO_BRANCHES */
  demoBranchId: string
  /** كلمات للمطابقة مع اسم/عنوان/مدينة الفرع في Supabase */
  nameHints: string[]
}

/**
 * بيانات دخول موظفي الفروع.
 * كل موظف يدخل برقم جواله ورقم سري خاص بفرعه فقط.
 */
export const BRANCH_ADMIN_ACCOUNTS: BranchAdminAccount[] = [
  {
    phone: '0504590002',
    password: '0357889',
    label: 'الفرع الرئيسي — طريق المطار',
    demoBranchId: 'branch-1',
    nameHints: ['الرئيسي', 'طريق المطار', 'المطار'],
  },
  {
    phone: '0555887324',
    password: '0357996',
    label: 'فرع المدينة طريق المطار 2',
    demoBranchId: 'branch-2',
    nameHints: ['المطار 2', 'مطار 2', 'طريق المطار 2'],
  },
  {
    phone: '0531188874',
    password: '0357559',
    label: 'فرع المدينة سلطانة',
    demoBranchId: 'branch-3',
    nameHints: ['سلطانة', 'سلطانه'],
  },
  {
    phone: '0556663589',
    password: '0357338',
    label: 'فرع المدينة العالية',
    demoBranchId: 'branch-4',
    nameHints: ['العالية'],
  },
  {
    phone: '0530021333',
    password: '0357446',
    label: 'فرع المدينة العزيزية',
    demoBranchId: 'branch-5',
    nameHints: ['العزيزية', 'العزيزيه'],
  },
  {
    phone: '0555803622',
    password: '0357994',
    label: 'فرع المدينة الحزام',
    demoBranchId: 'branch-9',
    nameHints: ['الحزام'],
  },
  {
    phone: '0555886210',
    password: '0357225',
    label: 'فرع ضباء',
    demoBranchId: 'branch-7',
    nameHints: ['ضباء', 'ضبا'],
  },
  {
    phone: '0555886412',
    password: '0357337',
    label: 'فرع تبوك',
    demoBranchId: 'branch-8',
    nameHints: ['تبوك'],
  },
  {
    phone: '0553357178',
    password: '0357229',
    label: 'فرع ينبع',
    demoBranchId: 'branch-6',
    nameHints: ['ينبع'],
  },
  {
    phone: '0530200772',
    password: '0357661',
    label: 'فرع مكة طريث الليث',
    demoBranchId: 'branch-10',
    nameHints: ['طريث الليث', 'طريث', 'الليث'],
  },
  {
    phone: '0568672067',
    password: '0537116',
    label: 'فرع مكة طريق التنعيم',
    demoBranchId: 'branch-11',
    nameHints: ['طريق التنعيم', 'التنعيم', 'تنعيم'],
  },
  {
    phone: '0537010809',
    password: '0537220',
    label: 'فرع الطائف',
    demoBranchId: 'branch-12',
    nameHints: ['الطائف', 'طائف'],
  },
  {
    phone: '0544126050',
    password: '0537330',
    label: 'فرع أملج',
    demoBranchId: 'branch-13',
    nameHints: ['أملج', 'املج'],
  },
]

function normalizeBranchPhone(value: string | null | undefined): string {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

function branchMatchesHints(branch: BranchRecord, hints: string[]): boolean {
  const haystack = `${branch.name} ${branch.address} ${branch.city}`.toLowerCase()
  return hints.some((hint) => haystack.includes(hint.toLowerCase()))
}

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

/** ربط حساب موظف الفرع بمعرّف الفرع الفعلي في قاعدة البيانات */
export async function resolveBranchIdForAccount(
  account: BranchAdminAccount,
): Promise<string | null> {
  const branches = await fetchBranches({ activeOnly: true })

  const phoneNorm = normalizeAdminPhone(account.phone)
  const byPhone = branches.find(
    (b) => normalizeBranchPhone(b.phone) === phoneNorm,
  )
  if (byPhone) return byPhone.id

  const byDemoId = branches.find((b) => b.id === account.demoBranchId)
  if (byDemoId && branchMatchesHints(byDemoId, account.nameHints)) {
    return byDemoId.id
  }

  const hintMatches = branches.filter((b) => branchMatchesHints(b, account.nameHints))
  if (hintMatches.length === 1) return hintMatches[0].id

  if (hintMatches.length > 1) {
    const sorted = [...hintMatches].sort((a, b) => {
      const aScore = account.nameHints.filter((h) => branchMatchesHints(a, [h])).length
      const bScore = account.nameHints.filter((h) => branchMatchesHints(b, [h])).length
      return bScore - aScore
    })
    return sorted[0].id
  }

  if (!isSupabaseConfigured && byDemoId) return byDemoId.id

  return null
}
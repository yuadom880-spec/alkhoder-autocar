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
  /** معرّف الفرع الفعلي في Supabase (الإنتاج) */
  supabaseBranchId: string
  /** كلمات للمطابقة الاحتياطية مع اسم/عنوان/مدينة الفرع */
  nameHints: string[]
}

/**
 * بيانات دخول موظفي الفروع — 12 فرع + الإدارة العامة منفصلة في admin.ts
 */
export const BRANCH_ADMIN_ACCOUNTS: BranchAdminAccount[] = [
  {
    phone: '0504590002',
    password: '0357889',
    label: 'الفرع الرئيسي — طريق المطار',
    demoBranchId: 'branch-1',
    supabaseBranchId: '730ab6d5-425c-4156-a87a-5b7938791f59',
    nameHints: ['الرئيسي', 'طريق المطار', 'المطار'],
  },
  {
    phone: '0555887324',
    password: '0357996',
    label: 'فرع المدينة طريق المطار 2',
    demoBranchId: 'branch-2',
    supabaseBranchId: '41b84920-8cff-4ca6-bbdd-a0039c6f7912',
    nameHints: ['المطار 2', 'مطار 2', 'طريق المطار 2'],
  },
  {
    phone: '0531188874',
    password: '0357559',
    label: 'فرع المدينة سلطانة',
    demoBranchId: 'branch-3',
    supabaseBranchId: 'f8290af8-64f8-4cf1-94c4-696c48ec32ea',
    nameHints: ['سلطانة', 'سلطانه'],
  },
  {
    phone: '0556663589',
    password: '0357338',
    label: 'فرع المدينة العالية',
    demoBranchId: 'branch-4',
    supabaseBranchId: 'a131325e-52de-4f81-9081-f66a7a752c12',
    nameHints: ['العالية'],
  },
  {
    phone: '0530021333',
    password: '0357446',
    label: 'فرع المدينة العزيزية',
    demoBranchId: 'branch-5',
    supabaseBranchId: '114457ce-7f02-4920-98fe-55080dc748cb',
    nameHints: ['العزيزية', 'العزيزيه'],
  },
  {
    phone: '0555803622',
    password: '0357994',
    label: 'فرع المدينة الحزام',
    demoBranchId: 'branch-9',
    supabaseBranchId: '19cd32a5-ed45-494d-817c-8817e9396fc7',
    nameHints: ['الحزام'],
  },
  {
    phone: '0555886210',
    password: '0357225',
    label: 'فرع ضباء',
    demoBranchId: 'branch-7',
    supabaseBranchId: '375449d5-befa-4cdb-93db-14cce3b28dd5',
    nameHints: ['ضباء', 'ضبا'],
  },
  {
    phone: '0555886412',
    password: '0357337',
    label: 'فرع تبوك',
    demoBranchId: 'branch-8',
    supabaseBranchId: 'b7959a76-8199-480f-91da-2c446db7a0a5',
    nameHints: ['تبوك'],
  },
  {
    phone: '0553357178',
    password: '0357229',
    label: 'فرع ينبع',
    demoBranchId: 'branch-6',
    supabaseBranchId: '483ba7f0-1795-48a1-ab62-7dd85d791f04',
    nameHints: ['ينبع'],
  },
  {
    phone: '0530200772',
    password: '0357661',
    label: 'فرع مكة طريث الليث',
    demoBranchId: 'branch-10',
    supabaseBranchId: '3af72c7e-b69b-486c-a213-31685fe71747',
    nameHints: ['طريق الليث', 'طريث', 'الليث', 'مكة'],
  },
  {
    phone: '0568672067',
    password: '0537116',
    label: 'فرع مكة طريق التنعيم',
    demoBranchId: 'branch-11',
    supabaseBranchId: '9cb07de6-0bd6-4681-9b7d-ed585bf602bd',
    nameHints: ['طريق التنعيم', 'التنعيم', 'تنعيم', 'مكة'],
  },
  {
    phone: '0537010809',
    password: '0537220',
    label: 'فرع الطائف',
    demoBranchId: 'branch-12',
    supabaseBranchId: 'a044a3e3-77d1-411c-aa29-09e445983092',
    nameHints: ['الطائف', 'طائف'],
  },
  {
    phone: '0544126050',
    password: '0537330',
    label: 'فرع أملج',
    demoBranchId: 'branch-13',
    supabaseBranchId: '177de678-1fc8-46e6-b201-a90227468815',
    nameHints: ['أملج', 'املج'],
  },
]

/** يزيل أحرف الاتجاه الخفية وأي شيء غير رقمي من رقم الجوال */
export function normalizeBranchPhone(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/\D/g, '')
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
  if (isSupabaseConfigured) {
    return account.supabaseBranchId
  }

  const branches = await fetchBranches({ activeOnly: true })

  const phoneNorm = normalizeAdminPhone(account.phone)
  const byPhone = branches.find((b) => normalizeBranchPhone(b.phone) === phoneNorm)
  if (byPhone) return byPhone.id

  const byDemoId = branches.find((b) => b.id === account.demoBranchId)
  if (byDemoId) return byDemoId.id

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

  return null
}
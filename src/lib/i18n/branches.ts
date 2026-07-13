import type { BranchRecord } from '../types'
import type { Locale } from './index'

const CITY_EN: Record<string, string> = {
  'المدينة المنورة': 'Madinah',
  'مكة المكرمة': 'Makkah',
  مكة: 'Makkah',
  جدة: 'Jeddah',
  الرياض: 'Riyadh',
  الطائف: 'Taif',
  ينبع: 'Yanbu',
  ضباء: 'Duba',
  تبوك: 'Tabuk',
  'الدمام والخبر': 'Dammam & Khobar',
  الدمام: 'Dammam',
  الخبر: 'Khobar',
  الهفوف: 'Hofuf',
  الثقبة: 'Thuqbah',
  بريدة: 'Buraidah',
  حائل: 'Hail',
  الخفجي: 'Khafji',
  البكيرية: 'Al Bukayriyah',
  أملج: 'Umluj',
  'خميس مشيط': 'Khamis Mushait',
  بيشة: 'Bisha',
  محايل: 'Mahayil',
  جازان: 'Jazan',
  'أبو عريش': 'Abu Arish',
  نجران: 'Najran',
  عرعر: 'Arar',
  رفحاء: 'Rafha',
  سكاكا: 'Sakaka',
  'صناعية السليم': 'Industrial Sulayy',
}

const ADDRESS_EN: Record<string, string> = {
  'طريق المطار': 'Airport Road',
  'طريق سلطانه': 'Sultanah Road',
  العالية: 'Al Awali',
  العزيزية: 'Al Aziziyah',
}

const BRANCH_NAME_EN: Record<string, string> = {
  'الفرع الرئيسي': 'Main branch',
  'فرع طريق المطار 2': 'Airport Road branch 2',
  'فرع طريق سلطانه': 'Sultanah Road branch',
  'فرع العالية': 'Al Awali branch',
  'فرع العزيزية': 'Al Aziziyah branch',
  'فرع ينبع': 'Yanbu branch',
  'فرع ضباء': 'Duba branch',
  'فرع تبوك': 'Tabuk branch',
}

function translateToken(value: string, locale: Locale): string {
  if (locale === 'ar') return value
  const trimmed = value.trim()
  return CITY_EN[trimmed] ?? ADDRESS_EN[trimmed] ?? trimmed
}

export function translateBranchCity(city: string, locale: Locale): string {
  return translateToken(city, locale)
}

export function translateBranchAddress(address: string, locale: Locale): string {
  if (locale === 'ar') return address
  const trimmed = address.trim()
  if (ADDRESS_EN[trimmed]) return ADDRESS_EN[trimmed]
  if (CITY_EN[trimmed]) return CITY_EN[trimmed]
  return trimmed
}

export function translateBranchName(name: string, locale: Locale): string {
  if (locale === 'ar') return name
  const trimmed = name.trim()
  if (BRANCH_NAME_EN[trimmed]) return BRANCH_NAME_EN[trimmed]
  if (trimmed === 'الفرع الرئيسي') return 'Main branch'

  const branchMatch = trimmed.match(/^فرع\s+(.+)$/)
  if (branchMatch) {
    const part = translateToken(branchMatch[1], locale)
    return `${part} branch`
  }

  return trimmed
}

export function getBranchDisplay(
  branch: Pick<BranchRecord, 'name' | 'city'> & { address?: string },
  locale: Locale,
): { name: string; city: string; address: string } {
  return {
    name: translateBranchName(branch.name, locale),
    city: translateBranchCity(branch.city, locale),
    address: branch.address ? translateBranchAddress(branch.address, locale) : '',
  }
}

export function formatBranchOption(
  branch: Pick<BranchRecord, 'name' | 'city'>,
  locale: Locale,
): string {
  const name = translateBranchName(branch.name, locale)
  const city = translateBranchCity(branch.city, locale)
  return `${name} — ${city}`
}
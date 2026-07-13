import type { CarCategory, CarClass } from '../types'
import { getCopy, type Locale } from './index'

const LEGACY_CATEGORY_AR: Record<string, string> = {
  economy: 'سيدان',
  family: 'SUV',
  luxury: 'SUV',
  sports: 'سيدان',
}

const SPEC_TRANSLATIONS: Record<string, string> = {
  أوتوماتيك: 'Automatic',
  اوتوماتيك: 'Automatic',
  'أوتوماتيكي': 'Automatic',
  يدوي: 'Manual',
  'يدوي ': 'Manual',
  بنزين: 'Petrol',
  ديزل: 'Diesel',
  هجين: 'Hybrid',
  كهربائي: 'Electric',
  automatic: 'Automatic',
  manual: 'Manual',
  petrol: 'Petrol',
  gasoline: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  electric: 'Electric',
}

const AR_HOURS_PATTERNS = ['السبت', 'الخميس', 'الجمعة', 'ص -', 'م |']

export function getCategoryLabel(category: string, locale: Locale): string {
  const labels = getCopy(locale).carLabels.categories
  return labels[category as CarCategory] ?? LEGACY_CATEGORY_AR[category] ?? category
}

export function getClassLabel(carClass: string, locale: Locale): string {
  const labels = getCopy(locale).carLabels.classes
  return labels[carClass as CarClass] ?? carClass
}

export function translateCarSpec(value: string, locale: Locale): string {
  if (locale === 'ar') return value
  const trimmed = value.trim()
  return SPEC_TRANSLATIONS[trimmed] ?? trimmed
}

export function formatBranchHours(hours: string, locale: Locale): string {
  if (locale === 'ar') return hours
  const isArabicHours = AR_HOURS_PATTERNS.some((p) => hours.includes(p))
  if (isArabicHours) return getCopy('en').branch.hours
  return hours
}

export function getMainBranchDisplay(locale: Locale) {
  const c = getCopy(locale).branch
  return {
    address: c.mainAddress,
    city: c.mainCity,
    hours: c.hours,
    phoneLabel: c.mainPhoneLabel,
  }
}
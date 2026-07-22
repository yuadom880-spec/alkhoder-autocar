import { formatDisplayPhone, toWhatsAppDigits } from './phone'
import { getActiveLocale, type Locale } from './i18n'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(amount: number, locale?: Locale): string {
  const loc = locale ?? getActiveLocale()
  const rounded = Math.round(amount * 100) / 100
  if (loc === 'en') {
    return `SAR ${rounded.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  return `${rounded.toLocaleString('ar-SA')} ر.س`
}

/** تحليل تاريخ YYYY-MM-DD أو ISO بدون إزاحة يوم بسبب UTC */
function parseDateInput(date: string): Date {
  const dayOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim())
  if (dayOnly && !date.includes('T')) {
    const y = Number(dayOnly[1])
    const m = Number(dayOnly[2]) - 1
    const d = Number(dayOnly[3])
    return new Date(y, m, d, 12, 0, 0)
  }
  // created_at ISO — نستخدم التاريخ المحلي للعرض
  const parsed = new Date(date)
  return parsed
}

/**
 * تنسيق التاريخ للعرض — ميلادي دائماً (عربي أو إنجليزي).
 * ar-SA بدون calendar يتبع إعدادات المتصفح فيظهر هجري أحياناً وميلادي أحياناً.
 */
export function formatDate(date: string, locale?: Locale): string {
  const loc = locale ?? getActiveLocale()
  const d = parseDateInput(date)
  if (Number.isNaN(d.getTime())) return date

  if (loc === 'en') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // gregory = ميلادي دائماً — أسماء الأشهر عربية (يوليو، أغسطس…)
  return d.toLocaleDateString('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calcDays(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function calcTotalPrice(pricePerDay: number, start: string, end: string): number {
  return pricePerDay * calcDays(start, end)
}

/** تحويل رقم دولي لرابط واتساب */
export function toWhatsAppLink(phone: string, message?: string): string {
  const intl = toWhatsAppDigits(phone)
  const base = `https://wa.me/${intl}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function toPhoneLink(phone: string): string {
  return `tel:${formatDisplayPhone(phone)}`
}
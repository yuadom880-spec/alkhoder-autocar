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

export function formatDate(date: string, locale?: Locale): string {
  const loc = locale ?? getActiveLocale()
  return new Date(date).toLocaleDateString(loc === 'en' ? 'en-US' : 'ar-SA', {
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
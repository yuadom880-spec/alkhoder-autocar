import { formatDisplayPhone, toWhatsAppDigits } from './phone'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', {
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
import type { Car, RentalPeriodType } from './types'
import { getEffectivePrice } from './offers'
import { calcDays } from './utils'

export function parseRentalType(value: string | null | undefined): RentalPeriodType {
  return value === 'monthly' ? 'monthly' : 'daily'
}

export function defaultMonthlyPrice(dailyPrice: number): number {
  return Math.round(dailyPrice * 25)
}

export function getCarBasePrice(car: Car, rentalType: RentalPeriodType): number {
  if (rentalType === 'monthly') {
    return car.price_per_month ?? defaultMonthlyPrice(car.price_per_day)
  }
  return car.price_per_day
}

/** السعر المعروض للعميل مع تطبيق العروض حسب نوع الإيجار */
export function getCarDisplayPrice(car: Car, rentalType: RentalPeriodType): number {
  return getEffectivePrice(car, rentalType)
}

export function getPriceUnitLabel(rentalType: RentalPeriodType): string {
  return rentalType === 'monthly' ? '/ شهر' : '/ يوم'
}

export function getSortPrice(car: Car, rentalType: RentalPeriodType): number {
  return getCarDisplayPrice(car, rentalType)
}

/** إضافة أيام لتاريخ YYYY-MM-DD */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** إضافة أشهر تقويمية لتاريخ YYYY-MM-DD */
export function addCalendarMonths(start: string, months: number): string {
  const [y, m, d] = start.split('-').map(Number)
  const target = new Date(y, m - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  const day = Math.min(d, lastDay)
  const mm = String(target.getMonth() + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${target.getFullYear()}-${mm}-${dd}`
}

/** نهاية شهر إيجار واحد (نفس يوم البداية في الشهر التالي) */
export function endDateForOneCalendarMonth(start: string): string {
  return addCalendarMonths(start, 1)
}

/**
 * عدد أشهر الإيجار بين تاريخين (تقويمي — ليس × 30).
 * مثال: 10 يوليو → 10 أغسطس = شهر واحد | 10 يوليو → 11 أغسطس = شهران
 */
export function calcCalendarMonths(start: string, end: string): number {
  if (!start || !end || end < start) return 1
  let months = 1
  while (addCalendarMonths(start, months) < end) {
    months++
  }
  return months
}

/** @deprecated استخدم calcCalendarMonths */
export const calcMonths = calcCalendarMonths

export function calcBookingTotal(
  unitPrice: number,
  start: string,
  end: string,
  rentalType: RentalPeriodType,
): number {
  if (rentalType === 'monthly') {
    return unitPrice * calcCalendarMonths(start, end)
  }
  return unitPrice * calcDays(start, end)
}
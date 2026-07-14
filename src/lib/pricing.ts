import { copy } from './copy'
import type { Car, RentalPeriodType } from './types'
import { getCarDisplayName } from './carBranchLabels'
import {
  defaultMonthlyPrice,
  getCarBasePrice as resolveCarBasePrice,
} from './carBranchPricing'

export { getCarDisplayName }
import { getEffectivePrice } from './offers'
import { calcDays } from './utils'

export { defaultMonthlyPrice }

export function parseRentalType(value: string | null | undefined): RentalPeriodType {
  return value === 'monthly' ? 'monthly' : 'daily'
}

export function getCarBasePrice(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): number {
  return resolveCarBasePrice(car, rentalType, branchId)
}

/** السعر المعروض للعميل مع تطبيق العروض حسب نوع الإيجار والفرع */
export function getCarDisplayPrice(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): number {
  return getEffectivePrice(car, rentalType, branchId)
}

export function getPriceUnitLabel(rentalType: RentalPeriodType): string {
  return rentalType === 'monthly' ? copy.cars.perMonth : copy.cars.perDay
}

export function getSortPrice(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): number {
  return getCarDisplayPrice(car, rentalType, branchId)
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

export interface MonthlyRentalSplit {
  fullMonths: number
  extraDays: number
}

export interface MonthlyBookingBreakdown extends MonthlyRentalSplit {
  monthlyPrice: number
  dailyPrice: number
  monthlySubtotal: number
  dailySubtotal: number
  total: number
}

/**
 * تفكيك فترة الإيجار الشهري: أشهر تقويمية كاملة + أيام زيادة.
 * مثال: 10 يوليو → 13 أغسطس = شهر واحد + 3 أيام
 */
export function splitMonthlyRentalPeriod(start: string, end: string): MonthlyRentalSplit {
  if (!start || !end || end < start) return { fullMonths: 1, extraDays: 0 }

  let fullMonths = 0
  while (addCalendarMonths(start, fullMonths + 1) <= end) {
    fullMonths++
  }

  if (fullMonths === 0) {
    return { fullMonths: 0, extraDays: calcDays(start, end) }
  }

  const afterFullMonths = addCalendarMonths(start, fullMonths)
  if (afterFullMonths >= end) {
    return { fullMonths, extraDays: 0 }
  }

  return { fullMonths, extraDays: calcDays(afterFullMonths, end) }
}

/**
 * عدد الأشهر التقويمية الكاملة (بدون احتساب الأيام الزائدة كشهر كامل).
 * مثال: 10 يوليو → 13 أغسطس = 1 | 10 يوليو → 10 أغسطس = 1
 */
export function calcCalendarMonths(start: string, end: string): number {
  return splitMonthlyRentalPeriod(start, end).fullMonths
}

/** @deprecated استخدم calcCalendarMonths */
export const calcMonths = calcCalendarMonths

export function calcMonthlyBookingBreakdown(
  monthlyPrice: number,
  dailyPrice: number,
  start: string,
  end: string,
): MonthlyBookingBreakdown {
  const { fullMonths, extraDays } = splitMonthlyRentalPeriod(start, end)
  const monthlySubtotal = monthlyPrice * fullMonths
  const dailySubtotal = dailyPrice * extraDays
  return {
    fullMonths,
    extraDays,
    monthlyPrice,
    dailyPrice,
    monthlySubtotal,
    dailySubtotal,
    total: monthlySubtotal + dailySubtotal,
  }
}

export function calcBookingTotal(
  unitPrice: number,
  start: string,
  end: string,
  rentalType: RentalPeriodType,
  dailyPrice?: number,
): number {
  if (rentalType === 'monthly') {
    const dayPrice = dailyPrice ?? unitPrice
    return calcMonthlyBookingBreakdown(unitPrice, dayPrice, start, end).total
  }
  return unitPrice * calcDays(start, end)
}
import type { Car, RentalPeriodType } from './types'
import { getEffectivePrice } from './offers'
import { calcDays } from './utils'

export const DAYS_PER_MONTH = 30

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

export function calcMonths(start: string, end: string): number {
  return Math.max(1, Math.ceil(calcDays(start, end) / DAYS_PER_MONTH))
}

export function calcBookingTotal(
  unitPrice: number,
  start: string,
  end: string,
  rentalType: RentalPeriodType,
): number {
  if (rentalType === 'monthly') {
    return unitPrice * calcMonths(start, end)
  }
  return unitPrice * calcDays(start, end)
}
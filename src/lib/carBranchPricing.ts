import { inferOfferBranchId } from './branchFilter'
import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { getBranchProfile, resolveCarForBranch } from './carBranchProfile'
import type { BranchCarPrice, Car, CarBranchPrices, RentalPeriodType } from './types'

export function defaultMonthlyPrice(dailyPrice: number): number {
  return Math.round(dailyPrice * 25)
}

export function normalizeBranchPrices(raw: CarBranchPrices | null | undefined): CarBranchPrices {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchPrices = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue
    const day = Number(value.price_per_day)
    const month = Number(value.price_per_month)
    if (!Number.isFinite(day) || day < 0) continue
    out[normalizeBranchIdForStorage(key)] = {
      price_per_day: day,
      price_per_month: Number.isFinite(month) && month >= 0 ? month : defaultMonthlyPrice(day),
    }
  }
  return out
}

export function getBranchPriceOverride(
  car: Car,
  branchId?: string | null,
): BranchCarPrice | null {
  if (!branchId) return null
  const profile = getBranchProfile(car, branchId)
  if (profile?.price_per_day != null) {
    return {
      price_per_day: profile.price_per_day,
      price_per_month:
        profile.price_per_month ?? defaultMonthlyPrice(profile.price_per_day),
    }
  }
  const prices = normalizeBranchPrices(car.branch_prices)
  const key = normalizeBranchIdForStorage(branchId)
  return prices[key] ?? null
}

/** السعر الأساسي — يفضّل override الفرع ثم السعر العام */
export function getCarBasePrice(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): number {
  const effectiveBranchId = inferOfferBranchId(car, branchId)
  const override = getBranchPriceOverride(car, effectiveBranchId)
  if (rentalType === 'monthly') {
    if (override?.price_per_month != null) return override.price_per_month
    return car.price_per_month ?? defaultMonthlyPrice(car.price_per_day)
  }
  if (override?.price_per_day != null) return override.price_per_day
  return car.price_per_day
}

export function hasBranchPriceOverride(car: Car, branchId?: string | null): boolean {
  return getBranchPriceOverride(car, branchId) != null
}

export function buildCarBranchPricePatch(
  car: Car,
  branchId: string,
  prices: Pick<BranchCarPrice, 'price_per_day' | 'price_per_month'>,
): Pick<Car, 'branch_prices'> {
  const merged = { ...normalizeBranchPrices(car.branch_prices) }
  const key = normalizeBranchIdForStorage(branchId)
  merged[key] = {
    price_per_day: prices.price_per_day,
    price_per_month:
      prices.price_per_month > 0
        ? prices.price_per_month
        : defaultMonthlyPrice(prices.price_per_day),
  }
  return { branch_prices: merged }
}

export function getBranchFormPrices(car: Car, branchId: string | null): BranchCarPrice {
  if (branchId) {
    const resolved = resolveCarForBranch(car, branchId)
    return {
      price_per_day: resolved.price_per_day,
      price_per_month: resolved.price_per_month,
    }
  }
  return {
    price_per_day: car.price_per_day,
    price_per_month: car.price_per_month ?? defaultMonthlyPrice(car.price_per_day),
  }
}
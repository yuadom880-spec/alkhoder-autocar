import { carMatchesBranch } from './branchFilter'
import { isFeaturedOfferVisibleForBranch } from './featuredOffers'
import type { Booking, Car, FeaturedOffer } from './types'

export function filterBookingsByBranch(
  bookings: Booking[],
  branchId: string | null | undefined,
): Booking[] {
  if (!branchId) return bookings
  return bookings.filter((b) => b.branch_id === branchId)
}

export function filterCarsByBranch(cars: Car[], branchId: string | null | undefined): Car[] {
  if (!branchId) return cars
  return cars.filter((c) => carMatchesBranch(c, branchId))
}

/** عروض سيارات الفرع في لوحة الإدارة (تشمل الموقوفة لإمكانية إعادة التفعيل) */
export function filterOffersForAdminByBranch(
  offers: FeaturedOffer[],
  branchId: string | null | undefined,
): FeaturedOffer[] {
  if (!branchId) return offers
  return offers.filter((o) => {
    if (!o.car_id || !o.car) return false
    return carMatchesBranch(o.car, branchId)
  })
}

/** عروض مرتبطة بسيارات الفرع — مع احترام إيقاف العرض لفرع محدد فقط */
export function filterOffersByBranch(
  offers: FeaturedOffer[],
  branchId: string | null | undefined,
): FeaturedOffer[] {
  if (!branchId) return offers
  return offers.filter((o) => {
    if (!o.car_id || !o.car) return false
    if (!carMatchesBranch(o.car, branchId)) return false
    return isFeaturedOfferVisibleForBranch(o, branchId)
  })
}
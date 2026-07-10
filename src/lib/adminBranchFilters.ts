import { carMatchesBranch } from './branchFilter'
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

/** عروض مرتبطة بسيارات الفرع، أو عروض عامة بدون سيارة */
export function filterOffersByBranch(
  offers: FeaturedOffer[],
  branchId: string | null | undefined,
): FeaturedOffer[] {
  if (!branchId) return offers
  return offers.filter((o) => {
    if (!o.car) return true
    return carMatchesBranch(o.car, branchId)
  })
}
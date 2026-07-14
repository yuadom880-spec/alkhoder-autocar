import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { carMatchesBranch } from './branchFilter'
import { offerBelongsToBranchAdmin, offerMatchesBranch } from './featuredOfferBranch'
import { isFeaturedOfferVisibleForBranch } from './featuredOffers'
import type { Booking, Car, FeaturedOffer } from './types'

export function bookingBelongsToBranch(
  booking: Booking,
  branchId: string | null | undefined,
): boolean {
  if (!branchId || !booking.branch_id) return false
  return (
    normalizeBranchIdForStorage(booking.branch_id) ===
    normalizeBranchIdForStorage(branchId)
  )
}

export function assertBookingBelongsToBranch(
  booking: Booking | undefined,
  branchId: string | null | undefined,
): void {
  if (!branchId || !booking) return
  if (!bookingBelongsToBranch(booking, branchId)) {
    throw new Error('غير مسموح — هذا الحجز لا يخص فرعك')
  }
}

export function filterBookingsByBranch(
  bookings: Booking[],
  branchId: string | null | undefined,
): Booking[] {
  if (!branchId) return bookings
  return bookings.filter((b) => bookingBelongsToBranch(b, branchId))
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
  return offers.filter((o) => offerBelongsToBranchAdmin(o, branchId))
}

/** عروض الفرع — مع احترام إيقاف العرض لفرع محدد فقط */
export function filterOffersByBranch(
  offers: FeaturedOffer[],
  branchId: string | null | undefined,
): FeaturedOffer[] {
  return offers.filter(
    (o) => offerMatchesBranch(o, branchId) && isFeaturedOfferVisibleForBranch(o, branchId),
  )
}
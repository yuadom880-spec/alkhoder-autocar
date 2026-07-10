import { isCarAvailableForBranch } from './carBranchAvailability'
import { copy } from './copy'
import type { Car, CarAvailability } from './types'

/** رسالة التوفر للعميل — بدون مصطلحات إدارية */
export function getCustomerUnavailableLabel(
  reason?: CarAvailability['reason'] | null,
  options?: { page?: 'card' | 'detail'; startDate?: string; endDate?: string },
): string {
  if (reason === 'booked') {
    if (options?.page === 'detail') {
      return options.startDate && options.endDate
        ? copy.detail.bookedConfirmed
        : copy.detail.booked
    }
    return copy.cars.booked
  }
  return options?.page === 'detail' ? copy.detail.unavailable : copy.cars.unavailable
}

export function isCarEnabledForAdminScope(car: Car, branchId?: string | null): boolean {
  if (branchId) return isCarAvailableForBranch(car, branchId)
  return car.is_available
}

export function getAdminCarStatusLabel(car: Car, branchId?: string | null): string {
  if (branchId) {
    return isCarAvailableForBranch(car, branchId)
      ? copy.admin.carAvailableHere
      : copy.admin.carHiddenHere
  }
  return car.is_available ? copy.admin.carAvailable : copy.admin.carHidden
}

export function getAdminCarToggleLabel(car: Car, branchId?: string | null): string {
  if (branchId) {
    return isCarAvailableForBranch(car, branchId)
      ? copy.admin.stopBookingHere
      : copy.admin.enableBookingHere
  }
  return car.is_available ? copy.admin.stopBooking : copy.admin.enableBooking
}

export function confirmAdminCarAvailabilityToggle(
  car: Car,
  branchId?: string | null,
): boolean {
  if (branchId) {
    const availableHere = isCarAvailableForBranch(car, branchId)
    const message = availableHere
      ? copy.admin.stopBookingBranchConfirm(car.name)
      : copy.admin.enableBookingBranchConfirm(car.name)
    return confirm(message)
  }

  const message = car.is_available
    ? copy.admin.stopBookingConfirm(car.name)
    : copy.admin.enableBookingConfirm(car.name)
  return confirm(message)
}
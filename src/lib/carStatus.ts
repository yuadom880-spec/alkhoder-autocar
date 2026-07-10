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

export function getAdminCarStatusLabel(car: Car): string {
  return car.is_available ? copy.admin.carAvailable : copy.admin.carHidden
}

export function getAdminCarToggleLabel(car: Car): string {
  return car.is_available ? copy.admin.stopBooking : copy.admin.enableBooking
}

export function confirmAdminCarAvailabilityToggle(car: Car): boolean {
  const message = car.is_available
    ? copy.admin.stopBookingConfirm(car.name)
    : copy.admin.enableBookingConfirm(car.name)
  return confirm(message)
}
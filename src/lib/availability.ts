import type { BookingBlock, BookingStatus, Car, CarAvailability } from './types'

/** حالات الحجز التي تحجب السيارة عن العملاء */
export const BLOCKING_STATUSES: BookingStatus[] = ['pending', 'confirmed']

/** حالات الحجز المؤكدة التي تظهر كـ «محجوزة» للزائر */
export const PUBLIC_BOOKED_STATUSES: BookingStatus[] = ['confirmed']

export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA <= endB && startB <= endA
}

export function isBlockingStatus(status: BookingStatus): boolean {
  return BLOCKING_STATUSES.includes(status)
}

export function getCarBlocks(
  carId: string,
  blocks: BookingBlock[],
  statuses: BookingStatus[] = BLOCKING_STATUSES,
): BookingBlock[] {
  return blocks.filter((b) => b.car_id === carId && statuses.includes(b.status))
}

export function findConflictingBlocks(
  carId: string,
  startDate: string,
  endDate: string,
  blocks: BookingBlock[],
  statuses: BookingStatus[] = BLOCKING_STATUSES,
): BookingBlock[] {
  return blocks.filter(
    (b) =>
      b.car_id === carId &&
      statuses.includes(b.status) &&
      datesOverlap(startDate, endDate, b.start_date, b.end_date),
  )
}

export function getCarAvailability(
  car: Car,
  blocks: BookingBlock[],
  startDate?: string,
  endDate?: string,
): CarAvailability {
  if (!car.is_available) {
    return { available: false, reason: 'admin_disabled' }
  }

  const carBlocks = getCarBlocks(car.id, blocks)

  if (startDate && endDate) {
    const conflicts = findConflictingBlocks(car.id, startDate, endDate, blocks)
    if (conflicts.length > 0) {
      const confirmed = conflicts.some((c) => c.status === 'confirmed')
      return {
        available: false,
        reason: 'booked',
        conflicts,
        confirmedOnly: confirmed,
      }
    }
    return { available: true, reason: 'available' }
  }

  const today = new Date().toISOString().split('T')[0]
  const activeConfirmed = carBlocks.filter(
    (b) => b.status === 'confirmed' && b.end_date >= today,
  )
  if (activeConfirmed.length > 0) {
    return {
      available: false,
      reason: 'booked',
      conflicts: activeConfirmed,
      confirmedOnly: true,
    }
  }

  const activePending = carBlocks.filter(
    (b) => b.status === 'pending' && b.end_date >= today,
  )
  if (activePending.length > 0) {
    return {
      available: true,
      reason: 'available',
      conflicts: activePending,
      hasPending: true,
    }
  }

  return { available: true, reason: 'available' }
}

export function canBookCar(
  car: Car,
  blocks: BookingBlock[],
  startDate: string,
  endDate: string,
): { ok: boolean; message?: string } {
  if (!car.is_available) {
    return { ok: false, message: 'هذه السيارة غير متاحة للحجز حالياً' }
  }

  const conflicts = findConflictingBlocks(car.id, startDate, endDate, blocks)
  if (conflicts.length > 0) {
    const confirmed = conflicts.some((c) => c.status === 'confirmed')
    return {
      ok: false,
      message: confirmed
        ? 'السيارة محجوزة ومؤكدة في هذه الفترة — اختر تواريخ أخرى'
        : 'يوجد طلب حجز قيد المراجعة لهذه الفترة — اختر تواريخ أخرى أو تواصل معنا',
    }
  }

  return { ok: true }
}
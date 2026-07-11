import { isCarUnavailableForBranch } from './carBranchAvailability'
import type { BookingBlock, BookingStatus, Car, CarAvailability } from './types'

/** حجوزات نشطة تُعرض في لوحة الإدارة والتقويم */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed']

/** حالات تمنع حجزاً جديداً — المؤكد فقط؛ الطلبات قيد المراجعة لا تحجب */
export const BLOCKING_STATUSES: BookingStatus[] = ['confirmed']

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

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(status)
}

export function isBlockingStatus(status: BookingStatus): boolean {
  return BLOCKING_STATUSES.includes(status)
}

/**
 * فلترة الحجوزات حسب الفرع.
 * - مع فرع: حجوزات ذلك الفرع فقط (كل فرع مستقل).
 * - بدون فرع: لا نحسب حجوزات فرع محدد — يظهر التوفر بعد اختيار الفرع.
 */
export function filterBlocksByBranch(
  blocks: BookingBlock[],
  branchId: string | null | undefined,
): BookingBlock[] {
  if (!branchId) return blocks.filter((b) => !b.branch_id)
  return blocks.filter((b) => b.branch_id === branchId)
}

export function getCarBlocks(
  carId: string,
  blocks: BookingBlock[],
  statuses: BookingStatus[] = ACTIVE_BOOKING_STATUSES,
  branchId?: string | null,
): BookingBlock[] {
  const scoped = filterBlocksByBranch(blocks, branchId)
  return scoped.filter((b) => b.car_id === carId && statuses.includes(b.status))
}

export function findConflictingBlocks(
  carId: string,
  startDate: string,
  endDate: string,
  blocks: BookingBlock[],
  statuses: BookingStatus[] = BLOCKING_STATUSES,
  branchId?: string | null,
): BookingBlock[] {
  const scoped = filterBlocksByBranch(blocks, branchId)
  return scoped.filter(
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
  branchId?: string | null,
): CarAvailability {
  if (isCarUnavailableForBranch(car, branchId)) {
    return { available: false, reason: 'admin_disabled' }
  }

  const carBlocks = getCarBlocks(car.id, blocks, ACTIVE_BOOKING_STATUSES, branchId)

  if (startDate && endDate) {
    const confirmedConflicts = findConflictingBlocks(
      car.id,
      startDate,
      endDate,
      blocks,
      BLOCKING_STATUSES,
      branchId,
    )
    if (confirmedConflicts.length > 0) {
      return {
        available: false,
        reason: 'booked',
        conflicts: confirmedConflicts,
        confirmedOnly: true,
      }
    }

    const pendingConflicts = findConflictingBlocks(
      car.id,
      startDate,
      endDate,
      blocks,
      ['pending'],
      branchId,
    )
    if (pendingConflicts.length > 0) {
      return {
        available: true,
        reason: 'available',
        conflicts: pendingConflicts,
        hasPending: true,
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
  branchId?: string | null,
): { ok: boolean; message?: string } {
  if (isCarUnavailableForBranch(car, branchId)) {
    return { ok: false, message: 'هذه السيارة غير متاحة للحجز حالياً' }
  }

  const confirmedConflicts = findConflictingBlocks(
    car.id,
    startDate,
    endDate,
    blocks,
    BLOCKING_STATUSES,
    branchId,
  )
  if (confirmedConflicts.length > 0) {
    return {
      ok: false,
      message: 'السيارة محجوزة ومؤكدة في هذه الفترة — اختر تواريخ أخرى',
    }
  }

  return { ok: true }
}
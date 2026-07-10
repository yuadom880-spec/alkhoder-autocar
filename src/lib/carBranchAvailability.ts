import type { Car } from './types'

export function normalizeUnavailableBranchIds(car: Car): string[] {
  return Array.isArray(car.unavailable_branch_ids) ? car.unavailable_branch_ids : []
}

/** هل السيارة موقوفة عالمياً أو في فرع محدد */
export function isCarUnavailableForBranch(
  car: Car,
  branchId?: string | null,
): boolean {
  if (!car.is_available) return true
  if (!branchId) return false
  return normalizeUnavailableBranchIds(car).includes(branchId)
}

export function isCarAvailableForBranch(car: Car, branchId?: string | null): boolean {
  return !isCarUnavailableForBranch(car, branchId)
}

export function buildCarBranchAvailabilityPatch(
  car: Car,
  branchId: string,
  available: boolean,
): Pick<Car, 'is_available' | 'unavailable_branch_ids'> {
  const ids = new Set(normalizeUnavailableBranchIds(car))
  if (available) ids.delete(branchId)
  else ids.add(branchId)
  return { is_available: true, unavailable_branch_ids: [...ids] }
}
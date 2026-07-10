import type { Car } from './types'

export function normalizeBranchIdForStorage(branchId: string): string {
  return branchId.trim().toLowerCase()
}

export function normalizeUnavailableBranchIds(car: Car): string[] {
  if (!Array.isArray(car.unavailable_branch_ids)) return []
  return car.unavailable_branch_ids.map(normalizeBranchIdForStorage)
}

function isBranchListed(ids: string[], branchId: string): boolean {
  const target = normalizeBranchIdForStorage(branchId)
  return ids.some((id) => normalizeBranchIdForStorage(id) === target)
}

/** هل السيارة موقوفة عالمياً أو في فرع محدد */
export function isCarUnavailableForBranch(
  car: Car,
  branchId?: string | null,
): boolean {
  if (!car.is_available) return true
  if (!branchId) return false
  return isBranchListed(normalizeUnavailableBranchIds(car), branchId)
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
  const normalizedBranchId = normalizeBranchIdForStorage(branchId)
  if (available) ids.delete(normalizedBranchId)
  else ids.add(normalizedBranchId)
  return { is_available: true, unavailable_branch_ids: [...ids] }
}
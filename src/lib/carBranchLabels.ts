import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { getCarDisplayName as resolveDisplayName } from './carBranchProfile'
import type { Car, CarBranchNames } from './types'

export function normalizeBranchNames(raw: CarBranchNames | null | undefined): CarBranchNames {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchNames = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (!trimmed) continue
    out[normalizeBranchIdForStorage(key)] = trimmed
  }
  return out
}

export { resolveDisplayName as getCarDisplayName }

export function hasBranchNameOverride(car: Car, branchId?: string | null): boolean {
  return resolveDisplayName(car, branchId) !== car.name
}

export function getBranchFormName(car: Car, branchId: string | null): string {
  return resolveDisplayName(car, branchId)
}

export function buildCarBranchNamePatch(
  car: Car,
  branchId: string,
  name: string,
): Pick<Car, 'branch_names'> {
  const merged = { ...normalizeBranchNames(car.branch_names) }
  const key = normalizeBranchIdForStorage(branchId)
  const trimmed = name.trim()
  if (trimmed && trimmed !== car.name.trim()) merged[key] = trimmed
  else delete merged[key]
  return { branch_names: merged }
}
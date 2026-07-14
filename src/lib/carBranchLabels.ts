import { normalizeBranchIdForStorage } from './carBranchAvailability'
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

export function getBranchNameOverride(car: Car, branchId?: string | null): string | null {
  if (!branchId) return null
  const names = normalizeBranchNames(car.branch_names)
  const key = normalizeBranchIdForStorage(branchId)
  return names[key] ?? null
}

/** الاسم المعروض للعميل — يفضّل اسم الفرع ثم الاسم العام */
export function getCarDisplayName(car: Car, branchId?: string | null): string {
  const override = getBranchNameOverride(car, branchId)
  return override?.trim() || car.name
}

export function hasBranchNameOverride(car: Car, branchId?: string | null): boolean {
  return Boolean(getBranchNameOverride(car, branchId)?.trim())
}

export function buildCarBranchNamePatch(
  car: Car,
  branchId: string,
  name: string,
): Pick<Car, 'branch_names'> {
  const merged = { ...normalizeBranchNames(car.branch_names) }
  const key = normalizeBranchIdForStorage(branchId)
  const trimmed = name.trim()
  if (trimmed && trimmed !== car.name.trim()) {
    merged[key] = trimmed
  } else {
    delete merged[key]
  }
  return { branch_names: merged }
}

export function getBranchFormName(car: Car, branchId: string | null): string {
  return getCarDisplayName(car, branchId)
}
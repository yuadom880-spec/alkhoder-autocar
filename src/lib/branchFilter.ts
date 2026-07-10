import { normalizeBranchIdForStorage } from './carBranchAvailability'
import type { BranchRecord, Car } from './types'

function branchListIncludes(ids: string[], branchId: string): boolean {
  const target = normalizeBranchIdForStorage(branchId)
  return ids.some((id) => normalizeBranchIdForStorage(id) === target)
}

/** سيارة بدون فروع محددة = متاحة في كل الفروع */
export function carMatchesBranch(car: Car, branchId: string | null | undefined): boolean {
  if (!branchId) return true
  const ids = car.branch_ids ?? []
  if (ids.length === 0) return true
  return branchListIncludes(ids, branchId)
}

export function branchRecordMatchesId(branch: BranchRecord, branchId: string): boolean {
  return normalizeBranchIdForStorage(branch.id) === normalizeBranchIdForStorage(branchId)
}

export function filterCarsByBranch(cars: Car[], branchId: string | null | undefined): Car[] {
  if (!branchId) return cars
  return cars.filter((c) => carMatchesBranch(c, branchId))
}

/** الفروع اللي السيارة متاحة فيها */
export function getBranchesForCar(car: Car, branches: BranchRecord[]): BranchRecord[] {
  const ids = car.branch_ids ?? []
  if (ids.length === 0) return branches
  return branches.filter((b) => ids.includes(b.id))
}

export function findBranch(branches: BranchRecord[], branchId: string | null | undefined): BranchRecord | null {
  if (!branchId) return null
  return branches.find((b) => b.id === branchId) ?? null
}

export function formatCarBranchLabels(
  car: Car,
  branches: BranchRecord[],
): string {
  const ids = car.branch_ids ?? []
  if (ids.length === 0) return 'كل الفروع'
  const names = ids
    .map((id) => branches.find((b) => b.id === id)?.name)
    .filter(Boolean)
  return names.length > 0 ? names.join('، ') : 'كل الفروع'
}

export interface BookingQueryParams {
  branch?: string | null
  start?: string | null
  end?: string | null
  promo?: string | null
  rental?: string | null
}

export function buildBookingQuery(params: BookingQueryParams): string {
  const sp = new URLSearchParams()
  if (params.branch) sp.set('branch', params.branch)
  if (params.start) sp.set('start', params.start)
  if (params.end) sp.set('end', params.end)
  if (params.promo) sp.set('promo', params.promo)
  if (params.rental === 'monthly') sp.set('rental', 'monthly')
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}
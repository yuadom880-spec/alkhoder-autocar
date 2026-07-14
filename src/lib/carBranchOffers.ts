import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { normalizeCarOffers, sanitizeCarOffers } from './offers'
import type { Car, CarBranchOffers, CarOffers } from './types'

export function normalizeBranchOffers(raw: CarBranchOffers | null | undefined): CarBranchOffers {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchOffers = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue
    const normalized = normalizeCarOffers(value as CarOffers)
    if (!normalized) continue
    out[normalizeBranchIdForStorage(key)] = normalized
  }
  return out
}

export function getBranchOffersOverride(car: Car, branchId?: string | null): CarOffers | null {
  if (!branchId) return null
  const offers = normalizeBranchOffers(car.branch_offers)
  const key = normalizeBranchIdForStorage(branchId)
  return offers[key] ?? null
}

export function getBranchFormOffers(car: Car, branchId: string | null): CarOffers {
  if (!branchId) return normalizeCarOffers(car.offer)
  const override = getBranchOffersOverride(car, branchId)
  if (override) return override
  return { daily: null, monthly: null }
}

export function buildCarBranchOffersPatch(
  car: Car,
  branchId: string,
  offers: CarOffers | null,
): Pick<Car, 'branch_offers'> {
  const merged = { ...normalizeBranchOffers(car.branch_offers) }
  const key = normalizeBranchIdForStorage(branchId)
  const sanitized = sanitizeCarOffers(offers)
  if (!sanitized) {
    delete merged[key]
  } else {
    merged[key] = sanitized
  }
  return { branch_offers: merged }
}
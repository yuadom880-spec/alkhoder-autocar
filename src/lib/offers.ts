import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { getBranchOffersOverride } from './carBranchOffers'
import { getBranchProfile } from './carBranchProfile'
import { getCarBasePrice } from './carBranchPricing'
import type { Car, CarOffer, CarOffers, OfferDiscountType, RentalPeriodType } from './types'
import { formatPrice } from './utils'

function normalizeDisabledBranchIds(ids: string[] | undefined): string[] {
  if (!Array.isArray(ids)) return []
  return [...new Set(ids.map(normalizeBranchIdForStorage).filter(Boolean))]
}

export const DEFAULT_OFFER: CarOffer = {
  active: false,
  title: '',
  badge_text: '',
  discount_type: 'percent',
  discount_value: 0,
  valid_until: null,
  description: '',
  disabled_branch_ids: [],
}

export const DEFAULT_OFFERS: CarOffers = {
  daily: null,
  monthly: null,
}

export function normalizeOffer(offer: CarOffer | null | undefined): CarOffer | null {
  if (!offer) return null
  const disabledBranchIds = normalizeDisabledBranchIds(offer.disabled_branch_ids)
  if (!offer.active) {
    if (disabledBranchIds.length === 0) {
      return offer.active === false ? { ...DEFAULT_OFFER, active: false } : null
    }
    // إيقاف فرعي فقط — يبقى العرض شغّال في باقي الفروع
    return { ...DEFAULT_OFFER, ...offer, active: true, disabled_branch_ids: disabledBranchIds }
  }
  return { ...DEFAULT_OFFER, ...offer, disabled_branch_ids: disabledBranchIds }
}

/** موقوف عالمياً — ليس إيقاف فرع واحد */
export function isOfferGloballyDisabled(offer: CarOffer | null | undefined): boolean {
  if (!offer) return true
  if (offer.active) return false
  return normalizeDisabledBranchIds(offer.disabled_branch_ids).length === 0
}

/** تحويل العرض القديم (كائن واحد) إلى هيكل يومي/شهري */
export function normalizeCarOffers(offer: CarOffers | CarOffer | null | undefined): CarOffers {
  if (!offer) return { ...DEFAULT_OFFERS }

  if ('daily' in offer || 'monthly' in offer) {
    const o = offer as CarOffers
    return {
      daily: normalizeOffer(o.daily),
      monthly: normalizeOffer(o.monthly),
    }
  }

  const legacy = normalizeOffer(offer as CarOffer)
  return { daily: legacy, monthly: null }
}

export function getCarOffer(car: Car, rentalType: RentalPeriodType): CarOffer | null {
  const offers = normalizeCarOffers(car.offer)
  return rentalType === 'monthly' ? offers.monthly : offers.daily
}

/** عرض السيارة مع احترام عروض الفرع المخصصة */
export function getResolvedCarOffer(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): CarOffer | null {
  if (branchId) {
    const profile = getBranchProfile(car, branchId)
    if (profile?.offer !== undefined) {
      const branchOffers = normalizeCarOffers(profile.offer)
      const specific = rentalType === 'monthly' ? branchOffers.monthly : branchOffers.daily
      if (specific !== null && specific !== undefined) {
        if (!specific.active && isOfferGloballyDisabled(specific)) return null
        if (specific.active) return normalizeOffer(specific)
        return null
      }
    }
    const branchOffers = getBranchOffersOverride(car, branchId)
    if (branchOffers) {
      const specific = rentalType === 'monthly' ? branchOffers.monthly : branchOffers.daily
      if (specific !== null && specific !== undefined) {
        if (!specific.active && isOfferGloballyDisabled(specific)) return null
        if (specific.active) return normalizeOffer(specific)
        return null
      }
    }
  }
  return getCarOffer(car, rentalType)
}

export function isOfferDisabledForBranch(
  offer: { disabled_branch_ids?: string[] } | null | undefined,
  branchId?: string | null,
): boolean {
  if (!offer || !branchId) return false
  const target = normalizeBranchIdForStorage(branchId)
  return normalizeDisabledBranchIds(offer.disabled_branch_ids).includes(target)
}

export function setOfferBranchDisabled(
  offer: CarOffer,
  branchId: string,
  disabled: boolean,
): CarOffer {
  const normalizedBranchId = normalizeBranchIdForStorage(branchId)
  const ids = new Set(normalizeDisabledBranchIds(offer.disabled_branch_ids))
  if (disabled) ids.add(normalizedBranchId)
  else ids.delete(normalizedBranchId)
  return { ...offer, active: true, disabled_branch_ids: [...ids] }
}

function isOfferValid(offer: CarOffer | null, branchId?: string | null): boolean {
  if (!offer) return false
  if (isOfferGloballyDisabled(offer)) return false
  if (isOfferDisabledForBranch(offer, branchId)) return false
  if (offer.valid_until) {
    const end = new Date(offer.valid_until)
    end.setHours(23, 59, 59, 999)
    if (end < new Date()) return false
  }
  return true
}

export function applyOffer(
  basePrice: number,
  offer: CarOffer | null,
  branchId?: string | null,
): number {
  if (!offer || isOfferGloballyDisabled(offer) || isOfferDisabledForBranch(offer, branchId)) {
    return basePrice
  }

  let price: number
  switch (offer.discount_type) {
    case 'percent':
      price = basePrice * (1 - Math.min(100, Math.max(0, offer.discount_value)) / 100)
      break
    case 'fixed':
      price = basePrice - offer.discount_value
      break
    case 'custom_price':
      price = offer.discount_value
      break
    default:
      price = basePrice
  }

  return Math.max(0, Math.round(price * 100) / 100)
}

export function isOfferActive(
  car: Car,
  rentalType: RentalPeriodType = 'daily',
  branchId?: string | null,
): boolean {
  const offer = getResolvedCarOffer(car, rentalType, branchId)
  if (!isOfferValid(offer, branchId)) return false
  const basePrice = getCarBasePrice(car, rentalType, branchId)
  return applyOffer(basePrice, offer, branchId) < basePrice
}

export function hasAnyOffer(car: Car, branchId?: string | null): boolean {
  return (
    isOfferActive(car, 'daily', branchId) || isOfferActive(car, 'monthly', branchId)
  )
}

export function getEffectivePrice(
  car: Car,
  rentalType: RentalPeriodType = 'daily',
  branchId?: string | null,
): number {
  const offer = getResolvedCarOffer(car, rentalType, branchId)
  const basePrice = getCarBasePrice(car, rentalType, branchId)
  if (!isOfferValid(offer, branchId)) return basePrice
  return applyOffer(basePrice, offer, branchId)
}

export function getOfferBadge(
  car: Car,
  rentalType: RentalPeriodType = 'daily',
  branchId?: string | null,
): string | null {
  if (!isOfferActive(car, rentalType, branchId)) return null
  const offer = getResolvedCarOffer(car, rentalType, branchId)
  if (!offer) return null
  if (offer.badge_text.trim()) return offer.badge_text.trim()

  switch (offer.discount_type) {
    case 'percent':
      return `خصم ${offer.discount_value}%`
    case 'fixed':
      return `وفّر ${formatPrice(offer.discount_value)}`
    case 'custom_price':
      return 'عرض خاص'
    default:
      return 'عرض'
  }
}

export function getOfferSavings(
  car: Car,
  rentalType: RentalPeriodType = 'daily',
  branchId?: string | null,
): number {
  if (!isOfferActive(car, rentalType, branchId)) return 0
  const basePrice = getCarBasePrice(car, rentalType, branchId)
  return Math.round((basePrice - getEffectivePrice(car, rentalType, branchId)) * 100) / 100
}

export const ADMIN_OFFER_DISCOUNT_TYPES = ['percent', 'fixed'] as const

export const DISCOUNT_TYPE_LABELS: Record<OfferDiscountType, string> = {
  percent: 'نسبة مئوية (%)',
  fixed: 'مبلغ ثابت (ر.س)',
  custom_price: 'سعر العرض (قديم)',
}

export function getDiscountValueLabel(
  discountType: OfferDiscountType,
  _rentalType: RentalPeriodType,
): string {
  switch (discountType) {
    case 'percent':
      return 'نسبة الخصم (%)'
    case 'fixed':
    case 'custom_price':
      return 'مبلغ الخصم (ر.س)'
    default:
      return 'قيمة الخصم'
  }
}

/** معاينة السعر بعد العرض */
export function previewOfferPrice(basePrice: number, offer: CarOffer): number {
  return applyOffer(basePrice, offer)
}

function keepStoredOffer(offer: CarOffer | null): CarOffer | null {
  if (!offer) return null
  if (isOfferGloballyDisabled(offer)) return null
  return {
    ...offer,
    active: offer.active || normalizeDisabledBranchIds(offer.disabled_branch_ids).length > 0,
    disabled_branch_ids: normalizeDisabledBranchIds(offer.disabled_branch_ids),
  }
}

export function sanitizeCarOffers(offers: CarOffers | null): CarOffers | null {
  const normalized = normalizeCarOffers(offers)
  const daily = keepStoredOffer(normalized.daily)
  const monthly = keepStoredOffer(normalized.monthly)
  if (!daily && !monthly) return null
  return { daily, monthly }
}
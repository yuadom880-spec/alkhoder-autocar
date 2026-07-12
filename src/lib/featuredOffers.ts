import type { Car, FeaturedOffer, RentalPeriodType } from './types'
import { isCarAvailableForBranch } from './carBranchAvailability'
import {
  getCarOffer,
  getEffectivePrice,
  getOfferBadge,
  getOfferSavings,
  isOfferActive,
  isOfferDisabledForBranch,
  isOfferGloballyDisabled,
} from './offers'
import { getCarBasePrice } from './pricing'
import { formatPrice } from './utils'

/** الحد الأدنى للخصم ليظهر العرض تلقائياً في العروض المميزة */
export const FEATURED_OFFER_MIN_SAVINGS = 200

export const RENTAL_TYPE_LABELS: Record<RentalPeriodType, string> = {
  daily: 'إيجار يومي',
  monthly: 'إيجار شهري',
}

export function isFeaturedOfferActive(offer: FeaturedOffer): boolean {
  if (!offer.is_active) return false
  if (offer.valid_until) {
    const end = new Date(offer.valid_until)
    end.setHours(23, 59, 59, 999)
    if (end < new Date()) return false
  }
  return true
}

export function isAutoCarFeaturedOffer(offer: FeaturedOffer): boolean {
  return offer.id.startsWith('car-offer-')
}

export function parseAutoCarOfferId(
  id: string,
): { carId: string; rentalType: RentalPeriodType } | null {
  const match = id.match(/^car-offer-(daily|monthly)-(.+)$/)
  if (!match) return null
  return { rentalType: match[1] as RentalPeriodType, carId: match[2] }
}

/** هل العرض موقوف في فرع محدد (للوحة الإدارة — بغض النظر عن صلاحية الخصم) */
export function isFeaturedOfferBranchDisabled(
  offer: FeaturedOffer,
  branchId?: string | null,
): boolean {
  if (!branchId) return false
  if (isOfferDisabledForBranch(offer, branchId)) return true
  if (offer.car_id && offer.car) {
    const carOffer = getCarOffer(offer.car, offer.rental_type)
    if (carOffer && isOfferDisabledForBranch(carOffer, branchId)) return true
  }
  return false
}

function isFeaturedOfferVisibleForCar(
  offer: FeaturedOffer,
  branchId?: string | null,
): boolean {
  if (!offer.car_id || !offer.car) return true

  if (!isCarAvailableForBranch(offer.car, branchId)) return false

  // عرض يدوي بسعر مستقل — لا يحتاج خصماً على السيارة
  if (!isAutoCarFeaturedOffer(offer)) return true

  const carOffer = getCarOffer(offer.car, offer.rental_type)
  if (!carOffer || isOfferGloballyDisabled(carOffer)) return false
  if (branchId && isOfferDisabledForBranch(carOffer, branchId)) return false
  return isOfferActive(offer.car, offer.rental_type, branchId)
}

/** هل العرض ظاهر لفرع معيّن */
export function isFeaturedOfferVisibleForBranch(
  offer: FeaturedOffer,
  branchId?: string | null,
): boolean {
  if (!isFeaturedOfferActive(offer)) return false
  if (branchId && isOfferDisabledForBranch(offer, branchId)) return false

  // عرض يدوي من الإدارة — مستقل عن خصم/توفر السيارة
  if (!isAutoCarFeaturedOffer(offer)) return true

  if (!branchId) {
    if (offer.car_id && offer.car) {
      return isFeaturedOfferVisibleForCar(offer, null)
    }
    return true
  }
  return isFeaturedOfferVisibleForCar(offer, branchId)
}

/** تحويل عرض السيارة (يومي/شهري) إلى بطاقة عرض مميز */
export function carToFeaturedOffer(
  car: Car,
  rentalType: RentalPeriodType,
  branchId?: string | null,
): FeaturedOffer | null {
  if (!isCarAvailableForBranch(car, branchId) || !isOfferActive(car, rentalType, branchId)) {
    return null
  }

  const savings = getOfferSavings(car, rentalType, branchId)
  if (savings <= FEATURED_OFFER_MIN_SAVINGS) return null

  const carOffer = getCarOffer(car, rentalType)
  if (!carOffer) return null

  const basePrice = getCarBasePrice(car, rentalType, branchId)
  const effectivePrice = getEffectivePrice(car, rentalType, branchId)

  return {
    id: `car-offer-${rentalType}-${car.id}`,
    title: carOffer.title.trim() || car.name,
    description: carOffer.description.trim() || `${car.name} — ${RENTAL_TYPE_LABELS[rentalType]}`,
    rental_type: rentalType,
    image_url: car.image_url,
    badge_text: getOfferBadge(car, rentalType, branchId) ?? '',
    price: effectivePrice,
    original_price: basePrice,
    car_id: car.id,
    link_url: null,
    is_active: true,
    is_featured: true,
    valid_until: carOffer.valid_until,
    sort_order: -Math.round(savings),
    disabled_branch_ids: carOffer.disabled_branch_ids ?? [],
    created_at: car.created_at,
    updated_at: car.updated_at,
    car,
  }
}

export function buildAutoFeaturedOffersFromCars(cars: Car[]): FeaturedOffer[] {
  const offers: FeaturedOffer[] = []
  const rentalTypes: RentalPeriodType[] = ['daily', 'monthly']

  for (const car of cars) {
    for (const rentalType of rentalTypes) {
      const offer = carToFeaturedOffer(car, rentalType)
      if (offer) offers.push(offer)
    }
  }

  return offers.sort((a, b) => a.sort_order - b.sort_order)
}

export function mergeFeaturedOffers(
  manualOffers: FeaturedOffer[],
  autoOffers: FeaturedOffer[],
): FeaturedOffer[] {
  const manualKeys = new Set(
    manualOffers
      .filter((offer) => offer.car_id && isFeaturedOfferActive(offer))
      .map((offer) => `${offer.car_id}-${offer.rental_type}`),
  )

  const uniqueAuto = autoOffers.filter(
    (offer) => !manualKeys.has(`${offer.car_id}-${offer.rental_type}`),
  )

  return [...manualOffers, ...uniqueAuto].sort((a, b) => a.sort_order - b.sort_order)
}

export function resolveDisplayedFeaturedOffers(
  manualOffers: FeaturedOffer[],
  cars: Car[],
  options: { activeOnly?: boolean; featuredOnly?: boolean } = {},
): FeaturedOffer[] {
  const { activeOnly = false, featuredOnly = false } = options

  let displayedManual = manualOffers
  if (activeOnly) displayedManual = displayedManual.filter(isFeaturedOfferActive)
  if (featuredOnly) displayedManual = displayedManual.filter((offer) => offer.is_featured)

  const autoOffers = buildAutoFeaturedOffersFromCars(cars).filter(
    activeOnly ? isFeaturedOfferActive : () => true,
  )

  return mergeFeaturedOffers(displayedManual, autoOffers)
}

/** رابط صفحة الحجز مباشرة مع العرض */
export function getFeaturedOfferLink(offer: FeaturedOffer): string {
  if (isAutoCarFeaturedOffer(offer) && offer.car_id) {
    return `/book/${offer.car_id}?rental=${offer.rental_type}`
  }
  if (offer.car_id) {
    return `/book/${offer.car_id}?promo=${offer.id}`
  }
  return `/book/offer/${offer.id}`
}

export function getPromoPricePerDay(offer: FeaturedOffer | null, car: Car): number {
  if (!offer || !isFeaturedOfferActive(offer) || offer.price <= 0) {
    return getEffectivePrice(car)
  }
  if (offer.rental_type === 'monthly') {
    return Math.round((offer.price / 30) * 100) / 100
  }
  return offer.price
}

export function getPromoSuggestedDays(_offer: FeaturedOffer | null): number {
  return 0
}

export function getFeaturedOfferPriceLabel(offer: FeaturedOffer): string {
  const unit = offer.rental_type === 'monthly' ? '/ شهر' : '/ يوم'
  return `${formatPrice(offer.price)}${unit}`
}

export function getFeaturedOfferSavings(offer: FeaturedOffer): number {
  if (!offer.original_price || offer.original_price <= offer.price) return 0
  return Math.round((offer.original_price - offer.price) * 100) / 100
}
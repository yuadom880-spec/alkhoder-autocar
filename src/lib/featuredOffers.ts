import type { Car, FeaturedOffer, RentalPeriodType } from './types'
import { getEffectivePrice } from './offers'
import { formatPrice } from './utils'

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

/** رابط صفحة الحجز مباشرة مع العرض */
export function getFeaturedOfferLink(offer: FeaturedOffer): string {
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

export function getPromoSuggestedDays(offer: FeaturedOffer | null): number {
  if (offer?.rental_type === 'monthly') return 30
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
import type { Car, CarOffer, CarOffers, OfferDiscountType, RentalPeriodType } from './types'
import { formatPrice } from './utils'

export const DEFAULT_OFFER: CarOffer = {
  active: false,
  title: '',
  badge_text: '',
  discount_type: 'percent',
  discount_value: 0,
  valid_until: null,
  description: '',
}

export const DEFAULT_OFFERS: CarOffers = {
  daily: null,
  monthly: null,
}

export function normalizeOffer(offer: CarOffer | null | undefined): CarOffer | null {
  if (!offer || !offer.active) {
    return offer?.active === false ? { ...DEFAULT_OFFER, active: false } : null
  }
  return { ...DEFAULT_OFFER, ...offer }
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

function isOfferValid(offer: CarOffer | null): boolean {
  if (!offer?.active) return false
  if (offer.valid_until) {
    const end = new Date(offer.valid_until)
    end.setHours(23, 59, 59, 999)
    if (end < new Date()) return false
  }
  return true
}

export function applyOffer(basePrice: number, offer: CarOffer | null): number {
  if (!offer?.active) return basePrice

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

export function isOfferActive(car: Car, rentalType: RentalPeriodType = 'daily'): boolean {
  const offer = getCarOffer(car, rentalType)
  if (!isOfferValid(offer)) return false
  const basePrice =
    rentalType === 'monthly'
      ? (car.price_per_month ?? car.price_per_day * 25)
      : car.price_per_day
  return applyOffer(basePrice, offer) < basePrice
}

export function hasAnyOffer(car: Car): boolean {
  return isOfferActive(car, 'daily') || isOfferActive(car, 'monthly')
}

export function getEffectivePrice(car: Car, rentalType: RentalPeriodType = 'daily'): number {
  const offer = getCarOffer(car, rentalType)
  const basePrice =
    rentalType === 'monthly'
      ? (car.price_per_month ?? car.price_per_day * 25)
      : car.price_per_day
  if (!isOfferValid(offer)) return basePrice
  return applyOffer(basePrice, offer)
}

export function getOfferBadge(car: Car, rentalType: RentalPeriodType = 'daily'): string | null {
  if (!isOfferActive(car, rentalType)) return null
  const offer = getCarOffer(car, rentalType)
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

export function getOfferSavings(car: Car, rentalType: RentalPeriodType = 'daily'): number {
  if (!isOfferActive(car, rentalType)) return 0
  const basePrice =
    rentalType === 'monthly'
      ? (car.price_per_month ?? car.price_per_day * 25)
      : car.price_per_day
  return Math.round((basePrice - getEffectivePrice(car, rentalType)) * 100) / 100
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

export function sanitizeCarOffers(offers: CarOffers | null): CarOffers | null {
  const normalized = normalizeCarOffers(offers)
  const daily = normalized.daily?.active ? normalized.daily : null
  const monthly = normalized.monthly?.active ? normalized.monthly : null
  if (!daily && !monthly) return null
  return { daily, monthly }
}
import type { Car, CarOffer, OfferDiscountType } from './types'
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

export function normalizeOffer(offer: CarOffer | null | undefined): CarOffer | null {
  if (!offer || !offer.active) return offer?.active === false ? { ...DEFAULT_OFFER, active: false } : null
  return { ...DEFAULT_OFFER, ...offer }
}

export function isOfferActive(car: Car): boolean {
  const offer = car.offer
  if (!offer?.active) return false
  if (offer.valid_until) {
    const end = new Date(offer.valid_until)
    end.setHours(23, 59, 59, 999)
    if (end < new Date()) return false
  }
  return getEffectivePrice(car) < car.price_per_day
}

export function getEffectivePrice(car: Car): number {
  const offer = car.offer
  if (!offer?.active) return car.price_per_day

  let price: number
  switch (offer.discount_type) {
    case 'percent':
      price = car.price_per_day * (1 - Math.min(100, Math.max(0, offer.discount_value)) / 100)
      break
    case 'fixed':
      price = car.price_per_day - offer.discount_value
      break
    case 'custom_price':
      price = offer.discount_value
      break
    default:
      price = car.price_per_day
  }

  return Math.max(0, Math.round(price * 100) / 100)
}

export function getOfferBadge(car: Car): string | null {
  if (!isOfferActive(car) || !car.offer) return null
  if (car.offer.badge_text.trim()) return car.offer.badge_text.trim()

  switch (car.offer.discount_type) {
    case 'percent':
      return `خصم ${car.offer.discount_value}%`
    case 'fixed':
      return `وفّر ${formatPrice(car.offer.discount_value)}`
    case 'custom_price':
      return 'عرض خاص'
    default:
      return 'عرض'
  }
}

export function getOfferSavings(car: Car): number {
  if (!isOfferActive(car)) return 0
  return Math.round((car.price_per_day - getEffectivePrice(car)) * 100) / 100
}

export const DISCOUNT_TYPE_LABELS: Record<OfferDiscountType, string> = {
  percent: 'نسبة مئوية (%)',
  fixed: 'مبلغ ثابت (ر.س)',
  custom_price: 'سعر العرض (ر.س/يوم)',
}

/** معاينة السعر بعد العرض */
export function previewOfferPrice(basePrice: number, offer: CarOffer): number {
  const car = { price_per_day: basePrice, offer } as Car
  return getEffectivePrice(car)
}
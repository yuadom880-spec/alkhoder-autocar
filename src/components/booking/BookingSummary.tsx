import { Calendar, Car, MapPin, Tag } from 'lucide-react'
import type { BranchRecord, Car as CarType, FeaturedOffer, RentalPeriodType } from '../../lib/types'
import { CarImage } from '../cars/CarImage'

import { copy } from '../../lib/copy'
import { getFeaturedOfferPriceLabel, isFeaturedOfferActive } from '../../lib/featuredOffers'
import { getCarOffer, getEffectivePrice, isOfferActive } from '../../lib/offers'
import {
  calcBookingTotal,
  calcMonthlyBookingBreakdown,
  getCarBasePrice,
  getCarDisplayPrice,
  getPriceUnitLabel,
} from '../../lib/pricing'
import { calcDays, formatDate, formatPrice } from '../../lib/utils'
import { MonthlyPriceBreakdown } from './MonthlyPriceBreakdown'

interface BookingSummaryProps {
  car: CarType
  startDate: string
  endDate: string
  pickupTime?: string
  promoOffer?: FeaturedOffer | null
  unitPrice?: number
  dailyPrice?: number
  rentalType?: RentalPeriodType
  branch?: BranchRecord | null
}

export function BookingSummary({
  car,
  startDate,
  endDate,
  pickupTime = '',
  promoOffer = null,
  unitPrice: priceOverride,
  dailyPrice: dailyPriceOverride,
  rentalType = 'daily',
  branch = null,
}: BookingSummaryProps) {
  const hasPromo = Boolean(promoOffer && isFeaturedOfferActive(promoOffer))
  const effectiveRentalType = hasPromo && promoOffer ? promoOffer.rental_type : rentalType
  const isMonthly = effectiveRentalType === 'monthly'
  const offerBranchId = branch?.id ?? null
  const hasCarOffer = isOfferActive(car, effectiveRentalType, offerBranchId)
  const activeCarOffer = getCarOffer(car, effectiveRentalType)
  const unitPrice =
    priceOverride ?? getCarDisplayPrice(car, effectiveRentalType, offerBranchId)
  const dailyPrice =
    dailyPriceOverride ??
    (effectiveRentalType === 'monthly'
      ? getEffectivePrice(car, 'daily', offerBranchId)
      : unitPrice)
  const basePrice = getCarBasePrice(car, effectiveRentalType)
  const days = startDate && endDate ? calcDays(startDate, endDate) : 0
  const monthlyBreakdown =
    startDate && endDate && isMonthly
      ? calcMonthlyBookingBreakdown(unitPrice, dailyPrice, startDate, endDate)
      : null
  const total =
    startDate && endDate
      ? calcBookingTotal(unitPrice, startDate, endDate, effectiveRentalType, dailyPrice)
      : 0
  const showDiscount = hasPromo || hasCarOffer
  const unitLabel = getPriceUnitLabel(effectiveRentalType)

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md sm:p-5 lg:sticky lg:top-24">
      <div className="flex gap-4 mb-5 pb-5 border-b border-slate-100">
        <CarImage src={car.image_url} alt={car.name} variant="summary" />
        <div>
          <p className="font-bold text-brand-dark">{car.name}</p>
          <p className="text-xs text-slate-500">
            {car.brand} · {car.year}
          </p>
          {showDiscount ? (
            <div className="mt-1">
              <p className="text-sm font-bold text-red-600">
                {hasPromo && promoOffer && promoOffer.price > 0
                  ? getFeaturedOfferPriceLabel(promoOffer)
                  : `${formatPrice(unitPrice)}${unitLabel}`}
              </p>
              <p className="text-xs text-slate-400 line-through">{formatPrice(basePrice)}</p>
            </div>
          ) : (
            <p className="text-sm font-bold text-brand-green mt-1">
              {formatPrice(unitPrice)}
              <span className="text-xs font-normal text-slate-400 mr-1">{unitLabel}</span>
            </p>
          )}
        </div>
      </div>

      {hasPromo && promoOffer && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          <Tag className="h-3.5 w-3.5 shrink-0" />
          {promoOffer.title}
        </div>
      )}

      {!hasPromo && hasCarOffer && activeCarOffer?.title && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          <Tag className="h-3.5 w-3.5 shrink-0" />
          {activeCarOffer.title}
        </div>
      )}

      <h3 className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-brand-green" />
        {copy.booking.priceSummary}
      </h3>

      {branch && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-green/5 border border-brand-green/15 px-3 py-2.5 text-sm">
          <MapPin className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400">{copy.booking.pickupBranch}</p>
            <p className="font-bold text-brand-dark">{branch.name}</p>
            <p className="text-xs text-slate-500">{branch.city}</p>
          </div>
        </div>
      )}

      {startDate && endDate ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{copy.booking.from}</span>
            <span className="font-medium">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{copy.booking.to}</span>
            <span className="font-medium">{formatDate(endDate)}</span>
          </div>
          {pickupTime && (
            <div className="flex justify-between text-slate-600">
              <span>{copy.booking.pickupTime}</span>
              <span className="font-medium" dir="ltr">{pickupTime}</span>
            </div>
          )}
          {isMonthly && monthlyBreakdown ? (
            <>
              {monthlyBreakdown.fullMonths > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.booking.totalMonths}</span>
                  <span className="font-medium">
                    {monthlyBreakdown.fullMonths}{' '}
                    {monthlyBreakdown.fullMonths === 1
                      ? copy.booking.monthUnit
                      : copy.booking.monthsUnit}
                  </span>
                </div>
              )}
              {monthlyBreakdown.extraDays > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.booking.extraDays}</span>
                  <span className="font-medium">
                    {monthlyBreakdown.extraDays}{' '}
                    {monthlyBreakdown.extraDays === 1 ? 'يوم' : 'أيام'}
                  </span>
                </div>
              )}
              {monthlyBreakdown.fullMonths > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.booking.pricePerMonth}</span>
                  <span className={showDiscount ? 'text-red-600 font-medium' : ''}>
                    {formatPrice(unitPrice)}
                    {showDiscount && (
                      <span className="text-slate-400 line-through text-xs mr-1">
                        {formatPrice(basePrice)}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {monthlyBreakdown.extraDays > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.booking.pricePerDay}</span>
                  <span>{formatPrice(dailyPrice)}</span>
                </div>
              )}
              {monthlyBreakdown.fullMonths === 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.booking.pricePerDay}</span>
                  <span>{formatPrice(dailyPrice)}</span>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <MonthlyPriceBreakdown breakdown={monthlyBreakdown} compact />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-slate-600">
                <span>{copy.booking.totalDays}</span>
                <span className="font-medium">
                  {days} {days === 1 ? 'يوم' : 'أيام'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{copy.booking.pricePerDay}</span>
                <span className={showDiscount ? 'text-red-600 font-medium' : ''}>
                  {formatPrice(unitPrice)}
                  {showDiscount && (
                    <span className="text-slate-400 line-through text-xs mr-1">
                      {formatPrice(basePrice)}
                    </span>
                  )}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between pt-3 border-t border-slate-100">
            <span className="font-bold text-brand-dark">{copy.booking.total}</span>
            <span className={`text-xl font-bold ${showDiscount ? 'text-red-600' : 'text-brand-green'}`}>
              {formatPrice(total)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 flex items-center gap-2">
          <Car className="h-4 w-4" />
          {copy.booking.autoCalc}
        </p>
      )}
    </div>
  )
}
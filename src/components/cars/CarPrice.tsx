import type { Car, RentalPeriodType } from '../../lib/types'
import { getEffectivePrice, getOfferBadge, getOfferSavings, isOfferActive } from '../../lib/offers'
import { getCarBasePrice, getPriceUnitLabel } from '../../lib/pricing'
import { copy } from '../../lib/copy'
import { cn, formatPrice } from '../../lib/utils'

interface CarPriceProps {
  car: Car
  rentalType?: RentalPeriodType
  branchId?: string | null
  size?: 'sm' | 'md' | 'lg'
  showSavings?: boolean
  className?: string
}

const sizes = {
  sm: { price: 'text-lg', old: 'text-xs', sub: 'text-[10px]' },
  md: { price: 'text-lg', old: 'text-sm', sub: 'text-[10px]' },
  lg: { price: 'text-3xl', old: 'text-base', sub: 'text-sm' },
}

export function CarPrice({
  car,
  rentalType = 'daily',
  branchId = null,
  size = 'md',
  showSavings = false,
  className,
}: CarPriceProps) {
  const s = sizes[size]
  const basePrice = getCarBasePrice(car, rentalType, branchId)
  const effective = getEffectivePrice(car, rentalType, branchId)
  const hasOffer = isOfferActive(car, rentalType, branchId)
  const badge = getOfferBadge(car, rentalType, branchId)
  const unitLabel = getPriceUnitLabel(rentalType)

  return (
    <div className={cn('text-left shrink-0', className)}>
      {hasOffer ? (
        <>
          {badge && size === 'lg' && (
            <span className="inline-block mb-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
          <p className={cn('font-bold text-red-600', s.price)}>{formatPrice(effective)}</p>
          <p className={cn('text-slate-400 line-through', s.old)}>{formatPrice(basePrice)}</p>
          {showSavings && (
            <p className="text-[10px] text-green-700 font-medium">
              {copy.offers.save} {formatPrice(getOfferSavings(car, rentalType, branchId))}
            </p>
          )}
        </>
      ) : (
        <p className={cn('font-bold text-brand-green', s.price)}>{formatPrice(effective)}</p>
      )}
      <p className={cn('text-slate-400', s.sub)}>{unitLabel}</p>
    </div>
  )
}

export function OfferBadge({
  car,
  rentalType = 'daily',
  branchId = null,
}: {
  car: Car
  rentalType?: RentalPeriodType
  branchId?: string | null
}) {
  const badge = getOfferBadge(car, rentalType, branchId)
  if (!badge) return null
  return (
    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
      {badge}
    </span>
  )
}
import type { Car } from '../../lib/types'
import { getEffectivePrice, getOfferBadge, isOfferActive } from '../../lib/offers'
import { cn, formatPrice } from '../../lib/utils'

interface CarPriceProps {
  car: Car
  size?: 'sm' | 'md' | 'lg'
  showSavings?: boolean
  className?: string
}

const sizes = {
  sm: { price: 'text-lg', old: 'text-xs', sub: 'text-[10px]' },
  md: { price: 'text-lg', old: 'text-sm', sub: 'text-[10px]' },
  lg: { price: 'text-3xl', old: 'text-base', sub: 'text-sm' },
}

export function CarPrice({ car, size = 'md', showSavings = false, className }: CarPriceProps) {
  const s = sizes[size]
  const hasOffer = isOfferActive(car)
  const effective = getEffectivePrice(car)
  const badge = getOfferBadge(car)

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
          <p className={cn('text-slate-400 line-through', s.old)}>{formatPrice(car.price_per_day)}</p>
          {showSavings && (
            <p className="text-[10px] text-green-700 font-medium">
              وفّر {formatPrice(car.price_per_day - effective)}
            </p>
          )}
        </>
      ) : (
        <p className={cn('font-bold text-brand-green', s.price)}>{formatPrice(car.price_per_day)}</p>
      )}
      <p className={cn('text-slate-400', s.sub)}>/ يوم</p>
    </div>
  )
}

export function OfferBadge({ car }: { car: Car }) {
  const badge = getOfferBadge(car)
  if (!badge) return null
  return (
    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
      {badge}
    </span>
  )
}
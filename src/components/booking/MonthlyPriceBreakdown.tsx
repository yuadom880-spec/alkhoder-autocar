import { copy } from '../../lib/copy'
import type { MonthlyBookingBreakdown } from '../../lib/pricing'
import { formatPrice } from '../../lib/utils'

interface MonthlyPriceBreakdownProps {
  breakdown: MonthlyBookingBreakdown
  compact?: boolean
  className?: string
}

export function MonthlyPriceBreakdown({
  breakdown,
  compact = false,
  className,
}: MonthlyPriceBreakdownProps) {
  const { fullMonths, extraDays, monthlyPrice, dailyPrice, total } = breakdown

  const monthLabel =
    fullMonths === 1 ? copy.booking.monthUnit : copy.booking.monthsUnit
  const dayWord = extraDays === 1 ? copy.booking.dayUnit : copy.booking.daysUnit

  if (fullMonths === 0) {
    return (
      <span className={className}>
        {formatPrice(dailyPrice)} × {extraDays} {dayWord} ={' '}
        <strong className="text-brand-green">{formatPrice(total)}</strong>
      </span>
    )
  }

  if (extraDays === 0) {
    return (
      <span className={className}>
        {formatPrice(monthlyPrice)} × {fullMonths} {monthLabel} ={' '}
        <strong className="text-brand-green">{formatPrice(total)}</strong>
      </span>
    )
  }

  if (compact) {
    return (
      <span className={className}>
        {formatPrice(monthlyPrice)} × {fullMonths} {monthLabel} + {formatPrice(dailyPrice)} ×{' '}
        {extraDays} {dayWord} ={' '}
        <strong className="text-brand-green">{formatPrice(total)}</strong>
      </span>
    )
  }

  return (
    <div className={className}>
      <p>
        {formatPrice(monthlyPrice)} × {fullMonths} {monthLabel}
      </p>
      <p className="mt-1">
        + {formatPrice(dailyPrice)} × {extraDays} {dayWord}{' '}
        <span className="text-slate-500">({copy.booking.extraDaysAtDaily})</span>
      </p>
      <p className="mt-2 font-medium">
        = <strong className="text-brand-green">{formatPrice(total)}</strong>
      </p>
    </div>
  )
}
import { cn } from '../../lib/utils'
import { copy } from '../../lib/copy'
import type { RentalPeriodType } from '../../lib/types'

interface RentalPeriodToggleProps {
  value: RentalPeriodType
  onChange: (type: RentalPeriodType) => void
  className?: string
  size?: 'sm' | 'md'
}

export function RentalPeriodToggle({
  value,
  onChange,
  className,
  size = 'md',
}: RentalPeriodToggleProps) {
  const options: { id: RentalPeriodType; label: string }[] = [
    { id: 'daily', label: copy.cars.rentalDaily },
    { id: 'monthly', label: copy.cars.rentalMonthly },
  ]

  return (
    <div
      className={cn(
        'inline-flex rounded-xl bg-slate-100 p-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className,
      )}
      role="group"
      aria-label={copy.cars.rentalType}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'rounded-lg px-3 py-2 font-medium transition-all min-h-[40px] sm:min-h-0',
            size === 'sm' && 'px-2.5 py-1.5',
            value === opt.id
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-slate-500 hover:text-brand-dark',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
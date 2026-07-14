import { cn } from '../../lib/utils'
import { copy } from '../../lib/copy'

interface FleetOffersToggleProps {
  offersOnly: boolean
  onChange: (offersOnly: boolean) => void
  className?: string
}

export function FleetOffersToggle({
  offersOnly,
  onChange,
  className,
}: FleetOffersToggleProps) {
  return (
    <div
      className={cn('inline-flex w-full rounded-xl bg-slate-100 p-1 text-sm', className)}
      role="group"
      aria-label={copy.cars.offersOnly}
    >
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'flex-1 rounded-lg px-3 py-2.5 font-semibold transition-all min-h-[44px]',
          !offersOnly
            ? 'bg-white text-brand-dark shadow-sm'
            : 'text-slate-500 hover:text-brand-dark',
        )}
      >
        {copy.cars.fleetViewAll}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'flex-1 rounded-lg px-3 py-2.5 font-semibold transition-all min-h-[44px]',
          offersOnly
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-red-600 hover:bg-red-50',
        )}
      >
        {copy.cars.offersOnly}
      </button>
    </div>
  )
}
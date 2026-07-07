import { CalendarDays, CalendarRange } from 'lucide-react'
import type { Car, CarAvailability, RentalPeriodType } from '../../lib/types'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'
import { CarCard } from './CarCard'

interface FleetRentalSectionProps {
  type: RentalPeriodType
  cars: { car: Car; availability: CarAvailability }[]
  startDate?: string
  endDate?: string
  branchId?: string
  className?: string
}

const sectionMeta = {
  daily: {
    id: 'daily-fleet',
    title: copy.cars.dailyFleetTitle,
    subtitle: copy.cars.dailyFleetSub,
    icon: CalendarDays,
    accent: 'border-brand-green/30 bg-brand-green/5',
    iconColor: 'text-brand-green',
  },
  monthly: {
    id: 'monthly-fleet',
    title: copy.cars.monthlyFleetTitle,
    subtitle: copy.cars.monthlyFleetSub,
    icon: CalendarRange,
    accent: 'border-brand-gold/30 bg-brand-gold/5',
    iconColor: 'text-brand-gold',
  },
} as const

export function FleetRentalSection({
  type,
  cars,
  startDate,
  endDate,
  branchId,
  className,
}: FleetRentalSectionProps) {
  const meta = sectionMeta[type]
  const Icon = meta.icon

  return (
    <section id={meta.id} className={cn('scroll-mt-24', className)}>
      <div
        className={cn(
          'mb-6 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5',
          meta.accent,
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 rounded-xl bg-white p-2.5 shadow-sm', meta.iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-dark sm:text-xl">{meta.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{meta.subtitle}</p>
          </div>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-md">
          <p className="text-slate-500">{copy.cars.noResults}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map(({ car, availability }, i) => (
            <CarCard
              key={`${type}-${car.id}`}
              car={car}
              index={i}
              startDate={startDate}
              endDate={endDate}
              branchId={branchId}
              rentalType={type}
              availability={availability}
            />
          ))}
        </div>
      )}
    </section>
  )
}
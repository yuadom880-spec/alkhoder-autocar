import { Link } from 'react-router'
import { Calendar, ChevronLeft, Fuel, MoveHorizontal, Settings2 } from 'lucide-react'
import type { Car, CarAvailability, RentalPeriodType } from '../../lib/types'
import { buildBookingQuery } from '../../lib/branchFilter'
import { isCarAvailableForBranch } from '../../lib/carBranchAvailability'
import { getCustomerUnavailableLabel } from '../../lib/carStatus'
import { translateCarSpec } from '../../lib/i18n/labels'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { resolveCarForBranch } from '../../lib/carBranchProfile'
import { optimizeImageUrl } from '../../lib/imageUrl'
import { CarPrice, OfferBadge } from './CarPrice'
import { Button } from '../ui/Button'

export interface FleetCarouselItem {
  car: Car
  availability?: CarAvailability
}

interface FleetCarCarouselProps {
  items: FleetCarouselItem[]
  rentalType?: RentalPeriodType
  branchId?: string
}

export function FleetCarCarousel({
  items,
  rentalType = 'daily',
  branchId,
}: FleetCarCarouselProps) {
  const { locale } = useLocale()

  return (
    <div>
      <div className="fleet-carousel -mx-1 flex gap-3.5 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ car, availability }, index) => {
          const query = buildBookingQuery({ branch: branchId, rental: rentalType })
          const detailUrl = `/cars/${car.id}${query}`
          const bookUrl = `/book/${car.id}${query}`
          const displayCar = resolveCarForBranch(car, branchId)
          const canBook = availability?.available ?? isCarAvailableForBranch(car, branchId)
          const overlayLabel = getCustomerUnavailableLabel(availability?.reason)
          const img = optimizeImageUrl(displayCar.image_url, 560)

          return (
            <article
              key={car.id}
              className="group w-[272px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(10,22,40,0.08)] ring-1 ring-slate-200/80 transition-shadow hover:shadow-[0_12px_36px_rgba(10,22,40,0.12)]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link to={detailUrl} className="relative block h-[188px] overflow-hidden bg-slate-100">
                <img
                  src={img}
                  alt={displayCar.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute top-2.5 right-2.5 z-10">
                  <OfferBadge car={car} rentalType={rentalType} branchId={branchId} />
                </div>
                {!canBook && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
                    <span className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                      {overlayLabel}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-3.5 bottom-3 z-10">
                  <h3 className="truncate text-base font-extrabold text-white drop-shadow-sm">
                    {displayCar.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-white/90">
                    {displayCar.brand} · {displayCar.year}
                  </p>
                </div>
              </Link>

              <div className="space-y-3 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Settings2 className="h-3 w-3 shrink-0" />
                      {translateCarSpec(displayCar.specs.transmission, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Fuel className="h-3 w-3 shrink-0" />
                      {translateCarSpec(displayCar.specs.fuel, locale)}
                    </span>
                  </div>
                  <CarPrice car={car} size="xs" rentalType={rentalType} branchId={branchId} />
                </div>
                {canBook ? (
                  <Link to={bookUrl}>
                    <Button className="h-10 w-full text-sm font-bold">
                      <Calendar className="h-4 w-4" />
                      {copy.cars.bookNow}
                    </Button>
                  </Link>
                ) : (
                  <Button className="h-10 w-full text-sm" variant="outline" disabled>
                    {overlayLabel}
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {items.length > 1 && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <MoveHorizontal className="h-4 w-4 opacity-70" />
          {copy.cars.fleetSwipeHint}
          <ChevronLeft className="h-3.5 w-3.5 opacity-50 rtl:rotate-180" />
        </p>
      )}
    </div>
  )
}
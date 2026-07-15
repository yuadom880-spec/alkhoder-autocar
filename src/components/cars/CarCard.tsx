import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar, Fuel, Settings2, Users } from 'lucide-react'
import type { Car, CarAvailability, RentalPeriodType } from '../../lib/types'
import { buildBookingQuery } from '../../lib/branchFilter'
import { isCarAvailableForBranch } from '../../lib/carBranchAvailability'
import { getCustomerUnavailableLabel } from '../../lib/carStatus'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { resolveCarForBranch } from '../../lib/carBranchProfile'
import { getCategoryLabel, getClassLabel, translateCarSpec } from '../../lib/i18n/labels'
import { Badge } from '../ui/Badge'
import { CarPrice, OfferBadge } from './CarPrice'
import { CarAvailabilityBadge } from './CarAvailabilityBadge'
import { CarImage } from './CarImage'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface CarCardProps {
  car: Car
  index?: number
  startDate?: string
  endDate?: string
  branchId?: string
  rentalType?: RentalPeriodType
  availability?: CarAvailability
  /** شبكة موبايل — بطاقة مدمجة بعمودين */
  compact?: boolean
}

export function CarCard({
  car,
  index = 0,
  startDate,
  endDate,
  branchId,
  rentalType = 'daily',
  availability,
  compact = false,
}: CarCardProps) {
  const { locale } = useLocale()
  const query = buildBookingQuery({ branch: branchId, start: startDate, end: endDate, rental: rentalType })
  const detailUrl = `/cars/${car.id}${query}`
  const bookUrl = `/book/${car.id}${query}`

  const displayCar = resolveCarForBranch(car, branchId)
  const canBook = availability?.available ?? isCarAvailableForBranch(car, branchId)
  const overlayLabel = getCustomerUnavailableLabel(availability?.reason)

  if (compact) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-xl bg-white',
          'ring-1 ring-slate-200/90 shadow-[0_4px_20px_rgba(10,22,40,0.06)]',
          'transition-all duration-300 hover:shadow-[0_8px_28px_rgba(10,22,40,0.1)] hover:-translate-y-0.5',
        )}
      >
        <Link to={detailUrl} className="relative block shrink-0">
          <CarImage src={displayCar.image_url} alt={displayCar.name} variant="card" className="aspect-[5/4]">
            <div className="absolute top-2 right-2 z-10">
              <OfferBadge car={car} rentalType={rentalType} branchId={branchId} />
            </div>
            {availability && (
              <div className="absolute bottom-2 left-2 z-10">
                <CarAvailabilityBadge availability={availability} showDatesHint={false} />
              </div>
            )}
            {!canBook && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
                <span className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                  {overlayLabel}
                </span>
              </div>
            )}
          </CarImage>
        </Link>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <Link to={detailUrl}>
            <h3 className="truncate text-xs font-extrabold text-brand-dark group-hover:text-brand-green sm:text-sm">
              {displayCar.name}
            </h3>
            <p className="truncate text-[10px] text-slate-500 sm:text-xs">
              {displayCar.brand} · {displayCar.year}
            </p>
          </Link>

          <div className="mt-auto pt-2">
            <CarPrice car={car} size="xs" rentalType={rentalType} branchId={branchId} />
          </div>

          <div className="mt-2 grid grid-cols-1 gap-1.5">
            {canBook ? (
              <Link to={bookUrl}>
                <Button className="h-8 w-full text-[11px] font-bold sm:text-xs" size="sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {copy.cars.bookNow}
                </Button>
              </Link>
            ) : (
              <Button className="h-8 w-full text-[11px]" size="sm" variant="outline" disabled>
                {overlayLabel}
              </Button>
            )}
            <Link to={detailUrl}>
              <Button variant="outline" size="sm" className="h-7 w-full text-[10px] sm:text-xs">
                {copy.cars.details}
              </Button>
            </Link>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-md card-hover ring-1 ring-slate-100"
    >
      <Link to={detailUrl}>
        <CarImage src={displayCar.image_url} alt={displayCar.name} variant="card">
          <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end z-10">
            <OfferBadge car={car} rentalType={rentalType} branchId={branchId} />
            <Badge>{getCategoryLabel(displayCar.category, locale)}</Badge>
            <Badge variant="info">{getClassLabel(displayCar.car_class, locale)}</Badge>
            {availability && (
              <CarAvailabilityBadge
                availability={availability}
                showDatesHint={Boolean(startDate && endDate)}
              />
            )}
          </div>
          {!canBook && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">
                {overlayLabel}
              </span>
            </div>
          )}
        </CarImage>
      </Link>

      <div className="p-4 sm:p-5">
        <Link to={detailUrl}>
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                {displayCar.name}
              </h3>
              <p className="text-xs text-slate-500">
                {displayCar.brand} · {displayCar.year}
              </p>
            </div>
            <CarPrice car={car} size="sm" rentalType={rentalType} branchId={branchId} />
          </div>
        </Link>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {translateCarSpec(displayCar.specs.transmission, locale)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {translateCarSpec(displayCar.specs.fuel, locale)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {displayCar.specs.seats} {copy.detail.seatsUnit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to={detailUrl}>
            <Button variant="outline" size="sm" className="w-full">
              {copy.cars.details}
            </Button>
          </Link>
          {canBook ? (
            <Link to={bookUrl}>
              <Button className="w-full" size="sm">
                <Calendar className="h-4 w-4" />
                {copy.cars.bookNow}
              </Button>
            </Link>
          ) : (
            <Button className="w-full" size="sm" variant="outline" disabled>
              <Calendar className="h-4 w-4" />
              {overlayLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
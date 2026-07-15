import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { Car, CarAvailability, RentalPeriodType } from '../../lib/types'
import { buildBookingQuery } from '../../lib/branchFilter'
import { isCarAvailableForBranch } from '../../lib/carBranchAvailability'
import { getCustomerUnavailableLabel } from '../../lib/carStatus'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { resolveCarForBranch } from '../../lib/carBranchProfile'
import { getCategoryLabel, getClassLabel } from '../../lib/i18n/labels'
import { Badge } from '../ui/Badge'
import { CarPrice, OfferBadge } from './CarPrice'
import { CarAvailabilityBadge } from './CarAvailabilityBadge'
import { CarImage } from './CarImage'
import { Button } from '../ui/Button'

interface CarRowCardProps {
  car: Car
  index?: number
  startDate?: string
  endDate?: string
  branchId?: string
  rentalType?: RentalPeriodType
  availability?: CarAvailability
}

export function CarRowCard({
  car,
  index = 0,
  startDate,
  endDate,
  branchId,
  rentalType = 'daily',
  availability,
}: CarRowCardProps) {
  const { locale } = useLocale()
  const query = buildBookingQuery({
    branch: branchId,
    start: startDate,
    end: endDate,
    rental: rentalType,
  })
  const detailUrl = `/cars/${car.id}${query}`
  const bookUrl = `/book/${car.id}${query}`

  const displayCar = resolveCarForBranch(car, branchId)
  const canBook = availability?.available ?? isCarAvailableForBranch(car, branchId)
  const overlayLabel = getCustomerUnavailableLabel(availability?.reason)

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/90 transition-shadow hover:shadow-md"
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <Link to={detailUrl} className="relative shrink-0">
          <CarImage
            src={displayCar.image_url}
            alt={displayCar.name}
            variant="thumb"
            className="!h-[96px] !w-[124px] rounded-xl"
          >
            {!canBook && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45">
                <span className="text-[10px] font-bold text-white">{overlayLabel}</span>
              </div>
            )}
          </CarImage>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link to={detailUrl} className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-brand-dark hover:text-brand-green">
                {displayCar.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {displayCar.brand} · {displayCar.year}
              </p>
            </Link>
            <CarPrice car={car} size="sm" rentalType={rentalType} branchId={branchId} />
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
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

          <div className="mt-auto flex gap-2 pt-3">
            <Link to={detailUrl} className="flex-1">
              <Button variant="outline" size="sm" className="h-9 w-full text-xs">
                {copy.cars.details}
              </Button>
            </Link>
            {canBook ? (
              <Link to={bookUrl} className="flex-[1.4]">
                <Button size="sm" className="h-9 w-full text-xs font-bold">
                  <Calendar className="h-3.5 w-3.5" />
                  {copy.cars.bookNow}
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="h-9 flex-[1.4] text-xs" variant="outline" disabled>
                {overlayLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
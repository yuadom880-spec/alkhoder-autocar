import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar, Fuel, Settings2, Users } from 'lucide-react'
import type { Car, CarAvailability, RentalPeriodType } from '../../lib/types'
import { buildBookingQuery } from '../../lib/branchFilter'
import { isCarAvailableForBranch } from '../../lib/carBranchAvailability'
import { getCustomerUnavailableLabel } from '../../lib/carStatus'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { getCategoryLabel, getClassLabel, translateCarSpec } from '../../lib/i18n/labels'
import { Badge } from '../ui/Badge'
import { CarPrice, OfferBadge } from './CarPrice'
import { CarAvailabilityBadge } from './CarAvailabilityBadge'
import { CarImage } from './CarImage'
import { Button } from '../ui/Button'

interface CarCardProps {
  car: Car
  index?: number
  startDate?: string
  endDate?: string
  branchId?: string
  rentalType?: RentalPeriodType
  availability?: CarAvailability
}

export function CarCard({
  car,
  index = 0,
  startDate,
  endDate,
  branchId,
  rentalType = 'daily',
  availability,
}: CarCardProps) {
  const { locale } = useLocale()
  const query = buildBookingQuery({ branch: branchId, start: startDate, end: endDate, rental: rentalType })
  const detailUrl = `/cars/${car.id}${query}`
  const bookUrl = `/book/${car.id}${query}`

  const canBook = availability?.available ?? isCarAvailableForBranch(car, branchId)
  const overlayLabel = getCustomerUnavailableLabel(availability?.reason)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-md card-hover"
    >
      <Link to={detailUrl}>
        <CarImage src={car.image_url} alt={car.name} variant="card">
          <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end z-10">
            <OfferBadge car={car} rentalType={rentalType} branchId={branchId} />
            <Badge>{getCategoryLabel(car.category, locale)}</Badge>
            <Badge variant="info">{getClassLabel(car.car_class, locale)}</Badge>
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
                {car.name}
              </h3>
              <p className="text-xs text-slate-500">
                {car.brand} · {car.year}
              </p>
            </div>
            <CarPrice car={car} size="sm" rentalType={rentalType} branchId={branchId} />
          </div>
        </Link>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {translateCarSpec(car.specs.transmission, locale)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {translateCarSpec(car.specs.fuel, locale)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {car.specs.seats} {copy.detail.seatsUnit}
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
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowRight, Calendar, Fuel, Settings2, Snowflake, Users } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CarAvailabilityBadge } from '../components/cars/CarAvailabilityBadge'
import { getCategoryLabel, getClassLabel } from '../lib/constants'
import { copy } from '../lib/copy'
import { buildBookingQuery } from '../lib/branchFilter'
import { getCarAvailability } from '../lib/availability'
import { PromoOfferBanner } from '../components/offers/PromoOfferBanner'
import { getFeaturedOfferPriceLabel } from '../lib/featuredOffers'
import { useCustomerBranch } from '../hooks/useCustomerBranch'
import { carMatchesBranch } from '../lib/branchFilter'
import { fetchBookingBlocks, fetchCarById, fetchFeaturedOfferById } from '../lib/supabase'
import type { BookingBlock, Car, FeaturedOffer } from '../lib/types'
import { getCarOffer, isOfferActive } from '../lib/offers'
import { getCarDisplayPrice, getPriceUnitLabel } from '../lib/pricing'
import { CarImage } from '../components/cars/CarImage'
import { CarPrice, OfferBadge } from '../components/cars/CarPrice'
import { RentalPeriodToggle } from '../components/cars/RentalPeriodToggle'
import { useRentalPeriod } from '../hooks/useRentalPeriod'
import { formatDate, formatPrice } from '../lib/utils'

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [car, setCar] = useState<Car | null>(null)
  const [promoOffer, setPromoOffer] = useState<FeaturedOffer | null>(null)
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  const promoId = searchParams.get('promo') ?? ''
  const start = searchParams.get('start') ?? ''
  const end = searchParams.get('end') ?? ''
  const { rentalType, setRentalType } = useRentalPeriod()
  const { branchId, hasBranch } = useCustomerBranch()

  const bookUrl = useMemo(
    () =>
      `/book/${id}${buildBookingQuery({ branch: branchId, start, end, promo: promoId, rental: rentalType })}`,
    [id, start, end, promoId, branchId, rentalType],
  )

  useEffect(() => {
    if (!id) return
    const tasks: Promise<unknown>[] = [fetchCarById(id), fetchBookingBlocks(id)]
    if (promoId) tasks.push(fetchFeaturedOfferById(promoId))

    Promise.all(tasks)
      .then((results) => {
        setCar(results[0] as Car | null)
        setBlocks(results[1] as BookingBlock[])
        if (promoId && results[2]) setPromoOffer(results[2] as FeaturedOffer)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, promoId])

  const carAvailableInBranch = useMemo(
    () => !car || !hasBranch || carMatchesBranch(car, branchId),
    [car, hasBranch, branchId],
  )

  const availability = useMemo(
    () =>
      car && hasBranch
        ? getCarAvailability(car, blocks, start || undefined, end || undefined, branchId)
        : null,
    [car, blocks, start, end, branchId, hasBranch],
  )

  if (loading) return <LoadingSpinner />

  if (!car) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-xl font-bold text-brand-dark mb-4">{copy.detail.notFound}</h1>
        <Link to="/cars" className="text-brand-green hover:underline">
          {copy.detail.back}
        </Link>
      </div>
    )
  }

  const images = car.images.length > 0 ? car.images : [car.image_url]
  const canBook = hasBranch && carAvailableInBranch && (availability?.available ?? false)
  const displayPrice =
    promoOffer && promoOffer.price > 0
      ? promoOffer.price
      : getCarDisplayPrice(car, rentalType, hasBranch ? branchId : null)
  const priceUnit = promoOffer
    ? promoOffer.rental_type === 'monthly'
      ? copy.cars.perMonth
      : copy.cars.perDay
    : getPriceUnitLabel(rentalType)
  const hasPromoPrice = Boolean(promoOffer && promoOffer.price > 0)

  const unavailableMessage =
    availability?.reason === 'booked'
      ? start && end
        ? copy.detail.bookedConfirmed
        : copy.detail.booked
      : copy.detail.adminDisabled

  return (
    <>
      <div className="page-shell pb-28 sm:pb-24 lg:pb-14">
        <div className="container-main">
          <Link
            to={promoOffer ? '/offers' : '/cars'}
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-green transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            {promoOffer ? copy.offers.viewAll : copy.detail.back}
          </Link>

          {promoOffer && (
            <PromoOfferBanner
              offer={promoOffer}
              showBookButton={canBook}
            />
          )}

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <CarImage
                src={images[activeImage]}
                alt={car.name}
                variant="detail"
                className="mb-3"
                loading="eager"
              >
                {!canBook && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                    <span className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white">
                      {availability?.reason === 'booked' ? copy.cars.booked : copy.cars.unavailable}
                    </span>
                  </div>
                )}
              </CarImage>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 border-2 transition-colors ${
                        activeImage === i ? 'border-brand-green' : 'border-transparent'
                      }`}
                    >
                      <CarImage src={img} alt="" variant="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <OfferBadge car={car} rentalType={rentalType} branchId={hasBranch ? branchId : null} />
                <Badge>{getCategoryLabel(car.category)}</Badge>
                <Badge variant="info">{getClassLabel(car.car_class)}</Badge>
                {availability && (
                  <CarAvailabilityBadge availability={availability} showDatesHint={Boolean(start && end)} />
                )}
              </div>

              <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl mb-2">{car.name}</h1>
              <p className="text-slate-500 mb-4">
                {car.brand} {car.model} · {car.year}
              </p>

              {start && end && (
                <p className="mb-4 text-sm text-slate-600">
                  {copy.cars.datesSelected}: {formatDate(start)} — {formatDate(end)}
                </p>
              )}

              {!carAvailableInBranch && hasBranch && (
                <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  {copy.cars.noCarsInBranch}
                </div>
              )}

              {!promoOffer && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">{copy.cars.rentalType}</p>
                  <RentalPeriodToggle value={rentalType} onChange={setRentalType} />
                </div>
              )}

              <div className={`mb-6 rounded-xl p-4 border ${hasPromoPrice || isOfferActive(car, rentalType, hasBranch ? branchId : null) ? 'bg-red-50 border-red-200' : 'bg-brand-green/5 border-brand-green/20'}`}>
                {promoOffer?.title && (
                  <p className="text-sm font-bold text-red-600 mb-2">{promoOffer.title}</p>
                )}
                {!promoOffer && getCarOffer(car, rentalType)?.title && isOfferActive(car, rentalType, hasBranch ? branchId : null) && (
                  <p className="text-sm font-bold text-red-600 mb-2">{getCarOffer(car, rentalType)?.title}</p>
                )}
                {hasPromoPrice && promoOffer ? (
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {getFeaturedOfferPriceLabel(promoOffer)}
                    </p>
                    {promoOffer.original_price && promoOffer.original_price > promoOffer.price ? (
                      <p className="text-sm text-slate-400 line-through mt-1">
                        {formatPrice(promoOffer.original_price)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 line-through mt-1">
                        {formatPrice(
                          promoOffer.rental_type === 'monthly'
                            ? car.price_per_month
                            : car.price_per_day,
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <CarPrice car={car} size="lg" showSavings rentalType={rentalType} branchId={hasBranch ? branchId : null} />
                )}
                {promoOffer?.description && (
                  <p className="text-xs text-slate-500 mt-2">{promoOffer.description}</p>
                )}
                {!promoOffer && getCarOffer(car, rentalType)?.description && isOfferActive(car, rentalType, hasBranch ? branchId : null) && (
                  <p className="text-xs text-slate-500 mt-2">{getCarOffer(car, rentalType)?.description}</p>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed mb-6">{car.description}</p>

              <h2 className="font-bold text-brand-dark mb-3">{copy.detail.specs}</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Settings2, label: copy.detail.transmission, value: car.specs.transmission },
                  { icon: Fuel, label: copy.detail.fuel, value: car.specs.fuel },
                  { icon: Users, label: copy.detail.seats, value: `${car.specs.seats} مقاعد` },
                  {
                    icon: Snowflake,
                    label: copy.detail.ac,
                    value: car.specs.ac ? copy.detail.acYes : copy.detail.acNo,
                  },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                  >
                    <spec.icon className="h-5 w-5 text-brand-green shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">{spec.label}</p>
                      <p className="text-sm font-medium text-brand-dark">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!hasBranch ? (
                <div className="rounded-2xl bg-brand-green/5 border border-brand-green/20 p-6 text-center">
                  <p className="text-brand-dark font-medium mb-1">{copy.cars.branchPromptTitle}</p>
                  <p className="text-sm text-slate-600 mb-4">{copy.cars.branchRequiredHint}</p>
                  <Link
                    to="/#choose-branch-home"
                    className="inline-flex items-center justify-center rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-green/90"
                  >
                    {copy.cars.branchPromptCta}
                  </Link>
                </div>
              ) : canBook ? (
                <Link to={bookUrl} className="hidden lg:block">
                  <Button size="lg" className="w-full">
                    <Calendar className="h-5 w-5" />
                    {copy.detail.bookThis}
                  </Button>
                </Link>
              ) : (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
                  <p className="text-red-700 font-medium">
                    {!carAvailableInBranch ? copy.cars.noCarsInBranch : unavailableMessage}
                  </p>
                  {!start && !end && car.is_available && carAvailableInBranch && (
                    <p className="mt-2 text-sm text-red-600/80">{copy.cars.checkDates}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasBranch && canBook && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 safe-bottom lg:hidden">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{car.name}</p>
              <p className={`font-bold ${hasPromoPrice || isOfferActive(car, rentalType, hasBranch ? branchId : null) ? 'text-red-600' : 'text-brand-green'}`}>
                {formatPrice(displayPrice)}{priceUnit}
              </p>
            </div>
          </div>
          <Link to={bookUrl}>
            <Button className="w-full min-h-[48px]" size="lg">
              <Calendar className="h-5 w-5" />
              {copy.cars.bookNow}
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}
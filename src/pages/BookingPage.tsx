import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BookingForm } from '../components/booking/BookingForm'
import { BookingSummary } from '../components/booking/BookingSummary'
import { PromoOfferBanner } from '../components/offers/PromoOfferBanner'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { buildBookingQuery, carMatchesBranch, findBranch, getBranchesForCar } from '../lib/branchFilter'
import { canBookCar } from '../lib/availability'
import { copy } from '../lib/copy'
import { isFeaturedOfferActive } from '../lib/featuredOffers'
import { getCarDisplayPrice, parseRentalType } from '../lib/pricing'
import { getEffectivePrice } from '../lib/offers'
import { RentalPeriodToggle } from '../components/cars/RentalPeriodToggle'
import { useRentalPeriod } from '../hooks/useRentalPeriod'
import { notifyBookingPending } from '../lib/bookingWhatsApp'
import {
  createBooking,
  fetchBookingBlocks,
  fetchBranches,
  fetchCarById,
  fetchFeaturedOfferById,
} from '../lib/supabase'
import type { BookingBlock, BranchRecord, Car, FeaturedOffer } from '../lib/types'

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [car, setCar] = useState<Car | null>(null)
  const [promoOffer, setPromoOffer] = useState<FeaturedOffer | null>(null)
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const promoId = searchParams.get('promo') ?? ''
  const branchId = searchParams.get('branch') ?? ''
  const startDate = searchParams.get('start') ?? ''
  const endDate = searchParams.get('end') ?? ''
  const { rentalType, setRentalType } = useRentalPeriod()
  const [dates, setDates] = useState({ start: startDate, end: endDate })
  const [pickupTime, setPickupTime] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<BranchRecord | null>(null)
  const [whatsappSent, setWhatsappSent] = useState<boolean | null>(null)

  const availableBranches = useMemo(() => {
    if (!car) return []
    return getBranchesForCar(car, branches)
  }, [car, branches])

  const preselectedBranch = useMemo(
    () => findBranch(availableBranches, branchId || null),
    [availableBranches, branchId],
  )

  useEffect(() => {
    if (!id) return

    let cancelled = false
    setLoading(true)
    setLoadError('')

    const load = async () => {
      let promo: FeaturedOffer | null = null
      if (promoId) {
        promo = await fetchFeaturedOfferById(promoId)
      }

      const carId = promo?.car_id || id

      if (promo?.car_id && promo.car_id !== id) {
        navigate(
          `/book/${promo.car_id}${buildBookingQuery({ branch: branchId, promo: promoId, start: startDate, end: endDate })}`,
          { replace: true },
        )
        return
      }

      const [carData, blocksData, branchesData] = await Promise.all([
        fetchCarById(carId),
        fetchBookingBlocks(carId),
        fetchBranches({ activeOnly: true }),
      ])

      if (cancelled) return

      if (!carData) {
        setLoadError(
          promo
            ? 'السيارة المرتبطة بالعرض غير موجودة — تأكد من ربط العرض بسيارة من لوحة الإدارة'
            : copy.detail.notFound,
        )
        setCar(null)
        setPromoOffer(promo)
        return
      }

      if (branchId && !carMatchesBranch(carData, branchId)) {
        setLoadError('هذه السيارة غير متاحة في الفرع المحدد — ارجع لصفحة السيارات واختر فرعاً آخر')
        setCar(carData)
        setPromoOffer(promo)
        setBranches(branchesData)
        return
      }

      setCar(carData)
      setBlocks(blocksData)
      setBranches(branchesData)
      setPromoOffer(promo)
    }

    load()
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'فشل تحميل الحجز')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, promoId, branchId, navigate, startDate, endDate])

  const effectiveRentalType = useMemo(() => {
    if (promoOffer?.rental_type === 'monthly') return 'monthly' as const
    return parseRentalType(searchParams.get('rental'))
  }, [promoOffer, searchParams])

  const unitPrice = useMemo(() => {
    if (!car) return 0
    if (promoOffer && isFeaturedOfferActive(promoOffer) && promoOffer.price > 0) {
      return promoOffer.price
    }
    return getCarDisplayPrice(car, effectiveRentalType)
  }, [car, promoOffer, effectiveRentalType])

  const dailyPrice = useMemo(() => {
    if (!car) return 0
    return getEffectivePrice(car, 'daily')
  }, [car])

  const activeBranchId = selectedBranch?.id ?? (branchId || null)

  const bookingCheck = useMemo(() => {
    if (!car || !dates.start || !dates.end || !activeBranchId) return null
    return canBookCar(car, blocks, dates.start, dates.end, activeBranchId)
  }, [car, blocks, dates.start, dates.end, activeBranchId])

  if (loading) return <LoadingSpinner />

  if (!car || loadError) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-xl font-bold text-brand-dark mb-4">
          {loadError || copy.detail.notFound}
        </h1>
        {promoOffer && (
          <p className="text-sm text-slate-500 mb-4">
            العرض: <strong>{promoOffer.title}</strong>
          </p>
        )}
        <Link to="/cars" className="text-brand-green hover:underline">
          العودة للسيارات
        </Link>
      </div>
    )
  }

  const backLink = promoOffer
    ? '/offers'
    : `/cars/${car.id}${buildBookingQuery({ branch: branchId, start: startDate, end: endDate, rental: effectiveRentalType })}`
  const pageTitle = promoOffer ? copy.booking.promoBooking : copy.booking.title
  const pageSubtitle = promoOffer ? copy.booking.promoBookingSub : copy.booking.subtitle

  return (
    <div className="page-shell">
      <div className="container-main">
        <Link
          to={backLink}
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-green transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          {promoOffer ? copy.offers.viewAll : copy.booking.backToCar}
        </Link>

        {promoOffer && <PromoOfferBanner offer={promoOffer} showBookButton={false} />}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title">{pageTitle}</h1>
          <p className="section-subtitle">{pageSubtitle}</p>
          {promoOffer?.rental_type === 'monthly' && (
            <p className="mt-2 text-sm text-red-600 font-medium">{copy.offers.monthlyHint}</p>
          )}
          {!promoOffer && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">{copy.cars.rentalType}</p>
              <RentalPeriodToggle value={rentalType} onChange={setRentalType} />
            </div>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="order-2 lg:order-1 lg:col-span-3">
            <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
              <BookingForm
                unitPrice={unitPrice}
                dailyPrice={dailyPrice}
                rentalType={effectiveRentalType}
                initialStartDate={dates.start}
                initialEndDate={dates.end}
                multiStep
                branches={availableBranches}
                initialBranchId={preselectedBranch?.id ?? ''}
                isPromoBooking={Boolean(promoOffer)}
                onDatesChange={(start, end) => setDates({ start, end })}
                onPickupTimeChange={setPickupTime}
                onBranchChange={setSelectedBranch}
                isDateRangeAvailable={bookingCheck?.ok}
                unavailableMessage={bookingCheck?.message}
                successWhatsAppSent={whatsappSent}
                onSubmit={async (data) => {
                  if (availableBranches.length > 0 && !selectedBranch) {
                    throw new Error(copy.booking.errors.pickupBranch)
                  }
                  const booking = await createBooking(car.id, data, unitPrice, {
                    promoOfferId: promoOffer?.id ?? null,
                    promoTitle: promoOffer?.title ?? null,
                    branchId: selectedBranch?.id ?? null,
                    branchName: selectedBranch?.name ?? null,
                    branchCity: selectedBranch?.city ?? null,
                    branchPhone: selectedBranch?.phone ?? null,
                    rentalType: effectiveRentalType,
                  })
                  const notify = await notifyBookingPending(
                    { ...booking, car },
                    car.name,
                  )
                  setWhatsappSent(notify.sent)
                }}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-2">
            <BookingSummary
              car={car}
              startDate={dates.start}
              endDate={dates.end}
              pickupTime={pickupTime}
              promoOffer={promoOffer}
              unitPrice={unitPrice}
              dailyPrice={dailyPrice}
              rentalType={effectiveRentalType}
              branch={selectedBranch}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
import { useCallback, useEffect, useState } from 'react'
import { useTableRealtime } from '../hooks/useTableRealtime'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { buildBookingQuery } from '../lib/branchFilter'
import { ArrowRight } from 'lucide-react'

import { PromoOfferBanner } from '../components/offers/PromoOfferBanner'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { useCustomerBranch } from '../hooks/useCustomerBranch'
import { copy } from '../lib/copy'
import { carMatchesBranch } from '../lib/branchFilter'
import { fetchCars, fetchFeaturedOfferById } from '../lib/supabase'
import type { Car, FeaturedOffer } from '../lib/types'

export function OfferBookingPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [offer, setOffer] = useState<FeaturedOffer | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCarId, setSelectedCarId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { branchId, hasBranch } = useCustomerBranch()

  const loadOffer = useCallback(() => {
    if (!offerId) return
    setLoading(true)
    Promise.all([fetchFeaturedOfferById(offerId), fetchCars({ availableOnly: true })])
      .then(([offerData, carsData]) => {
        if (!offerData) return
        setOffer(offerData)
        setCars(carsData)
        if (offerData.car_id) {
          const branch = searchParams.get('branch') ?? ''
          navigate(
            `/book/${offerData.car_id}${buildBookingQuery({ branch, promo: offerData.id })}`,
            { replace: true },
          )
          return
        }
        if (offerData.car) {
          setSelectedCarId(offerData.car.id)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [offerId, navigate, searchParams])

  useEffect(() => {
    loadOffer()
  }, [loadOffer])

  useTableRealtime('cars', loadOffer)
  useTableRealtime('featured_offers', loadOffer)

  if (loading) return <LoadingSpinner />

  if (!offer) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-xl font-bold text-brand-dark mb-4">{copy.offers.noOffers}</h1>
        <Link to="/offers" className="text-brand-green hover:underline">
          {copy.offers.viewAll}
        </Link>
      </div>
    )
  }

  const branchCars = hasBranch
    ? cars.filter((c) => carMatchesBranch(c, branchId))
    : cars

  const handleContinue = () => {
    if (!hasBranch) {
      setError(copy.cars.branchRequiredSearch)
      return
    }
    if (!selectedCarId) return
    navigate(`/book/${selectedCarId}${buildBookingQuery({ branch: branchId, promo: offer.id })}`)
  }

  return (
    <div className="py-10 lg:py-14">
      <div className="container-main max-w-2xl">
        <Link
          to="/offers"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-green transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          {copy.offers.viewAll}
        </Link>

        <PromoOfferBanner offer={offer} showBookButton={false} />

        <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
          <h1 className="text-xl font-bold text-brand-dark">{copy.booking.promoBooking}</h1>
          <p className="text-sm text-slate-600">{copy.booking.promoBookingSub}</p>

          {!hasBranch && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {copy.cars.pickBranchTitle} — {copy.cars.pickBranchSub}
            </p>
          )}

          <div>
            <label className="label-field">{copy.booking.selectCar}</label>
            <select
              className="input-field"
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              disabled={!hasBranch}
            >
              <option value="">{copy.booking.selectCarPlaceholder}</option>
              {branchCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name}
                </option>
              ))}
            </select>
            {hasBranch && branchCars.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">{copy.cars.noCarsInBranch}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedCarId || !hasBranch}
            onClick={handleContinue}
          >
            {copy.booking.continueBooking}
          </Button>
        </div>
      </div>
    </div>
  )
}
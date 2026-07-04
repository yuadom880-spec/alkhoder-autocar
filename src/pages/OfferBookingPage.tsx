import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { buildBookingQuery } from '../lib/branchFilter'
import { ArrowRight } from 'lucide-react'
import { PromoOfferBanner } from '../components/offers/PromoOfferBanner'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { copy } from '../lib/copy'
import { fetchCars, fetchFeaturedOfferById } from '../lib/supabase'
import type { Car, FeaturedOffer } from '../lib/types'

export function OfferBookingPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get('branch') ?? ''
  const [offer, setOffer] = useState<FeaturedOffer | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCarId, setSelectedCarId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!offerId) return
    Promise.all([fetchFeaturedOfferById(offerId), fetchCars({ availableOnly: true })])
      .then(([offerData, carsData]) => {
        if (!offerData) return
        setOffer(offerData)
        setCars(carsData)
        if (offerData.car_id) {
          navigate(
            `/book/${offerData.car_id}${buildBookingQuery({ branch: branchId, promo: offerData.id })}`,
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
  }, [offerId, navigate, branchId])

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

  const handleContinue = () => {
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

          <div>
            <label className="label-field">اختر السيارة *</label>
            <select
              className="input-field"
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="">— اختر سيارة —</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name}
                </option>
              ))}
            </select>
          </div>

          <Button className="w-full" size="lg" disabled={!selectedCarId} onClick={handleContinue}>
            متابعة الحجز
          </Button>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CalendarRange } from 'lucide-react'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { CarOfferForm } from '../../components/admin/CarOfferForm'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterCarsByBranch } from '../../lib/adminBranchFilters'
import { isCarExclusiveToBranch } from '../../lib/branchFilter'
import { getBranchFormCarData } from '../../lib/carBranchProfile'
import { copy } from '../../lib/copy'
import { hasMonthlyFeaturedOffer, normalizeCarOffers } from '../../lib/offers'
import {
  fetchCars,
  setCarBranchProfile,
  updateCar,
} from '../../lib/supabase'
import type { Car, CarOffer } from '../../lib/types'

const OFFERS_LIST = '/admin/offers'

export function AdminMonthlyOfferFormPage() {
  const navigate = useNavigate()
  const { isBranchAdmin, filterBranchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? filterBranchId : null

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [carId, setCarId] = useState('')
  const [pricePerMonth, setPricePerMonth] = useState(0)
  const [monthlyOffer, setMonthlyOffer] = useState<CarOffer | null>(null)

  useEffect(() => {
    fetchCars()
      .then(setCars)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visibleCars = useMemo(
    () => filterCarsByBranch(cars, branchScopeId),
    [cars, branchScopeId],
  )

  /** سيارات الأسطول التي لم تُضف بعد لقسم العروض المميزة */
  const eligibleCars = useMemo(
    () => visibleCars.filter((c) => !hasMonthlyFeaturedOffer(c, branchScopeId)),
    [visibleCars, branchScopeId],
  )

  const selectedCar = useMemo(
    () => visibleCars.find((c) => c.id === carId) ?? null,
    [visibleCars, carId],
  )

  useEffect(() => {
    if (!selectedCar) {
      setPricePerMonth(0)
      setMonthlyOffer(null)
      return
    }
    const formData = getBranchFormCarData(selectedCar, branchScopeId)
    setPricePerMonth(formData.price_per_month)
    setMonthlyOffer(normalizeCarOffers(formData.offer).monthly)
  }, [selectedCar, branchScopeId])

  const saveMonthlyOffer = async () => {
    if (!selectedCar) {
      setError(copy.admin.selectCarForOffer)
      return
    }
    if (!monthlyOffer?.active) {
      setError(copy.admin.monthlyOfferMustBeActive)
      return
    }

    const formData = getBranchFormCarData(selectedCar, branchScopeId)
    const branchOffers = normalizeCarOffers(formData.offer)
    const newOffers = { ...branchOffers, monthly: monthlyOffer }

    if (branchScopeId) {
      if (isCarExclusiveToBranch(selectedCar, branchScopeId)) {
        await updateCar(selectedCar.id, {
          price_per_month: pricePerMonth,
          offer: newOffers,
          unavailable_branch_ids: selectedCar.unavailable_branch_ids ?? [],
        })
      } else {
        await setCarBranchProfile(selectedCar.id, branchScopeId, {
          ...formData,
          price_per_month: pricePerMonth,
          offer: newOffers,
          is_available: selectedCar.is_available,
          is_featured: true,
          branch_ids: selectedCar.branch_ids ?? [],
          unavailable_branch_ids: selectedCar.unavailable_branch_ids ?? [],
        })
      }
    } else {
      const globalOffers = normalizeCarOffers(selectedCar.offer)
      await updateCar(selectedCar.id, {
        price_per_month: pricePerMonth,
        offer: { ...globalOffers, monthly: monthlyOffer },
        unavailable_branch_ids: selectedCar.unavailable_branch_ids ?? [],
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await saveMonthlyOffer()
      navigate(OFFERS_LIST)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AdminTopBar title={copy.admin.addMonthlyOffer} />
        <LoadingSpinner />
      </>
    )
  }

  return (
    <>
      <AdminTopBar title={copy.admin.addMonthlyOffer} />
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-brand-dark">
              {copy.admin.addMonthlyOffer}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{copy.admin.addMonthlyOfferSub}</p>
          </div>
          <Link to={OFFERS_LIST}>
            <Button variant="ghost" size="sm">
              {copy.admin.backToMonthlyOffers}
            </Button>
          </Link>
        </div>

        {visibleCars.length === 0 ? (
          <div className="max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500 mb-4">{copy.admin.addMonthlyOfferEmpty}</p>
            <Link to="/admin/cars/new">
              <Button>{copy.admin.addCarInFleet}</Button>
            </Link>
          </div>
        ) : eligibleCars.length === 0 ? (
          <div className="max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500 mb-4">{copy.admin.allCarsAlreadyFeatured}</p>
            <Link to={OFFERS_LIST}>
              <Button variant="outline">{copy.admin.backToMonthlyOffers}</Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="monthly-offer-car" className="label-field">
                  {copy.admin.selectCarForOfferLabel}
                </label>
                <select
                  id="monthly-offer-car"
                  className="input-field"
                  value={carId}
                  onChange={(e) => {
                    setCarId(e.target.value)
                    setError('')
                  }}
                >
                  <option value="">{copy.admin.selectCarForOfferPlaceholder}</option>
                  {eligibleCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} — {car.brand} · {car.year}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCar && (
                <div className="rounded-xl border border-brand-gold/25 bg-amber-50/40 px-4 py-3">
                  <p className="font-bold text-brand-dark">{selectedCar.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedCar.brand} · {selectedCar.model} · {selectedCar.year}
                  </p>
                </div>
              )}

              {selectedCar && (
                <>
                  <div>
                    <label className="label-field">
                      {isBranchAdmin ? copy.admin.carBranchMonthlyPrice : 'السعر الشهري (ر.س)'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={pricePerMonth}
                      onChange={(e) => setPricePerMonth(Number(e.target.value))}
                    />
                    {isBranchAdmin && (
                      <p className="text-[11px] text-slate-500 mt-1">{copy.admin.carBranchPriceHint}</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-brand-gold/25 bg-amber-50/50 px-4 py-3">
                    <p className="text-sm font-bold text-brand-dark">العرض الشهري</p>
                    <p className="text-xs text-slate-600 mt-1">{copy.admin.carOffersSectionHint}</p>
                  </div>

                  <CarOfferForm
                    rentalType="monthly"
                    basePrice={pricePerMonth}
                    offer={monthlyOffer}
                    onChange={setMonthlyOffer}
                    icon={CalendarRange}
                    heading="عرض شهري"
                  />
                </>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                <Button
                  type="submit"
                  isLoading={saving}
                  disabled={!selectedCar}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  {copy.admin.saveMonthlyOffer}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(OFFERS_LIST)}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
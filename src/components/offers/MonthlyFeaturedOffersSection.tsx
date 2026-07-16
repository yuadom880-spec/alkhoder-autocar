import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { CarCard } from '../cars/CarCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Button } from '../ui/Button'
import { PricesIncludeVatNote } from '../ui/PricesIncludeVatNote'
import { getCarAvailability } from '../../lib/availability'
import { carMatchesBranch } from '../../lib/branchFilter'
import { copy } from '../../lib/copy'
import { getOfferSavings, isMonthlyOfferOnlyCar } from '../../lib/offers'
import { fetchBookingBlocks, fetchCars } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { useTableRealtime } from '../../hooks/useTableRealtime'
import type { BookingBlock, Car } from '../../lib/types'

interface MonthlyFeaturedOffersSectionProps {
  compact?: boolean
  showHeader?: boolean
  limit?: number
  branchId?: string | null
  /** عند التمرير من الصفحة الرئيسية — تجنب طلب مكرر */
  cars?: Car[]
  blocks?: BookingBlock[]
  loading?: boolean
}

export function MonthlyFeaturedOffersSection({
  compact = false,
  showHeader = true,
  limit,
  branchId = null,
  cars: externalCars,
  blocks: externalBlocks,
  loading: externalLoading,
}: MonthlyFeaturedOffersSectionProps) {
  const [cars, setCars] = useState<Car[]>(externalCars ?? [])
  const [blocks, setBlocks] = useState<BookingBlock[]>(externalBlocks ?? [])
  const [loading, setLoading] = useState(externalLoading ?? externalCars == null)

  const selfFetch = externalCars == null

  const loadData = useCallback(() => {
    if (!selfFetch) return
    setLoading(true)
    Promise.all([
      fetchCars({ availableOnly: false }),
      fetchBookingBlocks(undefined, branchId),
    ])
      .then(([carsData, blocksData]) => {
        setCars(carsData)
        setBlocks(blocksData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selfFetch, branchId])

  useEffect(() => {
    if (externalCars != null) setCars(externalCars)
  }, [externalCars])

  useEffect(() => {
    if (externalBlocks != null) setBlocks(externalBlocks)
  }, [externalBlocks])

  useEffect(() => {
    if (externalLoading != null) setLoading(externalLoading)
  }, [externalLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  useTableRealtime('cars', loadData)

  const items = useMemo(() => {
    const list = cars
      .filter((car) => carMatchesBranch(car, branchId))
      .filter((car) => isMonthlyOfferOnlyCar(car, branchId))
      .map((car) => ({
        car,
        availability: getCarAvailability(
          car,
          blocks,
          undefined,
          undefined,
          branchId,
        ),
      }))
      .sort(
        (a, b) =>
          getOfferSavings(b.car, 'monthly', branchId) -
          getOfferSavings(a.car, 'monthly', branchId),
      )

    return limit ? list.slice(0, limit) : list
  }, [cars, blocks, branchId, limit])

  const isLoading = loading

  return (
    <section
      className={cn(
        compact
          ? 'border-y border-brand-gold/15 bg-gradient-to-b from-amber-50/90 via-white to-slate-50 py-10 sm:py-16 lg:py-20'
          : 'py-10 lg:py-14',
      )}
    >
      <div className="container-main">
        {showHeader && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3.5 py-1 text-xs font-semibold text-amber-800">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.offers.badge}
              </span>
              <h2 className="section-title">{copy.offers.title}</h2>
              <p className="section-subtitle">{copy.offers.subtitle}</p>
              <PricesIncludeVatNote />
            </div>
            {compact && (
              <Link to="/offers" className="hidden lg:block">
                <Button variant="outline">
                  {copy.offers.viewAll}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-16 text-center shadow-sm">
            <p className="text-slate-500">{copy.offers.noOffers}</p>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8',
              compact && 'lg:grid-cols-3',
            )}
          >
            {items.map(({ car, availability }, i) => (
              <CarCard
                key={car.id}
                car={car}
                index={i}
                rentalType="monthly"
                branchId={branchId || undefined}
                availability={availability}
              />
            ))}
          </div>
        )}

        {compact && items.length > 0 && (
          <div className="mt-8 text-center lg:hidden">
            <Link to="/offers">
              <Button variant="outline">{copy.offers.viewAll}</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
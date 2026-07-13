import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useCustomerBranch } from '../hooks/useCustomerBranch'
import { Calendar } from 'lucide-react'

import { HomeBranchPicker } from '../components/home/HomeBranchPicker'
import { CarCard } from '../components/cars/CarCard'
import { CarFilters } from '../components/cars/CarFilters'
import { RentalPeriodToggle } from '../components/cars/RentalPeriodToggle'
import { useRentalPeriod } from '../hooks/useRentalPeriod'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { PricesIncludeVatNote } from '../components/ui/PricesIncludeVatNote'
import { getCarAvailability } from '../lib/availability'
import { carMatchesBranch } from '../lib/branchFilter'
import { copy } from '../lib/copy'
import { sortFleet, type FleetSortOption } from '../lib/fleetSort'
import { formatDate } from '../lib/utils'
import { hasAnyOffer } from '../lib/offers'
import { fetchBookingBlocks, fetchCars } from '../lib/supabase'
import type { BookingBlock, Car, CarCategory, CarClass } from '../lib/types'

export function CarsPage() {
  const [searchParams] = useSearchParams()
  const startDate = searchParams.get('start') ?? ''
  const endDate = searchParams.get('end') ?? ''
  const offersParam = searchParams.get('offers') === '1'

  const [cars, setCars] = useState<Car[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CarCategory | 'all'>('all')
  const [carClass, setCarClass] = useState<CarClass | 'all'>('all')
  const [sort, setSort] = useState<FleetSortOption>('default')
  const [offersOnly, setOffersOnly] = useState(offersParam)
  const [availableOnly, setAvailableOnly] = useState(Boolean(startDate && endDate))
  const { rentalType, setRentalType } = useRentalPeriod()

  useEffect(() => {
    setOffersOnly(offersParam)
  }, [offersParam])

  useEffect(() => {
    setAvailableOnly(Boolean(startDate && endDate))
  }, [startDate, endDate])

  const { branchId: selectedBranch, hasBranch } = useCustomerBranch()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchCars({ availableOnly: false }),
      fetchBookingBlocks(undefined, hasBranch ? selectedBranch : null),
    ])
      .then(([carsData, blocksData]) => {
        setCars(carsData)
        setBlocks(blocksData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [hasBranch, selectedBranch])

  const filtered = useMemo(() => {
    const result = cars.filter((car) => {
      if (!carMatchesBranch(car, hasBranch ? selectedBranch : null)) return false
      const matchCategory = category === 'all' || car.category === category
      const matchClass = carClass === 'all' || car.car_class === carClass
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        car.name.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q)
      const matchOffer =
        !offersOnly || hasAnyOffer(car, hasBranch ? selectedBranch : null)
      return matchCategory && matchClass && matchSearch && matchOffer
    })

    const withAvailability = result.map((car) => ({
      car,
      availability: getCarAvailability(
        car,
        blocks,
        startDate || undefined,
        endDate || undefined,
        hasBranch ? selectedBranch : null,
      ),
    }))

    const visible = availableOnly
      ? withAvailability.filter((item) => item.availability.available)
      : withAvailability

    return sortFleet(visible, rentalType, sort, hasBranch ? selectedBranch : null)
  }, [cars, blocks, search, category, carClass, sort, offersOnly, availableOnly, startDate, endDate, selectedBranch, hasBranch, rentalType])

  return (
    <div className="page-shell">
      <div className="container-main">
        <div className="mb-8">
          <h1 className="section-title">{copy.cars.title}</h1>
          <p className="section-subtitle">{copy.cars.subtitle}</p>
          <PricesIncludeVatNote />
        </div>

        <div className="mb-8 -mx-4 sm:mx-0">
          <HomeBranchPicker browseTargetId="cars-list" />
        </div>

        <div id="cars-list">
        {hasBranch && (
          <p className="mb-4 text-xs text-slate-500">{copy.cars.availabilityPerBranch}</p>
        )}

        {startDate && endDate && (
          <div className="mb-6 flex items-start gap-2 rounded-xl bg-brand-green/5 border border-brand-green/20 px-4 py-3 text-sm">
            <Calendar className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
            <span className="text-slate-600 leading-relaxed">
              {copy.cars.datesSelected}:{' '}
              <strong className="block sm:inline">{formatDate(startDate)}</strong>
              <span className="hidden sm:inline"> — </span>
              <strong className="block sm:inline">{formatDate(endDate)}</strong>
            </span>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 mb-2">{copy.cars.rentalType}</p>
          <RentalPeriodToggle value={rentalType} onChange={setRentalType} />
          <p className="mt-3 text-xs text-slate-400">
            {rentalType === 'daily' ? copy.cars.dailyFleetSub : copy.cars.monthlyFleetSub}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <CarFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            carClass={carClass}
            onClassChange={setCarClass}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <label className="flex min-h-[44px] items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={offersOnly}
                onChange={(e) => setOffersOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-red-600 font-medium">{copy.cars.offersOnly}</span>
            </label>
            {startDate && endDate && (
              <label className="flex min-h-[44px] items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                />
                <span className="text-brand-green font-medium">{copy.cars.availableOnly}</span>
              </label>
            )}
            <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <label htmlFor="sort" className="text-xs text-slate-500 shrink-0">
                {copy.cars.sortPrice}:
              </label>
              <select
                id="sort"
                className="input-field w-full sm:max-w-xs"
                value={sort}
                onChange={(e) => setSort(e.target.value as FleetSortOption)}
              >
                <option value="default">{copy.cars.sortDefault}</option>
                <option value="price-asc">{copy.cars.sortLow}</option>
                <option value="price-desc">{copy.cars.sortHigh}</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-md">
            <p className="text-slate-500">{copy.cars.noCarsInBranch}</p>
            {availableOnly && startDate && endDate && (
              <p className="mt-2 text-sm text-slate-400">{copy.cars.showingAvailable}</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ car, availability }, i) => (
              <CarCard
                key={car.id}
                car={car}
                index={i}
                startDate={startDate}
                endDate={endDate}
                branchId={hasBranch ? selectedBranch || undefined : undefined}
                rentalType={rentalType}
                availability={availability}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
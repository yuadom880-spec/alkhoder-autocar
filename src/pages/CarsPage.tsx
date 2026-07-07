import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Calendar } from 'lucide-react'
import { BranchFilter } from '../components/cars/BranchFilter'
import { CarFilters } from '../components/cars/CarFilters'
import { FleetRentalSection } from '../components/cars/FleetRentalSection'
import { RentalPeriodToggle } from '../components/cars/RentalPeriodToggle'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { getCarAvailability } from '../lib/availability'
import { carMatchesBranch } from '../lib/branchFilter'
import { copy } from '../lib/copy'
import { sortFleet, type FleetSortOption } from '../lib/fleetSort'
import { formatDate } from '../lib/utils'
import { isOfferActive } from '../lib/offers'
import { fetchBookingBlocks, fetchBranches, fetchCars } from '../lib/supabase'
import type { BookingBlock, BranchRecord, Car, CarCategory } from '../lib/types'

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const startDate = searchParams.get('start') ?? ''
  const endDate = searchParams.get('end') ?? ''
  const branchParam = searchParams.get('branch') ?? ''
  const offersParam = searchParams.get('offers') === '1'

  const [cars, setCars] = useState<Car[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CarCategory | 'all'>('all')
  const [sort, setSort] = useState<FleetSortOption>('default')
  const [offersOnly, setOffersOnly] = useState(offersParam)
  const [availableOnly, setAvailableOnly] = useState(Boolean(startDate && endDate))
  const [selectedBranch, setSelectedBranch] = useState(branchParam)
  const [activeSection, setActiveSection] = useState<'daily' | 'monthly'>('daily')

  useEffect(() => {
    setOffersOnly(offersParam)
  }, [offersParam])

  useEffect(() => {
    setAvailableOnly(Boolean(startDate && endDate))
  }, [startDate, endDate])

  useEffect(() => {
    setSelectedBranch(branchParam)
  }, [branchParam])

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#monthly-fleet') setActiveSection('monthly')
    if (hash === '#daily-fleet' || hash === '#monthly-fleet') {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [loading])

  useEffect(() => {
    Promise.all([
      fetchCars({ availableOnly: false }),
      fetchBookingBlocks(),
      fetchBranches({ activeOnly: true }),
    ])
      .then(([carsData, blocksData, branchesData]) => {
        setCars(carsData)
        setBlocks(blocksData)
        setBranches(branchesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId)
    const params = new URLSearchParams(searchParams)
    if (branchId) params.set('branch', branchId)
    else params.delete('branch')
    setSearchParams(params, { replace: true })
  }

  const scrollToSection = (section: 'daily' | 'monthly') => {
    setActiveSection(section)
    const id = section === 'daily' ? '#daily-fleet' : '#monthly-fleet'
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${id}`)
  }

  const baseFiltered = useMemo(() => {
    const result = cars.filter((car) => {
      if (!carMatchesBranch(car, selectedBranch || null)) return false
      const matchCategory = category === 'all' || car.category === category
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        car.name.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q)
      const matchOffer = !offersOnly || isOfferActive(car)
      return matchCategory && matchSearch && matchOffer
    })

    const withAvailability = result.map((car) => ({
      car,
      availability: getCarAvailability(car, blocks, startDate || undefined, endDate || undefined),
    }))

    return availableOnly
      ? withAvailability.filter((item) => item.availability.available)
      : withAvailability
  }, [cars, blocks, search, category, offersOnly, availableOnly, startDate, endDate, selectedBranch])

  const hasResults = baseFiltered.length > 0
  const dailyFleet = useMemo(() => sortFleet(baseFiltered, 'daily', sort), [baseFiltered, sort])
  const monthlyFleet = useMemo(() => sortFleet(baseFiltered, 'monthly', sort), [baseFiltered, sort])

  useEffect(() => {
    if (loading || !hasResults) return

    const dailyEl = document.getElementById('daily-fleet')
    const monthlyEl = document.getElementById('monthly-fleet')
    if (!dailyEl || !monthlyEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id === 'monthly-fleet') setActiveSection('monthly')
        else if (visible[0]?.target.id === 'daily-fleet') setActiveSection('daily')
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )

    observer.observe(dailyEl)
    observer.observe(monthlyEl)
    return () => observer.disconnect()
  }, [loading, hasResults])

  return (
    <div className="page-shell">
      <div className="container-main">
        <div className="mb-8">
          <h1 className="section-title">{copy.cars.title}</h1>
          <p className="section-subtitle">{copy.cars.subtitle}</p>
        </div>

        <div className="mb-6">
          <BranchFilter
            branches={branches}
            selectedBranchId={selectedBranch}
            onSelect={handleBranchChange}
            loading={loading}
          />
        </div>

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

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-2">{copy.cars.rentalType}</p>
            <RentalPeriodToggle value={activeSection} onChange={scrollToSection} />
          </div>
        </div>

        <div className="mb-10 space-y-4">
          <CarFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <label className="flex min-h-[44px] items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={offersOnly}
                onChange={(e) => setOffersOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-red-600 font-medium">العروض فقط 🔥</span>
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
                <option value="default">الافتراضي</option>
                <option value="price-asc">{copy.cars.sortLow}</option>
                <option value="price-desc">{copy.cars.sortHigh}</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !hasResults ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-md">
            <p className="text-slate-500">
              {selectedBranch ? copy.cars.noCarsInBranch : copy.cars.noResults}
            </p>
            {availableOnly && startDate && endDate && (
              <p className="mt-2 text-sm text-slate-400">{copy.cars.showingAvailable}</p>
            )}
          </div>
        ) : (
          <div className="space-y-14 lg:space-y-20">
            <FleetRentalSection
              type="daily"
              cars={dailyFleet}
              startDate={startDate}
              endDate={endDate}
              branchId={selectedBranch || undefined}
            />
            <FleetRentalSection
              type="monthly"
              cars={monthlyFleet}
              startDate={startDate}
              endDate={endDate}
              branchId={selectedBranch || undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
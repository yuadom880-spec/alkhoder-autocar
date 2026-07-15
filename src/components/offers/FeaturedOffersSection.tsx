import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { FeaturedOfferCard } from './FeaturedOfferCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Button } from '../ui/Button'
import { PricesIncludeVatNote } from '../ui/PricesIncludeVatNote'
import { isFeaturedOfferActive } from '../../lib/featuredOffers'
import { copy } from '../../lib/copy'
import { filterOffersByBranch } from '../../lib/adminBranchFilters'
import { fetchDisplayedFeaturedOffers } from '../../lib/supabase'
import type { FeaturedOffer, RentalPeriodType } from '../../lib/types'
import { cn } from '../../lib/utils'
import { useTableRealtime } from '../../hooks/useTableRealtime'

type FilterType = 'all' | RentalPeriodType

interface FeaturedOffersSectionProps {
  compact?: boolean
  showFilters?: boolean
  showHeader?: boolean
  limit?: number
  branchId?: string | null
}

export function FeaturedOffersSection({
  compact = false,
  showFilters = true,
  showHeader = true,
  limit,
  branchId = null,
}: FeaturedOffersSectionProps) {
  const [offers, setOffers] = useState<FeaturedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  const loadOffers = useCallback(() => {
    setLoading(true)
    fetchDisplayedFeaturedOffers({
      activeOnly: true,
      featuredOnly: compact,
      includeCars: true,
    })
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [compact])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  useTableRealtime('featured_offers', loadOffers)
  useTableRealtime('cars', loadOffers)

  const filtered = useMemo(() => {
    let result = filterOffersByBranch(
      offers.filter(isFeaturedOfferActive),
      branchId,
    )
    if (filter !== 'all') result = result.filter((o) => o.rental_type === filter)
    if (limit) result = result.slice(0, limit)
    return result
  }, [offers, filter, limit, branchId])

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: copy.offers.filterAll },
    { value: 'daily', label: copy.offers.filterDaily },
    { value: 'monthly', label: copy.offers.filterMonthly },
  ]

  return (
    <section className={cn(compact ? 'py-10 sm:py-16 lg:py-20 bg-slate-50' : 'py-10 lg:py-14')}>
      <div className="container-main">
        {showHeader && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">{copy.offers.title}</h2>
              <p className="section-subtitle">{copy.offers.subtitle}</p>
              <PricesIncludeVatNote />
            </div>
            {compact && (
              <Link to="/offers" className="hidden sm:block">
                <Button variant="outline">
                  {copy.offers.viewAll}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {showFilters && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2.5 text-sm sm:py-1.5 sm:text-xs font-medium transition-colors min-h-[44px] sm:min-h-0',
                  filter === f.value
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-green/50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-md">
            <p className="text-slate-500">{copy.offers.noOffers}</p>
          </div>
        ) : (
          <div
            className={cn(
              compact
                ? 'flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden'
                : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {filtered.map((offer, i) => (
              <div
                key={offer.id}
                className={cn(
                  compact && 'w-[min(86vw,300px)] shrink-0 snap-start sm:w-auto sm:shrink',
                )}
              >
                <FeaturedOfferCard offer={offer} index={i} />
              </div>
            ))}
          </div>
        )}

        {compact && (
          <div className="mt-8 text-center sm:hidden">
            <Link to="/offers">
              <Button variant="outline">{copy.offers.viewAll}</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
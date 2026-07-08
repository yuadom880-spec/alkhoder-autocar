import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Clock, ExternalLink, MapPin, Phone } from 'lucide-react'
import { BranchImage } from '../components/branches/BranchImage'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { copy } from '../lib/copy'
import { PROFILE_ABOUT, PROFILE_BRANCH_REGIONS, PROFILE_IMAGES } from '../lib/profile'
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'
import { toPhoneLink } from '../lib/utils'

export function BranchesPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranches({ activeOnly: true })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-shell">
      <div className="container-main">
        <div className="mb-10 max-w-3xl">
          <h1 className="section-title">{copy.branches.title}</h1>
          <p className="section-subtitle">{copy.branches.subtitle}</p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {PROFILE_ABOUT.branchesIntro}
          </p>
        </div>

        <div className="mb-12 overflow-hidden rounded-3xl shadow-md">
          <OptimizedImage
            src={PROFILE_IMAGES.branchesMap}
            alt="فروع شركة عبدالمجيد الخضر في المملكة"
            className="h-48 sm:h-64 lg:h-80 w-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_BRANCH_REGIONS.map((region) => (
            <div
              key={region.region}
              className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100"
            >
              <h3 className="font-bold text-brand-dark mb-3">{region.region}</h3>
              <div className="flex flex-wrap gap-2">
                {region.cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full bg-brand-green/10 px-3 py-1 text-xs text-brand-green"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : branches.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500">لا توجد فروع متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md card-hover"
              >
                <div className="relative flex min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] items-center justify-center overflow-hidden bg-slate-100 px-4 py-5 sm:px-5 sm:py-6">
                  <BranchImage src={branch.image_url} alt={branch.name} />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                  <h2 className="absolute bottom-4 right-4 left-4 text-lg sm:text-xl font-bold text-white drop-shadow">
                    {branch.name}
                  </h2>
                </div>

                <div className="p-4 space-y-4 sm:p-6">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin className="h-5 w-5 shrink-0 text-brand-green mt-0.5" />
                    <div>
                      <p className="font-medium text-brand-dark">{branch.city}</p>
                      <p>{branch.address}</p>
                    </div>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="h-5 w-5 shrink-0 text-brand-green" />
                      <a
                        href={toPhoneLink(branch.phone)}
                        dir="ltr"
                        className="hover:text-brand-green transition-colors"
                      >
                        {branch.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-5 w-5 shrink-0 text-brand-green" />
                    <span>{branch.hours}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link to={`/cars?branch=${branch.id}`}>
                      <Button size="sm">
                        {copy.branches.bookFromBranch}
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                    {branch.map_url && branch.map_url !== '#' && (
                      <a
                        href={branch.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-green hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {copy.branches.openMap}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
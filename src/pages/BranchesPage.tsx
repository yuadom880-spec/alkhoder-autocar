import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Clock, MapPin, Phone } from 'lucide-react'
import { BranchImage } from '../components/branches/BranchImage'
import { Button } from '../components/ui/Button'
import { GoogleMapsLink } from '../components/ui/GoogleMapsLink'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { copy } from '../lib/copy'
import { useLocale } from '../context/LocaleContext'
import { getBranchDisplay } from '../lib/i18n/branches'
import { formatBranchHours } from '../lib/i18n/labels'
import { getProfileAbout, getProfileBranchRegions } from '../lib/i18n/profile'
import { PROFILE_IMAGES } from '../lib/profile'
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'
import { toPhoneLink } from '../lib/utils'

export function BranchesPage() {
  const { locale } = useLocale()
  const profileAbout = getProfileAbout(locale)
  const branchRegions = getProfileBranchRegions(locale)
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
            {profileAbout.branchesIntro}
          </p>
        </div>

        <div className="mb-12 overflow-hidden rounded-3xl shadow-md">
          <OptimizedImage
            src={PROFILE_IMAGES.branchesMap}
            alt={copy.branches.mapAlt}
            className="h-48 sm:h-64 lg:h-80 w-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branchRegions.map((region) => (
            <div
              key={region.region}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 font-bold text-brand-dark">
                {region.region}
              </h3>
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
            <p className="text-slate-500">{copy.branches.noBranches}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            {branches.map((branch) => {
              const display = getBranchDisplay(branch, locale)
              return (
              <div
                key={branch.id}
                className="card-hover overflow-hidden rounded-2xl bg-white shadow-md"
              >
                <div className="relative flex min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] items-center justify-center overflow-hidden bg-slate-100 px-4 py-5 sm:px-5 sm:py-6">
                  <BranchImage src={branch.image_url} alt={display.name} />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                  <h2 className="absolute bottom-4 right-4 left-4 text-lg sm:text-xl font-bold text-white drop-shadow">
                    {display.name}
                  </h2>
                </div>

                <div className="space-y-4 p-4 sm:p-6">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                    <div>
                      <p className="font-medium text-brand-dark">
                        {display.city}
                      </p>
                      <p>{display.address}</p>
                    </div>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="h-5 w-5 shrink-0 text-brand-green" />
                      <a
                        href={toPhoneLink(branch.phone)}
                        dir="ltr"
                        className="transition-colors hover:text-brand-green"
                      >
                        {branch.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-5 w-5 shrink-0 text-brand-green" />
                    <span>{formatBranchHours(branch.hours, locale)}</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <Link to={`/cars?branch=${branch.id}`} className="block w-full">
                      <Button size="sm" className="w-full sm:w-auto">
                        {copy.branches.bookFromBranch}
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                    {branch.map_url && branch.map_url !== '#' && (
                      <GoogleMapsLink href={branch.map_url} />
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
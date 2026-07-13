import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useLocale } from '../context/LocaleContext'
import { copy } from '../lib/copy'
import { getCityHighlights, getCityIntro } from '../lib/i18n/locations'
import { getCityDisplayName } from '../lib/i18n/seoPages'
import { getCityBySlug, SEO_CITIES } from '../lib/seo'

export function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { locale, isRtl } = useLocale()
  const city = slug ? getCityBySlug(slug) : undefined

  if (!city) return <Navigate to="/locations" replace />

  const cityName = getCityDisplayName(city.slug, locale)
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="page-shell">
      <div className="container-main max-w-3xl">
        <Link
          to="/locations"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-green transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          {copy.locations.allCities}
        </Link>

        <h1 className="section-title mb-4">{copy.locations.cityTitle(cityName)}</h1>
        <p className="mb-6 text-slate-600 leading-relaxed text-base sm:text-lg">
          {getCityIntro(city.slug, locale)}
        </p>

        <div className="mb-8 rounded-2xl bg-brand-green/5 border border-brand-green/10 p-5 sm:p-6">
          <h2 className="mb-4 font-bold text-brand-dark">{copy.locations.whyChooseIn(cityName)}</h2>
          <ul className="space-y-2">
            {getCityHighlights(city.slug, locale).map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8 prose prose-sm max-w-none text-slate-600">
          <p>{copy.locations.body(cityName)}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/cars" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[48px]">
              {copy.locations.bookNow}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/branches" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto min-h-[48px]">
              {copy.locations.ourBranches}
            </Button>
          </Link>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <h3 className="mb-4 font-bold text-brand-dark">{copy.locations.otherCities}</h3>
          <div className="flex flex-wrap gap-2">
            {SEO_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/locations/${c.slug}`}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-green/10 hover:text-brand-green transition-colors"
              >
                {copy.locations.cityTitle(getCityDisplayName(c.slug, locale))}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
import { Link } from 'react-router'
import { MapPin } from 'lucide-react'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { getCityDisplayName } from '../../lib/i18n/seoPages'
import { SEO_CITIES } from '../../lib/seo'

export function SeoCitiesSection() {
  const { locale } = useLocale()

  return (
    <section
      className="border-t border-slate-100 bg-white py-10 sm:py-12"
      aria-label={copy.locations.sectionTitle}
    >
      <div className="container-main">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold text-brand-dark">
            {copy.locations.sectionTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{copy.locations.sectionSub}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {SEO_CITIES.map((city) => (
            <Link
              key={city.slug}
              to={`/locations/${city.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {copy.locations.cityTitle(getCityDisplayName(city.slug, locale))}
            </Link>
          ))}
          <Link
            to="/locations"
            className="inline-flex items-center rounded-full bg-brand-green px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-brand-green-dark transition-colors"
          >
            {copy.locations.allCities}
          </Link>
        </div>
      </div>
    </section>
  )
}
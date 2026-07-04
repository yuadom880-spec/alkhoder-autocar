import { Link } from 'react-router'
import { MapPin } from 'lucide-react'
import { SEO_CITIES } from '../../lib/seo'

export function SeoCitiesSection() {
  return (
    <section className="border-t border-slate-100 bg-white py-10 sm:py-12" aria-label="ايجار سيارات في مدن السعودية">
      <div className="container-main">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold text-brand-dark">
            ايجار سيارات في السعودية
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            تأجير وايجار سيارات يومي وشهري — جدة، الرياض، مكة، المدينة المنورة وأكثر
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {SEO_CITIES.map((city) => (
            <Link
              key={city.slug}
              to={`/locations/${city.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              ايجار سيارات {city.nameAr}
            </Link>
          ))}
          <Link
            to="/locations"
            className="inline-flex items-center rounded-full bg-brand-green px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-brand-green-dark transition-colors"
          >
            كل المدن
          </Link>
        </div>
      </div>
    </section>
  )
}
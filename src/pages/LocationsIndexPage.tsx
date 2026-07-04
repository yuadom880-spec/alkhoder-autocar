import { Link } from 'react-router'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { SEO_CITIES } from '../lib/seo'

export function LocationsIndexPage() {
  return (
    <div className="page-shell">
      <div className="container-main">
        <div className="mb-10 max-w-3xl">
          <h1 className="section-title mb-4">ايجار سيارات في مدن السعودية</h1>
          <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
            عبدالمجيد الخضر لتأجير السيارات — تأجير وايجار سيارات يومي وشهري في جدة والرياض ومكة
            المكرمة والمدينة المنورة ومدن أخرى. اختر مدينتك واحجز اونلاين.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_CITIES.map((city) => (
            <Link
              key={city.slug}
              to={`/locations/${city.slug}`}
              className="group rounded-2xl bg-white p-5 shadow-md card-hover border border-slate-100"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                ايجار سيارات {city.nameAr}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{city.intro}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/cars">
            <Button>
              تصفح كل السيارات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
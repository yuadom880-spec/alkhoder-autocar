import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getCityBySlug, SEO_CITIES } from '../lib/seo'

export function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const city = slug ? getCityBySlug(slug) : undefined

  if (!city) return <Navigate to="/locations" replace />

  return (
    <div className="page-shell">
      <div className="container-main max-w-3xl">
        <Link
          to="/locations"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-green transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          كل المدن
        </Link>

        <h1 className="section-title mb-4">ايجار سيارات {city.nameAr}</h1>
        <p className="mb-6 text-slate-600 leading-relaxed text-base sm:text-lg">{city.intro}</p>

        <div className="mb-8 rounded-2xl bg-brand-green/5 border border-brand-green/10 p-5 sm:p-6">
          <h2 className="mb-4 font-bold text-brand-dark">ليش تختار الخضر في {city.nameAr}؟</h2>
          <ul className="space-y-2">
            {city.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8 prose prose-sm max-w-none text-slate-600">
          <p>
            نوفر <strong>تأجير سيارات</strong> و<strong>ايجار سيارات يومي</strong> و
            <strong> ايجار سيارات شهري</strong> في {city.nameAr} عبر شركة عبدالمجيد الخضر
            لتأجير السيارات. احجز اونلاين واستلم سيارتك بسهولة.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/cars" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[48px]">
              احجز سيارتك الآن
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/branches" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto min-h-[48px]">
              فروعنا
            </Button>
          </Link>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <h3 className="mb-4 font-bold text-brand-dark">مدن أخرى</h3>
          <div className="flex flex-wrap gap-2">
            {SEO_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/locations/${c.slug}`}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-green/10 hover:text-brand-green transition-colors"
              >
                ايجار سيارات {c.nameAr}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
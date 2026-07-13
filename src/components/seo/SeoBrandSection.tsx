import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { copy } from '../../lib/copy'

export function SeoBrandSection() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-12 sm:py-14 lg:py-16" aria-labelledby="seo-brand-heading">
      <div className="container-main max-w-3xl text-center">
        <h2 id="seo-brand-heading" className="text-xl font-bold text-brand-dark sm:text-2xl">
          {copy.seoBrand.heading}
        </h2>
        <p className="mt-2 text-base font-semibold text-brand-green sm:text-lg">
          {copy.seoBrand.subheading}
        </p>
        {copy.seoBrand.paragraphs.map((text) => (
          <p key={text} className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            {text}
          </p>
        ))}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/cars">
            <Button size="sm">
              {copy.seoBrand.browseCars}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/locations">
            <Button size="sm" variant="outline">
              {copy.seoBrand.rentalCities}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
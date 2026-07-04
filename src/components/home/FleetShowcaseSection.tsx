import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { copy } from '../../lib/copy'
import { PROFILE_FLEET, PROFILE_IMAGES } from '../../lib/profile'
import { cn } from '../../lib/utils'

export function FleetShowcaseSection() {
  const [active, setActive] = useState(PROFILE_FLEET[0].id)
  const category = PROFILE_FLEET.find((c) => c.id === active) ?? PROFILE_FLEET[0]

  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="container-main">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">{copy.profile.fleetTitle}</h2>
            <p className="section-subtitle">{copy.profile.fleetSub}</p>
          </div>
          <Link to="/cars" className="hidden sm:block">
            <Button variant="outline">
              {copy.home.viewAll}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl">
          <img
            src={PROFILE_IMAGES.fleetBanner}
            alt="أسطول عبدالمجيد الخضر"
            className="h-40 sm:h-56 w-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {PROFILE_FLEET.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActive(cat.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                active === cat.id
                  ? 'bg-brand-green text-white'
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50',
              )}
            >
              {cat.title}
              <span className="mr-1 text-xs opacity-70">({cat.titleEn})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {category.models.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group overflow-hidden rounded-xl bg-white shadow-md card-hover"
            >
              <div className="aspect-square overflow-hidden bg-slate-50 p-2">
                <img
                  src={model.image}
                  alt={model.name}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="p-2.5 text-center text-xs sm:text-sm font-medium text-brand-dark">
                {model.name}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/cars">
            <Button variant="outline">{copy.home.viewAll}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Phone } from 'lucide-react'
import { CarCard } from '../components/cars/CarCard'
import { FeaturedOffersSection } from '../components/offers/FeaturedOffersSection'
import { FleetShowcaseSection } from '../components/home/FleetShowcaseSection'
import { NewTigo7ProSection } from '../components/home/NewTigo7ProSection'
import { PartnersSection } from '../components/home/PartnersSection'
import { ProfileServicesSection } from '../components/home/ProfileServicesSection'
import { QuickSearch } from '../components/home/QuickSearch'
import { SummerPromoBlock } from '../components/home/SummerPromoBlock'
import { SeoBrandSection } from '../components/seo/SeoBrandSection'
import { SeoCitiesSection } from '../components/seo/SeoCitiesSection'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
  LOGO_URL,
  MAIN_BRANCH,
  PHONE,
  PHONE_LINK,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_SEO_PRIMARY,
  WHATSAPP_LINK,
} from '../lib/constants'
import { PROFILE_IMAGES } from '../lib/profile'
import { getCarAvailability } from '../lib/availability'
import { copy } from '../lib/copy'
import { fetchBookingBlocks, fetchCars } from '../lib/supabase'
import type { BookingBlock } from '../lib/types'
import type { Car as CarType } from '../lib/types'

export function HomePage() {
  const [cars, setCars] = useState<CarType[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchCars({ availableOnly: false }),
      fetchBookingBlocks(),
    ])
      .then(([carsData, blocksData]) => {
        setCars(carsData)
        setBlocks(blocksData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="relative min-h-[min(88svh,720px)] overflow-hidden bg-brand-dark text-white pb-4 sm:min-h-[620px] sm:pb-8 md:pb-24 lg:min-h-[700px] lg:pb-28">
        <div className="absolute inset-0">
          <img
            src={PROFILE_IMAGES.heroLuxurySuv}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-[center_62%] brightness-[0.88] contrast-[1.1] saturate-[1.05] sm:hidden"
          />
          <motion.img
            src={PROFILE_IMAGES.heroLuxurySuv}
            alt=""
            aria-hidden
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 28, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute inset-0 hidden h-full w-full object-cover object-center brightness-[0.9] contrast-[1.08] saturate-[1.05] sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/85 via-brand-dark/55 to-brand-dark/30 sm:bg-gradient-to-l sm:from-brand-dark/95 sm:via-brand-dark/70 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent sm:via-brand-dark/35" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 55% at 50% 72%, rgba(212,168,83,0.14) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="container-main relative flex min-h-[min(72svh,600px)] flex-col justify-end py-6 sm:min-h-0 sm:justify-start sm:py-16 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-text-glow w-full max-w-4xl"
          >
            <img
              src={LOGO_URL}
              alt={SITE_NAME}
              className="hero-logo-glow mb-3 h-14 w-auto rounded-xl object-contain sm:mb-4 sm:h-24"
            />
            <span className="mb-2 inline-block rounded-full border border-brand-gold/30 bg-brand-dark/40 px-3 py-1 text-[11px] font-medium text-brand-gold backdrop-blur-sm sm:mb-3 sm:py-1.5 sm:text-xs">
              {copy.site.tagline}
            </span>
            <h1 className="mb-1.5 font-extrabold leading-tight text-[clamp(1.25rem,5.5vw,2.75rem)] sm:mb-2 sm:leading-snug">
              {SITE_SEO_PRIMARY}
            </h1>
            <p className="mb-1 text-xs font-display text-brand-gold sm:text-lg">{SITE_NAME}</p>
            <p className="mb-1 hidden text-slate-300 sm:block sm:text-base">{SITE_NAME_EN}</p>
            <p className="mb-1 hidden text-lg font-bold text-white sm:mb-2 sm:block sm:text-2xl">
              {copy.site.heroTitle}
            </p>
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-slate-200 sm:mb-8 sm:text-lg">
              {copy.site.heroSubtitle}
            </p>
            <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap">
              <Link to="/cars" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full min-h-[48px] sm:w-auto">
                  {copy.site.browseCars}
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cars" className="w-full sm:w-auto">
                <Button size="lg" className="w-full min-h-[48px] sm:w-auto">{copy.site.heroCta}</Button>
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full min-h-[48px] border-white/30 text-white hover:bg-white/10 sm:w-auto"
                >
                  <Phone className="h-5 w-5" />
                  {copy.site.whatsapp}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        <QuickSearch />
      </section>

      <section className="py-10 pt-8 sm:py-16 sm:pt-32 md:py-20 md:pt-36 lg:py-24">
        <div className="container-main">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="section-title">{copy.home.whyUs}</h2>
            <p className="section-subtitle">{copy.home.whyUsSub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {copy.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-md card-hover text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green text-2xl font-bold">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-bold text-brand-dark">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProfileServicesSection />

      <FleetShowcaseSection />

      <NewTigo7ProSection />

      <FeaturedOffersSection compact limit={6} />

      <section className="bg-white py-16 lg:py-20">
        <div className="container-main">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">{copy.home.featured}</h2>
              <p className="section-subtitle">{copy.home.featuredSub}</p>
            </div>
            <Link to="/cars" className="hidden sm:block">
              <Button variant="outline">
                {copy.home.viewAll}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, i) => (
                <CarCard
                  key={car.id}
                  car={car}
                  index={i}
                  availability={getCarAvailability(car, blocks)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/cars">
              <Button variant="outline">{copy.home.viewAll}</Button>
            </Link>
          </div>
        </div>
      </section>

      <SummerPromoBlock />

      <section className="py-16 lg:py-20">
        <div className="container-main">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-green to-brand-green-dark text-white p-5 sm:p-8 lg:p-12">
            <h2 className="mb-4 text-xl font-bold sm:text-2xl lg:text-3xl">{copy.home.visitBranch}</h2>
            <div className="space-y-3 text-sm text-green-100">
              <p className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                {MAIN_BRANCH.address} — {MAIN_BRANCH.city}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <a href={PHONE_LINK} dir="ltr" className="hover:text-white transition-colors">
                  {PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0" />
                {MAIN_BRANCH.hours}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={MAIN_BRANCH.mapUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto min-h-[48px]">{copy.home.openMap}</Button>
              </a>
              <Link to="/branches" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] border-white/30 text-white hover:bg-white/10"
                >
                  {copy.home.allBranches}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SeoBrandSection />

      <SeoCitiesSection />

      <PartnersSection />
    </>
  )
}
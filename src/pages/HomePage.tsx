import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTableRealtime } from '../hooks/useTableRealtime'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Phone } from 'lucide-react'
import { CarRowCard } from '../components/cars/CarRowCard'
import { FleetOffersToggle } from '../components/cars/FleetOffersToggle'
import { RentalPeriodToggle } from '../components/cars/RentalPeriodToggle'
import { useRentalPeriod } from '../hooks/useRentalPeriod'
import { HomeBranchPicker } from '../components/home/HomeBranchPicker'
import { useCustomerBranch } from '../hooks/useCustomerBranch'
import { FeaturedOffersSection } from '../components/offers/FeaturedOffersSection'
import { FleetShowcaseSection } from '../components/home/FleetShowcaseSection'
import { BrandWelcomeVideoSection } from '../components/home/NewTigo7ProSection'
import { CustomerReviewsSection } from '../components/home/CustomerReviewsSection'
import { PartnersSection } from '../components/home/PartnersSection'
import { ProfileServicesSection } from '../components/home/ProfileServicesSection'
import { QuickSearch } from '../components/home/QuickSearch'
import { InstallmentPromoSection } from '../components/home/InstallmentPromoSection'
import { SummerPromoBlock } from '../components/home/SummerPromoBlock'
import { SeoBrandSection } from '../components/seo/SeoBrandSection'
import { SeoCitiesSection } from '../components/seo/SeoCitiesSection'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { SocialLinks } from '../components/layout/SocialLinks'
import { PricesIncludeVatNote } from '../components/ui/PricesIncludeVatNote'
import {
  LOGO_URL,
  MAIN_BRANCH,
  PHONE,
  PHONE_LINK,
  SITE_NAME,
  SITE_NAME_EN,
  WHATSAPP_LINK,
} from '../lib/constants'
import { useLocale } from '../context/LocaleContext'
import { getSeoHome } from '../lib/i18n'
import { getMainBranchDisplay } from '../lib/i18n/labels'
import { PROFILE_IMAGES } from '../lib/profile'
import { getCarAvailability } from '../lib/availability'
import { carMatchesBranch } from '../lib/branchFilter'
import { copy } from '../lib/copy'
import { hasAnyOffer } from '../lib/offers'
import { fetchBookingBlocks, fetchCars } from '../lib/supabase'

import type { BookingBlock } from '../lib/types'
import type { Car as CarType } from '../lib/types'

export function HomePage() {
  const { locale } = useLocale()
  const seoHome = getSeoHome(locale)
  const mainBranch = getMainBranchDisplay(locale)
  const [cars, setCars] = useState<CarType[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [offersOnly, setOffersOnly] = useState(false)
  const { rentalType, setRentalType } = useRentalPeriod()
  const { branchId, hasBranch } = useCustomerBranch()

  const loadFleet = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetchCars({ availableOnly: false }),
      fetchBookingBlocks(undefined, hasBranch ? branchId : null),
    ])
      .then(([carsData, blocksData]) => {
        setCars(carsData)
        setBlocks(blocksData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [hasBranch, branchId])

  useEffect(() => {
    loadFleet()
  }, [loadFleet])

  const reloadBlocks = useCallback(() => {
    fetchBookingBlocks(undefined, hasBranch ? branchId : null)
      .then(setBlocks)
      .catch(console.error)
  }, [hasBranch, branchId])

  useTableRealtime('cars', loadFleet)
  useTableRealtime('bookings', reloadBlocks)
  useTableRealtime('featured_offers', loadFleet)

  const fleetCars = useMemo(() => {
    return cars
      .filter((car) => carMatchesBranch(car, hasBranch ? branchId : null))
      .filter(
        (car) =>
          !offersOnly || hasAnyOffer(car, hasBranch ? branchId : null),
      )
      .map((car) => ({
        car,
        availability: getCarAvailability(
          car,
          blocks,
          undefined,
          undefined,
          hasBranch ? branchId : null,
        ),
      }))
  }, [cars, blocks, branchId, hasBranch, offersOnly])

  return (
    <>
      <section className="relative min-h-0 overflow-hidden bg-brand-dark text-white pb-4 sm:min-h-[620px] sm:pb-8 md:pb-24 lg:min-h-[700px] lg:pb-28">
        <div className="absolute inset-0">
          <OptimizedImage
            src={PROFILE_IMAGES.heroLuxurySuv}
            mobileSrc={PROFILE_IMAGES.heroLuxurySuvMobile}
            alt=""
            ariaHidden
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[center_62%] brightness-[0.88] contrast-[1.1] saturate-[1.05] sm:hidden"
          />
          <img
            src={PROFILE_IMAGES.heroLuxurySuv}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            fetchPriority="high"
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

        <div className="container-main relative pt-6 pb-2 sm:py-16 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-text-glow w-full max-w-4xl"
          >
            <img
              src={LOGO_URL}
              alt={SITE_NAME}
              className="hero-logo-glow mb-4 h-20 w-auto max-w-[200px] rounded-2xl object-contain sm:mb-5 sm:h-28 sm:max-w-[260px] lg:h-32 lg:max-w-[300px]"
            />
            <div className="flex max-w-xl flex-col gap-2 sm:gap-2.5">
              <span className="mb-2 inline-block w-fit rounded-full border border-brand-gold/35 bg-brand-dark/50 px-3.5 py-1.5 text-xs font-semibold text-brand-gold backdrop-blur-sm sm:mb-3 sm:px-4 sm:py-1.5 sm:text-sm">
                {copy.site.tagline}
              </span>
              <h1 className="mt-1 font-extrabold leading-snug text-[clamp(1.35rem,5.8vw,2.75rem)] text-white sm:mt-1.5">
                {seoHome.h1}
              </h1>
              <p className="text-sm font-semibold text-brand-gold sm:text-lg">{seoHome.subtitle}</p>
              <p className="hidden text-slate-300 sm:block sm:text-base">{SITE_NAME_EN}</p>
              <p className="hidden text-lg font-bold text-white sm:block sm:text-2xl">
                {copy.site.heroTitle}
              </p>
              <p className="text-[15px] leading-relaxed text-slate-100 sm:text-lg sm:text-slate-200">
                {copy.site.heroSubtitle}
              </p>
            </div>
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

      <section className="border-y border-brand-green/10 bg-gradient-to-b from-brand-green/[0.1] via-[#e8f0eb] to-brand-green/[0.06] py-10 pt-8 sm:py-16 sm:pt-32 md:py-20 md:pt-36 lg:py-24">
        <div className="container-main">
          <div className="mb-6 text-center sm:mb-10">
            <h2 className="section-title">{copy.home.whyUs}</h2>
            <p className="section-subtitle">{copy.home.whyUsSub}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {copy.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-md card-hover sm:p-6"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green text-lg font-bold sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
                  {i + 1}
                </div>
                <h3 className="mb-1.5 text-sm font-bold leading-snug text-brand-dark sm:mb-2 sm:text-base">
                  {f.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-500 sm:text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProfileServicesSection />

      <FleetShowcaseSection />

      <BrandWelcomeVideoSection />

      <InstallmentPromoSection />

      <HomeBranchPicker />

      <div id="home-offers">
        <FeaturedOffersSection compact branchId={branchId || null} />
      </div>

      <section id="home-fleet" className="bg-white py-10 sm:py-16 lg:py-20">
        <div className="container-main">
          <div className="mb-6 sm:mb-10">
            <h2 className="section-title">{copy.home.featured}</h2>
            <p className="section-subtitle">{copy.home.featuredSub}</p>
            <PricesIncludeVatNote />
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">{copy.cars.rentalType}</p>
              <RentalPeriodToggle value={rentalType} onChange={setRentalType} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">{copy.cars.offersOnly}</p>
              <FleetOffersToggle offersOnly={offersOnly} onChange={setOffersOnly} />
            </div>
          </div>

          {hasBranch && (
            <p className="mb-4 text-xs text-slate-500">{copy.cars.availabilityPerBranch}</p>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : fleetCars.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              {offersOnly ? copy.offers.noOffers : copy.cars.noCarsInBranch}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {fleetCars.map(({ car, availability }, i) => (
                <CarRowCard
                  key={car.id}
                  car={car}
                  index={i}
                  rentalType={rentalType}
                  branchId={hasBranch ? branchId || undefined : undefined}
                  availability={availability}
                />
              ))}
            </div>
          )}

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
                {mainBranch.address} — {mainBranch.city}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <a href={PHONE_LINK} dir="ltr" className="hover:text-white transition-colors">
                  {PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0" />
                {mainBranch.hours}
              </p>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-white">{copy.footer.social}</p>
              <SocialLinks variant="light" />
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

      <CustomerReviewsSection />

      <SeoCitiesSection />

      <PartnersSection />

      <SeoBrandSection />
    </>
  )
}
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { LazyVideo } from '../ui/LazyVideo'
import { Button } from '../ui/Button'
import { BRAND_VIDEO, NEW_TIGO_7_PRO_IMAGE, NEW_TIGO_7_PRO_IMAGE_FALLBACK } from '../../lib/constants'
import { copy } from '../../lib/copy'

export function NewTigo7ProSection() {
  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-4xl flex-col gap-5"
        >
          <div className="overflow-hidden rounded-2xl bg-brand-dark shadow-lg ring-1 ring-black/5">
            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-l from-brand-green/40 via-brand-dark to-brand-navy px-4 py-5 sm:px-6 sm:py-6">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />
              <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-1.5 text-sm font-bold text-brand-dark shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  جديدنا
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                    <span className="text-brand-gold">تيجو 7 برو</span>
                  </p>
                  <p className="mt-1 text-sm text-green-100/90 sm:text-base">
                    {copy.home.newTigo7ProSub}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-brand-dark p-4 sm:p-6">
              <picture>
                <source srcSet={NEW_TIGO_7_PRO_IMAGE} type="image/webp" />
                <source srcSet={NEW_TIGO_7_PRO_IMAGE_FALLBACK} type="image/jpeg" />
                <img
                  src={NEW_TIGO_7_PRO_IMAGE_FALLBACK}
                  alt={copy.home.newTigo7Pro}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto w-full max-h-[280px] rounded-xl object-contain sm:max-h-[380px] lg:max-h-[440px]"
                />
              </picture>
            </div>

            <div className="flex justify-center border-t border-white/10 bg-brand-navy/80 px-4 py-5 sm:px-6">
              <Link to="/cars">
                <Button size="lg" variant="secondary" className="min-h-[48px]">
                  {copy.site.heroCta}
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-brand-dark shadow-lg ring-1 ring-black/5">
            <div className="border-b border-white/10 bg-gradient-to-l from-brand-navy via-brand-dark to-brand-slate px-4 py-4 text-center sm:px-6">
              <p className="text-lg font-bold text-white sm:text-xl">{copy.home.brandVideoTitle}</p>
            </div>
            <LazyVideo
              src={BRAND_VIDEO}
              title={copy.home.brandVideoTitle}
              className="mx-auto w-full max-h-[280px] object-contain sm:max-h-[360px] lg:max-h-[420px]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
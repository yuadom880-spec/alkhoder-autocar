import { motion } from 'framer-motion'
import { HomeBranchPicker } from '../components/home/HomeBranchPicker'
import { FeaturedOffersSection } from '../components/offers/FeaturedOffersSection'
import { useCustomerBranch } from '../hooks/useCustomerBranch'
import { LazyVideo } from '../components/ui/LazyVideo'
import { SAVINGS_OFFER_IMAGE_FALLBACK, SUMMER_VIDEO } from '../lib/constants'
import { copy } from '../lib/copy'

export function OffersPage() {
  const { branchId } = useCustomerBranch()
  return (
    <>
      <section className="page-shell bg-gradient-to-bl from-brand-dark via-brand-navy to-brand-slate text-white">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="mb-3 inline-block rounded-full bg-brand-gold/20 px-4 py-1.5 text-xs font-medium text-brand-gold">
              {copy.offers.badge}
            </span>
            <h1 className="text-2xl font-extrabold sm:text-4xl mb-3 leading-snug">{copy.offers.pageTitle}</h1>
            <p className="text-slate-300 leading-relaxed">{copy.offers.pageSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 lg:py-12">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl shadow-lg"
          >
            <LazyVideo
              src={SUMMER_VIDEO}
              poster={SAVINGS_OFFER_IMAGE_FALLBACK}
              className="w-full max-h-[420px] object-cover bg-brand-dark"
            />
          </motion.div>
        </div>
      </section>

      <HomeBranchPicker browseTargetId="offers-list" />

      <div id="offers-list">
      <FeaturedOffersSection
        compact={false}
        showHeader={false}
        branchId={branchId || null}
      />
      </div>
    </>
  )
}
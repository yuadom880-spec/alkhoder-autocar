import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  INSTALLMENT_BANNER_DESKTOP,
  INSTALLMENT_BANNER_MOBILE,
} from '../../lib/constants'
import { copy } from '../../lib/copy'
import { OptimizedImage } from '../ui/OptimizedImage'

export function InstallmentPromoSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-brand-green/[0.05] py-8 sm:py-14 lg:py-16">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center sm:mb-8"
        >
          <h2 className="section-title">{copy.installment.sectionTitle}</h2>
          <p className="section-subtitle">{copy.installment.sectionSub}</p>
        </motion.div>

        <Link
          to="/cars"
          className="group block overflow-hidden rounded-2xl shadow-lg card-hover"
        >
          <OptimizedImage
            src={INSTALLMENT_BANNER_DESKTOP}
            alt={copy.installment.bannerAlt}
            className="hidden w-full object-contain md:block"
            loading="lazy"
          />
          <OptimizedImage
            src={INSTALLMENT_BANNER_MOBILE}
            alt={copy.installment.bannerAlt}
            className="w-full object-cover md:hidden"
            loading="lazy"
          />
        </Link>
      </div>
    </section>
  )
}
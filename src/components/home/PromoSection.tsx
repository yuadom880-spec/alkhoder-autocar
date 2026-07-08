import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { LazyVideo } from '../ui/LazyVideo'
import { OptimizedImage } from '../ui/OptimizedImage'
import { PROMO_BANNERS, SUMMER_VIDEO } from '../../lib/constants'
import { copy } from '../../lib/copy'

export function PromoSection() {
  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="container-main">
        <div className="mb-10 text-center">
          <h2 className="section-title">{copy.home.promos}</h2>
          <p className="section-subtitle">{copy.home.promosSub}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 overflow-hidden rounded-2xl shadow-lg"
        >
          <LazyVideo
            src={SUMMER_VIDEO}
            poster={PROMO_BANNERS[0].src}
            className="w-full max-h-[420px] object-cover bg-brand-dark"
          />
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMO_BANNERS.map((banner, i) => (
            <motion.div
              key={banner.src}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={banner.link}
                className="group block overflow-hidden rounded-2xl bg-white shadow-md card-hover"
              >
                <OptimizedImage
                  src={banner.src}
                  alt={banner.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
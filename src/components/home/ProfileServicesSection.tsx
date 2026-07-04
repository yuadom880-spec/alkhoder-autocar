import { motion } from 'framer-motion'
import { Building2, CalendarRange, Headphones, Wrench } from 'lucide-react'
import { copy } from '../../lib/copy'
import { PROFILE_SERVICES } from '../../lib/profile'

const icons = [CalendarRange, Building2, Wrench, Headphones]

export function ProfileServicesSection() {
  return (
    <section className="bg-brand-dark py-14 sm:py-16 lg:py-20 text-white">
      <div className="container-main">
        <div className="mb-10 text-center">
          <h2 className="text-xl sm:text-3xl font-bold">{copy.profile.servicesTitle}</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">{copy.profile.servicesSub}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE_SERVICES.map((service, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs text-brand-gold/80 mb-1">{service.titleEn}</p>
                <h3 className="mb-2 font-bold text-lg">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
import { motion } from 'framer-motion'
import { Building2, CalendarRange, Headphones, Wrench } from 'lucide-react'
import { copy } from '../../lib/copy'
import { PROFILE_SERVICES } from '../../lib/profile'

const icons = [CalendarRange, Building2, Wrench, Headphones]

export function ProfileServicesSection() {
  return (
    <section className="bg-brand-dark py-12 sm:py-16 lg:py-20 text-white">
      <div className="container-main">
        <div className="mb-6 text-center sm:mb-10">
          <h2 className="text-xl sm:text-3xl font-bold">{copy.profile.servicesTitle}</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">{copy.profile.servicesSub}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {PROFILE_SERVICES.map((service, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold sm:mb-4 sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="mb-1 hidden text-[10px] text-brand-gold/80 sm:block sm:text-xs">
                  {service.titleEn}
                </p>
                <h3 className="mb-1.5 text-sm font-bold leading-snug sm:mb-2 sm:text-lg">
                  {service.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-400 sm:text-sm">
                  {service.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
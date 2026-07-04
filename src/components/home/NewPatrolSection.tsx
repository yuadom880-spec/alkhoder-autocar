import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { NEW_PATROL_VIDEO } from '../../lib/constants'
import { copy } from '../../lib/copy'

export function NewPatrolSection() {
  return (
    <section className="bg-slate-50 py-12 sm:py-14 lg:py-16">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <div className="overflow-hidden rounded-2xl bg-brand-dark shadow-lg ring-1 ring-black/5">
            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-l from-brand-green/40 via-brand-dark to-brand-navy px-4 py-5 sm:px-6 sm:py-6">
              <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />
              <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-1.5 text-sm font-bold text-brand-dark shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  جديدنا
                </span>
                <p className="font-display text-2xl font-extrabold leading-none tracking-wide text-white sm:text-3xl">
                  <span className="text-brand-gold">PATROL</span>
                  <span className="mx-2 text-white/90">2026</span>
                  <span className="text-brand-gold">!</span>
                </p>
              </div>
            </div>

            <video
              src={NEW_PATROL_VIDEO}
              controls
              playsInline
              preload="metadata"
              aria-label={copy.home.newPatrol}
              className="mx-auto w-full max-h-[320px] object-contain sm:max-h-[400px] lg:max-h-[480px]"
            >
              <track kind="captions" />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
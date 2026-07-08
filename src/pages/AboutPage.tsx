import { motion } from 'framer-motion'
import { Award, Globe2, Headphones, Sparkles, Target } from 'lucide-react'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { copy } from '../lib/copy'
import {
  PROFILE_ABOUT,
  PROFILE_IMAGES,
  PROFILE_STRATEGIC_GOALS,
} from '../lib/profile'

const goalIcons = [Globe2, Sparkles, Award, Headphones]

export function AboutPage() {
  return (
    <div className="page-shell">
      <div className="container-main">
        <div className="mb-10 max-w-3xl">
          <h1 className="section-title mb-4">{copy.about.title}</h1>
          <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-4">
            {PROFILE_ABOUT.intro}
          </p>
          <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
            {PROFILE_ABOUT.extended}
          </p>
        </div>

        <div className="mb-16 overflow-hidden rounded-3xl">
          <OptimizedImage
            src={PROFILE_IMAGES.aboutFleet}
            alt="أسطول عبدالمجيد الخضر لتأجير السيارات"
            loading="lazy"
            className="h-64 w-full object-cover sm:h-80 lg:h-96"
          />
        </div>

        <div className="mb-16 rounded-3xl bg-gradient-to-l from-brand-green to-brand-green-dark p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Target className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{copy.about.visionTitle}</h2>
              <p className="text-green-100 leading-relaxed">{PROFILE_ABOUT.vision}</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="section-title mb-8">{copy.about.goalsTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE_STRATEGIC_GOALS.map((goal, i) => {
              const Icon = goalIcons[i]
              return (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-white p-6 shadow-md card-hover"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-brand-green mb-1">{goal.titleEn}</p>
                  <h3 className="mb-2 font-bold text-brand-dark">{goal.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{goal.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-brand-dark text-white p-5 sm:p-8 lg:p-12">
          <h2 className="text-2xl font-bold mb-6">{copy.about.whyTitle}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 text-sm text-slate-300">
            {copy.about.perks.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
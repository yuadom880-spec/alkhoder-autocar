import { copy } from '../../lib/copy'
import { PARTNERS_IMAGE } from '../../lib/profile'

export function PartnersSection() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-8 sm:py-10">
      <div className="container-main">
        <div className="mb-5 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-brand-dark">{copy.profile.partnersTitle}</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">{copy.profile.partnersSub}</p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-100 bg-white px-3 py-4 sm:px-6 sm:py-5 shadow-sm">
          <img
            src={PARTNERS_IMAGE}
            alt={copy.profile.partnersTitle}
            loading="lazy"
            className="mx-auto w-full h-auto object-contain"
          />
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">{copy.profile.partnersCta}</p>
      </div>
    </section>
  )
}
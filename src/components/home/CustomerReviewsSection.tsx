import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react'
import { copy } from '../../lib/copy'
import { MAIN_BRANCH } from '../../lib/constants'
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_SUMMARY } from '../../lib/reviews'
import type { CustomerReview } from '../../lib/reviews'

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} من 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" aria-hidden />
      ))}
    </div>
  )
}

function ReviewCard({ review, index }: { review: CustomerReview; index: number }) {
  const displayName = review.nameAr ?? review.name

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="flex h-full min-w-[280px] max-w-[340px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md card-hover sm:min-w-0"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-bold text-brand-dark">{displayName}</h3>
              {review.isNew && (
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold text-brand-green">
                  جديد
                </span>
              )}
              {review.localGuide && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  مرشد محلي
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">{review.date}</p>
          </div>
          <StarRow />
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#0f0f0f] px-2 pt-2">
        <img
          src={review.image}
          alt={`مراجعة ${displayName} على Google`}
          loading="lazy"
          className="mx-auto w-full max-h-[220px] object-contain object-top"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-4">{review.text}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          مراجعة على Google
        </p>
      </div>
    </motion.article>
  )
}

export function CustomerReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section className="border-y border-slate-100 bg-gradient-to-b from-white via-slate-50/60 to-white py-14 sm:py-16 lg:py-20">
      <div className="container-main">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {GOOGLE_REVIEWS_SUMMARY.source}
            </div>
            <h2 className="section-title">{copy.home.reviewsTitle}</h2>
            <p className="section-subtitle">{copy.home.reviewsSub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-gold/25 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-3xl font-extrabold text-brand-dark">{GOOGLE_REVIEWS_SUMMARY.ratingValue}</p>
              <StarRow />
            </div>
            <div className="h-10 w-px bg-slate-200" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-dark">{GOOGLE_REVIEWS_SUMMARY.count}+ تقييم</p>
              <p className="text-xs text-slate-500">من عملائنا على Google</p>
            </div>
            <a
              href={MAIN_BRANCH.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark"
            >
              {copy.home.reviewsCta}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="mb-4 flex justify-end gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => scroll('prev')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('next')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden"
          >
            {GOOGLE_REVIEWS.map((review, i) => (
              <div key={review.id} className="snap-start sm:min-w-0">
                <ReviewCard review={review} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
import { Link } from 'react-router'
import { SAVINGS_OFFER_IMAGE, SAVINGS_OFFER_IMAGE_FALLBACK } from '../../lib/constants'

export function SummerPromoBlock() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="container-main">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <Link
            to="/offers"
            className="block overflow-hidden rounded-2xl bg-white shadow-md card-hover"
          >
            <picture>
              <source srcSet={SAVINGS_OFFER_IMAGE} type="image/webp" />
              <source srcSet={SAVINGS_OFFER_IMAGE_FALLBACK} type="image/jpeg" />
              <img
                src={SAVINGS_OFFER_IMAGE_FALLBACK}
                alt="عروض التوفير"
                loading="lazy"
                decoding="async"
                className="mx-auto w-full max-h-[240px] object-contain sm:max-h-[300px] lg:max-h-[360px]"
              />
            </picture>
          </Link>
        </div>
      </div>
    </section>
  )
}
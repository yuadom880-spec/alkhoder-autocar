import { Link } from 'react-router'
import { OptimizedImage } from '../ui/OptimizedImage'
import { SAVINGS_OFFER_IMAGE } from '../../lib/constants'

export function SummerPromoBlock() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="container-main">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <Link
            to="/offers"
            className="block overflow-hidden rounded-2xl bg-white shadow-md card-hover"
          >
            <OptimizedImage
              src={SAVINGS_OFFER_IMAGE}
              alt="عروض التوفير"
              className="mx-auto w-full max-h-[240px] object-contain sm:max-h-[300px] lg:max-h-[360px]"
              loading="lazy"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
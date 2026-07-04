import { Link } from 'react-router'
import { SAVINGS_OFFER_IMAGE, SUMMER_VIDEO } from '../../lib/constants'

export function SummerPromoBlock() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="container-main">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <div className="overflow-hidden rounded-2xl bg-brand-dark shadow-md">
            <video
              src={SUMMER_VIDEO}
              controls
              playsInline
              className="mx-auto w-full max-h-[280px] object-contain sm:max-h-[340px] lg:max-h-[400px]"
            >
              <track kind="captions" />
            </video>
          </div>

          <Link
            to="/offers"
            className="block overflow-hidden rounded-2xl bg-white shadow-md card-hover"
          >
            <img
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
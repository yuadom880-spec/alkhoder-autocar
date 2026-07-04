import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, CalendarRange } from 'lucide-react'
import type { FeaturedOffer } from '../../lib/types'
import {
  getFeaturedOfferLink,
  getFeaturedOfferPriceLabel,
  getFeaturedOfferSavings,
  isFeaturedOfferActive,
  RENTAL_TYPE_LABELS,
} from '../../lib/featuredOffers'
import { copy } from '../../lib/copy'
import { formatPrice } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { OfferImage } from './OfferImage'

interface FeaturedOfferCardProps {
  offer: FeaturedOffer
  index?: number
}

export function FeaturedOfferCard({ offer, index = 0 }: FeaturedOfferCardProps) {
  const active = isFeaturedOfferActive(offer)
  const savings = getFeaturedOfferSavings(offer)
  const link = getFeaturedOfferLink(offer)
  const isMonthly = offer.rental_type === 'monthly'
  const showPrice = offer.price > 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md card-hover"
    >
      <OfferImage src={offer.image_url} alt={offer.title}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end z-10">
          <Badge variant={isMonthly ? 'info' : 'warning'}>
            {isMonthly ? (
              <span className="flex items-center gap-1">
                <CalendarRange className="h-3 w-3" />
                {RENTAL_TYPE_LABELS.monthly}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {RENTAL_TYPE_LABELS.daily}
              </span>
            )}
          </Badge>
          {offer.badge_text && <Badge variant="danger">{offer.badge_text}</Badge>}
          {!active && <Badge variant="default">{copy.offers.expired}</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 left-3 z-10 pointer-events-none">
          <h3 className="text-lg font-bold text-white drop-shadow">{offer.title}</h3>
          {offer.car?.name && (
            <p className="text-xs text-white/80 mt-0.5">{offer.car.name}</p>
          )}
        </div>
      </OfferImage>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {offer.description}
        </p>

        {showPrice ? (
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400">{copy.offers.offerPrice}</p>
              <p className="text-xl font-bold text-brand-green">
                {getFeaturedOfferPriceLabel(offer)}
              </p>
            </div>
            {offer.original_price && offer.original_price > offer.price && (
              <div className="text-left">
                <p className="text-xs text-slate-400 line-through">
                  {formatPrice(offer.original_price)}
                </p>
                {savings > 0 && (
                  <p className="text-xs font-medium text-red-600">
                    {copy.offers.save} {formatPrice(savings)}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="mb-4 text-sm font-medium text-brand-gold">
            {offer.badge_text || copy.offers.specialDeal}
          </p>
        )}

        <div className="mt-auto">
          <Link to={link} className="block">
            <Button className="w-full" size="sm" variant={active ? 'primary' : 'outline'}>
              {copy.offers.bookOffer}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
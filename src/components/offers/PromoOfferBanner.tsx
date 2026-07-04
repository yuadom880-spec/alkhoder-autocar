import { Link } from 'react-router'
import { Tag } from 'lucide-react'
import type { FeaturedOffer } from '../../lib/types'
import {
  getFeaturedOfferLink,
  getFeaturedOfferPriceLabel,
  isFeaturedOfferActive,
  RENTAL_TYPE_LABELS,
} from '../../lib/featuredOffers'
import { copy } from '../../lib/copy'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { OfferImage } from './OfferImage'

interface PromoOfferBannerProps {
  offer: FeaturedOffer
  showBookButton?: boolean
}

export function PromoOfferBanner({ offer, showBookButton = true }: PromoOfferBannerProps) {
  if (!isFeaturedOfferActive(offer)) return null

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-red-200 bg-red-50">
      <div className="grid gap-4 sm:grid-cols-[140px_1fr] lg:grid-cols-[180px_1fr_auto]">
        <OfferImage
          src={offer.image_url}
          alt={offer.title}
          className="sm:rounded-none aspect-[4/3] sm:aspect-auto sm:min-h-full"
        />
        <div className="p-4 sm:py-5 sm:pl-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="danger">
              <Tag className="h-3 w-3 ml-1" />
              {copy.offers.activePromo}
            </Badge>
            <Badge variant={offer.rental_type === 'monthly' ? 'info' : 'warning'}>
              {RENTAL_TYPE_LABELS[offer.rental_type]}
            </Badge>
            {offer.badge_text && <Badge variant="warning">{offer.badge_text}</Badge>}
          </div>
          <h2 className="text-lg font-bold text-brand-dark mb-1">{offer.title}</h2>
          <p className="text-sm text-slate-600 mb-2">{offer.description}</p>
          {offer.price > 0 && (
            <p className="text-xl font-bold text-red-600">{getFeaturedOfferPriceLabel(offer)}</p>
          )}
        </div>
        {showBookButton && offer.car_id && (
          <div className="flex items-center p-4 sm:p-5">
            <Link to={getFeaturedOfferLink(offer)} className="w-full sm:w-auto">
              <Button className="w-full">{copy.offers.bookOffer}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
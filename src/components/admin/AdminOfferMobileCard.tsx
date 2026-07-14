import { Link } from 'react-router'
import { Edit, Power, Star, Trash2 } from 'lucide-react'
import {
  getFeaturedOfferPriceLabel,
  isAutoCarFeaturedOffer,
  isFeaturedOfferActive,
  RENTAL_TYPE_LABELS,
} from '../../lib/featuredOffers'
import type { FeaturedOffer } from '../../lib/types'
import { formatDate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface AdminOfferMobileCardProps {
  offer: FeaturedOffer
  enabledHere: boolean
  isBranchAdmin: boolean
  updating: boolean
  deleting: boolean
  onToggleActive: () => void
  onToggleFeatured: () => void
  onDelete: () => void
}

export function AdminOfferMobileCard({
  offer,
  enabledHere,
  isBranchAdmin,
  updating,
  deleting,
  onToggleActive,
  onToggleFeatured,
  onDelete,
}: AdminOfferMobileCardProps) {
  const isAuto = isAutoCarFeaturedOffer(offer)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex gap-3 p-4">
        <img src={offer.image_url} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-brand-dark leading-snug">{offer.title}</p>
          {offer.car?.name && <p className="text-xs text-slate-500 mt-0.5">{offer.car.name}</p>}
          <p className="mt-2 font-bold text-brand-green">
            {offer.price > 0 ? getFeaturedOfferPriceLabel(offer) : '—'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={offer.rental_type === 'monthly' ? 'info' : 'warning'}>
              {RENTAL_TYPE_LABELS[offer.rental_type]}
            </Badge>
            <Badge variant={enabledHere ? 'success' : 'danger'}>
              {enabledHere
                ? isBranchAdmin
                  ? 'ظاهر في فرعك'
                  : 'مفعّل'
                : isBranchAdmin
                  ? 'غير مفعّل في فرعك حالياً'
                  : 'موقوف'}
            </Badge>
            {offer.is_featured && <Badge variant="warning">مميز</Badge>}
            {offer.badge_text && <Badge variant="danger">{offer.badge_text}</Badge>}
          </div>
          {offer.valid_until && (
            <p className="text-[11px] text-slate-400 mt-2">حتى {formatDate(offer.valid_until)}</p>
          )}
          {!isFeaturedOfferActive(offer) && offer.is_active && (
            <p className="text-[11px] text-amber-600 mt-1">منتهي الصلاحية</p>
          )}
        </div>
      </div>

      <div
        className={`grid gap-2 border-t border-slate-100 bg-slate-50/60 p-3 ${
          isAuto ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] bg-white"
          isLoading={updating}
          onClick={onToggleActive}
        >
          <Power className="h-4 w-4" />
          {enabledHere ? 'إيقاف' : 'تفعيل'}
        </Button>
        {!isAuto && (
          <>
            {!isBranchAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="min-h-[44px] bg-white"
                isLoading={updating}
                onClick={onToggleFeatured}
              >
                <Star className={`h-4 w-4 ${offer.is_featured ? 'fill-brand-gold text-brand-gold' : ''}`} />
                تمييز
              </Button>
            )}
            <Link to={`/admin/offers/${offer.id}/edit`}>
              <Button size="sm" variant="outline" className="w-full min-h-[44px] bg-white">
                <Edit className="h-4 w-4" />
                تعديل
              </Button>
            </Link>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] bg-white text-red-600 hover:bg-red-50"
          isLoading={deleting}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          حذف
        </Button>
      </div>
    </article>
  )
}
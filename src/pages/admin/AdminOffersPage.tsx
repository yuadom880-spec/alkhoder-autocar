import { useEffect, useMemo, useState } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterOffersForAdminByBranch } from '../../lib/adminBranchFilters'
import { Link } from 'react-router'
import { Edit, Plus, Power, Star, Trash2 } from 'lucide-react'
import { AdminOfferMobileCard } from '../../components/admin/AdminOfferMobileCard'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import {
  getFeaturedOfferPriceLabel,
  isAutoCarFeaturedOffer,
  isFeaturedOfferActive,
  isFeaturedOfferBranchDisabled,
  RENTAL_TYPE_LABELS,
} from '../../lib/featuredOffers'
import {
  deleteFeaturedOffer,
  fetchDisplayedFeaturedOffers,
  setFeaturedOfferVisibilityForBranch,
  updateFeaturedOffer,
} from '../../lib/supabase'
import type { FeaturedOffer } from '../../lib/types'
import { formatDate } from '../../lib/utils'

export function AdminOffersPage() {
  const { filterBranchId, isBranchMode, activeBranchId } = useAdminBranch()
  const [offers, setOffers] = useState<FeaturedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetchDisplayedFeaturedOffers({ includeCars: true })
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const visibleOffers = useMemo(
    () => filterOffersForAdminByBranch(offers, filterBranchId),
    [offers, filterBranchId],
  )

  const branchScopeId = isBranchMode ? (activeBranchId ?? filterBranchId) : null

  const isOfferEnabledHere = (offer: FeaturedOffer) =>
    isBranchMode && branchScopeId
      ? !isFeaturedOfferBranchDisabled(offer, branchScopeId)
      : offer.is_active

  const setOfferVisibilityForBranch = async (offer: FeaturedOffer, visible: boolean) => {
    if (!branchScopeId) throw new Error('اختر فرعاً من شريط الأعلى أولاً')
    await setFeaturedOfferVisibilityForBranch(offer, branchScopeId, visible)
  }

  const handleDelete = async (offer: FeaturedOffer) => {
    const branchNote = isBranchMode && branchScopeId ? ` من فرعك فقط` : ''
    if (!confirm(`هل تريد إيقاف عرض "${offer.title}"${branchNote}؟`)) return
    setDeleting(offer.id)
    try {
      if (isBranchMode && branchScopeId) {
        await setOfferVisibilityForBranch(offer, false)
      } else {
        await deleteFeaturedOffer(offer.id)
      }
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (offer: FeaturedOffer) => {
    setUpdating(offer.id)
    try {
      const enable = !isOfferEnabledHere(offer)

      if (isBranchMode) {
        if (!branchScopeId) {
          alert('اختر فرعاً من شريط الأعلى أولاً')
          return
        }
        await setOfferVisibilityForBranch(offer, enable)
        load()
        return
      }

      const updated = await updateFeaturedOffer(offer.id, { is_active: enable })
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setUpdating(null)
    }
  }

  const toggleField = async (offer: FeaturedOffer, field: 'is_featured') => {
    if (isAutoCarFeaturedOffer(offer)) return
    setUpdating(offer.id)
    try {
      const updated = await updateFeaturedOffer(offer.id, {
        [field]: !offer[field],
      })
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <>
      <AdminTopBar title="العروض المميزة" />
      <div className="p-3 sm:p-6 lg:p-8">
        <AdminPageHeader
          title="العروض المميزة"
          subtitle={
            <>
              <p>إدارة عروض الإيجار اليومي والشهري</p>
              {isBranchMode && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  وضع فرعي: إيقاف العرض يخصّ فرعك فقط
                </p>
              )}
            </>
          }
          action={
            <Link to="/admin/offers/new">
              <Button size="md" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                إضافة عرض
              </Button>
            </Link>
          }
        />

        {loading ? (
          <LoadingSpinner />
        ) : visibleOffers.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500 mb-4">
              {isBranchMode ? 'لا توجد عروض لسيارات فرعك' : 'لا توجد عروض'}
            </p>
            <Link to="/admin/offers/new">
              <Button>إضافة أول عرض</Button>
            </Link>
          </div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {visibleOffers.map((offer) => (
              <AdminOfferMobileCard
                key={offer.id}
                offer={offer}
                enabledHere={isOfferEnabledHere(offer)}
                isBranchMode={isBranchMode}
                updating={updating === offer.id}
                deleting={deleting === offer.id}
                onToggleActive={() => toggleActive(offer)}
                onToggleFeatured={() => toggleField(offer, 'is_featured')}
                onDelete={() => handleDelete(offer)}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">العرض</th>
                    <th className="px-4 py-3 text-right font-medium">النوع</th>
                    <th className="px-4 py-3 text-right font-medium">السعر</th>
                    <th className="px-4 py-3 text-right font-medium">الحالة</th>
                    <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleOffers.map((offer) => {
                    const enabledHere = isOfferEnabledHere(offer)
                    return (
                      <tr key={offer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={offer.image_url}
                              alt=""
                              className="h-12 w-20 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{offer.title}</p>
                              {offer.car?.name && (
                                <p className="text-xs text-slate-400">{offer.car.name}</p>
                              )}
                              {offer.valid_until && (
                                <p className="text-xs text-slate-400">
                                  حتى {formatDate(offer.valid_until)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={offer.rental_type === 'monthly' ? 'info' : 'warning'}>
                            {RENTAL_TYPE_LABELS[offer.rental_type]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {offer.price > 0 ? getFeaturedOfferPriceLabel(offer) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={enabledHere ? 'success' : 'danger'}>
                              {enabledHere
                                ? isBranchMode
                                  ? 'ظاهر في فرعك'
                                  : 'مفعّل'
                                : isBranchMode
                                  ? 'موقوف في فرعك'
                                  : 'موقوف'}
                            </Badge>
                            {offer.is_featured && <Badge variant="warning">مميز</Badge>}
                            {!isFeaturedOfferActive(offer) && offer.is_active && (
                              <Badge variant="default">منتهي</Badge>
                            )}
                            {offer.badge_text && (
                              <Badge variant="danger">{offer.badge_text}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              title={isBranchMode ? 'إظهار/إخفاء في فرعك' : 'تفعيل/إيقاف'}
                              isLoading={updating === offer.id}
                              onClick={() => toggleActive(offer)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            {!isAutoCarFeaturedOffer(offer) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="تمييز"
                                isLoading={updating === offer.id}
                                onClick={() => toggleField(offer, 'is_featured')}
                              >
                                <Star
                                  className={`h-4 w-4 ${offer.is_featured ? 'fill-brand-gold text-brand-gold' : ''}`}
                                />
                              </Button>
                            )}
                            {!isAutoCarFeaturedOffer(offer) && (
                              <Link to={`/admin/offers/${offer.id}/edit`}>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              title={isBranchMode ? 'إخفاء من فرعك' : 'إيقاف العرض'}
                              isLoading={deleting === offer.id}
                              onClick={() => handleDelete(offer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </>
  )
}
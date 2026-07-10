import { useEffect, useMemo, useState } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterOffersByBranch } from '../../lib/adminBranchFilters'
import { Link } from 'react-router'
import { Edit, Plus, Power, Star, Trash2 } from 'lucide-react'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import {
  getFeaturedOfferPriceLabel,
  isFeaturedOfferActive,
  RENTAL_TYPE_LABELS,
} from '../../lib/featuredOffers'
import { deleteFeaturedOffer, fetchFeaturedOffers, updateFeaturedOffer } from '../../lib/supabase'
import type { FeaturedOffer } from '../../lib/types'
import { formatDate } from '../../lib/utils'

export function AdminOffersPage() {
  const { filterBranchId, isBranchMode } = useAdminBranch()
  const [offers, setOffers] = useState<FeaturedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetchFeaturedOffers({ includeCars: true })
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const visibleOffers = useMemo(
    () => filterOffersByBranch(offers, filterBranchId),
    [offers, filterBranchId],
  )

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل تريد حذف عرض "${title}"؟`)) return
    setDeleting(id)
    try {
      await deleteFeaturedOffer(id)
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const toggleField = async (offer: FeaturedOffer, field: 'is_active' | 'is_featured') => {
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">العروض المميزة</h1>
            <p className="text-sm text-slate-500 mt-1">إدارة عروض الإيجار اليومي والشهري</p>
          </div>
          <Link to="/admin/offers/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة عرض
            </Button>
          </Link>
        </div>

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
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
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
                  {visibleOffers.map((offer) => (
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
                          <Badge variant={offer.is_active ? 'success' : 'danger'}>
                            {offer.is_active ? 'مفعّل' : 'موقوف'}
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
                            title="تفعيل/إيقاف"
                            isLoading={updating === offer.id}
                            onClick={() => toggleField(offer, 'is_active')}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
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
                          <Link to={`/admin/offers/${offer.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            isLoading={deleting === offer.id}
                            onClick={() => handleDelete(offer.id, offer.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
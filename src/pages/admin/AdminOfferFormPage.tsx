import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { FeaturedOfferForm } from '../../components/admin/FeaturedOfferForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import {
  createFeaturedOffer,
  fetchFeaturedOfferById,
  updateFeaturedOffer,
} from '../../lib/supabase'
import type { FeaturedOffer } from '../../lib/types'

export function AdminOfferFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [offer, setOffer] = useState<FeaturedOffer | null>(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    fetchFeaturedOfferById(id)
      .then(setOffer)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <><AdminTopBar /><LoadingSpinner /></>

  if (isEdit && !offer) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">العرض غير موجود</p>
      </div>
    )
  }

  return (
    <>
      <AdminTopBar title={isEdit ? 'تعديل العرض' : 'إضافة عرض'} />
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark mb-6">
          {isEdit ? 'تعديل العرض المميز' : 'إضافة عرض مميز جديد'}
        </h1>
        <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <FeaturedOfferForm
            initial={offer ?? undefined}
            onSubmit={async (data) => {
              if (isEdit && id) {
                await updateFeaturedOffer(id, data)
              } else {
                await createFeaturedOffer(data)
              }
              navigate('/admin/offers')
            }}
            onCancel={() => navigate('/admin/offers')}
          />
        </div>
      </div>
    </>
  )
}
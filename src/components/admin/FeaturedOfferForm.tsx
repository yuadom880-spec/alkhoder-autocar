import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Tag } from 'lucide-react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import type { Car, FeaturedOffer, FeaturedOfferFormData, RentalPeriodType } from '../../lib/types'
import { RENTAL_TYPE_LABELS } from '../../lib/featuredOffers'
import { filterCarsByBranch } from '../../lib/adminBranchFilters'
import { copy } from '../../lib/copy'
import { fetchCars, isSupabaseConfigured, uploadCarImage } from '../../lib/supabase'
import { Button } from '../ui/Button'

interface FeaturedOfferFormProps {
  initial?: FeaturedOffer
  onSubmit: (data: FeaturedOfferFormData) => Promise<void>
  onCancel: () => void
}

export function FeaturedOfferForm({ initial, onSubmit, onCancel }: FeaturedOfferFormProps) {
  const { filterBranchId, isBranchAdmin, branchId } = useAdminBranch()
  const [cars, setCars] = useState<Car[]>([])
  const [form, setForm] = useState<FeaturedOfferFormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    rental_type: initial?.rental_type ?? 'daily',
    image_url: initial?.image_url ?? '',
    badge_text: initial?.badge_text ?? '',
    price: initial?.price ?? 0,
    original_price: initial?.original_price ?? null,
    car_id: initial?.car_id ?? null,
    link_url: initial?.link_url ?? '',
    is_active: initial?.is_active ?? true,
    is_featured: initial?.is_featured ?? false,
    valid_until: initial?.valid_until ?? '',
    sort_order: initial?.sort_order ?? 0,
    branch_ids:
      initial?.branch_ids ?? (isBranchAdmin && branchId ? [branchId] : []),
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCars().then(setCars).catch(console.error)
  }, [])

  const branchCars = useMemo(
    () => filterCarsByBranch(cars, filterBranchId),
    [cars, filterBranchId],
  )

  const update = <K extends keyof FeaturedOfferFormData>(
    key: K,
    value: FeaturedOfferFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      if (!isSupabaseConfigured) {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('فشل قراءة الصورة'))
          reader.readAsDataURL(file)
        })
        update('image_url', url)
        return
      }
      const url = await uploadCarImage(file)
      update('image_url', url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('عنوان العرض مطلوب')
      return
    }
    if (!form.image_url) {
      setError('صورة العرض مطلوبة')
      return
    }
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-5 py-4 border-b border-slate-200">
          <Tag className="h-5 w-5 text-brand-gold" />
          <span className="font-bold text-brand-dark">بيانات العرض المميز</span>
        </div>
        <div className="p-5 space-y-4">
          {isBranchAdmin && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {copy.admin.offerBranchHint}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-field">عنوان العرض *</label>
              <input
                className="input-field"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="مثال: باقة الإيجار الشهري — كابتيفا"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">الوصف</label>
              <textarea
                rows={3}
                className="input-field resize-none"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">نوع الإيجار *</label>
              <select
                className="input-field"
                value={form.rental_type}
                onChange={(e) => update('rental_type', e.target.value as RentalPeriodType)}
              >
                {(Object.keys(RENTAL_TYPE_LABELS) as RentalPeriodType[]).map((type) => (
                  <option key={type} value={type}>
                    {RENTAL_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">نص الشارة</label>
              <input
                className="input-field"
                value={form.badge_text}
                onChange={(e) => update('badge_text', e.target.value)}
                placeholder="خصم 15%"
              />
            </div>
            <div>
              <label className="label-field">
                سعر العرض ({form.rental_type === 'monthly' ? 'ر.س/شهر' : 'ر.س/يوم'})
              </label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.price}
                onChange={(e) => update('price', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label-field">السعر قبل العرض (اختياري)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.original_price ?? ''}
                onChange={(e) =>
                  update('original_price', e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
            <div>
              <label className="label-field">سيارة مرتبطة (اختياري)</label>
              <select
                className="input-field"
                value={form.car_id ?? ''}
                onChange={(e) => {
                  const carId = e.target.value || null
                  setForm((prev) => ({
                    ...prev,
                    car_id: carId,
                    link_url: carId ? '' : prev.link_url,
                  }))
                  setError('')
                }}
              >
                <option value="">— بدون —</option>
                {branchCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name}
                  </option>
                ))}
              </select>

            </div>
            <div>
              <label className="label-field">رابط مخصص (اختياري)</label>
              <input
                className="input-field"
                dir="ltr"
                value={form.link_url}
                onChange={(e) => update('link_url', e.target.value)}
                placeholder="/cars/5"
              />
            </div>
            <div>
              <label className="label-field">صالح حتى</label>
              <input
                type="date"
                className="input-field"
                value={form.valid_until}
                onChange={(e) => update('valid_until', e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">ترتيب العرض</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.sort_order}
                onChange={(e) => update('sort_order', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label-field">صورة العرض *</label>
            {form.image_url && (
              <img
                src={form.image_url}
                alt=""
                className="mb-3 h-40 w-full max-w-sm rounded-xl object-contain bg-slate-100"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="input-field py-2"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
            <input
              className="input-field mt-2"
              dir="ltr"
              placeholder="أو ألصق رابط الصورة"
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update('is_active', e.target.checked)}
                className="rounded border-slate-300 text-brand-green"
              />
              <span>العرض مفعّل</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => update('is_featured', e.target.checked)}
                className="rounded border-slate-300 text-brand-gold"
              />
              <span>عرض مميز (يظهر في الرئيسية)</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" isLoading={loading || uploading}>
          حفظ العرض
        </Button>
      </div>
    </form>
  )
}
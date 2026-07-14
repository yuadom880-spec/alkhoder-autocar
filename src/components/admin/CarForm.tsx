import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { isCarExclusiveToBranch } from '../../lib/branchFilter'
import type { Car, CarCategory, CarClass, CarFormData } from '../../lib/types'
import { getBranchFormName } from '../../lib/carBranchLabels'
import { getBranchFormPrices } from '../../lib/carBranchPricing'
import { CAR_CATEGORIES, CAR_CLASSES, CATEGORY_LABELS, CLASS_LABELS } from '../../lib/constants'
import { copy } from '../../lib/copy'
import { CarBranchSelector } from './CarBranchSelector'
import { CarImageUploader } from './CarImageUploader'
import { CarOffersForm } from './CarOffersForm'
import { Button } from '../ui/Button'

const defaultSpecs = {
  transmission: 'أوتوماتيك',
  fuel: 'بنزين',
  seats: 5,
  doors: 4,
  ac: true,
}

interface CarFormProps {
  initial?: Car
  onSubmit: (data: CarFormData) => Promise<void>
  onCancel: () => void
}

function defaultBranchIds(initial: Car | undefined, branchId: string | null): string[] {
  if (initial) return initial.branch_ids ?? []
  if (branchId) return [branchId]
  return []
}

export function CarForm({ initial, onSubmit, onCancel }: CarFormProps) {
  const { isBranchAdmin, branchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? branchId : null
  const branchPriceOnlyMode = Boolean(
    isBranchAdmin &&
      branchScopeId &&
      initial &&
      !isCarExclusiveToBranch(initial, branchScopeId),
  )
  const branchPrices = initial ? getBranchFormPrices(initial, branchScopeId) : null
  const branchName = initial ? getBranchFormName(initial, branchScopeId) : ''

  const [form, setForm] = useState<CarFormData>({
    name: branchName,
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    year: initial?.year ?? new Date().getFullYear(),
    category: initial?.category ?? 'sedan',
    car_class: initial?.car_class ?? 'mid',
    price_per_day: branchPrices?.price_per_day ?? initial?.price_per_day ?? 100,
    price_per_month: branchPrices?.price_per_month ?? initial?.price_per_month ?? 2500,
    image_url: initial?.image_url ?? '',
    images: initial?.images ?? [],
    specs: initial?.specs ?? defaultSpecs,
    description: initial?.description ?? '',
    is_available: initial?.is_available ?? true,
    is_featured: true,
    offer: initial?.offer ?? { daily: null, monthly: null },
    branch_ids: defaultBranchIds(initial, branchScopeId),
    unavailable_branch_ids: initial?.unavailable_branch_ids ?? [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const update = <K extends keyof CarFormData>(key: K, value: CarFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const handleImagesChange = (imageUrl: string, images: string[]) => {
    setForm((prev) => ({ ...prev, image_url: imageUrl, images }))
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('اسم السيارة مطلوب')
      return
    }
    if (!branchPriceOnlyMode && (!form.brand || !form.image_url)) {
      setError(!form.brand ? 'الماركة مطلوبة' : 'ارفع صورة واحدة على الأقل للسيارة')
      return
    }
    setLoading(true)
    try {
      await onSubmit({ ...form, is_featured: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {branchPriceOnlyMode && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          هذه السيارة مشتركة بين الفروع — يمكنك تعديل اسم العرض وأسعار فرعك فقط.
          {initial && (
            <span className="block mt-1 text-xs text-amber-700">
              الاسم العام في النظام: {initial.name}
            </span>
          )}
        </p>
      )}

      <div className={`grid gap-4 sm:grid-cols-2 ${branchPriceOnlyMode ? 'max-w-xl' : ''}`}>
        <div className={branchPriceOnlyMode ? 'sm:col-span-2' : ''}>
            <label className="label-field">
              {branchPriceOnlyMode ? 'اسم العرض في فرعك *' : 'اسم السيارة *'}
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            {branchPriceOnlyMode && (
              <p className="text-[11px] text-slate-500 mt-1">
                يظهر للعملاء عند اختيار فرعك فقط — باقي الفروع يبقى الاسم العام.
              </p>
            )}
        </div>
        {!branchPriceOnlyMode && (
          <>
            <div>
              <label className="label-field">الماركة *</label>
              <input
                className="input-field"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">الموديل</label>
              <input
                className="input-field"
                value={form.model}
                onChange={(e) => update('model', e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">السنة</label>
              <input
                type="number"
                className="input-field"
                value={form.year}
                onChange={(e) => update('year', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label-field">التصنيف</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update('category', e.target.value as CarCategory)}
              >
                {CAR_CATEGORIES.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">الفئة</label>
              <select
                className="input-field"
                value={form.car_class}
                onChange={(e) => update('car_class', e.target.value as CarClass)}
              >
                {CAR_CLASSES.map((k) => (
                  <option key={k} value={k}>
                    {CLASS_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div>
          <label className="label-field">
            {isBranchAdmin ? copy.admin.carBranchDailyPrice : 'السعر اليومي (ر.س)'}
          </label>
          <input
            type="number"
            className="input-field"
            value={form.price_per_day}
            onChange={(e) => update('price_per_day', Number(e.target.value))}
          />
          {isBranchAdmin && (
            <p className="text-[11px] text-slate-500 mt-1">{copy.admin.carBranchPriceHint}</p>
          )}
        </div>
        <div>
          <label className="label-field">
            {isBranchAdmin ? copy.admin.carBranchMonthlyPrice : 'السعر الشهري (ر.س)'}
          </label>
          <input
            type="number"
            className="input-field"
            value={form.price_per_month}
            onChange={(e) => update('price_per_month', Number(e.target.value))}
          />
        </div>
      </div>

      {!branchPriceOnlyMode && (
        <>
          <CarImageUploader
            imageUrl={form.image_url}
            images={form.images}
            onChange={handleImagesChange}
            onError={setError}
          />

          {!isBranchAdmin && (
            <CarBranchSelector
              value={form.branch_ids}
              onChange={(branch_ids) => update('branch_ids', branch_ids)}
            />
          )}

          {(!isBranchAdmin ||
            !initial ||
            (branchScopeId && isCarExclusiveToBranch(initial, branchScopeId))) && (
            <CarOffersForm
              dailyBasePrice={form.price_per_day}
              monthlyBasePrice={form.price_per_month}
              offers={form.offer}
              onChange={(offer) => update('offer', offer)}
            />
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-slate-400 hover:text-brand-green transition-colors"
          >
            {showUrlInput ? 'إخفاء رابط الصورة' : 'أو ألصق رابط صورة (اختياري)'}
          </button>

          {showUrlInput && (
            <div>
              <input
                className="input-field"
                dir="ltr"
                value={form.image_url.startsWith('data:') ? '' : form.image_url}
                onChange={(e) => {
                  const url = e.target.value
                  if (url) handleImagesChange(url, form.images.filter((i) => i !== url))
                }}
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="label-field">الوصف</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field">ناقل الحركة</label>
              <input
                className="input-field"
                value={form.specs.transmission}
                onChange={(e) =>
                  update('specs', { ...form.specs, transmission: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-field">الوقود</label>
              <input
                className="input-field"
                value={form.specs.fuel}
                onChange={(e) => update('specs', { ...form.specs, fuel: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">المقاعد</label>
              <input
                type="number"
                className="input-field"
                value={form.specs.seats}
                onChange={(e) =>
                  update('specs', { ...form.specs, seats: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </>
      )}

      {!isBranchAdmin && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => update('is_available', e.target.checked)}
              className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            متاحة للحجز في كل الفروع
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
        <Button type="submit" isLoading={loading} className="w-full sm:w-auto min-h-[48px]">
          {initial ? 'حفظ التعديلات' : 'إضافة السيارة'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto min-h-[48px]">
          إلغاء
        </Button>
      </div>
    </form>
  )
}
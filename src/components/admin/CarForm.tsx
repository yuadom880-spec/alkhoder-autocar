import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Car, CarCategory, CarFormData } from '../../lib/types'
import { CATEGORY_LABELS } from '../../lib/constants'
import { CarBranchSelector } from './CarBranchSelector'
import { CarImageUploader } from './CarImageUploader'
import { CarOfferForm } from './CarOfferForm'
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

export function CarForm({ initial, onSubmit, onCancel }: CarFormProps) {
  const [form, setForm] = useState<CarFormData>({
    name: initial?.name ?? '',
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    year: initial?.year ?? new Date().getFullYear(),
    category: initial?.category ?? 'sedan',
    price_per_day: initial?.price_per_day ?? 100,
    image_url: initial?.image_url ?? '',
    images: initial?.images ?? [],
    specs: initial?.specs ?? defaultSpecs,
    description: initial?.description ?? '',
    is_available: initial?.is_available ?? true,
    is_featured: initial?.is_featured ?? false,
    offer: initial?.offer ?? null,
    branch_ids: initial?.branch_ids ?? [],
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
    if (!form.name || !form.brand) {
      setError('الاسم والماركة مطلوبين')
      return
    }
    if (!form.image_url) {
      setError('ارفع صورة واحدة على الأقل للسيارة')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">اسم السيارة *</label>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
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
          <label className="label-field">الفئة</label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => update('category', e.target.value as CarCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">السعر / يوم (ر.س)</label>
          <input
            type="number"
            className="input-field"
            value={form.price_per_day}
            onChange={(e) => update('price_per_day', Number(e.target.value))}
          />
        </div>
      </div>

      <CarImageUploader
        imageUrl={form.image_url}
        images={form.images}
        onChange={handleImagesChange}
        onError={setError}
      />

      <CarBranchSelector
        value={form.branch_ids}
        onChange={(branch_ids) => update('branch_ids', branch_ids)}
      />

      <CarOfferForm
        basePrice={form.price_per_day}
        offer={form.offer}
        onChange={(offer) => update('offer', offer)}
      />

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

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => update('is_available', e.target.checked)}
            className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
          />
          متاحة للحجز
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update('is_featured', e.target.checked)}
            className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
          />
          سيارة مميزة
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          {initial ? 'حفظ التعديلات' : 'إضافة السيارة'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { isCarExclusiveToBranch } from '../../lib/branchFilter'
import { getBranchFormCarData } from '../../lib/carBranchProfile'
import type { Car, CarCategory, CarClass, CarFormData } from '../../lib/types'
import { CAR_CATEGORIES, CAR_CLASSES, CATEGORY_LABELS, CLASS_LABELS } from '../../lib/constants'
import { copy } from '../../lib/copy'
import { CarBranchSelector } from './CarBranchSelector'
import { CarImageUploader } from './CarImageUploader'
import { CarOffersForm } from './CarOffersForm'
import {
  DEFAULT_OFFER,
  MONTHLY_FEATURED_MIN_SAVINGS,
  normalizeCarOffers,
  previewOfferPrice,
} from '../../lib/offers'
import { formatPrice } from '../../lib/utils'
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
  /** وضع العرض الشهري — من قسم العروض الشهرية */
  monthlyFocus?: boolean
  /** إضافة سيارة جديدة كعرض شهري (بيانات كاملة + عرض شهري) */
  monthlyOfferCreate?: boolean
  onSubmit: (data: CarFormData) => Promise<void>
  onCancel: () => void
}

function defaultBranchIds(initial: Car | undefined, branchId: string | null): string[] {
  if (initial) return initial.branch_ids ?? []
  if (branchId) return [branchId]
  return []
}

function readMonthlyOfferPrice(form: CarFormData): number {
  const monthly = normalizeCarOffers(form.offer).monthly
  if (!monthly?.active) return 0
  if (monthly.discount_type === 'custom_price') return monthly.discount_value
  return previewOfferPrice(form.price_per_month, monthly)
}

function buildMonthlyOfferFromPrice(
  offerPrice: number,
): CarFormData['offer'] {
  return {
    daily: null,
    monthly: {
      ...DEFAULT_OFFER,
      active: true,
      title: 'عرض شهري',
      discount_type: 'custom_price',
      discount_value: offerPrice,
    },
  }
}

function buildInitialForm(
  initial: Car | undefined,
  branchScopeId: string | null,
): CarFormData {
  const branchDefaults =
    initial && branchScopeId ? getBranchFormCarData(initial, branchScopeId) : null

  return {
    name: branchDefaults?.name ?? initial?.name ?? '',
    brand: branchDefaults?.brand ?? initial?.brand ?? '',
    model: branchDefaults?.model ?? initial?.model ?? '',
    year: branchDefaults?.year ?? initial?.year ?? new Date().getFullYear(),
    category: branchDefaults?.category ?? initial?.category ?? 'sedan',
    car_class: branchDefaults?.car_class ?? initial?.car_class ?? 'mid',
    price_per_day: branchDefaults?.price_per_day ?? initial?.price_per_day ?? 100,
    price_per_month:
      branchDefaults?.price_per_month ??
      initial?.price_per_month ??
      Math.round((branchDefaults?.price_per_day ?? initial?.price_per_day ?? 100) * 25),
    image_url: branchDefaults?.image_url ?? initial?.image_url ?? '',
    images: branchDefaults?.images ?? initial?.images ?? [],
    specs: branchDefaults?.specs ?? initial?.specs ?? defaultSpecs,
    description: branchDefaults?.description ?? initial?.description ?? '',
    is_available: initial?.is_available ?? true,
    is_featured: true,
    offer: branchDefaults?.offer ?? initial?.offer ?? { daily: null, monthly: null },
    branch_ids: defaultBranchIds(initial, branchScopeId),
    unavailable_branch_ids: initial?.unavailable_branch_ids ?? [],
  }
}

export function CarForm({
  initial,
  monthlyFocus = false,
  monthlyOfferCreate = false,
  onSubmit,
  onCancel,
}: CarFormProps) {
  const { isBranchAdmin, branchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? branchId : null
  const branchSharedCarMode = Boolean(
    isBranchAdmin &&
      branchScopeId &&
      initial &&
      !isCarExclusiveToBranch(initial, branchScopeId),
  )

  const [form, setForm] = useState<CarFormData>(() => buildInitialForm(initial, branchScopeId))
  const [monthlyOfferPrice, setMonthlyOfferPrice] = useState(() =>
    readMonthlyOfferPrice(buildInitialForm(initial, branchScopeId)),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const syncMonthlyOfferPrice = (offerPrice: number) => {
    setMonthlyOfferPrice(offerPrice)
    setForm((prev) => ({
      ...prev,
      offer: buildMonthlyOfferFromPrice(offerPrice),
    }))
    setError('')
  }

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
    if (!form.name.trim() || !form.brand.trim()) {
      setError('الاسم والماركة مطلوبين')
      return
    }
    if (!form.image_url) {
      setError('ارفع صورة واحدة على الأقل للسيارة')
      return
    }
    if (monthlyFocus) {
      if (form.price_per_month <= 0) {
        setError(copy.admin.monthlyOfferBasePriceRequired)
        return
      }
      if (monthlyOfferPrice <= 0) {
        setError(copy.admin.monthlyOfferPriceRequired)
        return
      }
      if (monthlyOfferPrice >= form.price_per_month) {
        setError(copy.admin.monthlyOfferPriceMustBeLower)
        return
      }
    }
    setLoading(true)
    try {
      const payload =
        monthlyFocus
          ? {
              ...form,
              is_featured: true,
              offer: buildMonthlyOfferFromPrice(monthlyOfferPrice),
            }
          : { ...form, is_featured: true }
      await onSubmit(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {branchSharedCarMode && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          هذه السيارة مشتركة بين الفروع — كل التعديلات هنا (الاسم، الصور، الوصف، الأسعار، العروض)
          تظهر لعملاء فرعك فقط ولا تغيّر بيانات باقي الفروع.
        </p>
      )}

      {monthlyFocus && initial ? (
        <div className="rounded-xl border border-brand-gold/25 bg-amber-50/40 px-4 py-3">
          <p className="font-bold text-brand-dark">{form.name}</p>
          <p className="text-sm text-slate-500">
            {form.brand} · {form.model} · {form.year}
          </p>
        </div>
      ) : (
        <>
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
          </div>

          {!monthlyFocus && (
            <>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <p className="text-sm font-bold text-brand-dark">الأسعار</p>
                <p className="text-xs text-slate-500 mt-1">
                  {isBranchAdmin
                    ? 'السعر اليومي والشهري لفرعك — يظهر في قسم أسطول السيارات'
                    : 'السعر اليومي والشهري الافتراضي لكل الفروع'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
            </>
          )}
        </>
      )}

      {monthlyFocus && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-4">
          <div>
            <p className="text-sm font-bold text-brand-dark">
              {copy.admin.monthlyOfferPriceSection}
            </p>
            <p className="text-xs text-slate-500 mt-1">{copy.admin.monthlyOfferPriceHint}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">{copy.admin.monthlyOfferBasePriceLabel}</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.price_per_month || ''}
                onChange={(e) => {
                  const base = Number(e.target.value)
                  update('price_per_month', base)
                  if (monthlyOfferPrice > 0 && monthlyOfferPrice < base) {
                    syncMonthlyOfferPrice(monthlyOfferPrice)
                  }
                }}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {copy.admin.monthlyOfferBasePriceHint}
              </p>
            </div>
            <div>
              <label className="label-field">{copy.admin.monthlyOfferFinalPriceLabel}</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={monthlyOfferPrice || ''}
                onChange={(e) => syncMonthlyOfferPrice(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {copy.admin.monthlyOfferFinalPriceHint}
              </p>
            </div>
          </div>
          {monthlyOfferPrice > 0 && form.price_per_month > monthlyOfferPrice && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <span className="text-slate-400 line-through">
                {formatPrice(form.price_per_month)}
              </span>
              <span className="mx-2">←</span>
              <span className="font-bold text-lg">{formatPrice(monthlyOfferPrice)}</span>
              <span className="mx-2 text-green-700">
                وفّر {formatPrice(form.price_per_month - monthlyOfferPrice)}
              </span>
            </div>
          )}
          {monthlyOfferPrice > 0 &&
            form.price_per_month > monthlyOfferPrice &&
            form.price_per_month - monthlyOfferPrice >= MONTHLY_FEATURED_MIN_SAVINGS && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {copy.admin.monthlyOfferFeaturedEligible}
              </p>
            )}
          {monthlyOfferPrice > 0 &&
            form.price_per_month > monthlyOfferPrice &&
            form.price_per_month - monthlyOfferPrice < MONTHLY_FEATURED_MIN_SAVINGS && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {copy.admin.monthlyOfferFeaturedIneligible(
                  Math.round(form.price_per_month - monthlyOfferPrice),
                )}
              </p>
            )}
        </div>
      )}

      <CarImageUploader
        imageUrl={form.image_url}
        images={form.images}
        onChange={handleImagesChange}
        onError={setError}
      />

      {(!monthlyFocus || monthlyOfferCreate) && !isBranchAdmin && (
        <CarBranchSelector
          value={form.branch_ids}
          onChange={(branch_ids) => update('branch_ids', branch_ids)}
        />
      )}

      {!monthlyFocus && (
        <>
          <div className="rounded-xl border border-brand-gold/25 bg-amber-50/50 px-4 py-3">
            <p className="text-sm font-bold text-brand-dark">العروض — يومي وشهري</p>
            <p className="text-xs text-slate-600 mt-1">{copy.admin.carOffersSectionHint}</p>
          </div>
          <CarOffersForm
            dailyBasePrice={form.price_per_day}
            monthlyBasePrice={form.price_per_month}
            offers={form.offer}
            onChange={(offer) => update('offer', offer)}
          />
        </>
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

      {(!monthlyFocus || monthlyOfferCreate) && (
      <div>
        <label className="label-field">الوصف</label>
        <textarea
          rows={3}
          className="input-field resize-none"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>
      )}

      {(!monthlyFocus || monthlyOfferCreate) && (
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
      )}

      {!monthlyFocus && !isBranchAdmin && (
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
          {monthlyOfferCreate
            ? copy.admin.saveMonthlyOffer
            : monthlyFocus
              ? copy.admin.saveMonthlyOffer
              : initial
                ? 'حفظ التعديلات'
                : 'إضافة السيارة'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto min-h-[48px]">
          إلغاء
        </Button>
      </div>
    </form>
  )
}
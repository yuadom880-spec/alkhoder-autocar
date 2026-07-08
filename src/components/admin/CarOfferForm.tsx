import { useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Tag } from 'lucide-react'
import type { CarOffer, RentalPeriodType } from '../../lib/types'
import {
  ADMIN_OFFER_DISCOUNT_TYPES,
  DEFAULT_OFFER,
  getDiscountValueLabel,
  previewOfferPrice,
} from '../../lib/offers'
import { getPriceUnitLabel } from '../../lib/pricing'
import { formatPrice } from '../../lib/utils'

interface CarOfferFormProps {
  rentalType: RentalPeriodType
  basePrice: number
  offer: CarOffer | null
  onChange: (offer: CarOffer | null) => void
  heading: string
  icon?: LucideIcon
}

export function CarOfferForm({
  rentalType,
  basePrice,
  offer,
  onChange,
  heading,
  icon: Icon,
}: CarOfferFormProps) {
  const current = offer ?? { ...DEFAULT_OFFER, active: false }
  const enabled = current.active
  const unitLabel = getPriceUnitLabel(rentalType)

  const update = (patch: Partial<CarOffer>) => {
    onChange({ ...current, ...patch })
  }

  const toggle = (active: boolean) => {
    if (!active) {
      onChange({ ...current, active: false })
    } else {
      onChange({
        ...DEFAULT_OFFER,
        active: true,
        title: rentalType === 'monthly' ? 'عرض شهري' : 'عرض يومي',
      })
    }
  }

  const preview = enabled ? previewOfferPrice(basePrice, current) : basePrice

  useEffect(() => {
    if (!offer?.active || offer.discount_type !== 'custom_price') return
    onChange({
      ...offer,
      discount_type: 'fixed',
      discount_value: Math.max(0, Math.round((basePrice - offer.discount_value) * 100) / 100),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- تحويل العروض القديمة مرة واحدة عند الفتح

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-brand-gold" /> : <Tag className="h-5 w-5 text-brand-gold" />}
          <span className="font-bold text-brand-dark">{heading}</span>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <span className={enabled ? 'text-brand-green font-medium' : 'text-slate-500'}>
            {enabled ? 'مفعّل' : 'بدون عرض'}
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => toggle(e.target.checked)}
            className="rounded border-slate-300 text-brand-green focus:ring-brand-green h-5 w-5"
          />
        </label>
      </div>

      {enabled && (
        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">عنوان العرض</label>
              <input
                className="input-field"
                value={current.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="مثال: عرض نهاية الأسبوع"
              />
            </div>
            <div>
              <label className="label-field">نص الشارة (يظهر على السيارة)</label>
              <input
                className="input-field"
                value={current.badge_text}
                onChange={(e) => update({ badge_text: e.target.value })}
                placeholder="مثال: خصم 20% — يتولّد تلقائياً إذا فارغ"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">نوع العرض</label>
              <select
                className="input-field"
                value={
                  current.discount_type === 'custom_price' ? 'fixed' : current.discount_type
                }
                onChange={(e) =>
                  update({
                    discount_type: e.target.value as 'percent' | 'fixed',
                    discount_value: 0,
                  })
                }
              >
                {ADMIN_OFFER_DISCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'percent' ? 'نسبة مئوية (%)' : 'مبلغ ثابت (ر.س)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">
                {getDiscountValueLabel(current.discount_type, rentalType)}
              </label>
              <input
                type="number"
                min={0}
                max={current.discount_type === 'percent' ? 100 : undefined}
                className="input-field"
                value={current.discount_value || ''}
                onChange={(e) => update({ discount_value: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label-field">تاريخ انتهاء العرض (اختياري)</label>
            <input
              type="date"
              className="input-field"
              value={current.valid_until ?? ''}
              onChange={(e) => update({ valid_until: e.target.value || null })}
            />
          </div>

          <div>
            <label className="label-field">وصف العرض (اختياري)</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              value={current.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="مثال: العرض ساري لفترة محدودة"
            />
          </div>

          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-xs text-red-600 mb-2 font-medium">معاينة العرض</p>
            <div className="flex items-center gap-3 flex-wrap">
              {current.badge_text && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  {current.badge_text}
                </span>
              )}
              <span className="text-slate-400 line-through text-sm">
                {formatPrice(basePrice)}
              </span>
              <span className="text-xl font-bold text-red-600">{formatPrice(preview)}</span>
              <span className="text-xs text-slate-500">{unitLabel}</span>
              {preview < basePrice && (
                <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                  وفّر {formatPrice(basePrice - preview)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
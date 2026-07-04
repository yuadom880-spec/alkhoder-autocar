import { Tag } from 'lucide-react'
import type { CarOffer } from '../../lib/types'
import {
  DEFAULT_OFFER,
  DISCOUNT_TYPE_LABELS,
  previewOfferPrice,
} from '../../lib/offers'
import { formatPrice } from '../../lib/utils'

interface CarOfferFormProps {
  basePrice: number
  offer: CarOffer | null
  onChange: (offer: CarOffer | null) => void
}

export function CarOfferForm({ basePrice, offer, onChange }: CarOfferFormProps) {
  const current = offer ?? { ...DEFAULT_OFFER, active: false }
  const enabled = current.active

  const update = (patch: Partial<CarOffer>) => {
    onChange({ ...current, ...patch })
  }

  const toggle = (active: boolean) => {
    if (!active) {
      onChange({ ...current, active: false })
    } else {
      onChange({ ...DEFAULT_OFFER, active: true, title: 'عرض خاص' })
    }
  }

  const preview = enabled ? previewOfferPrice(basePrice, current) : basePrice

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-brand-gold" />
          <span className="font-bold text-brand-dark">العروض والخصومات</span>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <span className={enabled ? 'text-brand-green font-medium' : 'text-slate-500'}>
            {enabled ? 'العرض مفعّل' : 'بدون عرض'}
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
              <label className="label-field">نوع الخصم</label>
              <select
                className="input-field"
                value={current.discount_type}
                onChange={(e) =>
                  update({
                    discount_type: e.target.value as CarOffer['discount_type'],
                    discount_value: 0,
                  })
                }
              >
                {Object.entries(DISCOUNT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">
                {current.discount_type === 'percent'
                  ? 'نسبة الخصم (%)'
                  : current.discount_type === 'fixed'
                    ? 'مبلغ الخصم (ر.س)'
                    : 'سعر العرض (ر.س/يوم)'}
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
              placeholder="مثال: العرض ساري على الحجوزات لمدة 3 أيام أو أكثر"
            />
          </div>

          {/* معاينة */}
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
              <span className="text-xs text-slate-500">/ يوم</span>
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
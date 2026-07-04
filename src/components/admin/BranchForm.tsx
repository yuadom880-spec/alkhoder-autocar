import { useState } from 'react'
import type { FormEvent } from 'react'
import { BranchImageUploader } from './BranchImageUploader'
import { Button } from '../ui/Button'
import type { BranchFormData, BranchRecord } from '../../lib/types'

const DEFAULT_HOURS = 'السبت - الخميس: 8 ص - 11 م | الجمعة: 4 م - 11 م'

const emptyForm = (): BranchFormData => ({
  name: '',
  address: '',
  city: '',
  phone: '',
  hours: DEFAULT_HOURS,
  map_url: '',
  image_url: '',
  is_main: false,
  is_active: true,
  sort_order: 0,
})

function toFormData(branch: BranchRecord): BranchFormData {
  return {
    name: branch.name,
    address: branch.address,
    city: branch.city,
    phone: branch.phone ?? '',
    hours: branch.hours,
    map_url: branch.map_url === '#' ? '' : branch.map_url,
    image_url: branch.image_url ?? '',
    is_main: branch.is_main,
    is_active: branch.is_active,
    sort_order: branch.sort_order,
  }
}

interface BranchFormProps {
  initial?: BranchRecord
  onSubmit: (data: BranchFormData) => Promise<void>
  onCancel: () => void
}

export function BranchForm({ initial, onSubmit, onCancel }: BranchFormProps) {
  const [form, setForm] = useState<BranchFormData>(initial ? toFormData(initial) : emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('اسم الفرع والعنوان والمدينة مطلوبين')
      return
    }

    setLoading(true)
    setError('')
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
        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="branch-name">
            اسم الفرع *
          </label>
          <input
            id="branch-name"
            className="input-field"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label-field" htmlFor="branch-city">
            المدينة *
          </label>
          <input
            id="branch-city"
            className="input-field"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label-field" htmlFor="branch-phone">
            رقم التواصل
          </label>
          <input
            id="branch-phone"
            type="tel"
            dir="ltr"
            className="input-field text-left"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="05xxxxxxxx"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="branch-address">
            عنوان الفرع *
          </label>
          <input
            id="branch-address"
            className="input-field"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="branch-map">
            رابط الخريطة (Google Maps)
          </label>
          <input
            id="branch-map"
            dir="ltr"
            className="input-field text-left"
            value={form.map_url}
            onChange={(e) => setForm((p) => ({ ...p, map_url: e.target.value }))}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="branch-hours">
            ساعات العمل
          </label>
          <input
            id="branch-hours"
            className="input-field"
            value={form.hours}
            onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))}
          />
        </div>
      </div>

      <BranchImageUploader
        imageUrl={form.image_url}
        onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
        onError={setError}
      />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.is_main}
            onChange={(e) => setForm((p) => ({ ...p, is_main: e.target.checked }))}
            className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
          />
          فرع رئيسي
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
          />
          ظاهر للزوار
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={loading}>
          {initial ? 'حفظ التعديلات' : 'إضافة الفرع'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
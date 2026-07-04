import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { copy } from '../../lib/copy'
import { fetchBranches } from '../../lib/supabase'
import type { BranchRecord } from '../../lib/types'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CarBranchSelectorProps {
  value: string[]
  onChange: (branchIds: string[]) => void
}

export function CarBranchSelector({ value, onChange }: CarBranchSelectorProps) {
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranches({ activeOnly: false })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((b) => b !== id))
    } else {
      onChange([...value, id])
    }
  }

  const selectAll = () => onChange([])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="label-field flex items-center gap-1.5 mb-0">
          <MapPin className="h-4 w-4 text-brand-green" />
          {copy.admin.carBranches}
        </label>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium text-brand-green hover:underline"
        >
          {copy.cars.allBranches}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">{copy.admin.carBranchesHint}</p>

      {branches.length === 0 ? (
        <p className="text-sm text-slate-500 rounded-lg bg-slate-50 px-3 py-2">
          لا توجد فروع — أضف فروعاً من لوحة الإدارة أولاً
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3">
          {branches.map((b) => (
            <label
              key={b.id}
              className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={value.includes(b.id)}
                onChange={() => toggle(b.id)}
                className="mt-1 rounded border-slate-300 text-brand-green focus:ring-brand-green"
              />
              <span>
                <span className="font-medium text-brand-dark block">{b.name}</span>
                <span className="text-xs text-slate-500">{b.city}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
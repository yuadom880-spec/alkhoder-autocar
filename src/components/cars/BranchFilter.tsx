import { MapPin, X } from 'lucide-react'
import type { BranchRecord } from '../../lib/types'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

interface BranchFilterProps {
  branches: BranchRecord[]
  selectedBranchId: string
  onSelect: (branchId: string) => void
  loading?: boolean
}

export function BranchFilter({
  branches,
  selectedBranchId,
  onSelect,
  loading = false,
}: BranchFilterProps) {
  const selected = branches.find((b) => b.id === selectedBranchId) ?? null

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <label htmlFor="branch-filter" className="flex items-center gap-2 text-sm font-bold text-black shrink-0">
          <MapPin className="h-4 w-4 text-brand-green" />
          {copy.cars.chooseBranch}
        </label>
        <select
          id="branch-filter"
          className={cn('input-field w-full text-sm text-black sm:w-auto sm:min-w-[280px]')}
          value={selectedBranchId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={loading}
        >
          <option value="">{copy.cars.allBranches}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.city}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/25 bg-brand-green/5 px-4 py-3">
          <p className="text-sm text-slate-700">
            {copy.cars.browsingBranch}:{' '}
            <strong className="text-brand-dark">
              {selected.name} — {selected.city}
            </strong>
          </p>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            {copy.cars.clearBranch}
          </button>
        </div>
      )}
    </div>
  )
}
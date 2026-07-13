import { MapPin, X } from 'lucide-react'
import type { BranchRecord } from '../../lib/types'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { formatBranchOption, getBranchDisplay } from '../../lib/i18n/branches'
import { cn } from '../../lib/utils'

interface BranchFilterProps {
  branches: BranchRecord[]
  selectedBranchId: string
  onSelect: (branchId: string) => void
  loading?: boolean
  /** إجبار اختيار فرع — بدون خيار «كل الفروع» */
  required?: boolean
}

export function BranchFilter({
  branches,
  selectedBranchId,
  onSelect,
  loading = false,
  required = false,
}: BranchFilterProps) {
  const { locale } = useLocale()
  const selected = branches.find((b) => b.id === selectedBranchId) ?? null
  const selectedDisplay = selected ? getBranchDisplay(selected, locale) : null

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <label htmlFor="branch-filter" className="flex items-center gap-2 text-sm font-bold text-black shrink-0">
          <MapPin className="h-4 w-4 text-brand-green" />
          {copy.cars.chooseBranch}
          {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="branch-filter"
          className={cn('input-field w-full text-sm text-black sm:w-auto sm:min-w-[280px]')}
          value={selectedBranchId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={loading}
          required={required}
        >
          {!required && <option value="">{copy.cars.allBranches}</option>}
          {required && !selectedBranchId && (
            <option value="">{copy.cars.selectBranchPlaceholder}</option>
          )}
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {formatBranchOption(b, locale)}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/25 bg-brand-green/5 px-4 py-3">
          <p className="text-sm text-slate-700">
            {copy.cars.browsingBranch}:{' '}
            <strong className="text-brand-dark">
              {selectedDisplay?.name} — {selectedDisplay?.city}
            </strong>
            {selected.phone && (
              <span className="block text-xs text-slate-500 mt-0.5" dir="ltr">
                {selected.phone}
              </span>
            )}
          </p>
          {!required && (
            <button
              type="button"
              onClick={() => onSelect('')}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              {copy.cars.clearBranch}
            </button>
          )}
        </div>
      )}

      {required && !selected && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {copy.cars.branchRequiredHint}
        </p>
      )}
    </div>
  )
}
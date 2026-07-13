import { Search } from 'lucide-react'
import type { CarCategory, CarClass } from '../../lib/types'
import { CAR_CATEGORIES, CAR_CLASSES } from '../../lib/constants'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { getCategoryLabel, getClassLabel } from '../../lib/i18n/labels'
import { cn } from '../../lib/utils'

interface CarFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: CarCategory | 'all'
  onCategoryChange: (value: CarCategory | 'all') => void
  carClass: CarClass | 'all'
  onClassChange: (value: CarClass | 'all') => void
}

function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | 'all'
  options: { value: T | 'all'; label: string }[]
  onChange: (value: T | 'all') => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2.5 text-sm sm:py-1.5 sm:text-xs font-medium transition-colors min-h-[44px] sm:min-h-0',
              value === opt.value
                ? 'bg-brand-green text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-green/50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CarFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  carClass,
  onClassChange,
}: CarFiltersProps) {
  const { locale } = useLocale()

  const categoryOptions: { value: CarCategory | 'all'; label: string }[] = [
    { value: 'all', label: copy.cars.filterAll },
    ...CAR_CATEGORIES.map((value) => ({
      value,
      label: getCategoryLabel(value, locale),
    })),
  ]

  const classOptions: { value: CarClass | 'all'; label: string }[] = [
    { value: 'all', label: copy.cars.filterAll },
    ...CAR_CLASSES.map((value) => ({
      value,
      label: getClassLabel(value, locale),
    })),
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          className="input-field pr-10"
          placeholder={copy.cars.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <FilterChips
        label={copy.cars.filterCategory}
        value={category}
        options={categoryOptions}
        onChange={onCategoryChange}
      />
      <FilterChips
        label={copy.cars.filterClass}
        value={carClass}
        options={classOptions}
        onChange={onClassChange}
      />
    </div>
  )
}
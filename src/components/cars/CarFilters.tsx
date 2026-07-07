import { Search } from 'lucide-react'
import type { CarCategory } from '../../lib/types'
import { CAR_CATEGORIES, CATEGORY_LABELS } from '../../lib/constants'
import { cn } from '../../lib/utils'

interface CarFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: CarCategory | 'all'
  onCategoryChange: (value: CarCategory | 'all') => void
}

const categories: { value: CarCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  ...CAR_CATEGORIES.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  })),
]

export function CarFilters({ search, onSearchChange, category, onCategoryChange }: CarFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="ابحث عن سيارة..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field pr-11"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2.5 text-sm sm:py-1.5 sm:text-xs font-medium transition-colors min-h-[44px] sm:min-h-0',
              category === cat.value
                ? 'bg-brand-green text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-green/50',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
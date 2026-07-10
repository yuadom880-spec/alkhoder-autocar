import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, MapPin, Phone } from 'lucide-react'
import { useCustomerBranch } from '../../context/CustomerBranchContext'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

export function CustomerBranchBar() {
  const { branches, selectedBranch, hasBranch, loading, setBranchId } = useCustomerBranch()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!loading) setExpanded(!hasBranch)
  }, [loading, hasBranch])

  if (loading) return null

  if (branches.length === 0) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
        {copy.cars.noBranchesAvailable}
      </div>
    )
  }

  if (hasBranch && selectedBranch && !expanded) {
    return (
      <div className="sticky top-14 sm:top-16 z-30 border-b border-brand-green/30 bg-brand-green text-white shadow-md">
        <div className="container-main flex flex-wrap items-center justify-between gap-2 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold truncate">
              {copy.cars.yourBranch}: {selectedBranch.name}
              <span className="font-normal opacity-90 mr-1">— {selectedBranch.city}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition-colors"
          >
            {copy.cars.changeBranch}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-14 sm:top-16 z-30 border-b-2 border-brand-green/40 bg-gradient-to-l from-brand-green/10 to-white shadow-sm">
      <div className="container-main py-4 sm:py-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-brand-dark text-base sm:text-lg">{copy.cars.pickBranchTitle}</p>
            <p className="text-xs sm:text-sm text-slate-600">{copy.cars.pickBranchSub}</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => {
            const active = selectedBranch?.id === branch.id
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  setBranchId(branch.id)
                  setExpanded(false)
                }}
                className={cn(
                  'rounded-xl border-2 p-3 sm:p-4 text-right transition-all hover:shadow-md',
                  active
                    ? 'border-brand-green bg-brand-green/10 ring-2 ring-brand-green/30'
                    : 'border-slate-200 bg-white hover:border-brand-green/50',
                )}
              >
                <p className="font-bold text-brand-dark text-sm sm:text-base">{branch.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{branch.city}</p>
                {branch.phone && (
                  <p className="text-xs text-brand-green mt-1 flex items-center gap-1 justify-end" dir="ltr">
                    <Phone className="h-3 w-3" />
                    {branch.phone}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {hasBranch && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-brand-green hover:underline"
          >
            <ChevronDown className="h-4 w-4" />
            إغلاق
          </button>
        )}

        <p className="mt-3 text-center text-[11px] text-slate-400">
          <Link to="/branches" className="hover:text-brand-green">
            {copy.cars.allBranchesLink}
          </Link>
        </p>
      </div>
    </div>
  )
}
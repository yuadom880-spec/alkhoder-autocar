import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { MapPin, Phone, RefreshCw } from 'lucide-react'
import { useCustomerBranch } from '../../context/CustomerBranchContext'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

export function CustomerBranchBar() {
  const {
    branches,
    selectedBranch,
    hasBranch,
    loading,
    loadError,
    setBranchId,
    reloadBranches,
  } = useCustomerBranch()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!loading) setExpanded(!hasBranch)
  }, [loading, hasBranch])

  if (loading) {
    return (
      <div className="border-b-2 border-brand-green/30 bg-brand-green/5 px-4 py-4">
        <div className="container-main flex items-center gap-3 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-brand-green/20" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-3 w-64 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (branches.length === 0) {
    return (
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-4 text-center">
        <p className="text-sm font-bold text-amber-900">{copy.cars.noBranchesAvailable}</p>
        <button
          type="button"
          onClick={() => reloadBranches()}
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-green"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (hasBranch && selectedBranch && !expanded) {
    return (
      <div className="border-b-4 border-brand-green bg-brand-green text-white shadow-lg">
        <div className="container-main flex flex-wrap items-center justify-between gap-2 py-3 sm:py-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-5 w-5 shrink-0" />
            <p className="text-sm sm:text-base font-bold truncate">
              {copy.cars.yourBranch}: {selectedBranch.name}
              <span className="font-normal opacity-90 mr-1">— {selectedBranch.city}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs sm:text-sm font-bold text-brand-green hover:bg-white/90"
          >
            {copy.cars.changeBranch}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      id="choose-branch"
      className="border-b-4 border-brand-green bg-gradient-to-l from-brand-green/15 via-white to-brand-green/5 shadow-md"
    >
      <div className="container-main py-5 sm:py-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green text-white shrink-0 shadow-lg shadow-brand-green/30">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-brand-dark text-lg sm:text-xl">{copy.cars.pickBranchTitle}</p>
              <p className="text-sm text-slate-600 mt-0.5">{copy.cars.pickBranchSub}</p>
            </div>
          </div>
          {hasBranch && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-sm font-medium text-brand-green hover:underline"
            >
              إغلاق
            </button>
          )}
        </div>

        {loadError && (
          <p className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  'rounded-2xl border-2 p-4 text-right transition-all hover:shadow-lg hover:-translate-y-0.5',
                  active
                    ? 'border-brand-green bg-brand-green/10 ring-2 ring-brand-green/40 shadow-md'
                    : 'border-slate-200 bg-white hover:border-brand-green',
                )}
              >
                <p className="font-bold text-brand-dark">{branch.name}</p>
                <p className="text-xs text-slate-500 mt-1">{branch.city}</p>
                {branch.phone && (
                  <p
                    className="text-xs text-brand-green mt-2 flex items-center gap-1 justify-end font-medium"
                    dir="ltr"
                  >
                    <Phone className="h-3 w-3" />
                    {branch.phone}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link to="/branches" className="font-medium text-brand-green hover:underline">
            {copy.cars.allBranchesLink}
          </Link>
          {' · '}
          <Link to="/cars" className="hover:text-brand-green">
            تصفح السيارات
          </Link>
        </p>
      </div>
    </div>
  )
}
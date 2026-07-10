import { MapPin, Phone } from 'lucide-react'
import { useCustomerBranch } from '../../context/CustomerBranchContext'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

interface HomeBranchPickerProps {
  /** وجهة زر «شوف كل السيارات» — افتراضياً قسم العروض في الرئيسية */
  browseTargetId?: string
}

/** اختيار الفرع — اختياري؛ بدون فرع يُعرض كل الأسطول */
export function HomeBranchPicker({ browseTargetId = 'home-offers' }: HomeBranchPickerProps) {
  const { branches, selectedBranch, hasBranch, loading, setBranchId } = useCustomerBranch()

  if (loading) {
    return (
      <section id="choose-branch-home" className="py-10 sm:py-12 bg-slate-50">
        <div className="container-main animate-pulse space-y-4">
          <div className="h-6 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (hasBranch && selectedBranch) {
    return (
      <section id="choose-branch-home" className="py-6 sm:py-8 bg-brand-green/5 border-y border-brand-green/20">
        <div className="container-main flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{copy.cars.browsingBranch}</p>
              <p className="font-bold text-brand-dark">
                {selectedBranch.name}
                <span className="text-slate-500 font-normal mr-1">— {selectedBranch.city}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBranchId('')}
            className="rounded-xl border border-brand-green/40 bg-white px-4 py-2 text-sm font-bold text-brand-green hover:bg-brand-green/5"
          >
            {copy.cars.clearBranch}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="choose-branch-home"
      className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200"
    >
      <div className="container-main">
        <div className="mx-auto max-w-3xl text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green text-white shadow-lg shadow-brand-green/25">
            <MapPin className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-2">
            {copy.cars.branchPromptTitle}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {copy.cars.branchPromptSub}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-5xl mx-auto">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setBranchId(branch.id)}
              className={cn(
                'rounded-2xl border-2 border-slate-200 bg-white p-4 text-right',
                'hover:border-brand-green hover:shadow-md hover:-translate-y-0.5 transition-all',
              )}
            >
              <p className="font-bold text-brand-dark text-sm sm:text-base">{branch.name}</p>
              <p className="text-xs text-slate-500 mt-1">{branch.city}</p>
              {branch.phone && (
                <p className="text-xs text-brand-green mt-2 flex items-center gap-1 justify-end" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {branch.phone}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`#${browseTargetId}`}
            className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-brand-green/40 hover:text-brand-green transition-colors"
          >
            {copy.cars.browseAllWithoutBranch}
          </a>
        </div>
      </div>
    </section>
  )
}
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MapPin, Phone } from 'lucide-react'
import { useCustomerBranch } from '../../context/CustomerBranchContext'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { getBranchDisplay } from '../../lib/i18n/branches'
import { cn } from '../../lib/utils'

interface HomeBranchPickerProps {
  /** وجهة زر «شوف كل السيارات» — افتراضياً قسم العروض في الرئيسية */
  browseTargetId?: string
}

function BranchCard({
  name,
  city,
  phone,
  onClick,
}: {
  name: string
  city: string
  phone?: string | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 text-right sm:gap-3 sm:p-4',
        'shadow-sm hover:border-brand-green/50 hover:shadow-md hover:shadow-brand-green/5',
        'active:scale-[0.99] transition-all duration-200 min-h-[72px]',
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors mt-0.5 sm:h-11 sm:w-11 sm:rounded-xl">
        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-bold text-brand-dark text-[13px] sm:text-base leading-snug break-words">
          {name}
        </p>
        <p className="text-[11px] sm:text-sm text-slate-500 leading-relaxed break-words">{city}</p>
        {phone && (
          <p
            className="text-xs text-brand-green flex items-center gap-1.5 justify-end opacity-90 pt-0.5"
            dir="ltr"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">{phone}</span>
          </p>
        )}
      </div>
    </button>
  )
}

/** اختيار الفرع — قابل للطي؛ بدون فرع يُعرض كل الأسطول */
export function HomeBranchPicker({ browseTargetId = 'home-offers' }: HomeBranchPickerProps) {
  const { locale } = useLocale()
  const { branches, selectedBranch, hasBranch, loading, setBranchId } = useCustomerBranch()
  const [expanded, setExpanded] = useState(false)

  const pickBranch = (id: string) => {
    setBranchId(id)
    setExpanded(false)
  }

  if (loading) {
    return (
      <section id="choose-branch-home" className="py-6 sm:py-8 bg-slate-50/80">
        <div className="container-main animate-pulse">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="h-5 w-48 mx-auto rounded bg-slate-200" />
            <div className="h-4 w-72 max-w-full mx-auto rounded bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="choose-branch-home"
      className={cn(
        'py-6 sm:py-8 border-b transition-colors',
        hasBranch
          ? 'bg-brand-green/[0.06] border-brand-green/15'
          : 'bg-gradient-to-b from-slate-50 to-white border-slate-200/80',
      )}
    >
      <div className="container-main">
        <div
          className={cn(
            'overflow-hidden rounded-2xl sm:rounded-3xl border shadow-sm',
            hasBranch ? 'border-brand-green/20 bg-white/90' : 'border-slate-200/90 bg-white',
          )}
        >
          {/* رأس القسم */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-lg',
                  hasBranch
                    ? 'bg-brand-green shadow-brand-green/20'
                    : 'bg-gradient-to-br from-brand-green to-brand-green-dark shadow-brand-green/25',
                )}
              >
                <MapPin className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              {hasBranch && selectedBranch ? (
                <div className="w-full max-w-lg px-1">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1.5">{copy.cars.browsingBranch}</p>
                  <p className="font-bold text-brand-dark text-base sm:text-lg leading-snug break-words">
                    {getBranchDisplay(selectedBranch, locale).name}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {getBranchDisplay(selectedBranch, locale).city}
                  </p>
                </div>
              ) : (
                <div className="max-w-xl">
                  <h2 className="text-base sm:text-xl font-bold text-brand-dark mb-1.5 leading-snug">
                    {copy.cars.branchPromptTitle}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed px-1">
                    {copy.cars.branchPromptSub}
                  </p>
                </div>
              )}

              <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className={cn(
                    'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all',
                    expanded
                      ? 'bg-slate-100 text-brand-dark hover:bg-slate-200/80'
                      : 'bg-brand-green text-white shadow-md shadow-brand-green/20 hover:bg-brand-green/90',
                  )}
                >
                  {expanded
                    ? copy.cars.branchPickerHide
                    : hasBranch
                      ? copy.cars.changeBranch
                      : copy.cars.branchPromptCta}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-300',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>

                {hasBranch && (
                  <button
                    type="button"
                    onClick={() => {
                      setBranchId('')
                      setExpanded(false)
                    }}
                    className="min-h-[48px] w-full rounded-xl border border-brand-green/30 bg-white px-5 py-3 text-sm font-bold text-brand-green hover:bg-brand-green/5 sm:w-auto"
                  >
                    {copy.cars.clearBranch}
                  </button>
                )}
              </div>

              {!hasBranch && !expanded && (
                <a
                  href={`#${browseTargetId}`}
                  className="text-xs sm:text-sm font-medium text-slate-500 hover:text-brand-green transition-colors underline-offset-2 hover:underline"
                >
                  {copy.cars.browseAllWithoutBranch}
                </a>
              )}
            </div>
          </div>

          {/* قائمة الفروع — تظهر وتختفي */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="branch-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6 sm:py-5">
                  <p className="text-center text-xs text-slate-500 mb-3 sm:mb-4">
                    {copy.cars.branchPickerCount(branches.length)}
                  </p>

                  <div
                    className={cn(
                      'grid gap-3',
                      'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                      branches.length > 5 && 'max-h-[min(58vh,480px)] overflow-y-auto overscroll-contain',
                    )}
                  >
                    {branches.map((branch, i) => (
                      <motion.div
                        key={branch.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.25 }}
                      >
                        <BranchCard
                          name={getBranchDisplay(branch, locale).name}
                          city={getBranchDisplay(branch, locale).city}
                          phone={branch.phone}
                          onClick={() => pickBranch(branch.id)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                    <a
                      href={`#${browseTargetId}`}
                      onClick={() => setExpanded(false)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:border-brand-green/30 hover:text-brand-green transition-colors"
                    >
                      {copy.cars.browseAllWithoutBranch}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
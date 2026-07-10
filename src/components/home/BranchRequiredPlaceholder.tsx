import { MapPin } from 'lucide-react'
import { copy } from '../../lib/copy'

/** يظهر مكان العروض أو السيارات لحد ما العميل يختار فرع */
export function BranchRequiredPlaceholder() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-green/30 bg-brand-green/5 py-12 sm:py-16 text-center px-6">
      <MapPin className="mx-auto h-10 w-10 text-brand-green mb-4" />
      <p className="font-bold text-brand-dark text-lg mb-2">{copy.cars.branchPromptTitle}</p>
      <p className="text-slate-600 text-sm max-w-md mx-auto">{copy.cars.branchPromptScroll}</p>
      <a
        href="#choose-branch-home"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-green/90"
      >
        {copy.cars.branchPromptCta}
      </a>
    </div>
  )
}
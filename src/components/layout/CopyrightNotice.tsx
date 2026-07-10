import { SITE_COPYRIGHT_NOTICE, SITE_DESIGN_CREDIT } from '../../lib/constants'

type CopyrightNoticeProps = {
  variant?: 'public' | 'admin'
}

export function CopyrightNotice({ variant = 'public' }: CopyrightNoticeProps) {
  const isAdmin = variant === 'admin'

  return (
    <div
      className={
        isAdmin
          ? 'border-t border-slate-200 bg-white px-4 py-3 text-center text-[11px] leading-relaxed text-slate-500 sm:px-6 sm:py-3.5 sm:text-xs'
          : 'space-y-1.5 text-center text-xs text-slate-500'
      }
      aria-label="حقوق الملكية وتوقيع التصميم"
    >
      <p className={isAdmin ? 'text-slate-600' : undefined}>{SITE_COPYRIGHT_NOTICE}</p>
      <p className={isAdmin ? 'text-slate-400' : 'text-slate-600'}>{SITE_DESIGN_CREDIT}</p>
    </div>
  )
}
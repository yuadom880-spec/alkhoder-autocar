import { useLocation } from 'react-router'
import { Globe } from 'lucide-react'
import { copy } from '../../lib/copy'
import { useLocale } from '../../context/LocaleContext'
import { cn } from '../../lib/utils'

type LanguageSwitcherProps = {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { pathname } = useLocation()
  const { locale, setLocale } = useLocale()

  if (pathname.startsWith('/admin')) {
    return null
  }

  const nextLocale = locale === 'ar' ? 'en' : 'ar'
  const label = locale === 'ar' ? copy.language.switchToEn : copy.language.switchToAr

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className={cn(
        'flex items-center justify-center rounded-lg border border-slate-200 font-bold text-slate-600 transition-colors',
        'hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green',
        compact
          ? 'h-10 w-10 shrink-0 p-0 lg:h-auto lg:w-auto lg:gap-1.5 lg:px-3 lg:py-2 lg:text-sm'
          : 'gap-1.5 px-3 py-2 text-sm',
      )}
      aria-label={copy.language.label}
      title={label}
    >
      <Globe className={cn('shrink-0', compact ? 'h-4 w-4' : 'h-4 w-4')} />
      <span className={cn(compact && 'hidden lg:inline')}>{label}</span>
    </button>
  )
}
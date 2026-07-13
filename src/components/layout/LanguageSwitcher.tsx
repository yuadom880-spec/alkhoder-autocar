import { useLocation } from 'react-router'
import { Globe } from 'lucide-react'
import { copy } from '../../lib/copy'
import { useLocale } from '../../context/LocaleContext'
import { cn } from '../../lib/utils'

export function LanguageSwitcher() {
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
        'flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors',
        'hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green',
      )}
      aria-label={copy.language.label}
      title={label}
    >
      <Globe className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  )
}
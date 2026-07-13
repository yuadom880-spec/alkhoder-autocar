import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setCopyLocale } from '../lib/copy'
import {
  getLocaleDir,
  getNavLinks,
  readStoredLocale,
  setActiveLocale,
  STORAGE_KEY,
  type Locale,
} from '../lib/i18n'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: 'rtl' | 'ltr'
  isRtl: boolean
  navLinks: ReturnType<typeof getNavLinks>
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function applyDocumentLocale(locale: Locale) {
  const dir = getLocaleDir(locale)
  document.documentElement.lang = locale
  document.documentElement.dir = dir
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    setActiveLocale(next)
    setCopyLocale(next)
    localStorage.setItem(STORAGE_KEY, next)
    applyDocumentLocale(next)
  }, [])

  useLayoutEffect(() => {
    setActiveLocale(locale)
    setCopyLocale(locale)
    applyDocumentLocale(locale)
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dir: getLocaleDir(locale),
      isRtl: locale === 'ar',
      navLinks: getNavLinks(locale),
    }),
    [locale, setLocale],
  )

  return (
    <LocaleContext.Provider value={value}>
      <div key={locale}>{children}</div>
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
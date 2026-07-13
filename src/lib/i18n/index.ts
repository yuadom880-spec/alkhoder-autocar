import { copyAr } from './copy.ar'
import { copyEn } from './copy.en'
import type { CopyBundle } from './types'

export type Locale = 'ar' | 'en'

export const STORAGE_KEY = 'alkhoder_locale'

let activeLocale: Locale = 'ar'

export function getCopy(locale: Locale): CopyBundle {
  return locale === 'en' ? copyEn : copyAr
}

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale
}

export function getActiveLocale(): Locale {
  return activeLocale
}

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ar'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'ar'
}

export function getNavLinks(locale: Locale) {
  const c = getCopy(locale)
  return [
    { path: '/', label: c.nav.home },
    { path: '/cars', label: c.nav.cars },
    { path: '/offers', label: c.nav.offers },
    { path: '/about', label: c.nav.about },
    { path: '/branches', label: c.nav.branches },
  ]
}

export function getSeoHome(locale: Locale) {
  const c = getCopy(locale)
  return { h1: c.seo.homeH1, subtitle: c.seo.homeSubtitle }
}

export function getLocaleDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export type { CopyBundle } from './types'
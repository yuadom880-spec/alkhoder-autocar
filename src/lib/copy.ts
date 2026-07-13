import { copyAr } from './i18n/copy.ar'
import { copyEn } from './i18n/copy.en'
import type { CopyBundle } from './i18n/types'
import type { Locale } from './i18n'

export let copy: CopyBundle = copyAr

export function setCopyLocale(locale: Locale) {
  copy = locale === 'en' ? copyEn : copyAr
}

export type { CopyBundle, Locale }
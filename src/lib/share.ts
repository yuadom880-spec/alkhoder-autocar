import { SITE_NAME, SITE_NAME_EN } from './constants'

const APP_STORE_URL = 'https://apps.apple.com/app/id6792943970'
const SITE_URL = 'https://alkhodercar.com'

export function carShareUrl(carId: string): string {
  return `${SITE_URL}/cars/${carId}`
}

export type ShareResult = 'shared' | 'copied' | 'failed'

/** مشاركة عربية (أو إنجليزية حسب اللغة) — رابط الموقع + ذكر التطبيق */
export async function shareContent(opts: {
  title: string
  text: string
  url: string
}): Promise<ShareResult> {
  const payload = { title: opts.title, text: opts.text, url: opts.url }
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (err) {
      // إلغاء المستخدم — لا نعتبره فشلاً صريحاً
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'failed'
      }
    }
  }

  const body = `${opts.text}\n${opts.url}`
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(body)
      return 'copied'
    }
  } catch {
    /* fall through */
  }
  return 'failed'
}

export function buildCarShareText(
  carName: string,
  locale: 'ar' | 'en',
  carId?: string,
): {
  title: string
  text: string
  url: string
} {
  const url =
    carId != null
      ? carShareUrl(carId)
      : typeof window !== 'undefined'
        ? window.location.href
        : SITE_URL
  if (locale === 'en') {
    return {
      title: SITE_NAME_EN,
      text: `Check out ${carName} on ${SITE_NAME_EN}\nApp Store: ${APP_STORE_URL}`,
      url,
    }
  }
  return {
    title: SITE_NAME,
    text: `شوف ${carName} على الخضر لتأجير السيارات\nالتطبيق: ${APP_STORE_URL}`,
    url,
  }
}

export function buildSiteShareText(locale: 'ar' | 'en'): {
  title: string
  text: string
  url: string
} {
  if (locale === 'en') {
    return {
      title: SITE_NAME_EN,
      text: `${SITE_NAME_EN} — book your car easily\nApp Store: ${APP_STORE_URL}`,
      url: SITE_URL,
    }
  }
  return {
    title: SITE_NAME,
    text: `الخضر لتأجير السيارات — احجز سيارتك بسهولة\nالتطبيق: ${APP_STORE_URL}`,
    url: SITE_URL,
  }
}

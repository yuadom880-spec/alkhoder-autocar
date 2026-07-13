import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { SITE_COPYRIGHT_NOTICE, SITE_META_AUTHOR } from '../../lib/constants'
import { useLocale } from '../../context/LocaleContext'
import { getOgLocale, getPageSeoForLocale, getSiteSeoPrimary } from '../../lib/i18n/seoPages'
import {
  buildPageJsonLdGraph,
  getCanonicalUrl,
  getSiteUrl,
} from '../../lib/seo'

const JSON_LD_ID = 'alkhoder-structured-data'

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertPropertyMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function PageSeo() {
  const { pathname } = useLocation()
  const { locale } = useLocale()

  useEffect(() => {
    const seo = getPageSeoForLocale(pathname, locale)
    const origin = getSiteUrl()
    const canonical = getCanonicalUrl(pathname, origin)
    const keywords = (seo.keywords ?? []).join(', ')
    const robots = seo.noindex ? 'noindex, nofollow' : 'index, follow'

    document.title = seo.title
    upsertMeta('description', seo.description)
    upsertMeta('keywords', keywords)
    upsertMeta('robots', robots)
    upsertMeta('author', SITE_META_AUTHOR)
    upsertMeta('copyright', SITE_COPYRIGHT_NOTICE)
    upsertLink('canonical', canonical)

    upsertPropertyMeta('og:title', seo.title)
    upsertPropertyMeta('og:description', seo.description)
    upsertPropertyMeta('og:type', 'website')
    upsertPropertyMeta('og:locale', getOgLocale(locale))
    upsertPropertyMeta('og:url', canonical)
    upsertPropertyMeta('og:image', `${origin}/favicon-192.png`)
    upsertPropertyMeta('og:site_name', getSiteSeoPrimary(locale))

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', seo.title)
    upsertMeta('twitter:description', seo.description)
    upsertMeta('twitter:image', `${origin}/favicon-192.png`)
    upsertMeta('application-name', getSiteSeoPrimary(locale))

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(buildPageJsonLdGraph(pathname, origin))
  }, [pathname, locale])

  return null
}
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { SITE_SEO_PRIMARY } from '../../lib/constants'
import {
  buildPageJsonLdGraph,
  getCanonicalUrl,
  getPageSeo,
  getSiteUrl,
  SEO_KEYWORDS,
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

  useEffect(() => {
    const seo = getPageSeo(pathname)
    const origin = getSiteUrl()
    const canonical = getCanonicalUrl(pathname, origin)
    const keywords = (seo.keywords ?? SEO_KEYWORDS).join(', ')
    const robots = seo.noindex ? 'noindex, nofollow' : 'index, follow'

    document.title = seo.title
    upsertMeta('description', seo.description)
    upsertMeta('keywords', keywords)
    upsertMeta('robots', robots)
    upsertLink('canonical', canonical)

    upsertPropertyMeta('og:title', seo.title)
    upsertPropertyMeta('og:description', seo.description)
    upsertPropertyMeta('og:type', 'website')
    upsertPropertyMeta('og:locale', 'ar_SA')
    upsertPropertyMeta('og:url', canonical)
    upsertPropertyMeta('og:image', `${origin}/favicon-192.png`)
    upsertPropertyMeta('og:site_name', SITE_SEO_PRIMARY)

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', seo.title)
    upsertMeta('twitter:description', seo.description)
    upsertMeta('twitter:image', `${origin}/favicon-192.png`)
    upsertMeta('application-name', SITE_SEO_PRIMARY)

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(buildPageJsonLdGraph(pathname, origin))
  }, [pathname])

  return null
}
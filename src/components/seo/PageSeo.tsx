import { useEffect } from 'react'
import { useLocation } from 'react-router'
import {
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
  getCanonicalUrl,
  getCityBySlug,
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
    upsertPropertyMeta('og:image', `${origin}/logo.png`)
    upsertPropertyMeta('og:site_name', 'عبدالمجيد الخضر لتأجير السيارات')

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', seo.title)
    upsertMeta('twitter:description', seo.description)
    upsertMeta('twitter:image', `${origin}/logo.png`)

    const breadcrumbs = [{ name: 'الرئيسية', path: '/' }]
    if (pathname.startsWith('/locations/')) {
      breadcrumbs.push({ name: 'المدن', path: '/locations' })
      const city = getCityBySlug(pathname.split('/')[2] ?? '')
      if (city) breadcrumbs.push({ name: city.nameAr, path: pathname })
    } else if (pathname !== '/') {
      const labels: Record<string, string> = {
        '/cars': 'السيارات',
        '/offers': 'العروض',
        '/about': 'من نحن',
        '/branches': 'فروعنا',
        '/locations': 'المدن',
      }
      const label = labels[pathname]
      if (label) breadcrumbs.push({ name: label, path: pathname })
    }

    const jsonLd = [
      buildWebSiteJsonLd(origin),
      ...(seo.noindex ? [] : [buildLocalBusinessJsonLd(origin)]),
      ...(breadcrumbs.length > 1 ? [buildBreadcrumbJsonLd(breadcrumbs, origin)] : []),
    ]

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(
      jsonLd.length === 1
        ? jsonLd[0]
        : { '@context': 'https://schema.org', '@graph': jsonLd.map((item) => ({ ...item, '@context': undefined })) },
    )
  }, [pathname])

  return null
}
import {
  MAIN_BRANCH,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_SEO_PRIMARY,
  TOLL_FREE,
  TOLL_FREE_LINK,
  WHATSAPP_LINK,
} from './constants'

export const DEFAULT_SITE_URL = 'https://alkhodercar.com'

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return DEFAULT_SITE_URL
}

/** @deprecated use getSiteUrl */
export function getSiteOrigin(): string {
  return getSiteUrl()
}

export const SEO_BRAND_NAMES = [
  SITE_SEO_PRIMARY,
  'عبدالمجيد الخضر لتأجير السيارات',
  'شبكة عبدالمجيد الخضر لتأجير السيارات',
  'تأجير سيارات الخضر',
  'ايجار سيارات الخضر',
  'شركة الخضر لتأجير السيارات',
  'مكتب الخضر لتأجير السيارات',
  'الخضر ايجار سيارات',
  'الخضر تأجير سيارات',
  'alkhodercar',
  'alkhoder car rental',
] as const

export const SEO_BRAND_INTRO = {
  heading: SITE_SEO_PRIMARY,
  paragraphs: [
    'الخضر لتأجير السيارات — شبكة عبدالمجيد الخضر سعودية موثوقة لـ تأجير سيارات الخضر وايجار السيارات يومي وشهري في أكثر من 35 فرعاً بالمملكة.',
    'سواء كنت تبحث عن شركة تأجير سيارات في جدة أو الرياض أو مكة أو المدينة المنورة أو ينبع أو تبوك — نوفر لك أسطولاً حديثاً، أسعاراً واضحة، وحجزاً أونلاين سهلاً.',
    'احجز الآن من موقع عبدالمجيد الخضر لتأجير السيارات واستمتع بتجربة تأجير سيارات مريحة وآمنة.',
  ],
} as const

export const SEO_KEYWORDS = [
  ...SEO_BRAND_NAMES,
  'تأجير سيارات',
  'تاجير سيارات',
  'ايجار سيارات',
  'إيجار سيارات',
  'ايجار سيارات يومي',
  'ايجار سيارة يومي',
  'تأجير سيارات يومي',
  'تاجير سيارة يومي',
  'ايجار سيارات شهري',
  'ايجار سيارة شهري',
  'تأجير سيارات شهري',
  'ايجار سيارات عبدالمجيد الخضر',
  'شركة تأجير سيارات',
  'شركة ايجار سيارات',
  'مكتب تأجير سيارات',
  'ايجار سيارات في السعودية',
  'تأجير سيارات في السعودية',
  'ايجار سيارات جدة',
  'تأجير سيارات جدة',
  'ايجار سيارات الرياض',
  'تأجير سيارات الرياض',
  'ايجار سيارات مكة',
  'ايجار سيارات مكه',
  'ايجار سيارة في مكة',
  'تأجير سيارات مكة',
  'ايجار سيارات المدينة المنورة',
  'تأجير سيارات المدينة المنورة',
  'ايجار سيارات المدينة',
  'تأجير سيارات ينبع',
  'ايجار سيارات ينبع',
  'تأجير سيارات تبوك',
  'ايجار سيارات تبوك',
  'تأجير سيارات ضباء',
  'ايجار سيارات الطائف',
  'ايجار سيارات في الطائف',
  'ايجار سيارات الدمام',
  'تأجير سيارات الخبر',
  'ايجار سيارات خميس مشيط',
  'ايجار سيارات جازان',
  'ايجار سياره في تبوك',
  'ايجار سياره في ينبع',
  'ايجار سياره في املج',
  'حجز سيارة اونلاين',
  'حجز سيارة أونلاين',
  'تأجير سيارة بدون سائق',
  'تأجير سيارات للحج والعمرة',
  'تأجير سيارات بأسعار منافسة',
  'car rental saudi arabia',
  'car rental jeddah',
  'car rental riyadh',
  'car rental makkah',
  'alkhoder car rental',
] as const

export const SEO_KEYWORDS_TEXT = SEO_KEYWORDS.join(', ')
export const SEO_KEYWORDS_FOOTER_TEXT = SEO_KEYWORDS.join(' · ')

export const SEO_TITLE =
  'الخضر لتأجير السيارات | شبكة عبدالمجيد الخضر — ايجار وتأجير سيارات يومي وشهري'

export const SEO_DESCRIPTION =
  'شبكة عبدالمجيد الخضر لتأجير السيارات — الخضر لتأجير السيارات وتأجير سيارات الخضر في السعودية. ايجار سيارات يومي وشهري في جدة والرياض ومكة والمدينة وينبع وتبوك. احجز أونلاين.'

export interface SeoCity {
  slug: string
  nameAr: string
  title: string
  description: string
  keywords: string[]
  intro: string
  highlights: string[]
}

export const SEO_CITIES: SeoCity[] = [
  {
    slug: 'madinah',
    nameAr: 'المدينة المنورة',
    title: 'ايجار سيارات المدينة المنورة | عبدالمجيد الخضر',
    description:
      'تأجير وايجار سيارات يومي وشهري في المدينة المنورة — فرع طريق المطار وعدة فروع. حجز سريع وأسطول حديث.',
    keywords: ['ايجار سيارات المدينة المنورة', 'تأجير سيارات المدينة', 'ايجار سيارة المدينة المنورة'],
    intro:
      'نوفر خدمة ايجار سيارات في المدينة المنورة بفروع متعددة قريبة من المطار والمعالم الرئيسية. تأجير يومي وشهري بأسعار واضحة.',
    highlights: ['فرع طريق المطار', 'استلام مرن', 'مناسب لزوار المسجد النبوي'],
  },
  {
    slug: 'jeddah',
    nameAr: 'جدة',
    title: 'ايجار سيارات جدة | تأجير يومي وشهري — الخضر',
    description:
      'ايجار سيارات في جدة — تأجير سيارات يومي وشهري بأسعار منافسة. احجز اونلاين من عبدالمجيد الخضر لتأجير السيارات.',
    keywords: ['ايجار سيارات جدة', 'تأجير سيارات جدة', 'ايجار سيارة في جدة'],
    intro:
      'خدمة ايجار سيارات جدة من شبكة فروع الخضر — خيارات يومية وشهرية لرجال الأعمال والعائلات والزوار.',
    highlights: ['حجز اونلاين', 'أسطول متنوع', 'دعم 24/7'],
  },
  {
    slug: 'riyadh',
    nameAr: 'الرياض',
    title: 'ايجار سيارات الرياض | تأجير سيارات — عبدالمجيد الخضر',
    description:
      'تأجير وايجار سيارات في الرياض — يومي وشهري. شركة عبدالمجيد الخضر لتأجير السيارات بأسعار واضحة وخدمة سريعة.',
    keywords: ['ايجار سيارات الرياض', 'تأجير سيارات الرياض', 'ايجار سيارة في الرياض'],
    intro:
      'ايجار سيارات الرياض مع الخضر — حلول تنقل مرنة للموظفين والشركات والزوار بأسطول حديث ومُصان.',
    highlights: ['إيجار يومي وشهري', 'حلول شركات', 'أسعار تنافسية'],
  },
  {
    slug: 'makkah',
    nameAr: 'مكة المكرمة',
    title: 'ايجار سيارات مكة | ايجار سيارة في مكة — الخضر',
    description:
      'ايجار سيارات في مكة المكرمة — تأجير يومي وشهري لزوار الحرم. احجز سيارتك اونلاين بسهولة.',
    keywords: ['ايجار سيارات مكة', 'ايجار سيارة في مكة', 'ايجار سيارات في مكه', 'تأجير سيارات مكة'],
    intro:
      'ايجار سيارات مكة المكرمة بخدمة موثوقة وأسعار واضحة — مثالي للعمرة والزيارات العائلية.',
    highlights: ['مناسب للعمرة', 'تأجير يومي', 'حجز سريع'],
  },
  {
    slug: 'taif',
    nameAr: 'الطائف',
    title: 'ايجار سيارات الطائف | تأجير سيارات يومي',
    description: 'ايجار سيارات في الطائف — تأجير يومي وشهري من عبدالمجيد الخضر لتأجير السيارات.',
    keywords: ['ايجار سيارات الطائف', 'ايجار سيارة في الطائف', 'تأجير سيارات الطائف'],
    intro: 'خدمة ايجار سيارات الطائف بخيارات يومية وشهرية وأسطول يناسب الرحلات والعائلات.',
    highlights: ['سيارات عائلية', 'أسعار واضحة', 'صيانة دورية'],
  },
  {
    slug: 'yanbu',
    nameAr: 'ينبع',
    title: 'ايجار سيارات ينبع | تأجير سيارات — الخضر',
    description: 'ايجار سيارات ينبع — فرع مخصص وتأجير يومي وشهري. احجز من موقع عبدالمجيد الخضر.',
    keywords: ['ايجار سيارات ينبع', 'ايجار سياره في ينبع', 'تأجير سيارات ينبع'],
    intro: 'فرع ينبع يقدم ايجار سيارات يومي وشهري بخدمة سريعة وأسطول محدث.',
    highlights: ['فرع ينبع', 'إيجار مرن', 'تواصل مباشر'],
  },
  {
    slug: 'tabuk',
    nameAr: 'تبوك',
    title: 'ايجار سيارات تبوك | تأجير يومي وشهري',
    description: 'ايجار سيارات تبوك — تأجير سيارات بأسعار منافسة من شركة الخضر.',
    keywords: ['ايجار سيارات تبوك', 'ايجار سياره في تبوك', 'تأجير سيارات تبوك'],
    intro: 'ايجار سيارات تبوك مع خيارات يومية وشهرية ودعم على مدار الساعة.',
    highlights: ['فرع تبوك', 'حجز اونلاين', 'أسطول حديث'],
  },
  {
    slug: 'dammam',
    nameAr: 'الدمام والخبر',
    title: 'ايجار سيارات الدمام والخبر | تأجير سيارات',
    description: 'ايجار سيارات في الدمام والخبر — تأجير يومي وشهري من عبدالمجيد الخضر.',
    keywords: ['ايجار سيارات الدمام', 'تأجير سيارات الخبر', 'ايجار سيارات المنطقة الشرقية'],
    intro: 'خدمة ايجار سيارات للمنطقة الشرقية — الدمام والخبر والمدن القريبة.',
    highlights: ['تغطية الشرقية', 'إيجار شركات', 'أسعار واضحة'],
  },
]

export interface PageSeoConfig {
  title: string
  description: string
  keywords?: string[]
  noindex?: boolean
}

const BASE_KEYWORDS = [...SEO_KEYWORDS]

export const STATIC_PAGE_SEO: Record<string, PageSeoConfig> = {
  '/': {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    keywords: BASE_KEYWORDS,
  },
  '/cars': {
    title: 'أسطول السيارات | ايجار سيارات يومي وشهري — عبدالمجيد الخضر',
    description:
      'تصفح أسطولنا واحجز ايجار سيارات يومي أو شهري — سيدان، SUV، فاخرة وعائلية. أسعار واضحة وحجز اونلاين.',
    keywords: ['ايجار سيارات', 'تأجير سيارات', 'حجز سيارة', 'ايجار سيارة يومي', 'ايجار سيارة شهري'],
  },
  '/offers': {
    title: 'عروض ايجار السيارات | تأجير يومي وشهري — الخضر',
    description: 'عروض ايجار وتأجير سيارات يومي وشهري بأسعار مخفضة — باقات حصرية من عبدالمجيد الخضر.',
    keywords: ['عروض ايجار سيارات', 'تأجير سيارات رخيص', 'ايجار سيارات يومي'],
  },
  '/about': {
    title: 'من نحن | شبكة عبدالمجيد الخضر لتأجير السيارات',
    description:
      'تعرف على شبكة عبدالمجيد الخضر لتأجير السيارات — الخضر لتأجير السيارات وتأجير سيارات الخضر في أكثر من 35 فرعاً بالمملكة.',
    keywords: [
      'شبكة عبدالمجيد الخضر لتأجير السيارات',
      'الخضر لتأجير السيارات',
      'تأجير سيارات الخضر',
      'شركة تأجير سيارات',
    ],
  },
  '/branches': {
    title: 'فروعنا | ايجار سيارات في السعودية — الخضر',
    description:
      'فروع عبدالمجيد الخضر لتأجير السيارات في المدينة المنورة وجدة والرياض ومكة وينبع وتبوك وأكثر.',
    keywords: ['فروع تأجير سيارات', 'ايجار سيارات فروع', 'الخضر فروع'],
  },
  '/locations': {
    title: 'ايجار سيارات في مدن السعودية | جدة الرياض مكة — الخضر',
    description:
      'ايجار وتأجير سيارات في جدة والرياض ومكة المكرمة والمدينة المنورة والطائف وينبع وتبوك والدمام.',
    keywords: ['ايجار سيارات جدة', 'ايجار سيارات الرياض', 'ايجار سيارات مكة'],
  },
}

export function getCityBySlug(slug: string): SeoCity | undefined {
  return SEO_CITIES.find((c) => c.slug === slug)
}

export function getPageSeo(pathname: string): PageSeoConfig {
  if (pathname.startsWith('/admin')) {
    return {
      title: 'لوحة الإدارة',
      description: SEO_DESCRIPTION,
      noindex: true,
    }
  }

  const locationMatch = pathname.match(/^\/locations\/([^/]+)$/)
  if (locationMatch) {
    const city = getCityBySlug(locationMatch[1])
    if (city) {
      return {
        title: city.title,
        description: city.description,
        keywords: city.keywords,
      }
    }
  }

  if (pathname.startsWith('/book/')) {
    return {
      title: 'حجز سيارة | ايجار سيارات اونلاين — الخضر',
      description: 'أكمل حجز ايجار سيارتك اونلاين — تأجير يومي وشهري بأسعار واضحة.',
      keywords: ['حجز سيارة اونلاين', 'ايجار سيارات', 'تأجير سيارات'],
    }
  }

  if (pathname.startsWith('/cars/')) {
    return {
      title: 'تفاصيل السيارة | ايجار سيارات — عبدالمجيد الخضر',
      description: 'تفاصيل السيارة والحجز — ايجار يومي وشهري من الخضر لتأجير السيارات.',
      keywords: ['ايجار سيارات', 'تأجير سيارة', 'حجز سيارة'],
    }
  }

  return (
    STATIC_PAGE_SEO[pathname] ?? {
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      keywords: BASE_KEYWORDS,
    }
  )
}

export function getCanonicalUrl(pathname: string, origin = getSiteUrl()): string {
  const clean = pathname.split('?')[0].split('#')[0] || '/'
  if (clean === '/') return `${origin}/`
  return `${origin}${clean}`
}

export function buildWebSiteJsonLd(origin = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_SEO_PRIMARY,
    alternateName: [...SEO_BRAND_NAMES, SITE_NAME, SITE_NAME_EN],
    url: origin,
    inLanguage: 'ar-SA',
    description: SEO_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/cars?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildOrganizationJsonLd(origin = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_SEO_PRIMARY,
    alternateName: [...SEO_BRAND_NAMES, SITE_NAME],
    url: origin,
    logo: `${origin}/favicon-192.png`,
    description: SEO_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: TOLL_FREE,
      contactType: 'customer service',
      areaServed: 'SA',
      availableLanguage: ['ar', 'en'],
    },
    sameAs: [WHATSAPP_LINK, origin],
    knowsAbout: [
      'تأجير سيارات',
      'ايجار سيارات',
      'Car Rental Saudi Arabia',
      'تأجير سيارات يومي',
      'تأجير سيارات شهري',
    ],
  }
}

export function buildLocalBusinessJsonLd(origin = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CarRental',
    name: SITE_SEO_PRIMARY,
    alternateName: [...SEO_BRAND_NAMES, SITE_NAME, SITE_NAME_EN, 'Alkhoder AutoCar'],
    description: SEO_DESCRIPTION,
    url: origin,
    telephone: TOLL_FREE_LINK.replace('tel:', ''),
    image: `${origin}/favicon-192.png`,
    logo: `${origin}/favicon-192.png`,
    priceRange: '$$',
    currenciesAccepted: 'SAR',
    paymentAccepted: 'Cash, Credit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: MAIN_BRANCH.address,
      addressLocality: MAIN_BRANCH.city,
      addressRegion: 'المدينة المنورة',
      addressCountry: 'SA',
    },
    areaServed: SEO_CITIES.map((c) => ({
      '@type': 'City',
      name: c.nameAr,
    })),
    sameAs: [WHATSAPP_LINK],
    openingHours: 'Mo-Su 08:00-23:00',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: TOLL_FREE,
      contactType: 'customer service',
      areaServed: 'SA',
      availableLanguage: ['Arabic', 'English'],
    },
  }
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
  origin = getSiteUrl(),
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path === '/' ? '/' : item.path}`,
    })),
  }
}

export function buildCityJsonLd(city: SeoCity, origin = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `ايجار سيارات ${city.nameAr}`,
    description: city.description,
    provider: {
      '@type': 'CarRental',
      name: SITE_SEO_PRIMARY,
      url: origin,
    },
    areaServed: {
      '@type': 'City',
      name: city.nameAr,
    },
    serviceType: 'Car Rental',
  }
}

export const PUBLIC_ROUTES = [
  '/',
  '/cars',
  '/offers',
  '/about',
  '/branches',
  '/locations',
  ...SEO_CITIES.map((c) => `/locations/${c.slug}`),
] as const
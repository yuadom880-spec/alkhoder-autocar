import { SITE_COMPANY_NAME, SITE_NAME_EN, SITE_SEO_PRIMARY } from '../constants'
import { getCityBySlug, SEO_KEYWORDS, type PageSeoConfig } from '../seo'
import type { Locale } from './index'

const EN_KEYWORDS = [
  'Alkhoder car rental',
  'Abdulmjeed Alkhoder car rental',
  'car rental Saudi Arabia',
  'daily car rental',
  'monthly car rental',
  'rent a car Jeddah',
  'rent a car Riyadh',
  'rent a car Makkah',
  'rent a car Madinah',
  'car hire Saudi Arabia',
  'online car booking',
  'alkhodercar',
] as const

const STATIC_PAGE_SEO_AR: Record<string, PageSeoConfig> = {
  '/': {
    title: 'الخضر لتأجير السيارات | عبدالمجيد الخضر لتأجير السيارات | شركة عبدالمجيد الخضر',
    description:
      'الخضر لتأجير السيارات — الموقع الرسمي لشركة عبدالمجيد الخضر لتأجير السيارات وعبدالمجيد الخضر لتأجير السيارات. ايجار وتأجير سيارات يومي وشهري في جدة والرياض ومكة والمدينة وينبع وتبوك. احجز أونلاين.',
    keywords: [...SEO_KEYWORDS],
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
    title: `من نحن | ${SITE_COMPANY_NAME}`,
    description:
      `تعرف على ${SITE_COMPANY_NAME} — الخضر لتأجير السيارات وتأجير سيارات الخضر في أكثر من 35 فرعاً بالمملكة.`,
    keywords: [SITE_COMPANY_NAME, 'الخضر لتأجير السيارات', 'تأجير سيارات الخضر', 'شركة تأجير سيارات'],
  },
  '/privacy': {
    title: `سياسة الخصوصية | ${SITE_COMPANY_NAME}`,
    description:
      'سياسة خصوصية تطبيق وموقع الخضر لتأجير السيارات — كيف نجمع ونستخدم ونحمي بياناتك عند الحجز وإنشاء الحساب.',
    keywords: ['سياسة الخصوصية', 'الخضر لتأجير السيارات', 'حماية البيانات'],
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

const STATIC_PAGE_SEO_EN: Record<string, PageSeoConfig> = {
  '/': {
    title: 'Alkhoder Car Rental | Abdulmjeed Alkhoder Car Rental | Official Website',
    description:
      'Alkhoder Car Rental — the official website of Abdulmjeed Alkhoder Car Rental Company. Daily and monthly car rental in Jeddah, Riyadh, Makkah, Madinah, Yanbu, and Tabuk. Book online.',
    keywords: [...EN_KEYWORDS],
  },
  '/cars': {
    title: 'Our fleet | Daily & monthly car rental — Alkhoder',
    description:
      'Browse our fleet and book daily or monthly car rental — sedan, SUV, luxury, and family cars. Transparent pricing and online booking.',
    keywords: ['car rental', 'rent a car', 'book a car', 'daily car rental', 'monthly car rental'],
  },
  '/offers': {
    title: 'Car rental offers | Daily & monthly deals — Alkhoder',
    description: 'Daily and monthly car rental offers at discounted rates — exclusive packages from Abdulmjeed Alkhoder.',
    keywords: ['car rental offers', 'cheap car rental', 'daily car rental deals'],
  },
  '/about': {
    title: `About us | ${SITE_NAME_EN}`,
    description:
      `Learn about ${SITE_NAME_EN} — Alkhoder Car Rental with 35+ branches across Saudi Arabia.`,
    keywords: [SITE_NAME_EN, 'Alkhoder car rental', 'car rental company Saudi Arabia'],
  },
  '/privacy': {
    title: `Privacy policy | ${SITE_NAME_EN}`,
    description:
      'Privacy policy for the Alkhoder Car Rental app and website — how we collect, use, and protect your data when booking and creating an account.',
    keywords: ['privacy policy', 'Alkhoder car rental', 'data protection'],
  },
  '/branches': {
    title: 'Our branches | Car rental in Saudi Arabia — Alkhoder',
    description:
      'Abdulmjeed Alkhoder Car Rental branches in Madinah, Jeddah, Riyadh, Makkah, Yanbu, Tabuk, and more.',
    keywords: ['car rental branches', 'Alkhoder branches', 'rent a car Saudi Arabia'],
  },
  '/locations': {
    title: 'Car rental in Saudi cities | Jeddah, Riyadh, Makkah — Alkhoder',
    description:
      'Car rental in Jeddah, Riyadh, Makkah, Madinah, Taif, Yanbu, Tabuk, and Dammam.',
    keywords: ['car rental Jeddah', 'car rental Riyadh', 'car rental Makkah'],
  },
}

const CITY_SEO_EN: Record<string, { title: string; description: string; keywords: string[] }> = {
  madinah: {
    title: 'Car rental Madinah | Abdulmjeed Alkhoder',
    description: 'Daily and monthly car rental in Madinah — Airport Road branch and more. Fast booking and modern fleet.',
    keywords: ['car rental Madinah', 'rent a car Madinah', 'Madinah car hire'],
  },
  jeddah: {
    title: 'Car rental Jeddah | Daily & monthly — Alkhoder',
    description: 'Car rental in Jeddah — daily and monthly rates. Book online from Abdulmjeed Alkhoder Car Rental.',
    keywords: ['car rental Jeddah', 'rent a car Jeddah', 'Jeddah car hire'],
  },
  riyadh: {
    title: 'Car rental Riyadh | Abdulmjeed Alkhoder',
    description: 'Car rental in Riyadh — daily and monthly. Transparent pricing and fast service.',
    keywords: ['car rental Riyadh', 'rent a car Riyadh', 'Riyadh car hire'],
  },
  makkah: {
    title: 'Car rental Makkah | Alkhoder',
    description: 'Car rental in Makkah — daily and monthly for Haram visitors. Book your car online easily.',
    keywords: ['car rental Makkah', 'rent a car Makkah', 'Makkah car hire'],
  },
  taif: {
    title: 'Car rental Taif | Daily rental',
    description: 'Car rental in Taif — daily and monthly from Abdulmjeed Alkhoder Car Rental.',
    keywords: ['car rental Taif', 'rent a car Taif', 'Taif car hire'],
  },
  yanbu: {
    title: 'Car rental Yanbu | Alkhoder',
    description: 'Car rental in Yanbu — dedicated branch with daily and monthly rental. Book from alkhodercar.com.',
    keywords: ['car rental Yanbu', 'rent a car Yanbu', 'Yanbu car hire'],
  },
  tabuk: {
    title: 'Car rental Tabuk | Daily & monthly',
    description: 'Car rental in Tabuk — competitive rates from Alkhoder Car Rental.',
    keywords: ['car rental Tabuk', 'rent a car Tabuk', 'Tabuk car hire'],
  },
  dammam: {
    title: 'Car rental Dammam & Khobar | Car hire',
    description: 'Car rental in Dammam and Khobar — daily and monthly from Abdulmjeed Alkhoder.',
    keywords: ['car rental Dammam', 'car rental Khobar', 'Eastern Province car rental'],
  },
}

function getStaticSeo(locale: Locale): Record<string, PageSeoConfig> {
  return locale === 'en' ? STATIC_PAGE_SEO_EN : STATIC_PAGE_SEO_AR
}

function getDefaultSeo(locale: Locale): PageSeoConfig {
  return getStaticSeo(locale)['/'] ?? STATIC_PAGE_SEO_AR['/']
}

export function getPageSeoForLocale(pathname: string, locale: Locale): PageSeoConfig {
  if (pathname.startsWith('/admin')) {
    return {
      title: locale === 'en' ? 'Admin panel' : 'لوحة الإدارة',
      description: getDefaultSeo(locale).description,
      noindex: true,
    }
  }

  const staticSeo = getStaticSeo(locale)

  const locationMatch = pathname.match(/^\/locations\/([^/]+)$/)
  if (locationMatch) {
    const slug = locationMatch[1]
    const city = getCityBySlug(slug)
    if (city) {
      if (locale === 'en') {
        const en = CITY_SEO_EN[slug]
        if (en) {
          return { title: en.title, description: en.description, keywords: en.keywords }
        }
      }
      return {
        title: city.title,
        description: city.description,
        keywords: city.keywords,
      }
    }
  }

  if (pathname.startsWith('/book/')) {
    return locale === 'en'
      ? {
          title: 'Book a car | Online car rental — Alkhoder',
          description: 'Complete your car rental booking online — daily and monthly rates with transparent pricing.',
          keywords: ['book a car online', 'car rental', 'rent a car'],
        }
      : {
          title: 'حجز سيارة | ايجار سيارات اونلاين — الخضر',
          description: 'أكمل حجز ايجار سيارتك اونلاين — تأجير يومي وشهري بأسعار واضحة.',
          keywords: ['حجز سيارة اونلاين', 'ايجار سيارات', 'تأجير سيارات'],
        }
  }

  if (pathname.startsWith('/cars/')) {
    return locale === 'en'
      ? {
          title: 'Car details | Car rental — Abdulmjeed Alkhoder',
          description: 'Car details and booking — daily and monthly rental from Alkhoder Car Rental.',
          keywords: ['car rental', 'rent a car', 'book a car'],
        }
      : {
          title: 'تفاصيل السيارة | ايجار سيارات — عبدالمجيد الخضر',
          description: 'تفاصيل السيارة والحجز — ايجار يومي وشهري من الخضر لتأجير السيارات.',
          keywords: ['ايجار سيارات', 'تأجير سيارة', 'حجز سيارة'],
        }
  }

  return staticSeo[pathname] ?? getDefaultSeo(locale)
}

export function getOgLocale(locale: Locale): string {
  return locale === 'en' ? 'en_US' : 'ar_SA'
}

export function getSiteSeoPrimary(locale: Locale): string {
  return locale === 'en' ? 'Alkhoder Car Rental' : SITE_SEO_PRIMARY
}

const CITY_DISPLAY_EN: Record<string, string> = {
  madinah: 'Madinah',
  jeddah: 'Jeddah',
  riyadh: 'Riyadh',
  makkah: 'Makkah',
  taif: 'Taif',
  yanbu: 'Yanbu',
  tabuk: 'Tabuk',
  dammam: 'Dammam & Khobar',
}

export function getCityDisplayName(slug: string, locale: Locale): string {
  const city = getCityBySlug(slug)
  if (!city) return slug
  if (locale === 'en') return CITY_DISPLAY_EN[slug] ?? city.nameAr
  return city.nameAr
}
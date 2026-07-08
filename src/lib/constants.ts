import { asset } from './assets'
import logoUrl from '../assets/logo.png'
import type { Car, CarCategory, CarClass, CarOffer, CarOffers } from './types'

const summerOffer = (badge: string): CarOffer => ({
  active: true,
  title: 'عروض إجازة الصيف',
  badge_text: badge,
  discount_type: 'percent',
  discount_value: 15,
  valid_until: '2026-09-30',
  description: 'عرض الصيف — لفترة محدودة',
})

const dailyOffer = (badge: string): CarOffers => ({
  daily: summerOffer(badge),
  monthly: null,
})

export const SITE_SEO_PRIMARY = 'الخضر لتأجير السيارات'
export const SITE_COMPANY_NAME = 'شركة عبدالمجيد الخضر لتأجير السيارات'
export const SITE_NAME = 'عبدالمجيد الخضر لتأجير السيارات'
export const SITE_NAME_SHORT = 'عبدالمجيد الخضر'
export const SITE_NAME_EN = 'Abdulmjeed Alkhoder Car Rental'
export const LOGO_URL = logoUrl
export const PHONE = '050 459 0002'
export const PHONE_LINK = 'tel:+966504590002'
export const WHATSAPP_LINK = 'https://wa.me/966504590002'
export const INSTAGRAM_LINK = 'https://www.instagram.com/alkhedrrental/'
export const X_LINK = 'https://x.com/alkhedrrental'
export const FACEBOOK_LINK =
  'https://www.facebook.com/p/%D8%B4%D8%B1%D9%83%D8%A9-%D8%B9%D8%A8%D8%AF-%D8%A7%D9%84%D9%85%D8%AC%D9%8A%D8%AF-%D8%B5%D8%A7%D9%84%D8%AD-%D8%A7%D9%84%D8%AE%D8%B6%D8%B1-%D9%84%D8%AA%D8%A3%D8%AC%D9%8A%D8%B1-%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D9%81%D8%B1%D8%B9-%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9-100093714615823/'

export type SocialLink = {
  id: 'instagram' | 'x' | 'facebook'
  label: string
  href: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'instagram', label: 'إنستغرام', href: INSTAGRAM_LINK },
  { id: 'x', label: 'X', href: X_LINK },
  { id: 'facebook', label: 'فيسبوك', href: FACEBOOK_LINK },
]

export const TOLL_FREE = '920018216'
export const TOLL_FREE_LINK = 'tel:920018216'
export const EMAIL_QA = 'Alkhedr.qa@alkhedrcars.com'
export const EMAIL_OSAMA = 'M.osama@alkhedrcars.com'

const BRANCH_HOURS = 'السبت - الخميس: 8 ص - 12 م | الجمعة: 4 م - 12 م'

export type Branch = {
  name: string
  address: string
  city: string
  phone?: string
  hours: string
  mapUrl: string
  isMain?: boolean
}

export const MAIN_BRANCH: Branch = {
  name: 'الفرع الرئيسي',
  address: 'طريق المطار',
  city: 'المدينة المنورة',
  phone: PHONE,
  hours: BRANCH_HOURS,
  mapUrl: 'https://maps.app.goo.gl/JJNXk515GhDxqu889?g_st=iw',
  isMain: true,
}

export const BRANCHES: Branch[] = [
  MAIN_BRANCH,
  {
    name: 'فرع طريق المطار 2',
    address: 'طريق المطار',
    city: 'المدينة المنورة',
    phone: '055 588 7324',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.google.com/?q=24.482824,39.630497',
  },
  {
    name: 'فرع طريق سلطانه',
    address: 'طريق سلطانه',
    city: 'المدينة المنورة',
    phone: '053 118 8874',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.app.goo.gl/GXRSGgLgdAj6gvJi6?g_st=iw',
  },
  {
    name: 'فرع العالية',
    address: 'العالية',
    city: 'المدينة المنورة',
    phone: '055 666 3589',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.google.com/?q=24.419773,39.620392',
  },
  {
    name: 'فرع العزيزية',
    address: 'العزيزية',
    city: 'المدينة المنورة',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.app.goo.gl/agZ4fhN7CEykbHva8?g_st=iw',
  },
  {
    name: 'فرع ينبع',
    address: 'ينبع',
    city: 'ينبع',
    phone: '055 335 7178',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.google.com/?q=24.086933,38.064159',
  },
  {
    name: 'فرع ضباء',
    address: 'ضباء',
    city: 'ضباء',
    phone: '055 588 6210',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.app.goo.gl/VAahiHjbq2Hr49ch7?g_st=iw',
  },
  {
    name: 'فرع تبوك',
    address: 'تبوك',
    city: 'تبوك',
    phone: '055 588 6412',
    hours: BRANCH_HOURS,
    mapUrl: 'https://maps.google.com/?q=28.399940,36.530735',
  },
]

export const NAV_LINKS = [
  { path: '/', label: 'الرئيسية' },
  { path: '/cars', label: 'السيارات' },
  { path: '/offers', label: 'العروض' },
  { path: '/about', label: 'من نحن' },
  { path: '/branches', label: 'فروعنا' },
]

export const CAR_CATEGORIES: CarCategory[] = [
  'sedan',
  'hatchback',
  'crossover',
  'suv',
  'van',
  'pickup',
]

export const CATEGORY_LABELS: Record<CarCategory, string> = {
  sedan: 'سيدان',
  hatchback: 'هاتشباك',
  crossover: 'كروس أوفر',
  suv: 'SUV',
  van: 'فان',
  pickup: 'بيك أب',
}

const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  economy: 'سيدان',
  family: 'SUV',
  luxury: 'SUV',
  sports: 'سيدان',
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as CarCategory] ?? LEGACY_CATEGORY_LABELS[category] ?? category
}

export const CAR_CLASSES: CarClass[] = [
  'economy',
  'mid',
  'family',
  'executive',
  'luxury',
  'sports',
]

export const CLASS_LABELS: Record<CarClass, string> = {
  economy: 'اقتصادية',
  mid: 'متوسطة',
  family: 'عائلية',
  executive: 'تنفيذية',
  luxury: 'فاخرة',
  sports: 'رياضية',
}

export function getClassLabel(carClass: string): string {
  return CLASS_LABELS[carClass as CarClass] ?? carClass
}

export const BOOKING_STATUS_LABELS = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  rejected: 'مرفوض',
  completed: 'مكتمل',
  cancelled: 'ملغي',
} as const

export const DEMO_CARS: Car[] = [
  {
    id: '1',
    name: 'نيسان كيكس 2025',
    brand: 'نيسان',
    model: 'كيكس',
    year: 2025,
    category: 'crossover',
    car_class: 'mid',
    price_per_day: 160,
    price_per_month: 4000,
    image_url: asset('نيسان-كيكس-٢٠٢٥-ابيض-ستوري.jpg.jpeg'),
    images: [
      asset('نيسان-كيكس-٢٠٢٥-ابيض-ستوري.jpg.jpeg'),
      asset('نيسان-كيكس-٢٠٢٥-مواصفات.jpg.jpeg'),
    ],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'كروس أوفر عصرية واقتصادية، مثالية للتنقل اليومي والرحلات القصيرة.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'هوندا سيتي 2024',
    brand: 'هوندا',
    model: 'سيتي',
    year: 2024,
    category: 'sedan',
    car_class: 'economy',
    price_per_day: 120,
    price_per_month: 3000,
    image_url: asset('هوندا-سيتي-٢٠٢٤-رمادي.jpg.jpeg'),
    images: [
      asset('هوندا-سيتي-٢٠٢٤-رمادي.jpg.jpeg'),
      asset('هوندا-سيتي-٢٠٢٤-اسود.jpg.jpeg'),
    ],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'سيدان اقتصادية موفرة للوقود، خيار ممتاز للاستخدام اليومي.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'شيري أريزو 5 2024',
    brand: 'شيري',
    model: 'أريزو 5',
    year: 2024,
    category: 'sedan',
    car_class: 'economy',
    price_per_day: 95,
    price_per_month: 2375,
    image_url: asset('اريزو ٥ ابيض ٢٠٢٤.jpg.jpeg'),
    images: [asset('اريزو ٥ ابيض ٢٠٢٤.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'سيدان اقتصادية بسعر منافس، مناسبة للموظفين والطلاب.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'كيا بيقاس 2025',
    brand: 'كيا',
    model: 'بيقاس',
    year: 2025,
    category: 'sedan',
    car_class: 'mid',
    price_per_day: 110,
    price_per_month: 2750,
    image_url: asset('كيا-بيقاس-٢٠٢٥-ابيض.jpg.jpeg'),
    images: [asset('كيا-بيقاس-٢٠٢٥-ابيض.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'سيدان عائلية مريحة بمواصفات حديثة واستهلاك وقود معقول.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'شيفرولية كابتيفا 2026',
    brand: 'شيفرولية',
    model: 'كابتيفا',
    year: 2026,
    category: 'suv',
    car_class: 'family',
    price_per_day: 180,
    price_per_month: 4500,
    image_url: asset('شيفرولية-كابتيفا٢٠٢٦.jpg.jpeg'),
    images: [
      asset('شيفرولية-كابتيفا٢٠٢٦.jpg.jpeg'),
      asset('شيفرولية-كابتيفا-٢٠٢٦-رمادي.jpg.jpeg'),
    ],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 7, doors: 4, ac: true },
    description: 'دفع رباعي عائلية بـ 7 مقاعد، مثالية للعائلات والرحلات.',
    is_available: true,
    is_featured: true,
    offer: dailyOffer('خصم 15%'),
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'فوتون غمارة 2026',
    brand: 'فوتون',
    model: 'غمارة',
    year: 2026,
    category: 'pickup',
    car_class: 'mid',
    price_per_day: 220,
    price_per_month: 5500,
    image_url: asset('فوتون-غمارة-٢٠٢٦.jpg.jpeg'),
    images: [asset('فوتون-غمارة-٢٠٢٦.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'ديزل', seats: 5, doors: 4, ac: true },
    description: 'بيك أب غمارتين قوية للأعمال والطرق الوعرة.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'لينك آند كو 03 2024',
    brand: 'لينك آند كو',
    model: '03',
    year: 2024,
    category: 'crossover',
    car_class: 'executive',
    price_per_day: 200,
    price_per_month: 5000,
    image_url: asset('لينك-اند-كو-03-ابيض2024.jpg.jpeg'),
    images: [
      asset('لينك-اند-كو-03-ابيض2024.jpg.jpeg'),
      asset('لينك-اند-كو-٠٣-رمادي٢٠٢٤.jpg.jpeg'),
    ],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'كروس أوفر فاخرة بتصميم عصري وتجهيزات متقدمة.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'شيفرولية تاهو 2023',
    brand: 'شيفرولية',
    model: 'تاهو',
    year: 2023,
    category: 'suv',
    car_class: 'luxury',
    price_per_day: 450,
    price_per_month: 11250,
    image_url: asset('تاهو-٢٠٢٣-بني-غامق.jpg.jpeg'),
    images: [asset('تاهو-٢٠٢٣-بني-غامق.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 7, doors: 4, ac: true },
    description: 'دفع رباعي فاخرة واسعة، مثالية للمناسبات والرحلات العائلية الكبيرة.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'جيلي ازكارا 2023',
    brand: 'جيلي',
    model: 'ازكارا',
    year: 2023,
    category: 'suv',
    car_class: 'executive',
    price_per_day: 210,
    price_per_month: 5250,
    image_url: asset('جيلي-ازكارا-٢٠٢٣-رمادي.jpg.jpeg'),
    images: [
      asset('جيلي-ازكارا-٢٠٢٣-رمادي.jpg.jpeg'),
      asset('جيلي-ازكارا-اسود-٢٠٢٣.jpg.jpeg'),
      asset('جيليي-ازكارا-فل-كامل-٢٠٢٣-اسود.jpg.jpeg'),
    ],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'دفع رباعي فل كامل بتجهيزات عالية وراحة ممتازة.',
    is_available: true,
    is_featured: true,
    offer: dailyOffer('دبل العرض'),
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'أومودا C5 2026',
    brand: 'أومودا',
    model: 'C5',
    year: 2026,
    category: 'crossover',
    car_class: 'mid',
    price_per_day: 190,
    price_per_month: 4750,
    image_url: asset('امودا-سي-٥-ابيض-٢٠٢٦.jpg.jpeg'),
    images: [asset('امودا-سي-٥-ابيض-٢٠٢٦.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'كروس أوفر حديثة بتصميم رياضي وتقنيات ذكية.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'رينو داستر 2024',
    brand: 'رينو',
    model: 'داستر',
    year: 2024,
    category: 'suv',
    car_class: 'economy',
    price_per_day: 140,
    price_per_month: 3500,
    image_url: asset('رينو-داستر-٢٠٢٤-ابيض.jpg.jpeg'),
    images: [asset('رينو-داستر-٢٠٢٤-ابيض.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'دفع رباعي اقتصادية عملية، مناسبة للعائلات والمغامرات الخفيفة.',
    is_available: true,
    is_featured: true,
    offer: null,
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'تويوتا يارس 2024',
    brand: 'تويوتا',
    model: 'يارس',
    year: 2024,
    category: 'sedan',
    car_class: 'economy',
    price_per_day: 100,
    price_per_month: 2500,
    image_url: asset('تويوتا-يارس-عروض-الصيف.jpg.jpeg'),
    images: [asset('تويوتا-يارس-عروض-الصيف.jpg.jpeg')],
    specs: { transmission: 'أوتوماتيك', fuel: 'بنزين', seats: 5, doors: 4, ac: true },
    description: 'سيدان اقتصادية مثالية للتنقل اليومي والرحلات القصيرة — عرض الصيف متاح.',
    is_available: true,
    is_featured: true,
    offer: dailyOffer('يبدأ 85 ر.س'),
    branch_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const PROMO_BANNERS = [
  {
    src: asset('عروض-التوفير.jpg.jpeg'),
    alt: 'عروض التوفير',
    link: '/offers',
  },
  {
    src: asset('تويوتا-يارس-عروض-الصيف.jpg.jpeg'),
    alt: 'عروض الصيف — تويوتا يارس',
    link: '/book/12?promo=offer-5',
  },
  {
    src: asset('شيفرولية-كابتيفا-عروض-الصيف.jpg.jpeg'),
    alt: 'عروض الصيف — شيفرولية كابتيفا',
    link: '/cars/5',
  },
  {
    src: asset('جيلي-ازكارا-دبل-عروض-الصيف.jpg.jpeg'),
    alt: 'عروض الصيف — جيلي ازكارا',
    link: '/cars/9',
  },
  {
    src: asset('بوست-لينك-اند-كو-٠٣.jpg.jpeg'),
    alt: 'عرض لينك آند كو 03',
    link: '/cars/7',
  },
  {
    src: asset('تمارا١.jpg.jpeg'),
    alt: 'قسّط مع تمارا',
    link: '/cars',
  },
  {
    src: asset('تمارا٢.jpg.jpeg'),
    alt: 'قسّط مع تمارا',
    link: '/cars',
  },
] as const

export const SUMMER_VIDEO = asset('فيديو اجازة الصيف (1).mp4')
export const BRAND_VIDEO = asset('الخضر للسيارات.mp4')
export const NEW_TIGO_7_PRO_IMAGE = asset('تيجو 7 برو.webp')
export const NEW_TIGO_7_PRO_IMAGE_FALLBACK = asset('تيجو 7 برو.jpeg')
export const SAVINGS_OFFER_IMAGE = asset('عروض-التوفير.jpg.webp')
export const SAVINGS_OFFER_IMAGE_FALLBACK = asset('عروض-التوفير.jpg.jpeg')
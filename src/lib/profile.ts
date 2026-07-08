import { asset } from './assets'

/** محتوى وصور الملف التعريفي — عبدالمجيد الخضر لتأجير السيارات */
export function profileAsset(filename: string): string {
  return encodeURI(`/profile/${filename}`)
}

export const PARTNERS_IMAGE = asset('شركاء النجاح.webp')
export const PARTNERS_IMAGE_FALLBACK = asset('شركاء النجاح.png')

export const PROFILE_IMAGES = {
  /** باترول سوداء فاخرة — خلفية الهيرو */
  heroLuxurySuv: '/hero-patrol-black.webp',
  heroLuxurySuvMobile: '/hero-patrol-black-mobile.webp',
  hero: profileAsset('page-01-img-002.webp'),
  aboutFleet: profileAsset('page-03-img-003.webp'),
  fleetBanner: profileAsset('page-12-img-070.webp'),
  branchesMap: profileAsset('page-12-img-070.webp'),
} as const

export const PROFILE_CONTACT = {
  tollFree: '920018216',
  tollFreeDisplay: '920018216',
  tollFreeLink: 'tel:920018216',
  emailQa: 'Alkhedr.qa@alkhedrcars.com',
  emailOsama: 'M.osama@alkhedrcars.com',
} as const

export const PROFILE_ABOUT = {
  intro:
    'انطلقت شركة عبدالمجيد الخضر لتأجير السيارات برؤية طموحة لتكون الخيار الرائد والموثوق في قطاع التنقل بالمملكة العربية السعودية. بفضل التزامنا الراسخ بتقديم أعلى معايير الجودة، نجحنا في بناء شبكة واسعة تتجاوز 35 فرعاً استراتيجياً لخدمة عملائنا أينما كانوا.',
  extended:
    'نحن لا نقدم مجرد سيارات للإيجار، بل نبتكر حلول تنقل متكاملة ومرنة تلبي تطلعات الأفراد وقطاع الأعمال، معتمدين على أسطول حديث ومتنوع، وفريق عمل يضع راحتك وسلامتك في قمة أولوياته لضمان تجربة قيادة استثنائية في كل رحلة.',
  vision:
    'أن نكون الخيار المثالي والوجهة الموثوقة لحلول التنقل في المملكة، من خلال تقديم خدمات ترتقي لتطلعات عملائنا.',
  branchesIntro:
    'رحلة توسع لا تتوقف؛ لتلبية احتياجاتكم أينما كنتم. أكثر من 35 فرعاً لشركة عبدالمجيد الخضر تتوزع استراتيجياً حول المملكة، لنقدم لكم أعلى مستويات الخدمة وأسطولاً متجدداً في كل مدينة.',
} as const

export const PROFILE_STRATEGIC_GOALS = [
  {
    title: 'الانتشار الجغرافي',
    titleEn: 'Nationwide Expansion',
    desc: 'تغطية كافة مناطق المملكة بفعالية',
  },
  {
    title: 'أسطول حديث',
    titleEn: 'Modern Fleet',
    desc: 'توفير سيارات تلبي جميع الاحتياجات',
  },
  {
    title: 'خدمة استثنائية',
    titleEn: 'Exceptional Service',
    desc: 'تقديم تجربة تأجير سلسة ومميزة للعملاء',
  },
  {
    title: 'التحول الرقمي',
    titleEn: 'Digital Transformation',
    desc: 'تسهيل وتسريع الحجوزات بأحدث التقنيات',
  },
] as const

export const PROFILE_SERVICES = [
  {
    title: 'تأجير مرن',
    titleEn: 'Flexible Rentals',
    desc: 'خيارات تأجير يومية وشهرية تناسب كافة الاحتياجات',
  },
  {
    title: 'حلول الشركات',
    titleEn: 'Corporate Solutions',
    desc: 'حلول تأجير طويلة الأجل بأسعار تنافسية للشركات',
  },
  {
    title: 'صيانة دورية',
    titleEn: 'Maintenance',
    desc: 'أسطول مدعوم بصيانة دورية مجانية لراحتك',
  },
  {
    title: 'دعم 24/7',
    titleEn: '24/7 Support',
    desc: 'فريق مساندة متواجد على مدار الساعة للتدخل السريع',
  },
] as const

type FleetCategory = {
  id: string
  title: string
  titleEn: string
  models: { name: string; image: string }[]
}

function fleetImg(page: number, index: number): string {
  const num = String(index).padStart(3, '0')
  return profileAsset(`page-${String(page).padStart(2, '0')}-img-${num}.webp`)
}

export const PROFILE_FLEET: FleetCategory[] = [
  {
    id: 'sedan',
    title: 'سيدان',
    titleEn: 'Sedan',
    models: [
      { name: 'Toyota Yaris', image: fleetImg(6, 15) },
      { name: 'Toyota Corolla', image: fleetImg(6, 16) },
      { name: 'Toyota Camry', image: fleetImg(6, 17) },
      { name: 'Nissan Sunny', image: fleetImg(6, 18) },
      { name: 'Hyundai Accent', image: fleetImg(6, 19) },
      { name: 'Hyundai Elantra', image: fleetImg(6, 20) },
      { name: 'Kia Pegas', image: fleetImg(6, 21) },
      { name: 'Kia 5', image: fleetImg(6, 22) },
      { name: 'Honda City', image: fleetImg(7, 23) },
      { name: 'MAZDA 6', image: fleetImg(7, 24) },
      { name: 'Ford Taurus', image: fleetImg(7, 25) },
      { name: 'Renault Symbol', image: fleetImg(7, 26) },
      { name: 'Chery Arizo 5', image: fleetImg(7, 30) },
      { name: 'Lynk & Co 03', image: fleetImg(7, 33) },
    ],
  },
  {
    id: 'suv',
    title: 'دفع رباعي',
    titleEn: 'SUVs',
    models: [
      { name: 'Chery Tiggo 7 Pro', image: asset('تيجو 7 برو.webp') },
      { name: 'Toyota RAV-4', image: fleetImg(8, 37) },
      { name: 'Nissan Kicks', image: fleetImg(9, 43) },
      { name: 'Chevrolet Captiva', image: fleetImg(9, 46) },
      { name: 'Honda HR-V', image: fleetImg(9, 48) },
      { name: 'MG HS', image: fleetImg(10, 53) },
      { name: 'Omoda C5', image: fleetImg(10, 54) },
      { name: 'Geely Azkara', image: fleetImg(10, 60) },
      { name: 'Lynk & Co 01', image: fleetImg(10, 64) },
    ],
  },
  {
    id: 'luxury',
    title: 'فاخرة',
    titleEn: 'Luxury',
    models: [{ name: 'Range Rover', image: fleetImg(11, 65) }],
  },
  {
    id: 'commercial',
    title: 'تجارية وبيك أب',
    titleEn: 'Commercial & Pickups',
    models: [
      { name: 'Renault Express Van', image: fleetImg(11, 66) },
      { name: 'Peugeot Partner', image: fleetImg(11, 67) },
      { name: 'Maxus T60', image: fleetImg(11, 68) },
      { name: 'Foton Tunland', image: fleetImg(11, 69) },
    ],
  },
]

export const PROFILE_BRANCH_REGIONS = [
  {
    region: 'المنطقة الوسطى',
    cities: ['المدينة المنورة', 'مكة المكرمة', 'جدة', 'الطائف', 'بريدة', 'حائل', 'الخفجي', 'البكيرية', 'ينبع'],
  },
  {
    region: 'المنطقة الغربية',
    cities: ['ينبع', 'ضباء', 'أملج', 'تبوك'],
  },
  {
    region: 'المنطقة الجنوبية',
    cities: ['خميس مشيط', 'بيشة', 'محايل', 'جازان', 'أبو عريش', 'نجران'],
  },
  {
    region: 'المنطقة الشمالية',
    cities: ['تبوك', 'عرعر', 'رفحاء', 'سكاكا'],
  },
  {
    region: 'المنطقة الشرقية',
    cities: ['الخبر', 'الهفوف', 'الثقبة', 'صناعية السليم'],
  },
] as const
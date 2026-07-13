import type { Locale } from './index'

export type ProfileAbout = {
  intro: string
  extended: string
  vision: string
  branchesIntro: string
}

export type ProfileItem = {
  title: string
  desc: string
}

export type ProfileBranchRegion = {
  region: string
  cities: string[]
}

const aboutAr: ProfileAbout = {
  intro:
    'انطلقت شركة عبدالمجيد الخضر لتأجير السيارات برؤية طموحة لتكون الخيار الرائد والموثوق في قطاع التنقل بالمملكة العربية السعودية. بفضل التزامنا الراسخ بتقديم أعلى معايير الجودة، نجحنا في بناء شبكة واسعة تتجاوز 35 فرعاً استراتيجياً لخدمة عملائنا أينما كانوا.',
  extended:
    'نحن لا نقدم مجرد سيارات للإيجار، بل نبتكر حلول تنقل متكاملة ومرنة تلبي تطلعات الأفراد وقطاع الأعمال، معتمدين على أسطول حديث ومتنوع، وفريق عمل يضع راحتك وسلامتك في قمة أولوياته لضمان تجربة قيادة استثنائية في كل رحلة.',
  vision:
    'أن نكون الخيار المثالي والوجهة الموثوقة لحلول التنقل في المملكة، من خلال تقديم خدمات ترتقي لتطلعات عملائنا.',
  branchesIntro:
    'رحلة توسع لا تتوقف؛ لتلبية احتياجاتكم أينما كنتم. أكثر من 35 فرعاً لشركة عبدالمجيد الخضر تتوزع استراتيجياً حول المملكة، لنقدم لكم أعلى مستويات الخدمة وأسطولاً متجدداً في كل مدينة.',
}

const aboutEn: ProfileAbout = {
  intro:
    'Abdulmjeed Alkhoder Car Rental was founded with an ambitious vision to become the leading and trusted choice in mobility across Saudi Arabia. Through our commitment to the highest quality standards, we have built a wide network of 35+ strategic branches to serve our customers wherever they are.',
  extended:
    'We offer more than cars for hire — we deliver integrated, flexible mobility solutions for individuals and businesses, backed by a modern, diverse fleet and a team that puts your comfort and safety first for an exceptional driving experience on every trip.',
  vision:
    'To be the ideal choice and trusted destination for mobility solutions in the Kingdom, through services that exceed our customers\' expectations.',
  branchesIntro:
    'Our expansion never stops — to meet your needs wherever you are. 35+ Abdulmjeed Alkhoder branches are strategically located across the Kingdom, delivering top-tier service and a refreshed fleet in every city.',
}

const servicesAr: ProfileItem[] = [
  { title: 'تأجير مرن', desc: 'خيارات تأجير يومية وشهرية تناسب كافة الاحتياجات' },
  { title: 'حلول الشركات', desc: 'حلول تأجير طويلة الأجل بأسعار تنافسية للشركات' },
  { title: 'صيانة دورية', desc: 'أسطول مدعوم بصيانة دورية مجانية لراحتك' },
  { title: 'دعم 24/7', desc: 'فريق مساندة متواجد على مدار الساعة للتدخل السريع' },
]

const servicesEn: ProfileItem[] = [
  { title: 'Flexible rentals', desc: 'Daily and monthly rental options for every need' },
  { title: 'Corporate solutions', desc: 'Long-term rental solutions at competitive rates for businesses' },
  { title: 'Scheduled maintenance', desc: 'Fleet supported by free scheduled maintenance for your peace of mind' },
  { title: '24/7 support', desc: 'Support team available around the clock for rapid assistance' },
]

const goalsAr: ProfileItem[] = [
  { title: 'الانتشار الجغرافي', desc: 'تغطية كافة مناطق المملكة بفعالية' },
  { title: 'أسطول حديث', desc: 'توفير سيارات تلبي جميع الاحتياجات' },
  { title: 'خدمة استثنائية', desc: 'تقديم تجربة تأجير سلسة ومميزة للعملاء' },
  { title: 'التحول الرقمي', desc: 'تسهيل وتسريع الحجوزات بأحدث التقنيات' },
]

const goalsEn: ProfileItem[] = [
  { title: 'Nationwide expansion', desc: 'Effective coverage across all regions of the Kingdom' },
  { title: 'Modern fleet', desc: 'Vehicles that meet every customer need' },
  { title: 'Exceptional service', desc: 'A smooth, outstanding rental experience' },
  { title: 'Digital transformation', desc: 'Faster, easier bookings with the latest technology' },
]

const branchRegionsAr: ProfileBranchRegion[] = [
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
]

const branchRegionsEn: ProfileBranchRegion[] = [
  {
    region: 'Central region',
    cities: ['Madinah', 'Makkah', 'Jeddah', 'Taif', 'Buraidah', 'Hail', 'Khafji', 'Al Bukayriyah', 'Yanbu'],
  },
  {
    region: 'Western region',
    cities: ['Yanbu', 'Duba', 'Umluj', 'Tabuk'],
  },
  {
    region: 'Southern region',
    cities: ['Khamis Mushait', 'Bisha', 'Mahayil', 'Jazan', 'Abu Arish', 'Najran'],
  },
  {
    region: 'Northern region',
    cities: ['Tabuk', 'Arar', 'Rafha', 'Sakaka'],
  },
  {
    region: 'Eastern region',
    cities: ['Khobar', 'Hofuf', 'Thuqbah', 'Industrial Sulayy'],
  },
]

export function getProfileAbout(locale: Locale): ProfileAbout {
  return locale === 'en' ? aboutEn : aboutAr
}

export function getProfileServices(locale: Locale): ProfileItem[] {
  return locale === 'en' ? servicesEn : servicesAr
}

export function getProfileStrategicGoals(locale: Locale): ProfileItem[] {
  return locale === 'en' ? goalsEn : goalsAr
}

export function getProfileBranchRegions(locale: Locale): ProfileBranchRegion[] {
  return locale === 'en' ? branchRegionsEn : branchRegionsAr
}
import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { normalizeCarOffers, sanitizeCarOffers } from './offers'
import type { CarBranchNames, CarBranchOffers, CarBranchPrices } from './types'
import type {
  BranchCarProfile,
  Car,
  CarBranchProfiles,
  CarFormData,
  CarOffers,
  CarSpecs,
} from './types'

function defaultMonthlyPrice(dailyPrice: number): number {
  return Math.round(dailyPrice * 25)
}

function normalizeBranchPrices(raw: CarBranchPrices | null | undefined): CarBranchPrices {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchPrices = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue
    const day = Number(value.price_per_day)
    const month = Number(value.price_per_month)
    if (!Number.isFinite(day) || day < 0) continue
    out[normalizeBranchIdForStorage(key)] = {
      price_per_day: day,
      price_per_month: Number.isFinite(month) && month >= 0 ? month : defaultMonthlyPrice(day),
    }
  }
  return out
}

function normalizeBranchNames(raw: CarBranchNames | null | undefined): CarBranchNames {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchNames = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (!trimmed) continue
    out[normalizeBranchIdForStorage(key)] = trimmed
  }
  return out
}

const defaultSpecs: CarSpecs = {
  transmission: 'أوتوماتيك',
  fuel: 'بنزين',
  seats: 5,
  doors: 4,
  ac: true,
}

/** دمج عروض الفرع مع العامة — null في الفرع يعني «استخدم العام» */
function mergeBranchOffers(
  global: CarOffers | null | undefined,
  branch: CarOffers | null | undefined,
): CarOffers | null {
  const g = normalizeCarOffers(global)
  if (branch === undefined) return sanitizeCarOffers(g)
  const b = normalizeCarOffers(branch)
  return sanitizeCarOffers({
    daily: b.daily !== null && b.daily !== undefined ? b.daily : g.daily,
    monthly: b.monthly !== null && b.monthly !== undefined ? b.monthly : g.monthly,
  })
}

function normalizeSpecs(raw: Partial<CarSpecs> | null | undefined): CarSpecs | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  return {
    transmission: raw.transmission?.trim() || defaultSpecs.transmission,
    fuel: raw.fuel?.trim() || defaultSpecs.fuel,
    seats: Number.isFinite(raw.seats) ? Number(raw.seats) : defaultSpecs.seats,
    doors: Number.isFinite(raw.doors) ? Number(raw.doors) : defaultSpecs.doors,
    ac: raw.ac ?? defaultSpecs.ac,
  }
}

function normalizeProfileEntry(raw: BranchCarProfile | null | undefined): BranchCarProfile | null {
  if (!raw || typeof raw !== 'object') return null
  const images = Array.isArray(raw.images)
    ? raw.images.filter((url) => typeof url === 'string' && url.trim())
    : undefined
  const imageUrl = raw.image_url?.trim()
  const offer = raw.offer !== undefined ? (raw.offer as CarOffers | null) : undefined

  const profile: BranchCarProfile = {}
  if (raw.name?.trim()) profile.name = raw.name.trim()
  if (raw.brand?.trim()) profile.brand = raw.brand.trim()
  if (raw.model?.trim()) profile.model = raw.model.trim()
  if (Number.isFinite(raw.year)) profile.year = Number(raw.year)
  if (raw.category) profile.category = raw.category
  if (raw.car_class) profile.car_class = raw.car_class
  if (Number.isFinite(raw.price_per_day)) profile.price_per_day = Number(raw.price_per_day)
  if (Number.isFinite(raw.price_per_month)) profile.price_per_month = Number(raw.price_per_month)
  if (imageUrl) profile.image_url = imageUrl
  if (images?.length) profile.images = images
  const specs = normalizeSpecs(raw.specs)
  if (specs) profile.specs = specs
  if (raw.description?.trim()) profile.description = raw.description.trim()
  if (offer !== undefined) profile.offer = offer

  return Object.keys(profile).length > 0 ? profile : null
}

export function normalizeBranchProfiles(
  raw: CarBranchProfiles | null | undefined,
): CarBranchProfiles {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: CarBranchProfiles = {}
  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeProfileEntry(value)
    if (normalized) out[normalizeBranchIdForStorage(key)] = normalized
  }
  return out
}

function readLegacyProfile(car: Car, branchId: string): BranchCarProfile {
  const key = normalizeBranchIdForStorage(branchId)
  const legacy: BranchCarProfile = {}

  const name = normalizeBranchNames(car.branch_names)[key]
  if (name) legacy.name = name

  const prices = normalizeBranchPrices(car.branch_prices)[key]
  if (prices) {
    legacy.price_per_day = prices.price_per_day
    legacy.price_per_month = prices.price_per_month
  }

  const offersRaw = car.branch_offers
  if (offersRaw && typeof offersRaw === 'object' && !Array.isArray(offersRaw)) {
    const entry = offersRaw[key] ?? offersRaw[branchId]
    if (entry && typeof entry === 'object') legacy.offer = entry as CarOffers
  }

  return legacy
}

/** ملف السيارة المخصص لفرع واحد (يشمل البيانات القديمة branch_names/prices/offers) */
export function getBranchProfile(
  car: Car,
  branchId?: string | null,
): BranchCarProfile | null {
  if (!branchId) return null
  const key = normalizeBranchIdForStorage(branchId)
  const fromProfiles = normalizeBranchProfiles(car.branch_profiles)[key]
  const legacy = readLegacyProfile(car, branchId)
  if (!fromProfiles && Object.keys(legacy).length === 0) return null
  return { ...legacy, ...fromProfiles }
}

export function hasBranchProfile(car: Car, branchId?: string | null): boolean {
  return getBranchProfile(car, branchId) != null
}

/** السيارة كما يراها عميل الفرع — بيانات الفرع ثم العامة */
export function resolveCarForBranch(car: Car, branchId?: string | null): Car {
  if (!branchId) return car
  const profile = getBranchProfile(car, branchId)
  if (!profile) return car

  const images =
    profile.images && profile.images.length > 0 ? profile.images : car.images
  const imageUrl = profile.image_url ?? images[0] ?? car.image_url
  const offer: CarOffers | null =
    profile.offer !== undefined
      ? (mergeBranchOffers(car.offer, profile.offer) ?? car.offer)
      : car.offer

  return {
    ...car,
    name: profile.name ?? car.name,
    brand: profile.brand ?? car.brand,
    model: profile.model ?? car.model,
    year: profile.year ?? car.year,
    category: profile.category ?? car.category,
    car_class: profile.car_class ?? car.car_class,
    price_per_day: profile.price_per_day ?? car.price_per_day,
    price_per_month:
      profile.price_per_month ??
      car.price_per_month ??
      defaultMonthlyPrice(profile.price_per_day ?? car.price_per_day),
    image_url: imageUrl,
    images: images.length > 0 ? images : [imageUrl],
    specs: profile.specs ? { ...car.specs, ...profile.specs } : car.specs,
    description: profile.description ?? car.description,
    offer,
  }
}

export function getCarDisplayName(car: Car, branchId?: string | null): string {
  return resolveCarForBranch(car, branchId).name
}

/** قيم النموذج لموظف الفرع — يبدأ من العام ثم يطبّق تخصيصات الفرع */
export function getBranchFormCarData(
  car: Car,
  branchId: string | null,
): Pick<
  CarFormData,
  | 'name'
  | 'brand'
  | 'model'
  | 'year'
  | 'category'
  | 'car_class'
  | 'price_per_day'
  | 'price_per_month'
  | 'image_url'
  | 'images'
  | 'specs'
  | 'description'
  | 'offer'
> {
  if (!branchId) {
    return {
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      car_class: car.car_class,
      price_per_day: car.price_per_day,
      price_per_month: car.price_per_month ?? defaultMonthlyPrice(car.price_per_day),
      image_url: car.image_url,
      images: car.images,
      specs: car.specs,
      description: car.description,
      offer: car.offer ?? { daily: null, monthly: null },
    }
  }

  const resolved = resolveCarForBranch(car, branchId)
  const profile = getBranchProfile(car, branchId)
  const offer =
    profile?.offer !== undefined
      ? (mergeBranchOffers(car.offer, profile.offer) ?? { daily: null, monthly: null })
      : normalizeCarOffers(car.offer)

  return {
    name: resolved.name,
    brand: resolved.brand,
    model: resolved.model,
    year: resolved.year,
    category: resolved.category,
    car_class: resolved.car_class,
    price_per_day: resolved.price_per_day,
    price_per_month: resolved.price_per_month,
    image_url: resolved.image_url,
    images: resolved.images,
    specs: resolved.specs,
    description: resolved.description,
    offer,
  }
}

function profileFromFormData(data: CarFormData): BranchCarProfile {
  return {
    name: data.name.trim(),
    brand: data.brand.trim(),
    model: data.model.trim(),
    year: data.year,
    category: data.category,
    car_class: data.car_class,
    price_per_day: data.price_per_day,
    price_per_month: data.price_per_month,
    image_url: data.image_url,
    images: data.images,
    specs: data.specs,
    description: data.description.trim(),
    offer: data.offer,
  }
}

export function buildCarBranchProfilePatch(
  car: Car,
  branchId: string,
  data: CarFormData,
): Pick<Car, 'branch_profiles' | 'branch_names' | 'branch_prices' | 'branch_offers'> {
  const key = normalizeBranchIdForStorage(branchId)
  const profiles = { ...normalizeBranchProfiles(car.branch_profiles) }
  profiles[key] = profileFromFormData(data)

  const names = { ...normalizeBranchNames(car.branch_names) }
  delete names[key]
  const prices = { ...normalizeBranchPrices(car.branch_prices) }
  delete prices[key]
  const offers: CarBranchOffers = {}
  for (const [entryKey, value] of Object.entries(car.branch_offers ?? {})) {
    if (normalizeBranchIdForStorage(entryKey) !== key) {
      offers[normalizeBranchIdForStorage(entryKey)] = value
    }
  }

  return {
    branch_profiles: profiles,
    branch_names: names,
    branch_prices: prices,
    branch_offers: offers,
  }
}
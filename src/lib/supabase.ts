import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { ADMIN_EMAIL, SUPABASE_ADMIN_PASSWORD } from './admin'
import { DEMO_CARS } from './constants'
import { DEMO_BRANCHES } from './branchesData'
import { DEMO_FEATURED_OFFERS } from './featuredOffersData'
import { formatError } from './errors'
import { isDataImageUrl, isPersistedImageUrl } from './imageUrl'
import { getSupabaseEnv } from './env'
import { carMatchesBranch } from './branchFilter'
import { canBookCar, isBlockingStatus } from './availability'
import type {
  Booking,
  BookingBlock,
  BookingFormData,
  BookingStatus,
  Car,
  CarFormData,
  CreateBookingMeta,
  BranchFormData,
  BranchRecord,
  FeaturedOffer,
  FeaturedOfferFormData,
} from './types'
import { normalizeCarOffers, sanitizeCarOffers } from './offers'
import { calcBookingTotal, defaultMonthlyPrice } from './pricing'
import { calcDays } from './utils'
import type { RentalPeriodType } from './types'

function normalizeCar(car: Car): Car {
  const branch_ids = Array.isArray(car.branch_ids) ? car.branch_ids : []
  const price_per_month = car.price_per_month ?? defaultMonthlyPrice(car.price_per_day)
  const car_class = car.car_class ?? 'mid'
  const offer = sanitizeCarOffers(normalizeCarOffers(car.offer))
  return { ...car, offer, branch_ids, price_per_month, car_class }
}

function prepareCarForm(form: CarFormData): CarFormData {
  return {
    ...form,
    offer: sanitizeCarOffers(form.offer),
    branch_ids: form.branch_ids ?? [],
  }
}

function prepareCarPatch(form: Partial<CarFormData>): Partial<CarFormData> {
  const patch = { ...form }
  if (form.offer !== undefined) {
    patch.offer = sanitizeCarOffers(form.offer)
  }
  if (form.branch_ids !== undefined) {
    patch.branch_ids = form.branch_ids ?? []
  }
  return patch
}

function formatSupabaseMutationError(error: { code?: string; message?: string }): string {
  if (
    error.code === 'PGRST116' ||
    error.message?.includes('single JSON object')
  ) {
    return 'فشل حفظ التعديل — سجّل الخروج من الإدارة ثم ادخل من جديد'
  }
  return formatError(error)
}

const { url: supabaseUrl, anonKey: supabaseAnonKey, isValid } = getSupabaseEnv()

export const isSupabaseConfigured = isValid

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

const CARS_TABLE = 'cars'
const BOOKINGS_TABLE = 'bookings'
const OFFERS_TABLE = 'featured_offers'
const BRANCHES_TABLE = 'branches'
const STORAGE_BUCKET = 'car-images'

const DEMO_BOOKINGS_KEY = 'alkhoder_demo_bookings'
const DEMO_CARS_KEY = 'alkhoder_demo_cars'
const DEMO_CARS_VERSION_KEY = 'alkhoder_demo_cars_version'
const DEMO_CARS_VERSION = '7'
const DEMO_OFFERS_KEY = 'alkhoder_demo_offers'
const DEMO_OFFERS_VERSION_KEY = 'alkhoder_demo_offers_version'
const DEMO_OFFERS_VERSION = '2'
const DEMO_BRANCHES_KEY = 'alkhoder_demo_branches'
const DEMO_BRANCHES_VERSION_KEY = 'alkhoder_demo_branches_version'
const DEMO_BRANCHES_VERSION = '1'

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase غير مُعد. أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env',
    )
  }
  return supabase
}

function getDemoCars(): Car[] {
  const version = localStorage.getItem(DEMO_CARS_VERSION_KEY)
  if (version !== DEMO_CARS_VERSION) {
    localStorage.setItem(DEMO_CARS_VERSION_KEY, DEMO_CARS_VERSION)
    saveDemoCars(DEMO_CARS.map(normalizeCar))
    return DEMO_CARS.map(normalizeCar)
  }

  const stored = localStorage.getItem(DEMO_CARS_KEY)
  if (stored) {
    try {
      return (JSON.parse(stored) as Car[]).map(normalizeCar)
    } catch {
      /* ignore */
    }
  }
  return DEMO_CARS.map(normalizeCar)
}

function saveDemoCars(cars: Car[]) {
  localStorage.setItem(DEMO_CARS_KEY, JSON.stringify(cars))
}

function getDemoBookings(): Booking[] {
  const stored = localStorage.getItem(DEMO_BOOKINGS_KEY)
  if (stored) {
    try {
      return (JSON.parse(stored) as Booking[]).map(normalizeBooking)
    } catch {
      /* ignore */
    }
  }
  return []
}

function saveDemoBookings(bookings: Booking[]) {
  localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings))
}

function bookingForCache(booking: Booking): Booking {
  const { car: _car, ...rest } = booking
  return normalizeBooking(rest)
}

function cacheBooking(booking: Booking) {
  const cached = getDemoBookings()
  const idx = cached.findIndex((b) => b.id === booking.id)
  const entry = bookingForCache(booking)
  if (idx >= 0) cached[idx] = entry
  else cached.unshift(entry)
  saveDemoBookings(cached)
}

function removeCachedBooking(id: string) {
  saveDemoBookings(getDemoBookings().filter((b) => b.id !== id))
}

async function bookingsWithCars(bookings: Booking[]): Promise<Booking[]> {
  const cars = await fetchCars()
  return bookings.map((b) => ({
    ...normalizeBooking(b),
    car: b.car ?? cars.find((c) => c.id === b.car_id),
  }))
}

function normalizeFeaturedOffer(offer: FeaturedOffer): FeaturedOffer {
  return {
    ...offer,
    original_price: offer.original_price ?? null,
    car_id: offer.car_id ?? null,
    link_url: offer.link_url ?? null,
    valid_until: offer.valid_until ?? null,
  }
}

function getDemoOffers(): FeaturedOffer[] {
  const version = localStorage.getItem(DEMO_OFFERS_VERSION_KEY)
  if (version !== DEMO_OFFERS_VERSION) {
    localStorage.setItem(DEMO_OFFERS_VERSION_KEY, DEMO_OFFERS_VERSION)
    saveDemoOffers(DEMO_FEATURED_OFFERS.map(normalizeFeaturedOffer))
    return DEMO_FEATURED_OFFERS.map(normalizeFeaturedOffer)
  }

  const stored = localStorage.getItem(DEMO_OFFERS_KEY)
  if (stored) {
    try {
      return (JSON.parse(stored) as FeaturedOffer[]).map(normalizeFeaturedOffer)
    } catch {
      /* ignore */
    }
  }
  return DEMO_FEATURED_OFFERS.map(normalizeFeaturedOffer)
}

function saveDemoOffers(offers: FeaturedOffer[]) {
  localStorage.setItem(DEMO_OFFERS_KEY, JSON.stringify(offers))
}

function prepareOfferForm(form: FeaturedOfferFormData) {
  return {
    ...form,
    original_price: form.original_price && form.original_price > 0 ? form.original_price : null,
    car_id: form.car_id || null,
    link_url: form.link_url.trim() || null,
    valid_until: form.valid_until || null,
    badge_text: form.badge_text.trim(),
  }
}

// ─── Cars ────────────────────────────────────────────────────

export interface FetchCarsOptions {
  availableOnly?: boolean
  featuredOnly?: boolean
}

export async function fetchCars(options: FetchCarsOptions = {}): Promise<Car[]> {
  const { availableOnly = false, featuredOnly = false } = options

  if (!isSupabaseConfigured) {
    let cars = getDemoCars()
    if (availableOnly) cars = cars.filter((c) => c.is_available)
    if (featuredOnly) cars = cars.filter((c) => c.is_featured)
    return cars.map(normalizeCar)
  }

  const client = requireSupabase()
  let query = client.from(CARS_TABLE).select('*')
  if (availableOnly) query = query.eq('is_available', true)
  if (featuredOnly) query = query.eq('is_featured', true)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(formatError(error))
  return ((data as Car[]) ?? []).map(normalizeCar)
}

export async function fetchCarById(id: string): Promise<Car | null> {
  if (!isSupabaseConfigured) {
    const car = getDemoCars().find((c) => c.id === id)
    return car ? normalizeCar(car) : null
  }

  const client = requireSupabase()
  const { data, error } = await client.from(CARS_TABLE).select('*').eq('id', id).single()
  if (error) throw new Error(formatError(error))
  return normalizeCar(data as Car)
}

export async function createCar(form: CarFormData): Promise<Car> {
  const data = prepareCarForm(form)
  if (!isSupabaseConfigured) {
    const car: Car = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const cars = getDemoCars()
    cars.unshift(car)
    saveDemoCars(cars)
    return car
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { data: row, error } = await client.from(CARS_TABLE).insert(data).select().single()
  if (error) throw new Error(formatSupabaseMutationError(error))
  return normalizeCar(row as Car)
}

export async function updateCar(id: string, form: Partial<CarFormData>): Promise<Car> {
  const patch = prepareCarPatch(form)
  if (!isSupabaseConfigured) {
    const cars = getDemoCars()
    const idx = cars.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('السيارة غير موجودة')
    cars[idx] = { ...cars[idx], ...patch, updated_at: new Date().toISOString() }
    saveDemoCars(cars)
    return cars[idx]
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { data: row, error } = await client
    .from(CARS_TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(formatSupabaseMutationError(error))
  return normalizeCar(row as Car)
}

export async function deleteCar(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const cars = getDemoCars().filter((c) => c.id !== id)
    saveDemoCars(cars)
    return
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { error } = await client.from(CARS_TABLE).delete().eq('id', id)
  if (error) throw new Error(formatError(error))
}

export async function uploadCarImage(file: File, folder = 'cars'): Promise<string> {
  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await client.storage.from(STORAGE_BUCKET).upload(fileName, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: '31536000',
  })

  if (error) {
    throw new Error(
      `فشل رفع الصورة على السيرفر — تأكد من إعداد Supabase Storage. ${formatError(error)}`,
    )
  }

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

// ─── Availability ────────────────────────────────────────────

function toBookingBlocks(rows: Booking[]): BookingBlock[] {
  return rows
    .filter((b) => isBlockingStatus(b.status))
    .map((b) => ({
      id: b.id,
      car_id: b.car_id,
      start_date: b.start_date,
      end_date: b.end_date,
      status: b.status,
    }))
}

export async function fetchBookingBlocks(carId?: string): Promise<BookingBlock[]> {
  if (!isSupabaseConfigured) {
    let bookings = getDemoBookings()
    if (carId) bookings = bookings.filter((b) => b.car_id === carId)
    return toBookingBlocks(bookings)
  }

  const client = requireSupabase()
  const { data, error } = await client.rpc('get_booking_blocks', {
    p_car_id: carId ?? null,
  })

  if (error) {
    // fallback إذا الدالة غير منشأة بعد
    let query = client
      .from(BOOKINGS_TABLE)
      .select('id, car_id, start_date, end_date, status')
      .in('status', ['pending', 'confirmed'])
    if (carId) query = query.eq('car_id', carId)
    const { data: rows, error: qErr } = await query
    if (qErr) throw new Error(formatError(qErr))
    return (rows as BookingBlock[]) ?? []
  }

  return ((data as BookingBlock[]) ?? []).map((b) => ({
    id: b.id,
    car_id: b.car_id,
    start_date: b.start_date,
    end_date: b.end_date,
    status: b.status,
  }))
}

// ─── Bookings ────────────────────────────────────────────────

function normalizeBooking(booking: Booking): Booking {
  return {
    ...booking,
    rental_type: booking.rental_type ?? 'daily',
    pickup_time: booking.pickup_time ?? null,
    promo_offer_id: booking.promo_offer_id ?? null,
    promo_title: booking.promo_title ?? null,
    branch_id: booking.branch_id ?? null,
    branch_name: booking.branch_name ?? null,
    branch_city: booking.branch_city ?? null,
    branch_phone: booking.branch_phone ?? null,
  }
}

export async function createBooking(
  carId: string,
  form: BookingFormData,
  unitPrice: number,
  meta: CreateBookingMeta = {},
): Promise<Booking> {
  const car = await fetchCarById(carId)
  if (!car) throw new Error('السيارة غير موجودة')

  if (meta.branchId && !carMatchesBranch(car, meta.branchId)) {
    throw new Error('هذه السيارة غير متاحة في الفرع المحدد')
  }

  const blocks = await fetchBookingBlocks(carId)
  const check = canBookCar(car, blocks, form.start_date, form.end_date)
  if (!check.ok) throw new Error(check.message ?? 'السيارة غير متاحة في هذه الفترة')

  const rentalType: RentalPeriodType = meta.rentalType ?? 'daily'
  const totalDays = calcDays(form.start_date, form.end_date)
  const totalPrice = calcBookingTotal(unitPrice, form.start_date, form.end_date, rentalType)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const booking: Booking = normalizeBooking({
    id,
    car_id: carId,
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    customer_email: form.customer_email || null,
    customer_id_number: form.customer_id_number || null,
    start_date: form.start_date,
    end_date: form.end_date,
    total_days: totalDays,
    rental_type: rentalType,
    price_per_day: unitPrice,
    total_price: totalPrice,
    status: 'pending',
    pickup_time: form.pickup_time || null,
    promo_offer_id: meta.promoOfferId ?? null,
    promo_title: meta.promoTitle ?? null,
    branch_id: meta.branchId ?? null,
    branch_name: meta.branchName ?? null,
    branch_city: meta.branchCity ?? null,
    branch_phone: meta.branchPhone ?? null,
    notes: form.notes || null,
    created_at: now,
    updated_at: now,
  })

  if (!isSupabaseConfigured) {
    const bookings = getDemoBookings()
    bookings.unshift(booking)
    saveDemoBookings(bookings)
    return booking
  }

  const client = requireSupabase()
  const { error } = await client.from(BOOKINGS_TABLE).insert({
    id,
    car_id: carId,
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    customer_email: form.customer_email || null,
    customer_id_number: form.customer_id_number || null,
    start_date: form.start_date,
    end_date: form.end_date,
    total_days: totalDays,
    rental_type: rentalType,
    price_per_day: unitPrice,
    total_price: totalPrice,
    status: 'pending',
    pickup_time: form.pickup_time || null,
    promo_offer_id: meta.promoOfferId ?? null,
    promo_title: meta.promoTitle ?? null,
    branch_id: meta.branchId ?? null,
    branch_name: meta.branchName ?? null,
    branch_city: meta.branchCity ?? null,
    notes: form.notes || null,
  })

  if (error) throw new Error(formatError(error))
  cacheBooking(booking)
  return booking
}

export async function fetchBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured) {
    return bookingsWithCars(getDemoBookings())
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { data, error } = await client
    .from(BOOKINGS_TABLE)
    .select('*, car:cars(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(formatError(error))

  const bookings = ((data as Booking[]) ?? []).map(normalizeBooking)
  if (bookings.length > 0) {
    saveDemoBookings(bookings.map(bookingForCache))
  }
  return bookings
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  if (!isSupabaseConfigured) {
    const bookings = getDemoBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('الحجز غير موجود')
    bookings[idx] = { ...bookings[idx], status, updated_at: new Date().toISOString() }
    saveDemoBookings(bookings)
    const cars = getDemoCars()
    return { ...bookings[idx], car: cars.find((c) => c.id === bookings[idx].car_id) }
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { data, error } = await client
    .from(BOOKINGS_TABLE)
    .update({ status })
    .eq('id', id)
    .select('*, car:cars(*)')
    .single()

  if (error) {
    const bookings = getDemoBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error(formatError(error))
    bookings[idx] = { ...bookings[idx], status, updated_at: new Date().toISOString() }
    saveDemoBookings(bookings)
    return bookingsWithCars([bookings[idx]]).then((rows) => rows[0])
  }

  const updated = normalizeBooking(data as Booking)
  cacheBooking(updated)
  return updated
}

export async function deleteBooking(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    removeCachedBooking(id)
    return
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { error } = await client.from(BOOKINGS_TABLE).delete().eq('id', id)
  if (error) throw new Error(formatError(error))
  removeCachedBooking(id)
}

// ─── Featured Offers ─────────────────────────────────────────

export interface FetchFeaturedOffersOptions {
  activeOnly?: boolean
  featuredOnly?: boolean
  includeCars?: boolean
}

export async function fetchFeaturedOffers(
  options: FetchFeaturedOffersOptions = {},
): Promise<FeaturedOffer[]> {
  const { activeOnly = false, featuredOnly = false, includeCars = false } = options

  if (!isSupabaseConfigured) {
    let offers = getDemoOffers()
    if (activeOnly) offers = offers.filter((o) => o.is_active)
    if (featuredOnly) offers = offers.filter((o) => o.is_featured)
    if (includeCars) {
      const cars = getDemoCars()
      offers = offers.map((o) => ({
        ...o,
        car: o.car_id ? cars.find((c) => c.id === o.car_id) : undefined,
      }))
    }
    return offers.sort((a, b) => a.sort_order - b.sort_order)
  }

  const client = requireSupabase()

  if (includeCars) {
    let query = client.from(OFFERS_TABLE).select('*, car:cars(*)')
    if (activeOnly) query = query.eq('is_active', true)
    if (featuredOnly) query = query.eq('is_featured', true)
    const { data, error } = await query.order('sort_order', { ascending: true })
    if (error) throw new Error(formatError(error))
    return ((data as unknown as FeaturedOffer[]) ?? []).map(normalizeFeaturedOffer)
  }

  let query = client.from(OFFERS_TABLE).select('*')
  if (activeOnly) query = query.eq('is_active', true)
  if (featuredOnly) query = query.eq('is_featured', true)
  const { data, error } = await query.order('sort_order', { ascending: true })
  if (error) throw new Error(formatError(error))
  return ((data as FeaturedOffer[]) ?? []).map(normalizeFeaturedOffer)
}

export async function fetchFeaturedOfferById(id: string): Promise<FeaturedOffer | null> {
  if (!isSupabaseConfigured) {
    const offer = getDemoOffers().find((o) => o.id === id)
    if (!offer) return null
    const cars = getDemoCars()
    return { ...offer, car: offer.car_id ? cars.find((c) => c.id === offer.car_id) : undefined }
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from(OFFERS_TABLE)
    .select('*, car:cars(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(formatError(error))
  return normalizeFeaturedOffer(data as FeaturedOffer)
}

export async function createFeaturedOffer(form: FeaturedOfferFormData): Promise<FeaturedOffer> {
  const data = prepareOfferForm(form)
  const now = new Date().toISOString()

  if (!isSupabaseConfigured) {
    const offer: FeaturedOffer = {
      id: crypto.randomUUID(),
      ...data,
      created_at: now,
      updated_at: now,
    }
    const offers = getDemoOffers()
    offers.push(offer)
    saveDemoOffers(offers)
    return offer
  }

  const client = requireSupabase()
  const { data: row, error } = await client.from(OFFERS_TABLE).insert(data).select().single()
  if (error) throw new Error(formatError(error))
  return normalizeFeaturedOffer(row as FeaturedOffer)
}

export async function updateFeaturedOffer(
  id: string,
  form: Partial<FeaturedOfferFormData>,
): Promise<FeaturedOffer> {
  const patch: Record<string, unknown> = { ...form }
  if (form.car_id !== undefined) patch.car_id = form.car_id || null
  if (form.link_url !== undefined) patch.link_url = form.link_url.trim() || null
  if (form.valid_until !== undefined) patch.valid_until = form.valid_until || null
  if (form.original_price !== undefined) {
    patch.original_price =
      form.original_price && form.original_price > 0 ? form.original_price : null
  }
  if (form.badge_text !== undefined) patch.badge_text = form.badge_text.trim()

  if (!isSupabaseConfigured) {
    const offers = getDemoOffers()
    const idx = offers.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error('العرض غير موجود')
    offers[idx] = {
      ...offers[idx],
      ...(patch as Partial<FeaturedOffer>),
      updated_at: new Date().toISOString(),
    }
    saveDemoOffers(offers)
    return offers[idx]
  }

  const client = requireSupabase()
  const { data: row, error } = await client
    .from(OFFERS_TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(formatError(error))
  return normalizeFeaturedOffer(row as FeaturedOffer)
}

export async function deleteFeaturedOffer(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    saveDemoOffers(getDemoOffers().filter((o) => o.id !== id))
    return
  }

  const client = requireSupabase()
  const { error } = await client.from(OFFERS_TABLE).delete().eq('id', id)
  if (error) throw new Error(formatError(error))
}

// ─── Branches ────────────────────────────────────────────────

function normalizeBranch(branch: BranchRecord): BranchRecord {
  return {
    ...branch,
    phone: branch.phone ?? null,
    image_url: branch.image_url ?? null,
    map_url: branch.map_url || '#',
  }
}

function getDemoBranches(): BranchRecord[] {
  const version = localStorage.getItem(DEMO_BRANCHES_VERSION_KEY)
  if (version !== DEMO_BRANCHES_VERSION) {
    localStorage.setItem(DEMO_BRANCHES_VERSION_KEY, DEMO_BRANCHES_VERSION)
    saveDemoBranches(DEMO_BRANCHES.map(normalizeBranch))
    return DEMO_BRANCHES.map(normalizeBranch)
  }

  const stored = localStorage.getItem(DEMO_BRANCHES_KEY)
  if (stored) {
    try {
      return (JSON.parse(stored) as BranchRecord[]).map(normalizeBranch)
    } catch {
      /* ignore */
    }
  }
  return DEMO_BRANCHES.map(normalizeBranch)
}

function saveDemoBranches(branches: BranchRecord[]) {
  localStorage.setItem(DEMO_BRANCHES_KEY, JSON.stringify(branches))
}

function prepareBranchForm(form: BranchFormData) {
  const imageUrl = form.image_url.trim() || null

  if (imageUrl && isDataImageUrl(imageUrl)) {
    throw new Error(
      'صورة الفرع لم تُرفع على السيرفر — ارفعها من جديد. تأكد من إعداد Supabase على Vercel.',
    )
  }

  if (imageUrl && isSupabaseConfigured && !isPersistedImageUrl(imageUrl)) {
    throw new Error('رابط صورة الفرع غير صالح — ارفع الصورة من جديد')
  }

  return {
    name: form.name.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    phone: form.phone.trim() || null,
    hours: form.hours.trim(),
    map_url: form.map_url.trim() || '#',
    image_url: imageUrl,
    is_main: form.is_main,
    is_active: form.is_active,
    sort_order: form.sort_order,
  }
}

function unsetOtherMainBranches(branches: BranchRecord[], mainId: string): BranchRecord[] {
  return branches.map((b) => (b.id !== mainId && b.is_main ? { ...b, is_main: false } : b))
}

export interface FetchBranchesOptions {
  activeOnly?: boolean
}

export async function fetchBranches(
  options: FetchBranchesOptions = {},
): Promise<BranchRecord[]> {
  const { activeOnly = true } = options

  if (!isSupabaseConfigured) {
    let branches = getDemoBranches()
    if (activeOnly) branches = branches.filter((b) => b.is_active)
    return branches.sort((a, b) => a.sort_order - b.sort_order)
  }

  if (!activeOnly) {
    await requireSupabaseAdminAuth()
  }

  const client = requireSupabase()
  let query = client.from(BRANCHES_TABLE).select('*')
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query.order('sort_order', { ascending: true })
  if (error) throw new Error(formatError(error))
  return ((data as BranchRecord[]) ?? []).map(normalizeBranch)
}

export async function fetchBranchById(id: string): Promise<BranchRecord | null> {
  if (!isSupabaseConfigured) {
    return getDemoBranches().find((b) => b.id === id) ?? null
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { data, error } = await client.from(BRANCHES_TABLE).select('*').eq('id', id).single()
  if (error) return null
  return normalizeBranch(data as BranchRecord)
}

export async function createBranch(form: BranchFormData): Promise<BranchRecord> {
  const data = prepareBranchForm(form)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  if (!isSupabaseConfigured) {
    let branches = getDemoBranches()
    const branch: BranchRecord = { id, ...data, created_at: now, updated_at: now }
    if (branch.is_main) branches = unsetOtherMainBranches(branches, id)
    branches.push(branch)
    saveDemoBranches(branches)
    return branch
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  if (data.is_main) {
    await client.from(BRANCHES_TABLE).update({ is_main: false }).eq('is_main', true)
  }

  const { data: row, error } = await client
    .from(BRANCHES_TABLE)
    .insert({ id, ...data })
    .select()
    .single()
  if (error) throw new Error(formatError(error))
  return normalizeBranch(row as BranchRecord)
}

export async function updateBranch(
  id: string,
  form: Partial<BranchFormData>,
): Promise<BranchRecord> {
  const patch: Record<string, unknown> = { ...form }
  if (form.name !== undefined) patch.name = form.name.trim()
  if (form.address !== undefined) patch.address = form.address.trim()
  if (form.city !== undefined) patch.city = form.city.trim()
  if (form.phone !== undefined) patch.phone = form.phone.trim() || null
  if (form.hours !== undefined) patch.hours = form.hours.trim()
  if (form.map_url !== undefined) patch.map_url = form.map_url.trim() || '#'
  if (form.image_url !== undefined) patch.image_url = form.image_url.trim() || null

  if (!isSupabaseConfigured) {
    const branches = getDemoBranches()
    const idx = branches.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('الفرع غير موجود')
    let next = unsetOtherMainBranches(branches, id)
    const updated = {
      ...next[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    } as BranchRecord
    next[idx] = updated
    saveDemoBranches(next)
    return updated
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  if (form.is_main) {
    await client.from(BRANCHES_TABLE).update({ is_main: false }).eq('is_main', true)
  }

  const { data: row, error } = await client
    .from(BRANCHES_TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(formatError(error))
  return normalizeBranch(row as BranchRecord)
}

export async function deleteBranch(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    saveDemoBranches(getDemoBranches().filter((b) => b.id !== id))
    return
  }

  await requireSupabaseAdminAuth()

  const client = requireSupabase()
  const { error } = await client.from(BRANCHES_TABLE).delete().eq('id', id)
  if (error) throw new Error(formatError(error))
}

// ─── Auth ────────────────────────────────────────────────────

export async function signInAdmin(email: string, password: string) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(formatError(error))
  return data
}

/** محاولة تسجيل دخول Supabase للأدمن — مطلوب لتعديل السيارات والحجوزات */
export async function ensureSupabaseAdminAuth(
  email: string = ADMIN_EMAIL,
  password: string = SUPABASE_ADMIN_PASSWORD,
): Promise<boolean> {
  if (!supabase) return false

  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) return true

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (!signInError) return true

  const { error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) {
    console.warn('Supabase admin auth:', signUpError.message)
    return false
  }

  const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
  return !retryError
}

/** يضمن جلسة Supabase للأدمن — يرمي خطأ واضح إذا فشل */
export async function requireSupabaseAdminAuth(): Promise<void> {
  const ok = await ensureSupabaseAdminAuth()
  if (!ok) {
    throw new Error('فشل الاتصال بقاعدة البيانات — سجّل الخروج من الإدارة ثم ادخل من جديد')
  }
}

export async function signOutAdmin() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(formatError(error))
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}
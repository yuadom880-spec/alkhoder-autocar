export type CarCategory =
  | 'sedan'
  | 'crossover'
  | 'suv'
  | 'family'
  | 'pickup'
  | 'van'
  | 'sports'
  | 'luxury'

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'

export type OfferDiscountType = 'percent' | 'fixed' | 'custom_price'

export type RentalPeriodType = 'daily' | 'monthly'

export interface CarOffer {
  active: boolean
  title: string
  badge_text: string
  discount_type: OfferDiscountType
  discount_value: number
  valid_until: string | null
  description: string
}

export interface CarSpecs {
  transmission: string
  fuel: string
  seats: number
  doors: number
  ac: boolean
}

export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: CarCategory
  price_per_day: number
  price_per_month: number
  image_url: string
  images: string[]
  specs: CarSpecs
  description: string
  is_available: boolean
  is_featured: boolean
  offer: CarOffer | null
  /** فروع توفر السيارة — فارغ = كل الفروع */
  branch_ids: string[]
  created_at: string
  updated_at: string
}

export interface CarFormData {
  name: string
  brand: string
  model: string
  year: number
  category: CarCategory
  price_per_day: number
  price_per_month: number
  image_url: string
  images: string[]
  specs: CarSpecs
  description: string
  is_available: boolean
  is_featured: boolean
  offer: CarOffer | null
  branch_ids: string[]
}

export interface Booking {
  id: string
  car_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_id_number: string | null
  start_date: string
  end_date: string
  total_days: number
  rental_type: RentalPeriodType
  price_per_day: number
  total_price: number
  status: BookingStatus
  pickup_time: string | null
  promo_offer_id: string | null
  promo_title: string | null
  branch_id: string | null
  branch_name: string | null
  branch_city: string | null
  branch_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  car?: Car
}

export interface BookingFormData {
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_id_number: string
  start_date: string
  end_date: string
  pickup_time: string
  notes: string
}

export interface CreateBookingMeta {
  promoOfferId?: string | null
  promoTitle?: string | null
  branchId?: string | null
  branchName?: string | null
  branchCity?: string | null
  branchPhone?: string | null
  rentalType?: RentalPeriodType
}

/** فترة حجز بدون بيانات العميل — للتحقق من التوفر */
export interface BookingBlock {
  id?: string
  car_id: string
  start_date: string
  end_date: string
  status: BookingStatus
}

export type AvailabilityReason = 'available' | 'admin_disabled' | 'booked'

export interface CarAvailability {
  available: boolean
  reason: AvailabilityReason
  conflicts?: BookingBlock[]
  confirmedOnly?: boolean
  hasPending?: boolean
}

export interface FeaturedOffer {
  id: string
  title: string
  description: string
  rental_type: RentalPeriodType
  image_url: string
  badge_text: string
  price: number
  original_price: number | null
  car_id: string | null
  link_url: string | null
  is_active: boolean
  is_featured: boolean
  valid_until: string | null
  sort_order: number
  created_at: string
  updated_at: string
  car?: Car
}

export interface BranchRecord {
  id: string
  name: string
  address: string
  city: string
  phone: string | null
  hours: string
  map_url: string
  image_url: string | null
  is_main: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BranchFormData {
  name: string
  address: string
  city: string
  phone: string
  hours: string
  map_url: string
  image_url: string
  is_main: boolean
  is_active: boolean
  sort_order: number
}

export interface FeaturedOfferFormData {
  title: string
  description: string
  rental_type: RentalPeriodType
  image_url: string
  badge_text: string
  price: number
  original_price: number | null
  car_id: string | null
  link_url: string
  is_active: boolean
  is_featured: boolean
  valid_until: string
  sort_order: number
}
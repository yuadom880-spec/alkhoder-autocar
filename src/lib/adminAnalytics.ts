import { carMatchesBranch } from './branchFilter'
import { hasMonthlyFeaturedOffer } from './offers'
import type { Booking, BranchRecord, Car } from './types'

export interface AdminDashboardStats {
  branchesTotal: number
  branchesActive: number
  carsTotal: number
  carsAvailable: number
  carsUnavailable: number
  offersTotal: number
  offersActive: number
  bookingsTotal: number
  bookingsPending: number
  bookingsConfirmed: number
  bookingsCompleted: number
  bookingsToday: number
  revenueConfirmed: number
  revenueCompleted: number
  revenuePending: number
}

export interface BranchPerformanceRow {
  branchId: string
  branchName: string
  city: string
  isActive: boolean
  isMain: boolean
  carsCount: number
  bookingsTotal: number
  bookingsPending: number
  revenue: number
}

const REVENUE_STATUSES = new Set<Booking['status']>(['confirmed', 'completed'])

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function sumRevenue(bookings: Booking[]): number {
  return bookings
    .filter((b) => REVENUE_STATUSES.has(b.status))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)
}

export function computeAdminDashboardStats(
  branches: BranchRecord[],
  cars: Car[],
  bookings: Booking[],
): AdminDashboardStats {
  const pending = bookings.filter((b) => b.status === 'pending')
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed')

  return {
    branchesTotal: branches.length,
    branchesActive: branches.filter((b) => b.is_active).length,
    carsTotal: cars.length,
    carsAvailable: cars.filter((c) => c.is_available).length,
    carsUnavailable: cars.filter((c) => !c.is_available).length,
    offersTotal: cars.filter((c) => hasMonthlyFeaturedOffer(c, null)).length,
    offersActive: cars.filter((c) => hasMonthlyFeaturedOffer(c, null)).length,
    bookingsTotal: bookings.length,
    bookingsPending: pending.length,
    bookingsConfirmed: confirmed.length,
    bookingsCompleted: completed.length,
    bookingsToday: bookings.filter((b) => isToday(b.created_at)).length,
    revenueConfirmed: sumRevenue(confirmed),
    revenueCompleted: sumRevenue(completed),
    revenuePending: pending.reduce((sum, b) => sum + (b.total_price ?? 0), 0),
  }
}

export function computeBranchPerformance(
  branches: BranchRecord[],
  cars: Car[],
  bookings: Booking[],
): BranchPerformanceRow[] {
  return branches
    .map((branch) => {
      const branchBookings = bookings.filter((b) => b.branch_id === branch.id)
      const pending = branchBookings.filter((b) => b.status === 'pending')
      return {
        branchId: branch.id,
        branchName: branch.name,
        city: branch.city,
        isActive: branch.is_active,
        isMain: branch.is_main,
        carsCount: cars.filter((c) => carMatchesBranch(c, branch.id)).length,
        bookingsTotal: branchBookings.length,
        bookingsPending: pending.length,
        revenue: sumRevenue(branchBookings),
      }
    })
    .sort((a, b) => b.bookingsPending - a.bookingsPending || b.bookingsTotal - a.bookingsTotal)
}

export function exportBookingsCsv(bookings: Booking[]): void {
  const headers = [
    'الزبون',
    'الجوال',
    'الإيميل',
    'السيارة',
    'الفرع',
    'من',
    'إلى',
    'الأيام',
    'المبلغ',
    'الحالة',
    'تاريخ الطلب',
  ]

  const rows = bookings.map((b) => [
    b.customer_name,
    b.customer_phone,
    b.customer_email ?? '',
    b.car?.name ?? '',
    b.branch_name ?? '',
    b.start_date,
    b.end_date,
    String(b.total_days),
    String(b.total_price),
    b.status,
    b.created_at,
  ])

  downloadCsv(`alkhedr-bookings-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export type RevenuePeriod = 'all' | 'today' | 'week' | 'month' | 'year'

export interface RevenueSummary {
  earned: number
  confirmed: number
  completed: number
  pending: number
  cancelled: number
  rejected: number
  bookingsEarned: number
  bookingsPending: number
  bookingsCancelled: number
  averageTicket: number
  dailyShare: number
  monthlyShare: number
  dailyCount: number
  monthlyCount: number
}

export interface RevenueByBranchRow {
  branchId: string
  branchName: string
  city: string
  earned: number
  pending: number
  bookingsEarned: number
  bookingsTotal: number
}

export interface RevenueByCarRow {
  carId: string
  carName: string
  earned: number
  bookings: number
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function filterBookingsByPeriod(
  bookings: Booking[],
  period: RevenuePeriod,
): Booking[] {
  if (period === 'all') return bookings
  const now = new Date()
  const start = startOfDay(now)

  if (period === 'today') {
    return bookings.filter((b) => new Date(b.created_at) >= start)
  }
  if (period === 'week') {
    const week = new Date(start)
    week.setDate(week.getDate() - 6)
    return bookings.filter((b) => new Date(b.created_at) >= week)
  }
  if (period === 'month') {
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
    return bookings.filter((b) => new Date(b.created_at) >= month)
  }
  const year = new Date(now.getFullYear(), 0, 1)
  return bookings.filter((b) => new Date(b.created_at) >= year)
}

export function computeRevenueSummary(bookings: Booking[]): RevenueSummary {
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed')
  const pending = bookings.filter((b) => b.status === 'pending')
  const cancelled = bookings.filter((b) => b.status === 'cancelled')
  const rejected = bookings.filter((b) => b.status === 'rejected')
  const earnedList = [...confirmed, ...completed]
  const earned = sumRevenue(earnedList)
  const daily = earnedList.filter((b) => b.rental_type !== 'monthly')
  const monthly = earnedList.filter((b) => b.rental_type === 'monthly')

  return {
    earned,
    confirmed: sumRevenue(confirmed),
    completed: sumRevenue(completed),
    pending: pending.reduce((s, b) => s + (b.total_price ?? 0), 0),
    cancelled: cancelled.reduce((s, b) => s + (b.total_price ?? 0), 0),
    rejected: rejected.reduce((s, b) => s + (b.total_price ?? 0), 0),
    bookingsEarned: earnedList.length,
    bookingsPending: pending.length,
    bookingsCancelled: cancelled.length,
    averageTicket: earnedList.length ? earned / earnedList.length : 0,
    dailyShare: sumRevenue(daily),
    monthlyShare: sumRevenue(monthly),
    dailyCount: daily.length,
    monthlyCount: monthly.length,
  }
}

export function computeRevenueByBranch(
  branches: BranchRecord[],
  bookings: Booking[],
): RevenueByBranchRow[] {
  return branches
    .map((branch) => {
      const branchBookings = bookings.filter((b) => b.branch_id === branch.id)
      const earnedList = branchBookings.filter((b) => REVENUE_STATUSES.has(b.status))
      const pending = branchBookings.filter((b) => b.status === 'pending')
      return {
        branchId: branch.id,
        branchName: branch.name,
        city: branch.city,
        earned: sumRevenue(earnedList),
        pending: pending.reduce((s, b) => s + (b.total_price ?? 0), 0),
        bookingsEarned: earnedList.length,
        bookingsTotal: branchBookings.length,
      }
    })
    .filter((r) => r.bookingsTotal > 0 || r.earned > 0)
    .sort((a, b) => b.earned - a.earned || b.pending - a.pending)
}

export function computeRevenueByCar(bookings: Booking[], limit = 12): RevenueByCarRow[] {
  const map = new Map<string, RevenueByCarRow>()
  for (const b of bookings) {
    if (!REVENUE_STATUSES.has(b.status)) continue
    const carId = b.car_id
    const carName = b.car?.name ?? 'سيارة'
    const prev = map.get(carId) ?? { carId, carName, earned: 0, bookings: 0 }
    prev.earned += b.total_price ?? 0
    prev.bookings += 1
    prev.carName = carName
    map.set(carId, prev)
  }
  return [...map.values()].sort((a, b) => b.earned - a.earned).slice(0, limit)
}

export function exportRevenueCsv(bookings: Booking[]): void {
  const earned = bookings.filter((b) => REVENUE_STATUSES.has(b.status))
  const headers = [
    'الزبون',
    'الجوال',
    'السيارة',
    'الفرع',
    'نوع الإيجار',
    'من',
    'إلى',
    'المبلغ',
    'الحالة',
    'تاريخ الطلب',
  ]
  const rows = earned.map((b) => [
    b.customer_name,
    b.customer_phone,
    b.car?.name ?? '',
    b.branch_name ?? '',
    b.rental_type === 'monthly' ? 'شهري' : 'يومي',
    b.start_date,
    b.end_date,
    String(b.total_price),
    b.status,
    b.created_at,
  ])
  downloadCsv(`alkhedr-revenue-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
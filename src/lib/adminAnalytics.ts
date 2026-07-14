import { carMatchesBranch } from './branchFilter'
import { isFeaturedOfferActive } from './featuredOffers'
import type { Booking, BranchRecord, Car, FeaturedOffer } from './types'

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
  offers: FeaturedOffer[],
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
    offersTotal: offers.length,
    offersActive: offers.filter((o) => o.is_active && isFeaturedOfferActive(o)).length,
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

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `alkhedr-bookings-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
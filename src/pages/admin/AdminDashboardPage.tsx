import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTableRealtime } from '../../hooks/useTableRealtime'
import { useAdminBranch } from '../../context/AdminBranchContext'
import {
  assertBookingBelongsToBranch,
  filterBookingsByBranch,
  filterCarsByBranch,
} from '../../lib/adminBranchFilters'
import {
  computeAdminDashboardStats,
  computeBranchPerformance,
} from '../../lib/adminAnalytics'
import { Link } from 'react-router'
import { AlertCircle, Calendar, Car as CarIcon, Clock, TrendingUp } from 'lucide-react'
import { AdminGeneralOverview } from '../../components/admin/AdminGeneralOverview'
import { BookingAdminCard } from '../../components/admin/BookingAdminCard'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { handleBookingStatusNotification } from '../../lib/bookingNotify'
import {
  deleteBooking,
  fetchBookings,
  fetchBranches,
  fetchCars,
  updateBookingStatus,
} from '../../lib/supabase'
import type { Booking, BookingStatus, BranchRecord, Car } from '../../lib/types'
import { isCarAvailableForBranch } from '../../lib/carBranchAvailability'
import { hasMonthlyFeaturedOffer } from '../../lib/offers'
import { formatDate, formatPrice, toPhoneLink } from '../../lib/utils'

export function AdminDashboardPage() {
  const { filterBranchId, isGeneralAdmin, activeBranch } = useAdminBranch()
  const [cars, setCars] = useState<Car[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const tasks: Promise<void>[] = [
      fetchCars().then(setCars),
      fetchBookings().then(setBookings),
    ]
    if (isGeneralAdmin) {
      tasks.push(fetchBranches({ activeOnly: false }).then(setBranches))
    }
    Promise.all(tasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isGeneralAdmin])

  useEffect(() => {
    load()
  }, [load])

  useTableRealtime('bookings', load)

  const visibleCars = useMemo(
    () => filterCarsByBranch(cars, filterBranchId),
    [cars, filterBranchId],
  )
  const visibleBookings = useMemo(
    () => filterBookingsByBranch(bookings, filterBranchId),
    [bookings, filterBranchId],
  )

  const generalStats = useMemo(
    () =>
      isGeneralAdmin
        ? computeAdminDashboardStats(branches, cars, bookings)
        : null,
    [isGeneralAdmin, branches, cars, bookings],
  )

  const branchPerformance = useMemo(
    () => (isGeneralAdmin ? computeBranchPerformance(branches, cars, bookings) : []),
    [isGeneralAdmin, branches, cars, bookings],
  )

  const pending = visibleBookings.filter((b) => b.status === 'pending')
  const confirmed = visibleBookings.filter((b) => b.status === 'confirmed')

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setUpdating(id)
    const previous = bookings.find((b) => b.id === id)
    try {
      assertBookingBelongsToBranch(previous, filterBranchId)
      const updated = await updateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
      await handleBookingStatusNotification(updated, status, previous?.status)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تبي تحذف حجز "${name}"؟`)) return
    try {
      assertBookingBelongsToBranch(bookings.find((b) => b.id === id), filterBranchId)
      await deleteBooking(id)
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    }
  }

  if (loading) return <><AdminTopBar /><LoadingSpinner /></>

  const branchStats = [
    { label: 'سيارات الفرع', value: visibleCars.length, icon: CarIcon, color: 'text-brand-green', link: '/admin/cars' },
    {
      label: 'عروض شهرية مميزة',
      value: visibleCars.filter((c) => hasMonthlyFeaturedOffer(c, filterBranchId)).length,
      icon: TrendingUp,
      color: 'text-brand-gold',
      link: '/admin/offers',
    },
    {
      label: 'متاحة للحجز',
      value: visibleCars.filter((c) => isCarAvailableForBranch(c, filterBranchId)).length,
      icon: TrendingUp,
      color: 'text-blue-600',
      link: '/admin/cars',
    },
    { label: 'حجوزات الفرع', value: visibleBookings.length, icon: Calendar, color: 'text-brand-gold', link: '/admin/bookings' },
    { label: 'بانتظار المراجعة', value: pending.length, icon: Clock, color: 'text-amber-600', link: '/admin/bookings' },
  ]

  const dashboardTitle = isGeneralAdmin
    ? 'لوحة الإدارة العامة'
    : activeBranch
      ? `لوحة فرع ${activeBranch.name}`
      : 'لوحة التحكم'

  return (
    <>
      <AdminTopBar title={dashboardTitle} />

      <div className="p-3 sm:p-6 lg:p-8">
        {pending.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:flex-row sm:items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-800">
                عندك {pending.length} طلب حجز جديد بانتظار المراجعة!
              </p>
              <p className="text-sm text-amber-700 mt-1">راجع الطلبات وتواصل مع الزبائن</p>
            </div>
            <Link to="/admin/bookings" className="shrink-0">
              <Button size="md" variant="secondary" className="w-full sm:w-auto">عرض الطلبات</Button>
            </Link>
          </div>
        )}

        {isGeneralAdmin && generalStats ? (
          <AdminGeneralOverview stats={generalStats} branchRows={branchPerformance} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 mb-8">
            {branchStats.map((s) => (
              <Link key={s.label} to={s.link} className="rounded-2xl bg-white p-5 shadow-sm card-hover block">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <span className="text-3xl font-bold text-brand-dark">{s.value}</span>
                </div>
                <p className="text-sm text-slate-500">{s.label}</p>
              </Link>
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-brand-dark flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                طلبات تحتاج مراجعة ({pending.length})
              </h2>
              <Link to="/admin/bookings" className="text-sm text-brand-green hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              {pending.map((b) => (
                <BookingAdminCard
                  key={b.id}
                  booking={b}
                  startCollapsed
                  updating={updating === b.id}
                  onStatusChange={(status) => handleStatusChange(b.id, status)}
                  onDelete={() => handleDelete(b.id, b.customer_name)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-brand-dark">آخر الحجوزات</h2>
            <Link to="/admin/bookings" className="text-sm text-brand-green hover:underline">
              إدارة الحجوزات
            </Link>
          </div>

          {visibleBookings.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">ما فيه حجوزات لحد الحين</p>
          ) : (
            <>
              <div className="divide-y divide-slate-100 md:hidden">
                {visibleBookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-brand-dark">{b.customer_name}</p>
                        <p className="text-xs text-slate-500">{b.car?.name ?? '—'}</p>
                        {isGeneralAdmin && b.branch_name && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{b.branch_name}</p>
                        )}
                      </div>
                      <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'confirmed' ? 'success' : 'default'}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(b.start_date)} — {formatDate(b.end_date)}
                    </p>
                    <div className="flex items-center justify-between">
                      <a href={toPhoneLink(b.customer_phone)} dir="ltr" className="text-brand-green text-xs font-medium">
                        {b.customer_phone}
                      </a>
                      <p className="font-bold text-brand-green">{formatPrice(b.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-right font-medium">الزبون</th>
                      <th className="px-5 py-3 text-right font-medium">التواصل</th>
                      <th className="px-5 py-3 text-right font-medium">السيارة</th>
                      {isGeneralAdmin && (
                        <th className="px-5 py-3 text-right font-medium">الفرع</th>
                      )}
                      <th className="px-5 py-3 text-right font-medium">الفترة</th>
                      <th className="px-5 py-3 text-right font-medium">المبلغ</th>
                      <th className="px-5 py-3 text-right font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleBookings.slice(0, 10).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium">{b.customer_name}</td>
                        <td className="px-5 py-3">
                          <a href={toPhoneLink(b.customer_phone)} dir="ltr" className="text-brand-green hover:underline text-xs">
                            {b.customer_phone}
                          </a>
                        </td>
                        <td className="px-5 py-3">{b.car?.name ?? '—'}</td>
                        {isGeneralAdmin && (
                          <td className="px-5 py-3 text-slate-600">{b.branch_name ?? '—'}</td>
                        )}
                        <td className="px-5 py-3 text-xs whitespace-nowrap">
                          {formatDate(b.start_date)} — {formatDate(b.end_date)}
                        </td>
                        <td className="px-5 py-3 font-medium">{formatPrice(b.total_price)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'confirmed' ? 'success' : 'default'}>
                            {BOOKING_STATUS_LABELS[b.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {confirmed.length > 0 && (
          <p className="mt-4 text-xs text-slate-400 text-center">
            {confirmed.length} حجز مؤكد · {visibleBookings.length} إجمالي
          </p>
        )}
      </div>
    </>
  )
}
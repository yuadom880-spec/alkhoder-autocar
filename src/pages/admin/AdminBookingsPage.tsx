import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { BookingAdminCard } from '../../components/admin/BookingAdminCard'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { copy } from '../../lib/copy'
import { handleBookingStatusNotification } from '../../lib/bookingWhatsApp'
import { deleteBooking, fetchBookings, fetchBranches, updateBookingStatus } from '../../lib/supabase'
import type { Booking, BookingStatus, BranchRecord } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

type FilterStatus = BookingStatus | 'all'

const filters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: BOOKING_STATUS_LABELS.pending },
  { value: 'confirmed', label: BOOKING_STATUS_LABELS.confirmed },
  { value: 'rejected', label: BOOKING_STATUS_LABELS.rejected },
  { value: 'completed', label: BOOKING_STATUS_LABELS.completed },
  { value: 'cancelled', label: BOOKING_STATUS_LABELS.cancelled },
]

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [branchFilter, setBranchFilter] = useState('')
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    fetchBookings()
      .then(setBookings)
      .catch((err) => {
        console.error(err)
        setLoadError(err instanceof Error ? err.message : 'فشل تحميل الحجوزات')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    fetchBranches({ activeOnly: false }).then(setBranches).catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = filter === 'all' || b.status === filter
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_phone.includes(q) ||
        (b.customer_email?.toLowerCase().includes(q) ?? false) ||
        (b.car?.name.toLowerCase().includes(q) ?? false) ||
        (b.branch_name?.toLowerCase().includes(q) ?? false) ||
        (b.branch_city?.toLowerCase().includes(q) ?? false)
      const matchBranch = !branchFilter || b.branch_id === branchFilter
      return matchStatus && matchSearch && matchBranch
    })
  }, [bookings, filter, search, branchFilter])

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setUpdating(id)
    const previous = bookings.find((b) => b.id === id)
    try {
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
      await deleteBooking(id)
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    }
  }

  return (
    <>
      <AdminTopBar title="إدارة الحجوزات" />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-dark sm:text-2xl">طلبات الحجز</h1>
            <p className="text-sm text-slate-500">
              {bookings.length} حجز
              {pendingCount > 0 && (
                <span className="mr-2 text-amber-600 font-medium">
                  · {pendingCount} بانتظار المراجعة
                </span>
              )}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="ابحث بالاسم، الجوال، الإيميل، أو السيارة..."
              className="input-field pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="branch-booking-filter" className="text-xs text-slate-500 shrink-0">
              {copy.admin.filterByBranch}:
            </label>
            <select
              id="branch-booking-filter"
              className="input-field py-2 text-sm max-w-xs"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">{copy.admin.allBranchesFilter}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const count =
                f.value === 'all'
                  ? bookings.length
                  : bookings.filter((b) => b.status === f.value).length
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f.value
                      ? 'bg-brand-green text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-green/50',
                  )}
                >
                  {f.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500">
              {bookings.length === 0 ? 'ما فيه حجوزات لحد الحين' : 'ما لقينا نتائج'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((b) => (
              <BookingAdminCard
                key={b.id}
                booking={b}
                updating={updating === b.id}
                onStatusChange={(status) => handleStatusChange(b.id, status)}
                onDelete={() => handleDelete(b.id, b.customer_name)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
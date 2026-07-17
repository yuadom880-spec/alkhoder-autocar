import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { BookingAuthGate } from '../components/auth/BookingAuthGate'
import { CustomerBookingCard } from '../components/booking/CustomerBookingCard'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { copy } from '../lib/copy'
import { cancelMyBooking, deleteMyBooking, fetchMyBookings } from '../lib/supabase'
import type { Booking } from '../lib/types'

function MyBookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyBookings()
      setBookings(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.myBookings.loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(t)
  }, [toast])

  const handleCancel = async (id: string) => {
    const updated = await cancelMyBooking(id)
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    setToast(copy.myBookings.cancelSuccess)
  }

  const handleDelete = async (id: string) => {
    await deleteMyBooking(id)
    setBookings((prev) => prev.filter((b) => b.id !== id))
    setToast(copy.myBookings.deleteSuccess)
  }

  return (
    <div className="container-main py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand-green">
            <ClipboardList className="h-6 w-6" />
            <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
              {copy.myBookings.title}
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">{copy.myBookings.sub}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {toast && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {toast}
        </div>
      )}

      {loading && <LoadingSpinner className="py-16" />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <Button onClick={() => void load()}>إعادة المحاولة</Button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="font-bold text-brand-dark text-lg mb-2">{copy.myBookings.empty}</p>
          <p className="text-slate-500 text-sm mb-6">{copy.myBookings.emptyHint}</p>
          <Link to="/cars">
            <Button>{copy.myBookings.browseCars}</Button>
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4 max-w-3xl">
          {bookings.map((b) => (
            <CustomerBookingCard
              key={b.id}
              booking={b}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MyBookingsPage() {
  return (
    <BookingAuthGate>
      <MyBookingsContent />
    </BookingAuthGate>
  )
}

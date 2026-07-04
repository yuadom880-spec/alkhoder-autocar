import { useEffect, useState } from 'react'
import { Calendar, Power } from 'lucide-react'
import { fetchBookingBlocks } from '../../lib/supabase'
import { getCarBlocks } from '../../lib/availability'
import type { BookingBlock, Car } from '../../lib/types'
import { copy } from '../../lib/copy'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { formatDate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CarAvailabilityPanelProps {
  car: Car
  onToggleAvailable: (available: boolean) => Promise<void>
}

export function CarAvailabilityPanel({ car, onToggleAvailable }: CarAvailabilityPanelProps) {
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchBookingBlocks(car.id)
      .then(setBlocks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [car.id])

  const today = new Date().toISOString().split('T')[0]
  const activeBlocks = getCarBlocks(car.id, blocks).filter((b) => b.end_date >= today)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggleAvailable(!car.is_available)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-brand-dark">{copy.admin.availabilityControl}</h3>
        <Button
          size="sm"
          variant={car.is_available ? 'outline' : 'primary'}
          isLoading={toggling}
          onClick={handleToggle}
        >
          <Power className="h-4 w-4" />
          {car.is_available ? 'إيقاف التوفر يدوياً' : 'تفعيل التوفر'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={car.is_available ? 'success' : 'danger'}>
          {car.is_available ? 'متاحة للحجز' : copy.admin.manualOff}
        </Badge>
        {activeBlocks.some((b) => b.status === 'confirmed') && (
          <Badge variant="danger">{copy.admin.bookedNow}</Badge>
        )}
        {activeBlocks.some((b) => b.status === 'pending') && (
          <Badge variant="warning">طلبات قيد المراجعة</Badge>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeBlocks.length === 0 ? (
        <p className="text-sm text-slate-500">{copy.admin.noActiveBookings}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {copy.admin.activeBookings} ({activeBlocks.length})
          </p>
          <ul className="space-y-2">
            {activeBlocks.map((block) => (
              <li
                key={block.id ?? `${block.start_date}-${block.end_date}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
              >
                <span>
                  {formatDate(block.start_date)} — {formatDate(block.end_date)}
                </span>
                <Badge variant={block.status === 'confirmed' ? 'success' : 'warning'}>
                  {BOOKING_STATUS_LABELS[block.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
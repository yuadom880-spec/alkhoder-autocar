import { useState } from 'react'
import { Calendar, Car, ChevronUp, CreditCard, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router'
import type { Booking, BookingStatus } from '../../lib/types'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { useLocale } from '../../context/LocaleContext'
import { copy } from '../../lib/copy'
import { translateBranchCity, translateBranchName } from '../../lib/i18n/branches'
import { formatDate, formatPrice, toPhoneLink, toWhatsAppLink } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const statusVariant = {
  pending: 'warning' as const,
  confirmed: 'success' as const,
  rejected: 'danger' as const,
  completed: 'info' as const,
  cancelled: 'default' as const,
}

function whatsappMessage(b: Booking): string {
  const car = b.car?.name ?? 'سيارة'
  const branch = b.branch_name ? ` — فرع ${b.branch_name}` : ''
  return `السلام عليكم، بخصوص حجزي لـ ${car} من ${b.start_date} إلى ${b.end_date}${branch} — عبدالمجيد الخضر لتأجير السيارات`
}

export function CustomerBookingCard({ booking: b }: { booking: Booking }) {
  const { locale } = useLocale()
  const [expanded, setExpanded] = useState(b.status === 'pending' || b.status === 'confirmed')
  const branchName = b.branch_name ? translateBranchName(b.branch_name, locale) : null
  const branchCity = b.branch_city ? translateBranchCity(b.branch_city, locale) : null

  const rentalLabel =
    b.rental_type === 'monthly'
      ? copy.myBookings.rentalTypeMonthly
      : copy.myBookings.rentalTypeDaily

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-brand-dark text-lg">
                {b.car?.name ?? 'سيارة'}
              </h3>
              <Badge variant={statusVariant[b.status as BookingStatus]}>
                {BOOKING_STATUS_LABELS[b.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{rentalLabel}</p>
            {branchName && (
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {branchName}
                {branchCity ? ` — ${branchCity}` : ''}
              </p>
            )}
          </div>
          <p className="text-lg font-bold text-brand-green shrink-0">
            {formatPrice(b.total_price)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-green shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400">{copy.myBookings.rentalPeriod}</p>
              <p className="font-semibold text-brand-dark" dir="ltr">
                {b.start_date} → {b.end_date}
              </p>
              <p className="text-xs text-slate-500">{b.total_days} يوم</p>
            </div>
          </div>
          {b.pickup_time && (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400">{copy.myBookings.pickupTime}</p>
              <p className="font-semibold text-brand-dark">{b.pickup_time}</p>
            </div>
          )}
        </div>

        {expanded && (
          <div className="space-y-2 pt-1 text-sm border-t border-slate-100">
            {b.promo_title && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                عرض: {b.promo_title}
              </p>
            )}
            {b.notes && (
              <p className="text-slate-600 text-xs bg-slate-50 rounded-lg px-3 py-2">
                ملاحظات: {b.notes}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {copy.myBookings.orderDate}: {formatDate(b.created_at)}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {b.car_id && (
                <Link to={`/cars/${b.car_id}`}>
                  <Button size="sm" variant="outline">
                    <Car className="h-4 w-4" />
                    عرض السيارة
                  </Button>
                </Link>
              )}
              {b.branch_phone && (
                <>
                  <a href={toPhoneLink(b.branch_phone)}>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                      {copy.myBookings.contactBranch}
                    </Button>
                  </a>
                  <a
                    href={toWhatsAppLink(b.branch_phone, whatsappMessage(b))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                      واتساب
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-green py-1"
        >
          {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          <ChevronUp className={`h-4 w-4 transition-transform ${expanded ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {(b.status === 'pending' || b.status === 'confirmed') && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <CreditCard className="h-3.5 w-3.5 shrink-0 text-brand-green" />
          {b.status === 'pending'
            ? 'طلبك قيد المراجعة — سنؤكد الحجز بعد التواصل معك'
            : 'تم تأكيد حجزك — تواصل مع الفرع لاستلام السيارة'}
        </div>
      )}
    </article>
  )
}
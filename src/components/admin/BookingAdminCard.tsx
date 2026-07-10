import {
  Calendar,
  Car,
  Check,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  User,
  X,
} from 'lucide-react'
import type { Booking, BookingStatus } from '../../lib/types'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { copy } from '../../lib/copy'
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

interface BookingAdminCardProps {
  booking: Booking
  updating: boolean
  onStatusChange: (status: BookingStatus) => void
  onDelete: () => void
}

function whatsappMessage(b: Booking): string {
  const car = b.car?.name ?? 'سيارة'
  const branch = b.branch_name ? ` — فرع ${b.branch_name}` : ''
  return `السلام عليكم ${b.customer_name}، بخصوص حجزك لـ ${car} من ${b.start_date} إلى ${b.end_date}${branch} — عبدالمجيد الخضر لتأجير السيارات`
}

export function BookingAdminCard({
  booking: b,
  updating,
  onStatusChange,
  onDelete,
}: BookingAdminCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-brand-dark text-lg">{b.customer_name}</h3>
            <Badge variant={statusVariant[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            طلب رقم: <span dir="ltr" className="font-mono">{b.id.slice(0, 8)}</span>
            {' · '}
            {formatDate(b.created_at)}
          </p>
          {b.branch_name && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold text-brand-dark">
              <MapPin className="h-3.5 w-3.5 text-brand-green" />
              {copy.admin.bookingBranch}: {b.branch_name}
              {b.branch_city ? ` — ${b.branch_city}` : ''}
            </p>
          )}
        </div>
        <p className="text-xl font-bold text-brand-green">{formatPrice(b.total_price)}</p>
      </div>

      <div className="p-4 sm:p-5 grid gap-5 lg:grid-cols-2">
        {/* بيانات التواصل */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            بيانات التواصل مع الزبون
          </h4>
          <div className="space-y-2.5 rounded-xl bg-brand-green/5 border border-brand-green/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-500">الجوال</span>
              <a
                href={toPhoneLink(b.customer_phone)}
                dir="ltr"
                className="font-bold text-brand-dark hover:text-brand-green"
              >
                {b.customer_phone}
              </a>
            </div>
            {b.customer_email && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">الإيميل</span>
                <a
                  href={`mailto:${b.customer_email}`}
                  dir="ltr"
                  className="text-sm text-brand-green hover:underline truncate max-w-[200px]"
                >
                  {b.customer_email}
                </a>
              </div>
            )}
            {b.customer_id_number && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">رقم الهوية</span>
                <span dir="ltr" className="text-sm font-medium">{b.customer_id_number}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-green/10 sm:flex sm:flex-wrap">
              <a href={toPhoneLink(b.customer_phone)} className="col-span-1">
                <Button size="sm" variant="outline" className="w-full min-h-[44px]">
                  <Phone className="h-3.5 w-3.5" />
                  اتصال
                </Button>
              </a>
              <a href={toWhatsAppLink(b.customer_phone, whatsappMessage(b))} target="_blank" rel="noopener noreferrer" className="col-span-1">
                <Button size="sm" className="w-full min-h-[44px] bg-[#25D366] hover:bg-[#1fb855]">
                  <MessageCircle className="h-3.5 w-3.5" />
                  واتساب
                </Button>
              </a>
              {b.customer_email && (
                <a href={`mailto:${b.customer_email}`} className="col-span-2 sm:col-span-1">
                  <Button size="sm" variant="ghost" className="w-full min-h-[44px]">
                    <Mail className="h-3.5 w-3.5" />
                    إيميل
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل الحجز */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            تفاصيل الحجز
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 p-3">
              {b.car?.image_url && (
                <img src={b.car.image_url} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0" />
              )}
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Car className="h-3 w-3" /> السيارة</p>
                <p className="font-bold text-brand-dark">{b.car?.name ?? '—'}</p>
                <p className="text-xs text-slate-500">
                  {formatPrice(b.price_per_day)}
                  {b.rental_type === 'monthly' ? ' / شهر' : ' / يوم'}
                </p>
              </div>
            </div>

            {b.branch_name && (
              <div className="rounded-lg bg-brand-green/5 border border-brand-green/15 p-3">
                <p className="text-[10px] text-brand-green mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {copy.admin.bookingBranch}
                </p>
                <p className="text-sm font-bold text-brand-dark">{b.branch_name}</p>
                {b.branch_city && <p className="text-xs text-slate-500">{b.branch_city}</p>}
              </div>
            )}

            {b.promo_title && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-[10px] text-red-500 mb-1">العرض المميز</p>
                <p className="text-sm font-bold text-red-700">{b.promo_title}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">من</p>
                <p className="font-medium">{formatDate(b.start_date)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">إلى</p>
                <p className="font-medium">{formatDate(b.end_date)}</p>
              </div>
              {b.pickup_time && (
                <div className="rounded-lg bg-slate-50 p-3 col-span-2">
                  <p className="text-[10px] text-slate-400">موعد الاستلام</p>
                  <p className="font-medium" dir="ltr">{b.pickup_time}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">عدد الأيام</p>
                <p className="font-medium">{b.total_days} يوم</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><CreditCard className="h-3 w-3" /> الإجمالي</p>
                <p className="font-bold text-brand-green">{formatPrice(b.total_price)}</p>
              </div>
            </div>

            {b.notes && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-[10px] text-amber-600 mb-1">ملاحظات الزبون</p>
                <p className="text-sm text-amber-900">{b.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-4 sm:px-5 space-y-3">
        {b.status === 'pending' && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="md"
              className="w-full min-h-[44px]"
              disabled={updating}
              onClick={() => onStatusChange('confirmed')}
            >
              <Check className="h-4 w-4" />
              تأكيد الحجز
            </Button>
            <Button
              size="md"
              variant="danger"
              className="w-full min-h-[44px]"
              disabled={updating}
              onClick={() => onStatusChange('rejected')}
            >
              <X className="h-4 w-4" />
              رفض
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="input-field py-3 text-sm w-full sm:flex-1 sm:max-w-xs"
            value={b.status}
            disabled={updating}
            onChange={(e) => onStatusChange(e.target.value as BookingStatus)}
          >
            {(['pending', 'confirmed', 'rejected', 'completed', 'cancelled'] as BookingStatus[]).map((s) => (
              <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
            ))}
          </select>

          <Button
            size="md"
            variant="outline"
            className="w-full sm:w-auto text-red-600 hover:bg-red-50 min-h-[44px]"
            disabled={updating}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            حذف الحجز
          </Button>
        </div>
      </div>
    </div>
  )
}
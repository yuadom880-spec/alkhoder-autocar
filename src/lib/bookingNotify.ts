import type { Booking } from './types'
import {
  EMAIL_QA,
  MAIN_BRANCH,
  MAIN_BRANCH_EMAIL,
  MAIN_BRANCH_PHONE_LABEL,
  PHONE,
  SITE_NAME,
} from './constants'
import { getSupabaseEnv } from './env'
import { formatDisplayPhone } from './phone'
import { fetchBranches, supabase, isSupabaseConfigured } from './supabase'
import { DEFAULT_SITE_URL } from './seo'
import { formatDate, formatPrice } from './utils'

const ADMIN_BOOKINGS_URL = 'https://alkhodercar.com/admin/bookings'

export interface NotifyResult {
  sent: boolean
  error?: string
}

export interface BookingPendingNotifyResult {
  customerEmailSent: boolean
  branchEmailSent: boolean
}

function bookingCarName(booking: Booking, carName?: string): string {
  return carName ?? booking.car?.name ?? 'سيارة'
}

function branchLabel(booking: Booking): string {
  if (!booking.branch_name) return 'غير محدد'
  return booking.branch_city ? `${booking.branch_name} — ${booking.branch_city}` : booking.branch_name
}

function rentalTypeLabel(type: Booking['rental_type']): string {
  return type === 'monthly' ? 'شهري' : 'يومي'
}

function branchContactPhone(booking: Booking): string {
  return booking.branch_phone?.trim() || MAIN_BRANCH.phone || PHONE
}

function branchPhoneLabel(booking: Booking): string {
  return booking.branch_phone?.trim() ? 'رقم الفرع' : MAIN_BRANCH_PHONE_LABEL
}

function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /></head>
<body style="font-family:Segoe UI,Tahoma,sans-serif;background:#f8fafc;padding:24px;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#14532d;color:#fff;padding:16px 20px;">
      <h1 style="margin:0;font-size:18px;">${title}</h1>
      <p style="margin:6px 0 0;font-size:12px;opacity:0.9;">${SITE_NAME}</p>
    </div>
    <div style="padding:20px;color:#1e293b;line-height:1.7;font-size:14px;">${body}</div>
    <div style="padding:12px 20px;background:#f8fafc;color:#64748b;font-size:11px;border-top:1px solid #e2e8f0;">
      رسالة تلقائية من موقع ${SITE_NAME}
    </div>
  </div>
</body>
</html>`
}

function row(label: string, value: string): string {
  return `<p style="margin:0 0 10px;"><strong>${label}:</strong> ${value}</p>`
}

export function buildCustomerPendingEmailHtml(booking: Booking, carName?: string): string {
  const car = bookingCarName(booking, carName)
  const body = [
    row('السلام عليكم', booking.customer_name),
    `<p style="margin:0 0 14px;">تم استلام طلب حجزك في <strong>${SITE_NAME}</strong>. سنتواصل معك قريباً لتأكيد الحجز.</p>`,
    row('الحالة', 'قيد المراجعة'),
    row('السيارة', car),
    row('نوع الإيجار', rentalTypeLabel(booking.rental_type)),
    row('من', formatDate(booking.start_date)),
    row('إلى', formatDate(booking.end_date)),
    booking.branch_name ? row('فرع الاستلام', branchLabel(booking)) : '',
    booking.pickup_time ? row('موعد الاستلام', booking.pickup_time) : '',
    row('الإجمالي', `${formatPrice(booking.total_price)} ر.س`),
    row(branchPhoneLabel(booking), formatDisplayPhone(branchContactPhone(booking))),
    `<p style="margin:14px 0 0;color:#475569;">للاستفسار: ${formatDisplayPhone(PHONE)}</p>`,
    '<p style="margin:8px 0 0;color:#475569;">شكراً لاختياركم لنا.</p>',
  ].join('')

  return emailShell('تم استلام طلب حجزك', body)
}

export function buildBranchNewBookingEmailHtml(booking: Booking, carName?: string): string {
  const car = bookingCarName(booking, carName)
  const body = [
    '<p style="margin:0 0 14px;color:#b45309;font-weight:700;">تنبيه: طلب حجز جديد في فرعك</p>',
    row('الفرع', branchLabel(booking)),
    row('اسم العميل', booking.customer_name),
    row('جوال العميل', formatDisplayPhone(booking.customer_phone)),
    booking.customer_email ? row('بريد العميل', booking.customer_email) : '',
    booking.customer_id_number ? row('رقم الهوية', booking.customer_id_number) : '',
    row('السيارة', car),
    row('نوع الإيجار', rentalTypeLabel(booking.rental_type)),
    row('من', formatDate(booking.start_date)),
    row('إلى', formatDate(booking.end_date)),
    booking.pickup_time ? row('موعد الاستلام', booking.pickup_time) : '',
    row('الإجمالي', `${formatPrice(booking.total_price)} ر.س`),
    booking.notes ? row('ملاحظات', booking.notes) : '',
    `<p style="margin:14px 0 0;"><strong>يرجى الدخول إلى لوحة الإدارة</strong> لمراجعة وتأكيد الطلب:</p>`,
    `<p style="margin:8px 0 0;"><a href="${ADMIN_BOOKINGS_URL}" style="color:#14532d;">${ADMIN_BOOKINGS_URL}</a></p>`,
  ].join('')

  return emailShell(`طلب حجز جديد — ${branchLabel(booking)}`, body)
}

export function buildCustomerConfirmedEmailHtml(booking: Booking, carName?: string): string {
  const car = bookingCarName(booking, carName)
  const body = [
    row('السلام عليكم', booking.customer_name),
    `<p style="margin:0 0 14px;">تم تأكيد حجزك في <strong>${SITE_NAME}</strong>. سيارتك جاهزة — نتمنى لك تجربة ممتعة.</p>`,
    row('الحالة', 'مؤكد'),
    row('السيارة', car),
    row('نوع الإيجار', rentalTypeLabel(booking.rental_type)),
    row('من', formatDate(booking.start_date)),
    row('إلى', formatDate(booking.end_date)),
    booking.branch_name ? row('فرع الاستلام', branchLabel(booking)) : '',
    booking.pickup_time ? row('موعد الاستلام', booking.pickup_time) : '',
    row('الإجمالي', `${formatPrice(booking.total_price)} ر.س`),
    row(branchPhoneLabel(booking), formatDisplayPhone(branchContactPhone(booking))),
    `<p style="margin:14px 0 0;color:#475569;">للدعم: ${formatDisplayPhone(PHONE)}</p>`,
  ].join('')

  return emailShell('تم تأكيد حجزك', body)
}

export async function resolveBookingBranchEmail(booking: Booking): Promise<string | null> {
  if (booking.branch_email?.trim()) return booking.branch_email.trim()

  if (booking.branch_id) {
    try {
      const branches = await fetchBranches({ activeOnly: true })
      const email = branches.find((b) => b.id === booking.branch_id)?.email?.trim()
      if (email) return email
    } catch {
      /* ignore */
    }
  }

  return MAIN_BRANCH.email?.trim() ?? MAIN_BRANCH_EMAIL ?? EMAIL_QA
}

function isLocalDevHost(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.')
    )
  } catch {
    return false
  }
}

function productionEmailApiUrl(): string {
  const site = import.meta.env.VITE_SITE_URL as string | undefined
  const base = (site?.trim() || DEFAULT_SITE_URL).replace(/\/$/, '')
  return `${base}/api/send-booking-email`
}

/** localhost ما عندوش /api — نستخدم API الإنتاج زي تطبيق الموبايل */
function getEmailApiUrls(): string[] {
  const production = productionEmailApiUrl()
  if (typeof window === 'undefined') return [production]

  const origin = window.location.origin
  if (isLocalDevHost(origin)) return [production]

  const sameOrigin = `${origin}/api/send-booking-email`
  return sameOrigin === production ? [sameOrigin] : [sameOrigin, production]
}

function parseEmailApiError(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const err = (data as { error?: unknown }).error
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return undefined
}

async function sendBookingEmail(
  to: string,
  subject: string,
  html: string,
): Promise<NotifyResult> {
  const email = to.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { sent: false, error: 'invalid_email' }
  }

  const payload = { to: email, subject, html }
  let lastError: string | undefined

  for (const apiUrl of getEmailApiUrls()) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) return { sent: true }
      lastError = parseEmailApiError(data) ?? (data?.error === 'resend_not_configured'
        ? 'resend_not_configured'
        : lastError)
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'vercel_api_failed'
    }
  }

  if (isSupabaseConfigured && supabase) {
    const { url, anonKey } = getSupabaseEnv()

    try {
      const { data, error } = await supabase.functions.invoke('send-booking-email', { body: payload })
      if (!error && data && typeof data === 'object' && 'ok' in data && data.ok === true) {
        return { sent: true }
      }
      lastError = parseEmailApiError(data) ?? error?.message
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'supabase_invoke_failed'
    }

    try {
      const res = await fetch(`${url}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) return { sent: true }
      lastError = parseEmailApiError(data) ?? lastError
    } catch {
      /* ignore */
    }
  }

  return { sent: false, error: lastError ?? 'send_failed' }
}

export async function notifyBookingPending(
  booking: Booking,
  carName?: string,
): Promise<BookingPendingNotifyResult> {
  const branchEmail = await resolveBookingBranchEmail(booking)
  const car = bookingCarName(booking, carName)

  const tasks: Promise<NotifyResult>[] = []

  if (booking.customer_email?.trim()) {
    tasks.push(
      sendBookingEmail(
        booking.customer_email,
        `تم استلام طلب حجزك — ${SITE_NAME}`,
        buildCustomerPendingEmailHtml(booking, car),
      ),
    )
  } else {
    tasks.push(Promise.resolve({ sent: false }))
  }

  if (branchEmail) {
    tasks.push(
      sendBookingEmail(
        branchEmail,
        `طلب حجز جديد — ${branchLabel(booking)} — ${car}`,
        buildBranchNewBookingEmailHtml(booking, car),
      ),
    )
  } else {
    tasks.push(Promise.resolve({ sent: false }))
  }

  const [customerResult, branchResult] = await Promise.all(tasks)

  return {
    customerEmailSent: customerResult.sent,
    branchEmailSent: branchResult.sent,
  }
}

export async function notifyBookingConfirmed(
  booking: Booking,
  carName?: string,
): Promise<NotifyResult> {
  if (!booking.customer_email?.trim()) {
    return { sent: false }
  }

  return sendBookingEmail(
    booking.customer_email,
    `تم تأكيد حجزك — ${SITE_NAME}`,
    buildCustomerConfirmedEmailHtml(booking, carName),
  )
}

export async function handleBookingStatusNotification(
  booking: Booking,
  newStatus: Booking['status'],
  previousStatus?: Booking['status'],
): Promise<void> {
  if (newStatus === 'confirmed' && previousStatus !== 'confirmed') {
    await notifyBookingConfirmed(booking)
  }
}
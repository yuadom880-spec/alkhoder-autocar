import type { Booking } from './types'
import { MAIN_BRANCH, MAIN_BRANCH_PHONE_LABEL, PHONE, SITE_NAME } from './constants'
import { getSupabaseEnv } from './env'
import { formatDisplayPhone, toWhatsAppDigits } from './phone'
import { fetchBranches, supabase, isSupabaseConfigured } from './supabase'
import { toWhatsAppLink } from './utils'

const LRM = '\u200E'

/** يمنع انعكاس الأرقام في النص العربي (RTL) على واتساب */
function wrapLtr(value: string): string {
  return `${LRM}${value}${LRM}`
}

/** تنسيق آمن لواتساب بدون رموز قد تظهر كعلامة استفهام */
function formatWhatsAppDate(date: string): string {
  const [year, month, day] = date.split('-')
  if (year && month && day) return wrapLtr(`${day}/${month}/${year}`)
  return wrapLtr(date)
}

function formatWhatsAppPrice(amount: number): string {
  return wrapLtr(`${Math.round(amount)}`) + ' ر.س'
}

function formatWhatsAppContactPhone(): string {
  const digits = PHONE.replace(/\D/g, '')
  const local = digits.startsWith('966') ? `0${digits.slice(3)}` : digits
  return wrapLtr(local)
}

function sanitizeWhatsAppText(text: string): string {
  const cleaned = text
    .normalize('NFC')
    .replace(/[\u{1F000}-\u{10FFFF}]/gu, '')
    .replace(/\u00B7/g, ' - ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u061F/g, '?')

  // أرقام وأوقات داخل النص العربي تظهر LTR
  return cleaned.replace(
    /(\d[\d\s:/()-]*\d|\d+)/g,
    (match) => wrapLtr(match.replace(/\s+/g, '')),
  )
}

export interface WhatsAppNotifyResult {
  sent: boolean
  fallbackUrl: string
}

function normalizeWhatsAppPhone(phone: string): string {
  return toWhatsAppDigits(phone)
}

function bookingCarName(booking: Booking, carName?: string): string {
  return carName ?? booking.car?.name ?? 'سيارة'
}

function branchLine(booking: Booking): string {
  if (!booking.branch_name) return ''
  const city = booking.branch_city ? ` - ${booking.branch_city}` : ''
  return `فرع الاستلام: ${booking.branch_name}${city}`
}

function formatWhatsAppBranchPhone(phone: string): string {
  return wrapLtr(formatDisplayPhone(phone))
}

function branchPhoneLine(booking: Booking, branchPhone?: string | null): string {
  if (!booking.branch_name && !booking.branch_id) return ''

  const phone = branchPhone?.trim() || booking.branch_phone?.trim() || MAIN_BRANCH.phone || PHONE
  const label =
    branchPhone?.trim() || booking.branch_phone?.trim() ? 'رقم الفرع' : MAIN_BRANCH_PHONE_LABEL
  return `${label}: ${formatWhatsAppBranchPhone(phone)}`
}

/** يجلب رقم الفرع من الحجز أو من قائمة الفروع الحالية (للفروع الجديدة) */
export async function resolveBookingBranchPhone(booking: Booking): Promise<string | null> {
  if (booking.branch_phone?.trim()) return booking.branch_phone.trim()
  if (!booking.branch_id) return null

  try {
    const branches = await fetchBranches({ activeOnly: true })
    return branches.find((b) => b.id === booking.branch_id)?.phone?.trim() ?? null
  } catch {
    return null
  }
}

function pickupLine(booking: Booking): string {
  if (!booking.pickup_time) return ''
  return `موعد الاستلام: ${sanitizeWhatsAppText(booking.pickup_time)}`
}

function joinLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

/** رسائل واتساب بدون إيموجي - تنسيق *عريض* المدعوم من واتساب */
export function buildPendingBookingWhatsAppMessage(
  booking: Booking,
  carName?: string,
  branchPhone?: string | null,
): string {
  const car = bookingCarName(booking, carName)
  return joinLines([
    `السلام عليكم ${booking.customer_name}`,
    '',
    `*تم استلام طلب حجزك* في ${SITE_NAME}`,
    '*الحالة:* قيد الانتظار',
    '',
    `*السيارة:* ${car}`,
    `*من:* ${formatWhatsAppDate(booking.start_date)}`,
    `*الى:* ${formatWhatsAppDate(booking.end_date)}`,
    branchLine(booking),
    pickupLine(booking),
    `*الاجمالي:* ${formatWhatsAppPrice(booking.total_price)}`,
    '',
    'طلبك قيد المراجعة - ستصلك رسالة واتساب عند التأكيد',
    'لتسريع التأكيد تواصل مع فرع الاستلام',
    branchPhoneLine(booking, branchPhone),
    SITE_NAME,
  ])
}

export function buildConfirmedBookingWhatsAppMessage(
  booking: Booking,
  carName?: string,
  branchPhone?: string | null,
): string {
  const car = bookingCarName(booking, carName)
  return joinLines([
    `السلام عليكم ${booking.customer_name}`,
    '',
    `*تم تأكيد حجزك* في ${SITE_NAME}`,
    '',
    `*السيارة:* ${car}`,
    `*من:* ${formatWhatsAppDate(booking.start_date)}`,
    `*الى:* ${formatWhatsAppDate(booking.end_date)}`,
    branchLine(booking),
    pickupLine(booking),
    `*الاجمالي:* ${formatWhatsAppPrice(booking.total_price)}`,
    '',
    '*سيارتك جاهزة* - نتمنى لك تجربة ممتعة',
    'للاستفسار تواصل مع فرع الاستلام',
    branchPhoneLine(booking, branchPhone),
    `الدعم العام: ${formatWhatsAppContactPhone()}`,
  ])
}

export async function sendBookingWhatsAppMessage(
  phone: string,
  message: string,
): Promise<WhatsAppNotifyResult> {
  const safeMessage = sanitizeWhatsAppText(message)
  const fallbackUrl = toWhatsAppLink(phone, safeMessage)

  if (!isSupabaseConfigured || !supabase) {
    return { sent: false, fallbackUrl }
  }

  const { url } = getSupabaseEnv()

  try {
    const { data, error } = await supabase.functions.invoke('send-booking-whatsapp', {
      body: { phone: normalizeWhatsAppPhone(phone), message: safeMessage },
    })

    if (!error && data && typeof data === 'object' && 'ok' in data && data.ok === true) {
      return { sent: true, fallbackUrl }
    }
  } catch {
    // fallback below
  }

  try {
    const res = await fetch(`${url}/functions/v1/send-booking-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${getSupabaseEnv().anonKey}`,
      },
      body: JSON.stringify({ phone: normalizeWhatsAppPhone(phone), message: safeMessage }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.ok) return { sent: true, fallbackUrl }
    }
  } catch {
    // fallback
  }

  return { sent: false, fallbackUrl }
}

export async function notifyBookingPending(
  booking: Booking,
  carName?: string,
): Promise<WhatsAppNotifyResult> {
  const branchPhone = await resolveBookingBranchPhone(booking)
  const message = buildPendingBookingWhatsAppMessage(booking, carName, branchPhone)
  return sendBookingWhatsAppMessage(booking.customer_phone, message)
}

export async function notifyBookingConfirmed(
  booking: Booking,
  carName?: string,
  options?: { openFallback?: boolean },
): Promise<WhatsAppNotifyResult> {
  const branchPhone = await resolveBookingBranchPhone(booking)
  const message = buildConfirmedBookingWhatsAppMessage(booking, carName, branchPhone)
  const result = await sendBookingWhatsAppMessage(booking.customer_phone, message)

  if (!result.sent && options?.openFallback !== false) {
    window.open(result.fallbackUrl, '_blank', 'noopener,noreferrer')
  }

  return result
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
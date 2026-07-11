import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import type { BookingFormData, BranchRecord, RentalPeriodType } from '../../lib/types'
import {
  calcBookingTotal,
  calcMonthlyBookingBreakdown,
  endDateForOneCalendarMonth,
} from '../../lib/pricing'
import { MonthlyPriceBreakdown } from './MonthlyPriceBreakdown'
import { copy } from '../../lib/copy'
import {
  buildPickupTimeValue,
  formatPickupTimeLabel,
  getPickupDateOptions,
  PICKUP_HOURS,
  PICKUP_PERIOD_LABELS,
  type PickupPeriod,
} from '../../lib/pickupTime'
import { MAIN_BRANCH, MAIN_BRANCH_PHONE_LABEL, PHONE, PHONE_LINK } from '../../lib/constants'
import { formatDisplayPhone } from '../../lib/phone'
import { calcDays, formatDate, formatPrice, toPhoneLink, toWhatsAppLink } from '../../lib/utils'
import { isValidInternationalPhone } from '../../lib/phone'
import { Button } from '../ui/Button'
import { CustomerPhoneField } from './CustomerPhoneField'
import { cn } from '../../lib/utils'

type MonthlyDateMode = 'auto' | 'custom'

interface BookingFormProps {
  unitPrice: number
  dailyPrice?: number
  rentalType?: RentalPeriodType
  onSubmit: (data: BookingFormData) => Promise<void>
  initialStartDate?: string
  initialEndDate?: string
  multiStep?: boolean
  branches?: BranchRecord[]
  initialBranchId?: string
  onDatesChange?: (start: string, end: string) => void
  onPickupTimeChange?: (time: string) => void
  onBranchChange?: (branch: BranchRecord | null) => void
  isDateRangeAvailable?: boolean
  unavailableMessage?: string
  isPromoBooking?: boolean
  notifyState?: { customerEmail: boolean; branchEmail: boolean } | null
}

const today = () => new Date().toISOString().split('T')[0]

const STEPS = [
  { key: 1, label: copy.booking.step1 },
  { key: 2, label: copy.booking.step2 },
  { key: 3, label: copy.booking.step3 },
]

export function BookingForm({
  unitPrice,
  dailyPrice: dailyPriceProp,
  rentalType = 'daily',
  onSubmit,
  initialStartDate = '',
  initialEndDate = '',
  multiStep = false,
  branches = [],
  initialBranchId = '',
  onDatesChange,
  onPickupTimeChange,
  onBranchChange,
  isDateRangeAvailable,
  unavailableMessage,
  isPromoBooking = false,
  notifyState = null,
}: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<BookingFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_id_number: '',
    start_date: initialStartDate,
    end_date: initialEndDate,
    pickup_time: '',
    notes: '',
  })
  const [pickupDate, setPickupDate] = useState(initialStartDate)
  const [pickupHour, setPickupHour] = useState('')
  const [pickupPeriod, setPickupPeriod] = useState<PickupPeriod>('am')
  const [branchId, setBranchId] = useState(initialBranchId)
  const [monthlyDateMode, setMonthlyDateMode] = useState<MonthlyDateMode>('auto')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const pickupDateOptions = useMemo(
    () => getPickupDateOptions(form.start_date, form.end_date),
    [form.start_date, form.end_date],
  )

  const hourOptions = PICKUP_HOURS[pickupPeriod]

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId],
  )

  const datesComplete = Boolean(form.start_date && form.end_date)

  useEffect(() => {
    if (!datesComplete) return
    if (!pickupDate || !pickupDateOptions.includes(pickupDate)) {
      setPickupDate(form.start_date)
    }
  }, [datesComplete, form.start_date, pickupDate, pickupDateOptions])

  useEffect(() => {
    if (!hourOptions.includes(pickupHour)) {
      setPickupHour('')
    }
  }, [pickupPeriod, pickupHour, hourOptions])

  useEffect(() => {
    if (pickupDate && pickupHour) {
      const label = formatPickupTimeLabel(pickupDate, pickupHour, pickupPeriod)
      const value = buildPickupTimeValue(pickupDate, pickupHour, pickupPeriod)
      setForm((prev) => (prev.pickup_time === value ? prev : { ...prev, pickup_time: value }))
      onPickupTimeChange?.(label)
      return
    }
    setForm((prev) => (prev.pickup_time === '' ? prev : { ...prev, pickup_time: '' }))
    onPickupTimeChange?.('')
  }, [pickupDate, pickupHour, pickupPeriod, onPickupTimeChange])

  useEffect(() => {
    onBranchChange?.(selectedBranch)
  }, [selectedBranch, onBranchChange])

  useEffect(() => {
    if (initialBranchId && branches.some((b) => b.id === initialBranchId)) {
      setBranchId(initialBranchId)
      return
    }
    if (branches.length === 1) {
      setBranchId(branches[0].id)
    }
  }, [initialBranchId, branches])

  const isMonthly = rentalType === 'monthly'
  const dailyPrice = dailyPriceProp ?? unitPrice

  const days =
    form.start_date && form.end_date && !isMonthly
      ? calcDays(form.start_date, form.end_date)
      : 0
  const monthlyBreakdown =
    form.start_date && form.end_date && isMonthly
      ? calcMonthlyBookingBreakdown(unitPrice, dailyPrice, form.start_date, form.end_date)
      : null
  const total =
    form.start_date && form.end_date
      ? calcBookingTotal(unitPrice, form.start_date, form.end_date, rentalType, dailyPrice)
      : 0

  const applyMonthlyAutoEnd = (start: string) => {
    if (!start) return
    const end = endDateForOneCalendarMonth(start)
    setForm((prev) => {
      const next = { ...prev, start_date: start, end_date: end }
      onDatesChange?.(next.start_date, next.end_date)
      return next
    })
  }

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setForm((prev) => {
      let next = { ...prev, [field]: value }
      if (isMonthly && monthlyDateMode === 'auto' && field === 'start_date' && value) {
        next = { ...next, end_date: endDateForOneCalendarMonth(value) }
      }
      if (field === 'start_date' || field === 'end_date') {
        onDatesChange?.(next.start_date, next.end_date)
      }
      return next
    })
    setError('')
  }

  useEffect(() => {
    if (!isMonthly || monthlyDateMode !== 'auto' || !form.start_date) return
    const expectedEnd = endDateForOneCalendarMonth(form.start_date)
    if (form.end_date !== expectedEnd) {
      setForm((prev) => {
        const next = { ...prev, end_date: expectedEnd }
        onDatesChange?.(next.start_date, next.end_date)
        return next
      })
    }
  }, [isMonthly, monthlyDateMode, form.start_date, form.end_date, onDatesChange])



  const validateDates = () => {
    if (!form.start_date || !form.end_date) {
      setError(copy.booking.errors.dates)
      return false
    }
    if (form.end_date < form.start_date) {
      setError(copy.booking.errors.dateOrder)
      return false
    }
    if (isDateRangeAvailable === false) {
      setError(unavailableMessage ?? copy.booking.errors.unavailable)
      return false
    }
    if (!pickupDate || !pickupHour) {
      setError(copy.booking.errors.pickupTime)
      return false
    }
    if (branches.length > 0 && !branchId) {
      setError(copy.booking.errors.pickupBranch)
      return false
    }
    return true
  }

  const validateCustomer = () => {
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError(copy.booking.errors.namePhone)
      return false
    }
    if (!isValidInternationalPhone(form.customer_phone)) {
      setError(copy.booking.errors.phoneInvalid)
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateDates()) return
    if (step === 2 && !validateCustomer()) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateDates() || !validateCustomer()) return

    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.booking.errors.submit)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const branchPhone = selectedBranch?.phone?.trim() || null
    const contactPhone = branchPhone ?? MAIN_BRANCH.phone ?? PHONE
    const contactLabel = branchPhone ? copy.booking.successBranchPhone : MAIN_BRANCH_PHONE_LABEL

    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8 text-center space-y-5">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-green-800">{copy.booking.successTitle}</h3>
          <p className="text-sm text-green-700">{copy.booking.successReview}</p>
          {notifyState?.customerEmail === true && (
            <p className="text-xs text-green-600">{copy.booking.successCustomerEmailSent}</p>
          )}
          {notifyState?.branchEmail === true && (
            <p className="text-xs text-green-600">{copy.booking.successBranchEmailSent}</p>
          )}
          {notifyState && !notifyState.customerEmail && (
            <p className="text-xs text-amber-700">{copy.booking.successEmailHint}</p>
          )}
        </div>

        {selectedBranch && (
          <div className="rounded-xl border border-green-200 bg-white p-4 text-right space-y-3">
            <p className="text-sm text-slate-600">{copy.booking.successContactBranch}</p>
            <div className="flex items-start gap-2 justify-end">
              <div>
                <p className="font-bold text-brand-dark">{selectedBranch.name}</p>
                <p className="text-xs text-slate-500">{selectedBranch.city}</p>
              </div>
              <MapPin className="h-5 w-5 shrink-0 text-brand-green mt-0.5" />
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 space-y-1">
              <p className="text-xs text-slate-500">{contactLabel}</p>
              <a
                href={branchPhone ? toPhoneLink(branchPhone) : PHONE_LINK}
                dir="ltr"
                className="inline-flex items-center gap-2 text-lg font-bold text-brand-green hover:underline"
              >
                <Phone className="h-4 w-4" />
                {formatDisplayPhone(contactPhone)}
              </a>
            </div>
            <a
              href={toWhatsAppLink(
                contactPhone,
                `السلام عليكم، أرسلت طلب حجز من الموقع وأحتاج تأكيد الحجز — فرع ${selectedBranch.name}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1ebe57] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              تواصل مع الفرع عبر واتساب
            </a>
          </div>
        )}

        <Button variant="outline" onClick={() => { setSuccess(false); setStep(1) }}>
          {copy.booking.newBooking}
        </Button>
      </div>
    )
  }

  const showStep = (n: number) => !multiStep || step === n
  const pickupLabel =
    pickupDate && pickupHour
      ? formatPickupTimeLabel(pickupDate, pickupHour, pickupPeriod)
      : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {multiStep && (
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
              <div
                className={cn(
                  'flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  step >= s.key
                    ? 'bg-brand-green text-white'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {s.key}
              </div>
              <span
                className={cn(
                  'truncate text-[10px] sm:text-xs font-medium',
                  step >= s.key ? 'text-brand-green' : 'text-slate-400',
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    step > s.key ? 'bg-brand-green' : 'bg-slate-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {showStep(1) && (
        <div className="space-y-5">
          <div className="space-y-4">
            <h3 className="font-bold text-black">{copy.booking.selectDates}</h3>

            {isMonthly && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyDateMode('auto')
                    if (form.start_date) applyMonthlyAutoEnd(form.start_date)
                  }}
                  className={cn(
                    'flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors',
                    monthlyDateMode === 'auto'
                      ? 'border-brand-green bg-brand-green/10 text-brand-green'
                      : 'border-slate-200 text-slate-600 hover:border-brand-green/40',
                  )}
                >
                  {copy.booking.monthlyModeAuto}
                </button>
                <button
                  type="button"
                  onClick={() => setMonthlyDateMode('custom')}
                  className={cn(
                    'flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors',
                    monthlyDateMode === 'custom'
                      ? 'border-brand-green bg-brand-green/10 text-brand-green'
                      : 'border-slate-200 text-slate-600 hover:border-brand-green/40',
                  )}
                >
                  {copy.booking.monthlyModeCustom}
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field text-black" htmlFor="start_date">
                  {isMonthly ? copy.booking.monthlyStartLabel : copy.booking.from} *
                </label>
                <input
                  id="start_date"
                  type="date"
                  min={today()}
                  className="input-field text-black"
                  value={form.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              {isMonthly && monthlyDateMode === 'auto' ? (
                <div>
                  <label className="label-field text-black">{copy.booking.monthlyAutoEnd}</label>
                  <div className="input-field text-black bg-slate-50 flex items-center min-h-[48px]">
                    {form.end_date ? formatDate(form.end_date) : '—'}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label-field text-black" htmlFor="end_date">
                    {copy.booking.to} *
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    min={form.start_date || today()}
                    className="input-field text-black"
                    value={form.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
              )}
            </div>

            {isMonthly && monthlyDateMode === 'custom' && (
              <p className="text-xs text-slate-500">{copy.booking.monthlyCustomHint}</p>
            )}
          </div>

          {datesComplete && (
            <div className="space-y-4 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
              <div>
                <h4 className="font-bold text-black flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-green" />
                  {copy.booking.pickupDetails}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{copy.booking.pickupDetailsSub}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field text-black" htmlFor="pickup_date">
                    {copy.booking.pickupDay} *
                  </label>
                  <select
                    id="pickup_date"
                    className="input-field text-black"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  >
                    <option value="">— اختر اليوم —</option>
                    {pickupDateOptions.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field text-black" htmlFor="pickup_period">
                    {copy.booking.pickupPeriod} *
                  </label>
                  <select
                    id="pickup_period"
                    className="input-field text-black"
                    value={pickupPeriod}
                    onChange={(e) => setPickupPeriod(e.target.value as PickupPeriod)}
                  >
                    <option value="am">{copy.booking.pickupMorning}</option>
                    <option value="pm">{copy.booking.pickupEvening}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label-field text-black" htmlFor="pickup_hour">
                    {copy.booking.pickupHour} *
                  </label>
                  <select
                    id="pickup_hour"
                    className="input-field text-black"
                    value={pickupHour}
                    onChange={(e) => setPickupHour(e.target.value)}
                  >
                    <option value="">— اختر الساعة —</option>
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00 {PICKUP_PERIOD_LABELS[pickupPeriod]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">{copy.booking.pickupTimeHint}</p>
                </div>

                {branches.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="label-field text-black flex items-center gap-1.5" htmlFor="pickup_branch">
                      <MapPin className="h-3.5 w-3.5 text-brand-green" />
                      {copy.booking.choosePickupBranch}
                    </label>
                    <select
                      id="pickup_branch"
                      className="input-field text-black"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                    >
                      <option value="">— اختر الفرع —</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} — {branch.city}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">{copy.booking.choosePickupBranchHint}</p>
                  </div>
                )}
              </div>

              {pickupLabel && (
                <div className="rounded-lg bg-white border border-brand-green/20 px-3 py-2 text-sm text-black">
                  <span className="text-slate-500">{copy.booking.pickupTime}: </span>
                  <strong>{pickupLabel}</strong>
                  {selectedBranch && (
                    <>
                      <span className="text-slate-400 mx-2">·</span>
                      <span className="text-slate-500">{copy.booking.pickupBranch}: </span>
                      <strong>{selectedBranch.name}</strong>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {isPromoBooking && (
            <p className="text-xs text-brand-green bg-brand-green/5 border border-brand-green/20 rounded-lg px-3 py-2">
              {copy.booking.promoBookingSub}
            </p>
          )}
          {days > 0 && isDateRangeAvailable === false && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {unavailableMessage ?? copy.booking.errors.unavailable}
            </div>
          )}
          {total > 0 && isDateRangeAvailable !== false && (
            <div className="rounded-xl bg-brand-green/5 border border-brand-green/20 p-4 text-sm text-slate-600">
              {isMonthly && monthlyBreakdown ? (
                <MonthlyPriceBreakdown breakdown={monthlyBreakdown} />
              ) : (
                <>
                  {formatPrice(unitPrice)} × {days} {days === 1 ? 'يوم' : 'أيام'} ={' '}
                  <strong className="text-brand-green">{formatPrice(total)}</strong>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {showStep(2) && (
        <div className="space-y-4">
          <h3 className="font-bold text-brand-dark">{copy.booking.customerInfo}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="customer_name">
                {copy.booking.fullName} *
              </label>
              <input
                id="customer_name"
                className="input-field"
                value={form.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="محمد أحمد"
              />
            </div>
            <CustomerPhoneField
              id="customer_phone"
              className="sm:col-span-2"
              value={form.customer_phone}
              onChange={(phone) => handleChange('customer_phone', phone)}
            />
            <div>
              <label className="label-field" htmlFor="customer_email">
                {copy.booking.email}
              </label>
              <input
                id="customer_email"
                type="email"
                dir="ltr"
                className="input-field text-left"
                value={form.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
              />
            </div>
            <div>
              <label className="label-field" htmlFor="customer_id_number">
                {copy.booking.idNumber}
              </label>
              <input
                id="customer_id_number"
                dir="ltr"
                className="input-field text-left"
                value={form.customer_id_number}
                onChange={(e) => handleChange('customer_id_number', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="notes">
              {copy.booking.notes}
            </label>
            <textarea
              id="notes"
              rows={3}
              className="input-field resize-none"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={copy.booking.notesPlaceholder}
            />
          </div>
        </div>
      )}

      {showStep(3) && multiStep && (
        <div className="rounded-xl bg-slate-50 p-5 space-y-3 text-sm">
          <h3 className="font-bold text-brand-dark mb-3">راجع بيانات حجزك</h3>
          <div className="flex justify-between">
            <span className="text-slate-500">{copy.booking.from}</span>
            <span className="font-medium">{form.start_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{copy.booking.to}</span>
            <span className="font-medium">{form.end_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{copy.booking.pickupTime}</span>
            <span className="font-medium">{pickupLabel || '—'}</span>
          </div>
          {selectedBranch && (
            <div className="flex justify-between">
              <span className="text-slate-500">{copy.booking.pickupBranch}</span>
              <span className="font-medium">{selectedBranch.name} — {selectedBranch.city}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">{copy.booking.fullName}</span>
            <span className="font-medium">{form.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{copy.booking.phone}</span>
            <span className="font-medium" dir="ltr">{form.customer_phone}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200">
            <span className="font-bold">{copy.booking.total}</span>
            <span className="text-lg font-bold text-brand-green">{formatPrice(total)}</span>
          </div>
        </div>
      )}

      {!multiStep && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="customer_name_inline">
                {copy.booking.fullName} *
              </label>
              <input
                id="customer_name_inline"
                className="input-field"
                value={form.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
              />
            </div>
            <CustomerPhoneField
              id="customer_phone_inline"
              className="sm:col-span-2"
              value={form.customer_phone}
              onChange={(phone) => handleChange('customer_phone', phone)}
            />
          </div>
          {total > 0 && (
            <div className="rounded-xl bg-brand-green/5 border border-brand-green/20 p-4">
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-600">
                  {isMonthly && monthlyBreakdown ? (
                    <MonthlyPriceBreakdown breakdown={monthlyBreakdown} compact />
                  ) : (
                    `${formatPrice(unitPrice)} × ${days} ${days === 1 ? 'يوم' : 'أيام'}`
                  )}
                </span>
                {!(isMonthly && monthlyBreakdown?.extraDays) && (
                  <span className="text-lg font-bold text-brand-green">{formatPrice(total)}</span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      {multiStep ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {step > 1 && (
            <Button type="button" variant="outline" className="w-full sm:w-auto min-h-[48px]" onClick={() => setStep((s) => s - 1)}>
              <ChevronRight className="h-4 w-4" />
              {copy.booking.prev}
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="w-full sm:w-auto sm:mr-auto min-h-[48px]" size="lg" onClick={handleNext}>
              {copy.booking.next}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto sm:mr-auto min-h-[48px]"
              size="lg"
              isLoading={loading}
              disabled={isDateRangeAvailable === false}
            >
              <Calendar className="h-5 w-5" />
              {copy.booking.confirm}
            </Button>
          )}
        </div>
      ) : (
        <Button type="submit" className="w-full min-h-[48px]" size="lg" isLoading={loading}>
          <Calendar className="h-5 w-5" />
          {copy.booking.submit}
        </Button>
      )}
    </form>
  )
}
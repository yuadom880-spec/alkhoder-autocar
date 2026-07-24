import { Check, Clock, Send, X } from 'lucide-react'
import type { BookingStatus } from '../../lib/types'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

type Props = {
  status: BookingStatus | string
}

/**
 * مسار الحجز: مُرسل → قيد المراجعة → مؤكد
 * (مع حالات مرفوض / ملغي / مكتمل على الخطوة الثالثة)
 */
export function BookingStatusTimeline({ status }: Props) {
  const failed = status === 'rejected' || status === 'cancelled'
  const thirdLabel =
    status === 'rejected'
      ? copy.myBookings.timelineRejected
      : status === 'cancelled'
        ? copy.myBookings.timelineCancelled
        : status === 'completed'
          ? copy.myBookings.timelineCompleted
          : copy.myBookings.timelineConfirmed

  const steps = [
    { key: 'submitted', label: copy.myBookings.timelineSubmitted, icon: Send },
    { key: 'review', label: copy.myBookings.timelineReview, icon: Clock },
    { key: 'final', label: thirdLabel, icon: failed ? X : Check },
  ] as const

  // 0 = مُرسل فقط (نادر)، 1 = قيد المراجعة (pending)، 2 = نهائي
  const level =
    status === 'pending'
      ? 1
      : status === 'confirmed' ||
          status === 'completed' ||
          status === 'rejected' ||
          status === 'cancelled'
        ? 2
        : 1

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 sm:px-4">
      <p className="mb-3 text-[11px] font-extrabold tracking-wide text-slate-500">
        {copy.myBookings.timelineTitle}
      </p>
      <div className="flex items-start">
        {steps.map((step, i) => {
          const done =
            i < level ||
            (i === level && (status === 'confirmed' || status === 'completed'))
          const current =
            i === level && status !== 'confirmed' && status !== 'completed'
          const isFailNode = failed && i === level
          const active = done || current || isFailNode
          const Icon = step.icon
          const color = isFailNode
            ? 'text-red-600'
            : active
              ? 'text-brand-green'
              : 'text-slate-400'

          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-start">
              {i > 0 && (
                <div
                  className={cn(
                    'mt-4 h-0.5 min-w-[8px] flex-1 rounded-full',
                    i <= level
                      ? isFailNode && i === level
                        ? 'bg-red-500'
                        : 'bg-brand-green'
                      : 'bg-slate-200',
                  )}
                  aria-hidden
                />
              )}
              <div className="flex w-[4.6rem] shrink-0 flex-col items-center sm:w-20">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2',
                    isFailNode
                      ? 'border-red-500 bg-red-50'
                      : done
                        ? 'border-brand-green bg-brand-green/10'
                        : current
                          ? 'border-brand-green bg-brand-green/10 ring-2 ring-brand-green/25'
                          : 'border-slate-200 bg-white',
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4', color)}
                    strokeWidth={done && !isFailNode ? 2.75 : 2.25}
                  />
                </div>
                <p
                  className={cn(
                    'mt-1.5 text-center text-[10px] leading-tight sm:text-[11px]',
                    current || isFailNode ? 'font-extrabold' : 'font-semibold',
                    color,
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

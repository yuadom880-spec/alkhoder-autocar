import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  CalendarRange,
  Car,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import {
  computeRevenueByBranch,
  computeRevenueByCar,
  computeRevenueSummary,
  exportRevenueCsv,
  filterBookingsByPeriod,
  type RevenuePeriod,
} from '../../lib/adminAnalytics'
import { fetchBookings, fetchBranches } from '../../lib/supabase'
import type { Booking, BranchRecord } from '../../lib/types'
import { formatDate, formatPrice, cn } from '../../lib/utils'
import { useTableRealtime } from '../../hooks/useTableRealtime'

const periods: { value: RevenuePeriod; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'آخر 7 أيام' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'year', label: 'هذه السنة' },
]

export function AdminRevenuePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [period, setPeriod] = useState<RevenuePeriod>('month')
  const [branchId, setBranchId] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setLoadError('')
    Promise.all([fetchBookings(), fetchBranches({ activeOnly: false })])
      .then(([bks, brs]) => {
        setBookings(bks)
        setBranches(brs)
      })
      .catch((err) => {
        console.error(err)
        setLoadError(err instanceof Error ? err.message : 'فشل تحميل الإيرادات')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useTableRealtime('bookings', load)

  const periodBookings = useMemo(
    () => filterBookingsByPeriod(bookings, period),
    [bookings, period],
  )

  const scopedBookings = useMemo(() => {
    if (!branchId) return periodBookings
    return periodBookings.filter((b) => b.branch_id === branchId)
  }, [periodBookings, branchId])

  const summary = useMemo(
    () => computeRevenueSummary(scopedBookings),
    [scopedBookings],
  )

  const byBranch = useMemo(
    () => computeRevenueByBranch(branches, periodBookings),
    [branches, periodBookings],
  )

  const byCar = useMemo(
    () => computeRevenueByCar(scopedBookings),
    [scopedBookings],
  )

  const earnedBookings = useMemo(
    () =>
      scopedBookings
        .filter((b) => b.status === 'confirmed' || b.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 25),
    [scopedBookings],
  )

  const cards = [
    {
      label: 'الإيراد المحقّق',
      value: formatPrice(summary.earned),
      hint: `${summary.bookingsEarned} حجز مؤكد/مكتمل`,
      icon: Wallet,
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
    },
    {
      label: 'مؤكد (قيد التنفيذ)',
      value: formatPrice(summary.confirmed),
      hint: 'حجوزات مؤكدة لم تُكمل بعد',
      icon: TrendingUp,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'مكتمل',
      value: formatPrice(summary.completed),
      hint: 'إيراد من حجوزات مكتملة',
      icon: Banknote,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'قيد الانتظار',
      value: formatPrice(summary.pending),
      hint: `${summary.bookingsPending} طلب لم يُؤكد`,
      icon: CalendarRange,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      label: 'ملغى / مرفوض',
      value: formatPrice(summary.cancelled + summary.rejected),
      hint: 'قيمة لم تتحقق',
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'متوسط قيمة الحجز',
      value: formatPrice(summary.averageTicket),
      hint: 'للمؤكد والمكتمل فقط',
      icon: Car,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
  ]

  if (loading) {
    return (
      <>
        <AdminTopBar />
        <LoadingSpinner />
      </>
    )
  }

  return (
    <>
      <AdminTopBar />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AdminPageHeader
          title="الإيرادات"
          subtitle="ملخص مالي من الحجوزات المؤكدة والمكتملة — الإدارة العامة"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <RefreshCw className="h-4 w-4" />
                تحديث
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportRevenueCsv(scopedBookings)}
                disabled={summary.bookingsEarned === 0}
              >
                <Download className="h-4 w-4" />
                تصدير CSV
              </Button>
            </div>
          }
        />

        {loadError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                  period === p.value
                    ? 'bg-brand-green text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-dark min-w-[200px]"
          >
            <option value="">كل الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.city ? ` — ${b.city}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 mb-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className={`mt-1 text-xl font-black ${card.color}`}>{card.value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.hint}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="font-bold text-brand-dark mb-1">توزيع نوع الإيجار</h2>
            <p className="text-xs text-slate-500 mb-4">من الإيراد المحقّق فقط</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-brand-dark">يومي</p>
                  <p className="text-xs text-slate-500">{summary.dailyCount} حجز</p>
                </div>
                <p className="font-black text-brand-green">
                  {formatPrice(summary.dailyShare)}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-brand-dark">شهري</p>
                  <p className="text-xs text-slate-500">{summary.monthlyCount} حجز</p>
                </div>
                <p className="font-black text-brand-green">
                  {formatPrice(summary.monthlyShare)}
                </p>
              </div>
              {summary.earned > 0 && (
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-full bg-brand-green"
                    style={{
                      width: `${Math.round((summary.dailyShare / summary.earned) * 100)}%`,
                    }}
                    title="يومي"
                  />
                  <div
                    className="h-full bg-emerald-400"
                    style={{
                      width: `${Math.round((summary.monthlyShare / summary.earned) * 100)}%`,
                    }}
                    title="شهري"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="font-bold text-brand-dark mb-1">أعلى السيارات إيراداً</h2>
            <p className="text-xs text-slate-500 mb-4">حسب الحجوزات المؤكدة والمكتملة</p>
            {byCar.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">لا توجد بيانات بعد</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {byCar.map((row, i) => (
                  <li
                    key={row.carId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-xs font-bold text-brand-green">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-dark truncate">
                          {row.carName}
                        </p>
                        <p className="text-[11px] text-slate-400">{row.bookings} حجز</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-brand-green shrink-0">
                      {formatPrice(row.earned)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-brand-dark">الإيراد حسب الفرع</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              الفترة المحددة — كل الفروع (فلتر الفرع أعلاه يؤثر على البطاقات والقوائم فقط)
            </p>
          </div>
          {byBranch.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">لا توجد حجوزات في هذه الفترة</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right min-w-[640px]">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 font-semibold">الفرع</th>
                    <th className="px-4 py-3 font-semibold">المدينة</th>
                    <th className="px-4 py-3 font-semibold">إيراد محقّق</th>
                    <th className="px-4 py-3 font-semibold">قيد الانتظار</th>
                    <th className="px-4 py-3 font-semibold">حجوزات محقّقة</th>
                    <th className="px-4 py-3 font-semibold">إجمالي الطلبات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byBranch.map((row) => (
                    <tr key={row.branchId} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-brand-dark">
                        {row.branchName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.city || '—'}</td>
                      <td className="px-4 py-3 font-black text-brand-green">
                        {formatPrice(row.earned)}
                      </td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">
                        {formatPrice(row.pending)}
                      </td>
                      <td className="px-4 py-3">{row.bookingsEarned}</td>
                      <td className="px-4 py-3">{row.bookingsTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-brand-dark">آخر الحجوزات المحقّقة</h2>
              <p className="text-xs text-slate-500 mt-0.5">مؤكدة أو مكتملة — أحدث 25</p>
            </div>
          </div>
          {earnedBookings.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">
              لا يوجد إيراد محقّق في الفلتر الحالي
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {earnedBookings.map((b) => (
                <li
                  key={b.id}
                  className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-brand-dark text-sm">
                        {b.car?.name ?? 'سيارة'}
                      </p>
                      <Badge
                        variant={b.status === 'completed' ? 'info' : 'success'}
                      >
                        {BOOKING_STATUS_LABELS[b.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.customer_name}
                      {b.branch_name ? ` · ${b.branch_name}` : ''}
                      {' · '}
                      {formatDate(b.created_at)}
                    </p>
                  </div>
                  <p className="font-black text-brand-green shrink-0">
                    {formatPrice(b.total_price)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

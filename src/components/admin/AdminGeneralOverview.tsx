import { Link } from 'react-router'
import {
  Building2,
  Calendar,
  Car,
  CircleDollarSign,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { AdminDashboardStats, BranchPerformanceRow } from '../../lib/adminAnalytics'
import { formatPrice } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface AdminGeneralOverviewProps {
  stats: AdminDashboardStats
  branchRows: BranchPerformanceRow[]
}

interface StatCard {
  label: string
  value: string | number
  hint?: string
  icon: typeof Car
  color: string
  bg: string
  link: string
}

export function AdminGeneralOverview({ stats, branchRows }: AdminGeneralOverviewProps) {
  const totalRevenue = stats.revenueConfirmed + stats.revenueCompleted

  const statCards: StatCard[] = [
    {
      label: 'الفروع النشطة',
      value: `${stats.branchesActive}/${stats.branchesTotal}`,
      hint: 'فرع على الخريطة',
      icon: MapPin,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      link: '/admin/branches',
    },
    {
      label: 'الأسطول',
      value: stats.carsTotal,
      hint: `${stats.carsAvailable} متاحة · ${stats.carsUnavailable} موقوفة`,
      icon: Car,
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
      link: '/admin/cars',
    },
    {
      label: 'عروض شهرية مميزة',
      value: stats.offersActive,
      hint: 'خصم 199 ر.س أو أكثر — تظهر في الموقع',
      icon: Tag,
      color: 'text-brand-gold',
      bg: 'bg-amber-50',
      link: '/admin/offers',
    },
    {
      label: 'حجوزات اليوم',
      value: stats.bookingsToday,
      hint: `${stats.bookingsPending} بانتظار المراجعة`,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/bookings',
    },
    {
      label: 'إجمالي الحجوزات',
      value: stats.bookingsTotal,
      hint: `${stats.bookingsConfirmed} مؤكد · ${stats.bookingsCompleted} مكتمل`,
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      link: '/admin/bookings',
    },
    {
      label: 'إيراد مؤكد',
      value: formatPrice(totalRevenue),
      hint: `${formatPrice(stats.revenuePending)} قيد المراجعة`,
      icon: CircleDollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      link: '/admin/bookings',
    },
  ]

  const quickActions = [
    { to: '/admin/cars/new', label: 'إضافة سيارة', icon: Car },
    { to: '/admin/branches/new', label: 'إضافة فرع', icon: Building2 },
    { to: '/admin/offers/monthly/new', label: 'إضافة عرض شهري', icon: Sparkles },
    { to: '/admin/bookings', label: 'مراجعة الحجوزات', icon: Calendar },
  ]

  const topBranches = branchRows.filter((b) => b.bookingsPending > 0 || b.bookingsTotal > 0).slice(0, 8)

  return (
    <div className="space-y-6 mb-8">
      <div className="rounded-2xl border border-brand-green/20 bg-gradient-to-l from-brand-green/10 via-white to-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-green">الإدارة العامة</p>
            <h2 className="text-lg sm:text-xl font-bold text-brand-dark mt-1">
              نظرة شاملة على كل الفروع والعمليات
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              تحكم كامل في الأسطول، الفروع، العروض، والحجوزات على مستوى الشركة
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 shrink-0">
            <TrendingUp className="h-5 w-5 text-brand-green" />
            <div>
              <p className="text-[11px] text-slate-400">بانتظار المراجعة</p>
              <p className="text-xl font-bold text-amber-600">{stats.bookingsPending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm card-hover block"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-lg sm:text-xl font-bold text-brand-dark truncate">{card.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-brand-dark">{card.label}</p>
            {card.hint && <p className="text-xs text-slate-400 mt-0.5">{card.hint}</p>}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-sm">
        <p className="text-sm font-bold text-brand-dark mb-3">إجراءات سريعة</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Button variant="outline" size="sm" className="w-full min-h-[44px] gap-2">
                <action.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-5 py-4">
          <div>
            <h2 className="font-bold text-brand-dark">أداء الفروع</h2>
            <p className="text-xs text-slate-500 mt-0.5">مقارنة الحجوزات والإيرادات والأسطول لكل فرع</p>
          </div>
          <Link to="/admin/branches" className="text-sm text-brand-green hover:underline shrink-0">
            إدارة الفروع
          </Link>
        </div>

        {branchRows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">لا توجد فروع مسجّلة بعد</p>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {topBranches.map((row) => (
                <div key={row.branchId} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-brand-dark">{row.branchName}</p>
                      <p className="text-xs text-slate-500">{row.city}</p>
                    </div>
                    <div className="flex gap-1">
                      {row.isMain && <Badge variant="warning">رئيسي</Badge>}
                      {!row.isActive && <Badge variant="default">مخفي</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 py-2">
                      <p className="font-bold text-brand-dark">{row.carsCount}</p>
                      <p className="text-slate-400">سيارة</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 py-2">
                      <p className="font-bold text-amber-700">{row.bookingsPending}</p>
                      <p className="text-slate-400">معلّق</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 py-2">
                      <p className="font-bold text-emerald-700">{formatPrice(row.revenue)}</p>
                      <p className="text-slate-400">إيراد</p>
                    </div>
                  </div>
                  <Link to={`/admin/branches/${row.branchId}/edit`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Plus className="h-3.5 w-3.5" />
                      تعديل الفرع
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-right font-medium">الفرع</th>
                    <th className="px-5 py-3 text-right font-medium">المدينة</th>
                    <th className="px-5 py-3 text-right font-medium">السيارات</th>
                    <th className="px-5 py-3 text-right font-medium">الحجوزات</th>
                    <th className="px-5 py-3 text-right font-medium">معلّق</th>
                    <th className="px-5 py-3 text-right font-medium">الإيراد</th>
                    <th className="px-5 py-3 text-right font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchRows.map((row) => (
                    <tr key={row.branchId} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">
                        <Link
                          to={`/admin/branches/${row.branchId}/edit`}
                          className="text-brand-dark hover:text-brand-green"
                        >
                          {row.branchName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{row.city}</td>
                      <td className="px-5 py-3">{row.carsCount}</td>
                      <td className="px-5 py-3">{row.bookingsTotal}</td>
                      <td className="px-5 py-3">
                        {row.bookingsPending > 0 ? (
                          <span className="font-bold text-amber-600">{row.bookingsPending}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">{formatPrice(row.revenue)}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {row.isMain && <Badge variant="warning">رئيسي</Badge>}
                          <Badge variant={row.isActive ? 'success' : 'default'}>
                            {row.isActive ? 'نشط' : 'مخفي'}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
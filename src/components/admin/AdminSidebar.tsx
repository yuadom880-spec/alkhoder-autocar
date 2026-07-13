import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Calendar, Car, LayoutDashboard, LogOut, ExternalLink, MapPin, Tag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterBookingsByBranch } from '../../lib/adminBranchFilters'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'
import { useTableRealtime } from '../../hooks/useTableRealtime'
import { fetchBookings } from '../../lib/supabase'
import { cn } from '../../lib/utils'

const links = [
  { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { path: '/admin/cars', label: 'إدارة السيارات', icon: Car },
  { path: '/admin/offers', label: 'العروض المميزة', icon: Tag },
  { path: '/admin/branches', label: 'الفروع', icon: MapPin },
  { path: '/admin/bookings', label: 'طلبات الحجز', icon: Calendar, showBadge: true },
]

export function AdminSidebar() {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const { filterBranchId, isBranchMode } = useAdminBranch()
  const [pendingCount, setPendingCount] = useState(0)

  const navLinks = isBranchMode
    ? links.filter((l) => l.path !== '/admin/branches')
    : links

  const refreshPending = useCallback(() => {
    fetchBookings()
      .then((bks) => {
        const scoped = filterBookingsByBranch(bks, filterBranchId)
        setPendingCount(scoped.filter((b) => b.status === 'pending').length)
      })
      .catch(() => {})
  }, [filterBranchId])

  useEffect(() => {
    refreshPending()
  }, [pathname, refreshPending])

  useTableRealtime('bookings', refreshPending)

  return (
    <aside className="w-64 shrink-0 border-l border-slate-200 bg-white hidden lg:flex flex-col">
      <div className="border-b border-slate-100 p-5">
        <img src={LOGO_URL} alt={SITE_NAME} className="h-12 w-auto rounded-lg object-contain mb-2" />
        <p className="font-bold text-brand-dark text-sm">{SITE_NAME}</p>
        <p className="text-xs text-slate-400">لوحة الإدارة — Admin</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((link) => {
          const active = link.exact ? pathname === link.path : pathname.startsWith(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <span className="flex items-center gap-3">
                <link.icon className="h-4 w-4" />
                {link.label}
              </span>
              {link.showBadge && pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-3 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          عرض الموقع
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
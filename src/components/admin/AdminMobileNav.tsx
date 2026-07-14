import { useCallback, useEffect, useState } from 'react'
import { useTableRealtime } from '../../hooks/useTableRealtime'
import { Link, useLocation } from 'react-router'
import { Calendar, Car, LayoutDashboard, MapPin, Tag } from 'lucide-react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterBookingsByBranch } from '../../lib/adminBranchFilters'
import { fetchBookings } from '../../lib/supabase'
import { cn } from '../../lib/utils'

const generalLinks = [
  { path: '/admin', label: 'العامة', icon: LayoutDashboard, exact: true },
  { path: '/admin/cars', label: 'السيارات', icon: Car },
  { path: '/admin/offers', label: 'العروض', icon: Tag },
  { path: '/admin/branches', label: 'الفروع', icon: MapPin },
  { path: '/admin/bookings', label: 'الحجوزات', icon: Calendar, showBadge: true },
]

const branchLinks = [
  { path: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { path: '/admin/cars', label: 'السيارات', icon: Car },
  { path: '/admin/offers', label: 'العروض', icon: Tag },
  { path: '/admin/bookings', label: 'الحجوزات', icon: Calendar, showBadge: true },
]

export function AdminMobileNav() {
  const { pathname } = useLocation()
  const { filterBranchId, isBranchAdmin } = useAdminBranch()
  const [pendingCount, setPendingCount] = useState(0)

  const navLinks = isBranchAdmin ? branchLinks : generalLinks

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
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-stretch">
        {navLinks.map((link) => {
          const active = link.exact ? pathname === link.path : pathname.startsWith(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[11px] font-semibold transition-colors',
                active ? 'text-brand-green' : 'text-slate-500',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  active ? 'bg-brand-green/15' : 'bg-transparent',
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.showBadge && pendingCount > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </span>
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
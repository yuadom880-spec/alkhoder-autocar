import { Link, useLocation } from 'react-router'
import { Calendar, Car, LayoutDashboard, MapPin, Tag } from 'lucide-react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { cn } from '../../lib/utils'

const links = [
  { path: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { path: '/admin/cars', label: 'السيارات', icon: Car },
  { path: '/admin/offers', label: 'العروض', icon: Tag },
  { path: '/admin/branches', label: 'الفروع', icon: MapPin },
  { path: '/admin/bookings', label: 'الحجوزات', icon: Calendar },
]

export function AdminMobileNav() {
  const { pathname } = useLocation()
  const { isBranchMode } = useAdminBranch()

  const navLinks = isBranchMode
    ? links.filter((l) => l.path !== '/admin/branches')
    : links

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
      {navLinks.map((link) => {
        const active = link.exact ? pathname === link.path : pathname.startsWith(link.path)
        return (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
              active ? 'text-brand-green' : 'text-slate-500',
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
import { Link } from 'react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'
import { ADMIN_PHONE, getAdminPhone } from '../../lib/admin'

interface AdminTopBarProps {
  title?: string
}

export function AdminTopBar({ title = 'لوحة الإدارة' }: AdminTopBarProps) {
  const { logout } = useAuth()
  const adminPhone = getAdminPhone() ?? ADMIN_PHONE

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={LOGO_URL}
          alt={SITE_NAME}
          className="h-9 w-auto shrink-0 rounded-md object-contain lg:hidden"
        />
        <div className="min-w-0">
          <p className="font-bold text-brand-dark text-sm sm:text-base truncate">{title}</p>
          <p className="text-[10px] text-slate-400 truncate hidden sm:block">
            {SITE_NAME}
            {adminPhone && (
              <>
                {' · '}
                <span dir="ltr">{adminPhone}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline text-xs text-brand-green hover:underline"
        >
          عرض الموقع
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  )
}


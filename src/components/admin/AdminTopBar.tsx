import { Link } from 'react-router'
import { ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'
import { GENERAL_ADMIN_USERNAME, getAdminUsername } from '../../lib/admin'
import { copy } from '../../lib/copy'

interface AdminTopBarProps {
  title?: string
}

export function AdminTopBar({ title = 'لوحة الإدارة العامة' }: AdminTopBarProps) {
  const { logout } = useAuth()
  const { isGeneralAdmin, isBranchAdmin, activeBranch } = useAdminBranch()
  const adminUsername = getAdminUsername() ?? GENERAL_ADMIN_USERNAME

  const panelLabel = isBranchAdmin && activeBranch
    ? `لوحة فرع ${activeBranch.name}`
    : copy.admin.generalPanelTitle

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-8">
        <div className="flex items-center gap-2 min-w-0 sm:gap-3">
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            className="h-8 w-auto shrink-0 rounded-md object-contain sm:h-9 lg:hidden"
          />
          <div className="min-w-0">
            <p className="font-bold text-brand-dark text-sm sm:text-base truncate">{title}</p>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              {panelLabel}
              {adminUsername && (
                <>
                  {' · '}
                  <span dir="ltr">{adminUsername}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
          {isGeneralAdmin && (
            <span className="hidden md:inline-flex rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-[11px] font-bold text-brand-green">
              كل الفروع
            </span>
          )}
          {isBranchAdmin && activeBranch && (
            <span className="hidden md:inline-flex rounded-full border border-amber-300/50 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
              {activeBranch.name}
            </span>
          )}

          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg text-brand-green hover:bg-brand-green/10"
            title={copy.admin.viewSite}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium"
            title={copy.admin.logout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.admin.logout}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
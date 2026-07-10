import { useState } from 'react'
import { Link } from 'react-router'
import { ExternalLink, LogOut, MapPin, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'
import { ADMIN_PHONE, getAdminPhone } from '../../lib/admin'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

interface AdminTopBarProps {
  title?: string
}

export function AdminTopBar({ title = 'لوحة الإدارة' }: AdminTopBarProps) {
  const { logout } = useAuth()
  const {
    branches,
    isBranchMode,
    activeBranch,
    enterBranchMode,
    exitBranchMode,
    setActiveBranch,
    loading: branchesLoading,
  } = useAdminBranch()
  const adminPhone = getAdminPhone() ?? ADMIN_PHONE
  const [showPicker, setShowPicker] = useState(false)
  const [pickedId, setPickedId] = useState('')

  const activeBranches = branches.filter((b) => b.is_active)

  const handleBranchButtonClick = () => {
    if (isBranchMode) {
      exitBranchMode()
      setShowPicker(false)
      return
    }
    if (activeBranches.length === 1) {
      enterBranchMode(activeBranches[0].id)
      return
    }
    setShowPicker(true)
    setPickedId(activeBranches[0]?.id ?? '')
  }

  const handleConfirmBranch = () => {
    if (!pickedId) return
    enterBranchMode(pickedId)
    setShowPicker(false)
  }

  return (
    <>
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

          <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
            <button
              type="button"
              onClick={handleBranchButtonClick}
              disabled={branchesLoading || activeBranches.length === 0}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all min-h-[40px] sm:gap-2 sm:px-4 sm:text-sm',
                isBranchMode
                  ? 'bg-brand-green text-white shadow-md shadow-brand-green/25'
                  : 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border border-brand-green/30',
              )}
              title={copy.admin.myBranchButton}
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="max-w-[72px] truncate sm:max-w-none">
                {isBranchMode && activeBranch ? activeBranch.name : copy.admin.myBranchButton}
              </span>
            </button>

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

      {showPicker && !isBranchMode && (
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4 lg:px-8">
          <p className="text-sm font-medium text-brand-dark mb-2">{copy.admin.pickYourBranch}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <select
              className="input-field py-3 text-sm w-full sm:max-w-xs"
              value={pickedId}
              onChange={(e) => setPickedId(e.target.value)}
            >
              {activeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <button
                type="button"
                onClick={handleConfirmBranch}
                className="rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white hover:bg-brand-green/90 min-h-[44px]"
              >
                {copy.admin.enterBranchMode}
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 min-h-[44px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isBranchMode && activeBranch && (
        <div className="border-b border-brand-green/30 bg-brand-green/10 px-3 py-2.5 sm:px-4 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 text-brand-green" />
              <p className="text-xs sm:text-sm font-medium text-brand-dark truncate">
                {copy.admin.branchModeActive}
                <span className="font-bold text-brand-green mr-1">{activeBranch.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeBranches.length > 1 && (
                <select
                  className="input-field py-2 text-xs flex-1 sm:max-w-[180px] sm:py-1"
                  value={activeBranch.id}
                  onChange={(e) => setActiveBranch(e.target.value)}
                  aria-label={copy.admin.switchBranch}
                >
                  {activeBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={exitBranchMode}
                className="flex items-center gap-1 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 min-h-[40px] shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                {copy.admin.exitBranchMode}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
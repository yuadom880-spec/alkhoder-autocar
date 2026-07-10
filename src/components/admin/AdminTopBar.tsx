import { useState } from 'react'
import { Link } from 'react-router'
import { LogOut, MapPin, X } from 'lucide-react'
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
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
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
          <button
            type="button"
            onClick={handleBranchButtonClick}
            disabled={branchesLoading || activeBranches.length === 0}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
              isBranchMode
                ? 'bg-brand-green text-white shadow-md shadow-brand-green/25'
                : 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border border-brand-green/30',
            )}
            title={copy.admin.myBranchButton}
          >
            <MapPin className="h-4 w-4" />
            <span>
              {isBranchMode && activeBranch ? activeBranch.name : copy.admin.myBranchButton}
            </span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline text-xs text-brand-green hover:underline"
          >
            {copy.admin.viewSite}
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{copy.admin.logout}</span>
          </button>
        </div>
      </header>

      {showPicker && !isBranchMode && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:px-8">
          <p className="text-sm font-medium text-brand-dark mb-3">{copy.admin.pickYourBranch}</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input-field py-2 text-sm max-w-xs"
              value={pickedId}
              onChange={(e) => setPickedId(e.target.value)}
            >
              {activeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleConfirmBranch}
              className="rounded-xl bg-brand-green px-5 py-2 text-sm font-bold text-white hover:bg-brand-green/90"
            >
              {copy.admin.enterBranchMode}
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {isBranchMode && activeBranch && (
        <div className="flex items-center justify-between gap-3 border-b border-brand-green/30 bg-brand-green/10 px-4 py-2.5 lg:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 shrink-0 text-brand-green" />
            <p className="text-sm font-medium text-brand-dark truncate">
              {copy.admin.branchModeActive}
              <span className="font-bold text-brand-green mr-1">{activeBranch.name}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">— {activeBranch.city}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeBranches.length > 1 && (
              <select
                className="input-field py-1 text-xs max-w-[140px] hidden sm:block"
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
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80"
            >
              <X className="h-3.5 w-3.5" />
              {copy.admin.exitBranchMode}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
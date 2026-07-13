import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  Phone,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { PHONE, PHONE_LINK } from '../../lib/constants'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useLocale } from '../../context/LocaleContext'
import { getMainBranchDisplay } from '../../lib/i18n/labels'
import { formatAuthErrorMessage } from '../../lib/authErrors'

import { Logo } from '../ui/Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { CustomerAuthModal } from '../auth/CustomerAuthModal'
import { DeleteAccountDialog } from '../auth/DeleteAccountDialog'

export function Header() {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const { navLinks, locale } = useLocale()
  const mainBranch = getMainBranchDisplay(locale)
  const { isLoggedIn, profile, signOut, deleteAccount, isLoading } = useCustomerAuth()

  const displayAccount =
    profile?.full_name?.trim() || profile?.email?.trim() || null

  useEffect(() => {
    if (!accountMenuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!accountMenuRef.current?.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [accountMenuOpen])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    setAccountMenuOpen(false)
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      setOpen(false)
      setAccountMenuOpen(false)
      setToast(copy.customerAuth.deleteAccountSuccess)
    } catch (err) {
      setToast(formatAuthErrorMessage(err))
      throw err
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md safe-top">
        <div className="container-main flex min-h-[4rem] sm:h-[4.5rem] items-center justify-between gap-2 py-2 sm:gap-4 sm:py-0">
          <Logo size="sm" showText compact className="min-w-0 flex-1 sm:flex-none sm:max-w-none" />

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  pathname === link.path
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-dark',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <a
              href={PHONE_LINK}
              title={mainBranch.phoneLabel}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-green transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{PHONE}</span>
            </a>

            {!isLoading &&
              (isLoggedIn ? (
                <div className="relative flex items-center gap-2" ref={accountMenuRef}>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-1.5 rounded-lg border border-brand-green/25 bg-brand-green/5 px-3 py-2 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green/10"
                  >
                    <ClipboardList className="h-4 w-4" />
                    {copy.myBookings.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                  >
                    <User className="h-4 w-4 text-brand-green" />
                    <span
                      className="hidden max-w-[120px] truncate xl:inline"
                      dir="ltr"
                      title={displayAccount ?? undefined}
                    >
                      {displayAccount}
                    </span>
                  </button>
                  {accountMenuOpen && (
                    <div
                      role="menu"
                      className="absolute top-full mt-2 min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg ltr:right-0 rtl:left-0"
                    >
                      <p
                        className="px-3 py-2 text-xs font-semibold text-slate-500"
                        dir="ltr"
                      >
                        {displayAccount}
                      </p>
                      <Link
                        to="/my-bookings"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ClipboardList className="h-4 w-4" />
                        {copy.myBookings.title}
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void handleSignOut()}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {copy.customerAuth.logout}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false)
                          setDeleteOpen(true)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {copy.customerAuth.deleteAccount}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-green/30 bg-brand-green/5 px-3 py-2 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green/10"
                >
                  <LogIn className="h-4 w-4" />
                  {copy.nav.login}
                </button>
              ))}

            <Link to="/cars">
              <Button size="sm">{copy.nav.bookNow}</Button>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <LanguageSwitcher compact />

            {!isLoading &&
              (isLoggedIn ? (
                <Link
                  to="/my-bookings"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-green/25 bg-brand-green/5 text-brand-green transition-colors hover:bg-brand-green/10"
                  title={copy.myBookings.title}
                  aria-label={copy.myBookings.title}
                >
                  <ClipboardList className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-brand-green/30 bg-brand-green/5 px-2 text-[10px] font-bold leading-none text-brand-green transition-colors hover:bg-brand-green/10"
                  title={copy.nav.login}
                >
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
                  <span>{copy.nav.loginShort}</span>
                </button>
              ))}

            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              onClick={() => setOpen(!open)}
              aria-label={copy.nav.menu}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 pb-4 lg:hidden shadow-lg">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-xl px-4 py-3.5 text-base font-medium min-h-[48px] flex items-center',
                    pathname === link.path
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'text-slate-600 active:bg-slate-50',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isLoading && isLoggedIn && (
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                      <User className="h-4 w-4 text-brand-green" />
                      <span>{copy.customerAuth.loggedInAs}</span>
                      <span dir="ltr" className="text-slate-600">
                        {displayAccount}
                      </span>
                    </div>
                    <Link to="/my-bookings" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px]">
                        <ClipboardList className="h-4 w-4" />
                        {copy.myBookings.title}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => void handleSignOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      {copy.customerAuth.logout}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        setOpen(false)
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      {copy.customerAuth.deleteAccount}
                    </Button>
                  </div>
                </div>
              )}

              <a
                href={PHONE_LINK}
                title={mainBranch.phoneLabel}
                className="flex min-h-[48px] flex-col items-start gap-0.5 rounded-xl px-4 py-3.5 text-base font-medium text-slate-600 active:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{PHONE}</span>
                </span>
                <span className="pr-6 text-xs text-slate-500">{mainBranch.phoneLabel}</span>
              </a>
              <Link to="/cars" onClick={() => setOpen(false)} className="mt-2">
                <Button className="w-full min-h-[48px]" size="lg">
                  {copy.nav.bookNow}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <CustomerAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[70] max-w-sm -translate-x-1/2 rounded-xl bg-brand-dark px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  )
}
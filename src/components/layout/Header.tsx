import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ClipboardList, LogIn, LogOut, Menu, Phone, User, X } from 'lucide-react'
import { MAIN_BRANCH_PHONE_LABEL, NAV_LINKS, PHONE, PHONE_LINK } from '../../lib/constants'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

import { Logo } from '../ui/Logo'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { CustomerAuthModal } from '../auth/CustomerAuthModal'

export function Header() {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { pathname } = useLocation()
  const { isLoggedIn, profile, signOut, isLoading } = useCustomerAuth()

  const displayAccount =
    profile?.full_name?.trim() || profile?.email?.trim() || null

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md safe-top">
        <div className="container-main flex min-h-14 sm:h-16 items-center justify-between gap-2 py-1.5 sm:gap-4 sm:py-0">
          <Logo size="sm" showText className="min-w-0 flex-1 pr-1 sm:flex-none sm:pr-0" />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
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
            <a
              href={PHONE_LINK}
              title={MAIN_BRANCH_PHONE_LABEL}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-green transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{PHONE}</span>
            </a>

            {!isLoading &&
              (isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-1.5 rounded-lg border border-brand-green/25 bg-brand-green/5 px-3 py-2 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green/10"
                  >
                    <ClipboardList className="h-4 w-4" />
                    {copy.myBookings.title}
                  </Link>
                  <span
                    className="hidden max-w-[120px] truncate text-xs font-semibold text-slate-600 xl:inline"
                    dir="ltr"
                    title={displayAccount ?? undefined}
                  >
                    {displayAccount}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    {copy.customerAuth.logout}
                  </button>
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

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {!isLoading && !isLoggedIn && (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="flex h-10 items-center gap-1 rounded-lg border border-brand-green/30 bg-brand-green/5 px-2.5 text-xs font-bold text-brand-green"
              >
                <LogIn className="h-3.5 w-3.5" />
                {copy.nav.login}
              </button>
            )}
            <Link to="/branches">
              <Button size="sm" variant="outline" className="min-h-[40px] px-3 text-xs">
                فروعنا
              </Button>
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              onClick={() => setOpen(!open)}
              aria-label="القائمة"
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 pb-4 lg:hidden shadow-lg">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
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

              {!isLoading && (
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  {isLoggedIn ? (
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
                    </div>
                  ) : (
                    <Button
                      className="w-full min-h-[44px]"
                      onClick={() => {
                        setOpen(false)
                        setAuthOpen(true)
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      {copy.nav.login}
                    </Button>
                  )}
                </div>
              )}

              <a
                href={PHONE_LINK}
                title={MAIN_BRANCH_PHONE_LABEL}
                className="flex min-h-[48px] flex-col items-start gap-0.5 rounded-xl px-4 py-3.5 text-base font-medium text-slate-600 active:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{PHONE}</span>
                </span>
                <span className="pr-6 text-xs text-slate-500">{MAIN_BRANCH_PHONE_LABEL}</span>
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
    </>
  )
}
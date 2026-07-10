import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, Phone, X } from 'lucide-react'
import { NAV_LINKS, TOLL_FREE, TOLL_FREE_LINK } from '../../lib/constants'
import { Logo } from '../ui/Logo'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
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

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={TOLL_FREE_LINK}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-green transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span dir="ltr">{TOLL_FREE}</span>
          </a>
          <Link to="/cars">
            <Button size="sm">{copy.nav.bookNow}</Button>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
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
            <a
              href={TOLL_FREE_LINK}
              className="flex min-h-[48px] items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-slate-600 active:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{TOLL_FREE}</span>
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
  )
}
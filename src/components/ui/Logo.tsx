import { Link } from 'react-router'
import { LOGO_URL, SITE_NAME, SITE_NAME_SHORT } from '../../lib/constants'
import { cn } from '../../lib/utils'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: LogoSize
  showText?: boolean
  linkTo?: string
  className?: string
}

const sizes: Record<LogoSize, { img: string; text: string; sub: string }> = {
  sm: { img: 'h-8 w-auto', text: 'text-sm', sub: 'text-[9px]' },
  md: { img: 'h-10 w-auto', text: 'text-base', sub: 'text-[10px]' },
  lg: { img: 'h-14 w-auto', text: 'text-lg', sub: 'text-xs' },
  xl: { img: 'h-20 sm:h-24 w-auto', text: 'text-xl', sub: 'text-sm' },
}

export function Logo({ size = 'md', showText = true, linkTo = '/', className }: LogoProps) {
  const s = sizes[size]

  const content = (
    <div className={cn('flex items-center gap-1.5 sm:gap-2.5 min-w-0', className)}>
      <img
        src={LOGO_URL}
        alt={SITE_NAME}
        className={cn(s.img, 'shrink-0 object-contain rounded-lg')}
      />
      {showText && (
        <div className="min-w-0 leading-tight">
          <span
            className={cn(
              'block font-bold text-brand-dark',
              'text-[11px] leading-snug sm:text-base',
              size === 'lg' && 'sm:text-lg',
              size === 'xl' && 'text-sm sm:text-xl',
            )}
          >
            {SITE_NAME_SHORT}
          </span>
          <span
            className={cn(
              'block text-slate-500 leading-snug',
              'text-[8px] sm:text-[10px]',
              size === 'lg' && 'sm:text-xs',
              size === 'xl' && 'text-[10px] sm:text-sm',
            )}
          >
            لتأجير السيارات
          </span>
        </div>
      )}
    </div>
  )

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }

  return content
}

/** نسخة للخلفيات الداكنة (الفوتر والهيرو) */
export function LogoLight({ size = 'md', linkTo = '/' }: { size?: LogoSize; linkTo?: string }) {
  const s = sizes[size]

  const content = (
    <div className="flex items-center gap-2.5">
      <img
        src={LOGO_URL}
        alt={SITE_NAME}
        className={cn(s.img, 'object-contain rounded-lg')}
      />
      <div className="leading-tight hidden sm:block">
        <span className={cn('block font-bold text-white', s.text)}>{SITE_NAME_SHORT}</span>
        <span className={cn('text-slate-400', s.sub)}>لتأجير السيارات</span>
      </div>
    </div>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
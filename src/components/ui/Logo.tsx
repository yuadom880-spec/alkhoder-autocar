import { Link } from 'react-router'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: LogoSize
  showText?: boolean
  linkTo?: string
  className?: string
  /** Compact layout for mobile header — two-line brand, smaller image */
  compact?: boolean
}

const sizes: Record<LogoSize, { img: string; text: string; sub: string }> = {
  sm: { img: 'h-11 w-11 sm:h-12 sm:w-12', text: 'text-sm', sub: 'text-[9px] sm:text-[10px]' },
  md: { img: 'h-12 w-12 sm:h-14 sm:w-14', text: 'text-base', sub: 'text-[10px] sm:text-xs' },
  lg: { img: 'h-16 w-16 sm:h-20 sm:w-20', text: 'text-lg sm:text-xl', sub: 'text-xs' },
  xl: { img: 'h-20 w-20 sm:h-24 sm:w-24', text: 'text-xl sm:text-2xl', sub: 'text-sm' },
}

export function Logo({
  size = 'md',
  showText = true,
  linkTo = '/',
  className,
  compact = false,
}: LogoProps) {
  const s = sizes[size]

  const content = (
    <div className={cn('flex items-center gap-1.5 min-w-0', compact && 'gap-2', className)}>
      <img
        src={LOGO_URL}
        alt={SITE_NAME}
        className={cn(
          s.img,
          'shrink-0 object-contain rounded-xl',
          compact && 'h-11 w-11 sm:h-12 sm:w-12',
        )}
      />
      {showText && (
        <div className="min-w-0 leading-tight">
          <span
            className={cn(
              'block font-bold text-brand-dark',
              compact
                ? 'text-[11px] leading-tight sm:text-xs'
                : 'truncate text-[11px] leading-snug sm:text-base',
              size === 'lg' && !compact && 'sm:text-lg',
              size === 'xl' && 'text-sm sm:text-xl',
            )}
          >
            {copy.site.logoTitle}
          </span>
          <span
            className={cn(
              'block text-slate-500 leading-tight',
              compact
                ? 'text-[9px] sm:text-[10px]'
                : 'truncate text-[8px] sm:text-[10px]',
              size === 'lg' && !compact && 'sm:text-xs',
              size === 'xl' && 'text-[10px] sm:text-sm',
            )}
          >
            {copy.site.logoSubtitle}
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
        className={cn(s.img, 'object-contain rounded-xl')}
      />
      <div className="leading-tight hidden sm:block">
        <span className={cn('block font-bold text-white', s.text)}>{copy.site.logoTitle}</span>
        <span className={cn('text-slate-400', s.sub)}>{copy.site.logoSubtitle}</span>
      </div>
    </div>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
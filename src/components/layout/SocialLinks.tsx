import type { SocialLink } from '../../lib/constants'
import { SOCIAL_LINKS } from '../../lib/constants'
import { cn } from '../../lib/utils'

function SocialIcon({ id }: { id: SocialLink['id'] }) {
  const className = 'h-5 w-5'

  if (id === 'instagram') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 0 1 1.75 1.14 4.92 4.92 0 0 1 1.14 1.75c.163.46.349 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.92 4.92 0 0 1-1.14 1.75 4.92 4.92 0 0 1-1.75 1.14c-.46.163-1.26.349-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.92 4.92 0 0 1-1.75-1.14 4.92 4.92 0 0 1-1.14-1.75c-.163-.46-.349-1.26-.403-2.43C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.92 4.92 0 0 1 1.14-1.75 4.92 4.92 0 0 1 1.75-1.14c.46-.163 1.26-.349 2.43-.403C8.416 2.175 8.796 2.163 12 2.163zm0 1.622c-3.15 0-3.52.012-4.757.069-1.024.047-1.58.218-1.948.363a3.41 3.41 0 0 0-1.24.808 3.41 3.41 0 0 0-.808 1.24c-.145.368-.316.924-.363 1.948-.057 1.237-.069 1.607-.069 4.757s.012 3.52.069 4.757c.047 1.024.218 1.58.363 1.948.19.476.47.89.808 1.24.35.35.764.63 1.24.808.368.145.924.316 1.948.363 1.237.057 1.607.069 4.757.069s3.52-.012 4.757-.069c1.024-.047 1.58-.218 1.948-.363a3.41 3.41 0 0 0 1.24-.808 3.41 3.41 0 0 0 .808-1.24c.145-.368.316-.924.363-1.948.057-1.237.069-1.607.069-4.757s-.012-3.52-.069-4.757c-.047-1.024-.218-1.58-.363-1.948a3.41 3.41 0 0 0-.808-1.24 3.41 3.41 0 0 0-1.24-.808c-.368-.145-.924-.316-1.948-.363-1.237-.057-1.607-.069-4.757-.069zm0 3.351a4.864 4.864 0 1 1 0 9.728 4.864 4.864 0 0 1 0-9.728zm0 1.622a3.242 3.242 0 1 0 0 6.484 3.242 3.242 0 0 0 0-6.484zm5.338-3.205a1.136 1.136 0 1 1-2.272 0 1.136 1.136 0 0 1 2.272 0z" />
      </svg>
    )
  }

  if (id === 'x') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

type SocialLinksProps = {
  className?: string
  iconClassName?: string
  showLabels?: boolean
  variant?: 'dark' | 'light'
}

const variantStyles = {
  dark: 'border-slate-600/60 bg-slate-800/40 text-slate-300 hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold',
  light:
    'border-white/25 bg-white/10 text-white hover:border-brand-gold/60 hover:bg-white/20 hover:text-brand-gold',
} as const

export function SocialLinks({
  className,
  iconClassName,
  showLabels = false,
  variant = 'dark',
}: SocialLinksProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          title={link.label}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border p-2.5 transition-colors',
            variantStyles[variant],
            iconClassName,
          )}
        >
          <SocialIcon id={link.id} />
          {showLabels && <span className="text-sm font-medium">{link.label}</span>}
        </a>
      ))}
    </div>
  )
}
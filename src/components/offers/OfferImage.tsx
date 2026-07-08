import { optimizeImageUrl } from '../../lib/imageUrl'
import { cn } from '../../lib/utils'

type OfferImageVariant = 'card' | 'admin'

interface OfferImageProps {
  src: string
  alt: string
  variant?: OfferImageVariant
  className?: string
  children?: React.ReactNode
}

const wrapperStyles: Record<OfferImageVariant, string> = {
  card: 'relative aspect-[4/3] overflow-hidden bg-slate-100',
  admin: 'relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100',
}

export function OfferImage({
  src,
  alt,
  variant = 'card',
  className,
  children,
}: OfferImageProps) {
  return (
    <div className={cn(wrapperStyles[variant], className)}>
      <img
        src={optimizeImageUrl(src, variant === 'card' ? 640 : 960)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
      {children}
    </div>
  )
}
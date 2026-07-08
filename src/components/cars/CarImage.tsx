import { optimizeImageUrl } from '../../lib/imageUrl'
import { cn } from '../../lib/utils'

type CarImageVariant = 'card' | 'detail' | 'thumb' | 'summary'

interface CarImageProps {
  src: string
  alt: string
  variant?: CarImageVariant
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  children?: React.ReactNode
}

const wrapperStyles: Record<CarImageVariant, string> = {
  card: 'relative aspect-[4/3] overflow-hidden bg-slate-100',
  detail: 'overflow-hidden rounded-2xl aspect-[4/3] relative bg-slate-100',
  thumb: 'h-16 w-24 overflow-hidden rounded-lg bg-slate-100',
  summary: 'h-20 w-28 overflow-hidden rounded-xl bg-slate-100 shrink-0',
}

const imageWidths: Record<CarImageVariant, number> = {
  card: 640,
  detail: 960,
  thumb: 192,
  summary: 224,
}

const imgStyles: Record<CarImageVariant, string> = {
  card: 'h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]',
  detail: 'h-full w-full object-contain',
  thumb: 'h-full w-full object-contain',
  summary: 'h-full w-full object-contain',
}

export function CarImage({
  src,
  alt,
  variant = 'card',
  className,
  imgClassName,
  loading = 'lazy',
  children,
}: CarImageProps) {
  const optimizedSrc = optimizeImageUrl(src, imageWidths[variant])

  return (
    <div className={cn(wrapperStyles[variant], className)}>
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn(imgStyles[variant], imgClassName)}
      />
      {children}
    </div>
  )
}
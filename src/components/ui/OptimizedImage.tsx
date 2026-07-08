import { cn } from '../../lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  mobileSrc?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
  ariaHidden?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  mobileSrc,
  loading = 'lazy',
  fetchPriority,
  sizes,
  ariaHidden,
}: OptimizedImageProps) {
  const imgProps = {
    alt,
    loading,
    decoding: 'async' as const,
    ...(fetchPriority ? { fetchPriority } : {}),
    ...(sizes ? { sizes } : {}),
    ...(ariaHidden ? { 'aria-hidden': true as const } : {}),
  }

  if (mobileSrc) {
    return (
      <picture>
        <source media="(max-width: 639px)" srcSet={mobileSrc} type="image/webp" />
        <source srcSet={src} type="image/webp" />
        <img src={src} className={className} {...imgProps} />
      </picture>
    )
  }

  return <img src={src} className={cn(className)} {...imgProps} />
}
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { isPersistedImageUrl, optimizeImageUrl } from '../../lib/imageUrl'
import { cn } from '../../lib/utils'

interface BranchImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  placeholderClassName?: string
}

export function BranchImage({
  src,
  alt,
  className,
  imgClassName,
  placeholderClassName,
}: BranchImageProps) {
  const [failed, setFailed] = useState(false)
  const canShow = isPersistedImageUrl(src) && !failed

  if (!canShow) {
    return (
      <div
        className={cn(
          'flex h-56 sm:h-64 lg:h-72 w-full items-center justify-center rounded-lg bg-gradient-to-bl from-brand-green/20 to-brand-dark/10',
          placeholderClassName,
          className,
        )}
      >
        <MapPin className="h-16 w-16 text-brand-green/30" />
      </div>
    )
  }

  return (
    <img
      src={optimizeImageUrl(src, 720)}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn(
        'max-h-56 sm:max-h-64 lg:max-h-72 w-auto max-w-full object-contain rounded-lg shadow-sm',
        imgClassName,
        className,
      )}
    />
  )
}
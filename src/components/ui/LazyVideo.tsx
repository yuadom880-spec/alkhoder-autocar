import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  title?: string
}

export function LazyVideo({ src, poster, className, title }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      poster={poster}
      controls
      playsInline
      preload="none"
      title={title}
      className={cn(className)}
    >
      {active ? <source src={src} type="video/mp4" /> : null}
      <track kind="captions" />
    </video>
  )
}
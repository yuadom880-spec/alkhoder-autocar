import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  className?: string
  label?: string
}

export function LoadingSpinner({ className, label = 'جاري التحميل...' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
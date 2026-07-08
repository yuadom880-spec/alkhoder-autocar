import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

interface PricesIncludeVatNoteProps {
  className?: string
  variant?: 'light' | 'dark'
}

export function PricesIncludeVatNote({ className, variant = 'light' }: PricesIncludeVatNoteProps) {
  return (
    <p
      className={cn(
        'mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'dark'
          ? 'bg-brand-gold/15 text-brand-gold'
          : 'bg-brand-green/10 text-brand-green',
        className,
      )}
    >
      {copy.shared.pricesIncludeVat}
    </p>
  )
}
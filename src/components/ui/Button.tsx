import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-green text-white hover:bg-brand-green-light shadow-md shadow-brand-green/20',
  secondary:
    'bg-brand-gold text-brand-dark hover:bg-brand-gold/90 shadow-md shadow-brand-gold/20',
  outline:
    'border-2 border-brand-green text-brand-green hover:bg-brand-green/5',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg min-h-[40px]',
  md: 'px-5 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-7 py-3.5 text-base rounded-xl min-h-[48px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
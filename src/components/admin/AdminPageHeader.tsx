import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface AdminPageHeaderProps {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}

/** عنوان صفحة إدارة — يتكيّف مع الجوال */
export function AdminPageHeader({ title, subtitle, action, className }: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-brand-dark sm:text-2xl">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0 [&_a]:block [&_button]:w-full sm:[&_button]:w-auto">{action}</div>}
    </div>
  )
}
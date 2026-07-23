import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { mode, cycle } = useTheme()
  const { icon: Icon, tip } =
    mode === 'light'
      ? { icon: Sun, tip: copy.theme.light }
      : mode === 'dark'
        ? { icon: Moon, tip: copy.theme.dark }
        : { icon: Monitor, tip: copy.theme.system }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${copy.theme.mode}: ${tip}`}
      aria-label={`${copy.theme.mode}: ${tip}`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors',
        'hover:bg-slate-100 hover:text-brand-dark',
        'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

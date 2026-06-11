import { Moon, Sun } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { useTheme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 ${
        compact
          ? 'w-9 h-9 bg-ink-muted/60 border-vellum/10 text-vellum/50 hover:text-vellum hover:bg-ink-muted'
          : 'w-11 h-11 bg-ink-muted/60 border-vellum/10 text-vellum/50 hover:text-vellum hover:bg-ink-muted'
      } ${className}`}
      aria-label={isDark ? t('theme.enableLight') : t('theme.enableDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? (
        <Sun className={compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} strokeWidth={1.5} />
      ) : (
        <Moon className={compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} strokeWidth={1.5} />
      )}
    </button>
  )
}

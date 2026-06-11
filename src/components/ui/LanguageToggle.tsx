import { Languages } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
interface LanguageToggleProps {
  className?: string
  compact?: boolean
  /** Même emprise qu’un bouton voisin (ex. thème) — largeur flexible, hauteur fixe */
  uniform?: boolean
}

export function LanguageToggle({ className = '', compact = false, uniform = false }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n()

  const toggle = () => setLocale(locale === 'fr' ? 'en' : 'fr')

  const sizeClass = uniform
    ? 'h-10 w-full min-w-0'
    : compact
      ? 'w-9 h-9'
      : 'w-11 h-11 px-2'

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center justify-center gap-1.5 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 bg-ink-muted/60 border-vellum/10 text-vellum/50 hover:text-vellum hover:bg-ink-muted ${sizeClass} ${className}`}
      aria-label={locale === 'fr' ? t('lang.switchTo') : t('lang.switchToFr')}
      title={locale === 'fr' ? 'EN' : 'FR'}
    >
      <Languages className={compact || uniform ? 'w-4 h-4 shrink-0' : 'w-4 h-4'} strokeWidth={1.5} aria-hidden="true" />
      <span className="font-mono text-[10px] font-medium uppercase">{locale === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  )
}

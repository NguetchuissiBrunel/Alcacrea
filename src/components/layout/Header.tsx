import { Logo } from '../brand/Logo'
import { WaveLine } from '../brand/WaveLine'
import { useI18n } from '../../contexts/I18nContext'

interface HeaderProps {
  title: string
  subtitle?: string
  /** Moins d'espace avant le contenu (fiches denses) */
  compact?: boolean
}

export function Header({ title, subtitle, compact = false }: HeaderProps) {
  const { t } = useI18n()
  const titleParts = title.split(' ')

  return (
    <header className={`animate-fade-up ${compact ? 'mb-6 md:mb-8' : 'mb-6 sm:mb-8 md:mb-12'}`}>
      {/* Bandeau clinique : mobile uniquement (sidebar = marque sur desktop) */}
      <div className="flex md:hidden items-center gap-3 py-2.5 px-3 mb-4 rounded-xl app-panel border border-vellum/8">
        <Logo size={22} />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-sans font-semibold tracking-[0.14em] uppercase text-breath truncate">
            {t('brand.clinic')}
          </p>
          <p className="text-[9px] font-sans font-medium tracking-[0.1em] uppercase text-clinical-muted truncate">
            {t('brand.clinicSub')}
          </p>
        </div>
      </div>

      <h1 className={`title-serif text-vellum break-words ${compact ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl md:text-[3.5rem]'}`}>
        {titleParts.length > 1 ? (
          <>
            {titleParts.slice(0, -1).join(' ')}{' '}
            <span className="title-accent">{titleParts.at(-1)}</span>
          </>
        ) : (
          <span className="title-accent">{title}</span>
        )}
      </h1>

      <WaveLine className="w-32 sm:w-48 h-3 mt-4 max-w-full" variant="dream" />

      {subtitle && (
        <p className="mt-4 text-clinical-muted text-sm max-w-lg font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  )
}

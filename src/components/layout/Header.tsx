import { Logo } from '../brand/Logo'
import { WaveLine } from '../brand/WaveLine'
import { useI18n } from '../../contexts/I18nContext'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { t } = useI18n()
  const titleParts = title.split(' ')

  return (
    <header className="mb-6 sm:mb-8 md:mb-12 animate-fade-up">
      <div className="hidden md:flex items-center gap-5 py-3 px-4 -mx-4 mb-6 rounded-2xl bg-ink-soft/60 border border-vellum/5">
        <Logo size={28} />
        <div className="flex-1" />
        <div className="text-right shrink-0">
          <p className="text-[10px] font-sans font-semibold tracking-[0.18em] uppercase text-breath">
            {t('brand.clinic')}
          </p>
          <p className="text-[10px] font-sans font-medium tracking-[0.12em] uppercase text-clinical-muted mt-0.5">
            {t('brand.clinicSub')}
          </p>
        </div>
      </div>

      <div className="flex md:hidden items-center gap-3 py-2.5 px-3 mb-4 rounded-xl bg-ink-soft/60 border border-vellum/5">
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

      <h1 className="title-serif text-3xl sm:text-4xl md:text-[3.5rem] text-vellum break-words">
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

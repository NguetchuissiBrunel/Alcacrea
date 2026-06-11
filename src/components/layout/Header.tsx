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
    <header className="mb-8 md:mb-12 animate-fade-up">
      <div className="hidden md:flex items-center gap-5 py-3 px-4 -mx-4 mb-6 rounded-2xl bg-ink-soft/60 border border-vellum/5">
        <Logo size={28} />
        <div className="flex-1" />
        <div className="text-right shrink-0">
          <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-breath/70">
            {t('brand.clinic')}
          </p>
          <p className="text-[9px] font-mono tracking-[0.14em] uppercase text-vellum/30 mt-0.5">
            {t('brand.clinicSub')}
          </p>
        </div>
      </div>

      <h1 className="title-serif text-4xl md:text-[3.5rem] text-vellum">
        {titleParts.length > 1 ? (
          <>
            {titleParts.slice(0, -1).join(' ')}{' '}
            <span className="title-accent">{titleParts.at(-1)}</span>
          </>
        ) : (
          <span className="title-accent">{title}</span>
        )}
      </h1>

      <WaveLine className="w-48 h-3 mt-4" variant="dream" />

      {subtitle && (
        <p className="mt-4 text-vellum/45 text-sm max-w-lg font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  )
}

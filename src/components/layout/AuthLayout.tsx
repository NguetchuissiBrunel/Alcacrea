import { Outlet } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import { BackgroundWaves } from '../brand/BackgroundWaves'
import { Logo } from '../brand/Logo'
import { WaveLine } from '../brand/WaveLine'
import { LanguageToggle } from '../ui/LanguageToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

export function AuthLayout() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen wave-mesh flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 safe-area-pt safe-area-pb">
      <div className="brand-thread" />
      <BackgroundWaves />

      <div className="fixed top-4 right-4 z-20 flex items-center gap-2 md:top-6 md:right-6">
        <LanguageToggle compact />
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size={48} showWordmark />
          <WaveLine className="w-32 h-2.5 mt-5" variant="dream" />
        </div>

        <div className="rounded-[var(--radius-organic)] surface-card p-6 sm:p-8 md:p-10">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-[10px] font-mono text-vellum/30 tracking-wider">
          {t('brand.clinicFooter')}
        </p>
      </div>
    </div>
  )
}

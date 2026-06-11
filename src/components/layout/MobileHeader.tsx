import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { Logo } from '../brand/Logo'
import { LanguageToggle } from '../ui/LanguageToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

export function MobileHeader() {
  const { t } = useI18n()
  const { user } = useAuth()
  const initials =
    `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <header className="app-mobile-header md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 safe-area-pt">
      <Link
        to="/"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded-lg"
        aria-label={t('nav.homeAria')}
      >
        <Logo size={28} />
      </Link>

      <div className="flex items-center gap-2">
        <LanguageToggle compact />
        <ThemeToggle compact />
        <Link
          to="/profile"
          className="w-9 h-9 rounded-xl bg-breath/12 border border-breath/20 flex items-center justify-center hover:bg-breath/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50"
          aria-label={t('nav.myProfile')}
        >
          <span className="font-mono text-[10px] text-breath font-medium">{initials}</span>
        </Link>
      </div>
    </header>
  )
}

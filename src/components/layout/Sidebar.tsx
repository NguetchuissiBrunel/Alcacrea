import { NavLink } from 'react-router-dom'
import { Activity, BarChart3, Download, Upload, UserCircle, Users } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { Logo } from '../brand/Logo'
import { LanguageToggle } from '../ui/LanguageToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Sidebar() {
  const { t } = useI18n()

  const mainNavItems = [
    { to: '/', icon: Activity, label: t('nav.overview'), shortLabel: t('nav.home') },
    { to: '/import', icon: Upload, label: t('nav.import'), shortLabel: t('nav.importShort') },
    { to: '/patients', icon: Users, label: t('nav.patients'), shortLabel: t('nav.patients') },
    { to: '/analyse', icon: BarChart3, label: t('nav.analysis'), shortLabel: t('nav.analysis') },
    { to: '/export', icon: Download, label: t('nav.export'), shortLabel: t('nav.export') },
  ]

  const navLinkClass = (isActive: boolean, compact = false) =>
    `group relative flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 ${
      compact
        ? `flex-col gap-1 flex-1 py-2.5 min-w-0 ${
            isActive ? 'text-breath' : 'text-vellum/40 hover:text-vellum'
          }`
        : `w-11 h-11 rounded-2xl ${
            isActive
              ? 'bg-breath/12 text-breath nav-active-glow'
              : 'text-vellum/35 hover:text-vellum hover:bg-ink-muted/80'
          }`
    }`

  return (
    <>
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col w-[5.5rem] py-6"
        aria-label={t('nav.main')}
      >
        <div className="flex flex-col items-center px-3 mb-8">
          <Logo size={36} />
          <span
            className="mt-4 font-serif text-[11px] text-vellum/60 tracking-wide"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            {t('brand.name')}
          </span>
        </div>

        <nav className="flex flex-col items-center gap-1.5 px-3 flex-1">
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
              <span className="absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-vellum text-ink-soft text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 shadow-lg translate-x-1 group-hover:translate-x-0 group-focus-visible:translate-x-0">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 flex flex-col items-center gap-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-breath/30 to-transparent" />
          <LanguageToggle />
          <ThemeToggle />
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 ${
                isActive
                  ? 'bg-breath/12 text-breath nav-active-glow'
                  : 'text-vellum/35 hover:text-vellum hover:bg-ink-muted/80'
              }`
            }
            aria-label={t('nav.myProfile')}
            title={t('nav.profile')}
          >
            <UserCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </NavLink>
        </div>
      </aside>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch px-2 py-2.5 bg-ink-soft/95 backdrop-blur-md border-t border-vellum/8 safe-area-pb"
        aria-label={t('nav.main')}
      >
        {mainNavItems.map(({ to, icon: Icon, label, shortLabel }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className={({ isActive }) => navLinkClass(isActive, true)}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-wide truncate max-w-full px-1">
              {shortLabel}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

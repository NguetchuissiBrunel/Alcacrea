import { NavLink } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  ClipboardList,
  Download,
  PanelLeft,
  PanelLeftClose,
  Upload,
  UserCircle,
  Users,
} from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { useSidebar } from '../../contexts/SidebarContext'
import { Logo } from '../brand/Logo'
import { LanguageToggle } from '../ui/LanguageToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Sidebar() {
  const { t } = useI18n()
  const { collapsed, toggleSidebar } = useSidebar()

  const mainNavItems = [
    { to: '/', icon: Activity, label: t('nav.home') },
    { to: '/import', icon: Upload, label: t('nav.import') },
    { to: '/exams', icon: ClipboardList, label: t('nav.exams') },
    { to: '/patients', icon: Users, label: t('nav.patients') },
    { to: '/analyse', icon: BarChart3, label: t('nav.analysis') },
    { to: '/export', icon: Download, label: t('nav.export') },
  ]

  const mobileNavItems = mainNavItems.map((item, index) => {
    const shortLabels = [
      t('nav.home'),
      t('nav.importShort'),
      t('nav.examsShort'),
      t('nav.patients'),
      t('nav.analysis'),
      t('nav.export'),
    ]
    return { ...item, shortLabel: shortLabels[index] ?? item.label }
  })

  const desktopLinkClass = (isActive: boolean) =>
    `group relative flex items-center rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 ${
      collapsed ? 'justify-center w-11 h-11 mx-auto' : 'gap-3 px-3 py-2.5 w-full'
    } ${
      isActive
        ? 'bg-breath/14 text-breath nav-active-glow'
        : 'text-vellum/70 hover:text-vellum hover:bg-ink-muted'
    }`

  const mobileLinkClass = (isActive: boolean) =>
    `group relative flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-w-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 ${
      isActive ? 'text-breath' : 'text-vellum/50 hover:text-vellum'
    }`

  return (
    <>
      <aside
        className={`app-sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col transition-[width] duration-300 ease-out ${
          collapsed ? 'w-[5.5rem]' : 'w-[13rem]'
        }`}
        aria-label={t('nav.main')}
      >
        <div className={`shrink-0 px-2 ${collapsed ? 'pt-3 pb-2' : 'pt-3 pb-2 border-b border-vellum/10'}`}>
          {collapsed ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-vellum/10 bg-ink-muted/50 text-vellum/55 hover:text-vellum hover:bg-ink-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 shadow-sm"
                aria-label={t('nav.expandSidebar')}
                title={t('nav.expand')}
              >
                <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-1">
              <NavLink
                to="/"
                end
                className="flex items-center min-w-0 gap-3 px-1 py-1 flex-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50"
                aria-label={t('nav.homeAria')}
              >
                <Logo size={30} />
                <span className="font-serif text-lg text-vellum leading-none truncate">{t('brand.name')}</span>
              </NavLink>

              <button
                type="button"
                onClick={toggleSidebar}
                className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl text-vellum/55 hover:text-vellum hover:bg-ink-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50"
                aria-label={t('nav.collapseSidebar')}
                title={t('nav.collapse')}
              >
                <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>

        <nav className={`flex flex-col flex-1 min-h-0 px-2 ${collapsed ? 'items-center gap-1 pt-2' : 'gap-0.5 pt-1'}`}>
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              title={collapsed ? label : undefined}
              className={({ isActive }) => desktopLinkClass(isActive)}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-ink-soft text-vellum text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-md border border-vellum/10 z-[60]">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`shrink-0 px-2 pb-4 pt-2 border-t border-vellum/10 ${collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2'}`}>
          {!collapsed && (
            <div className="grid grid-cols-2 gap-2 px-1 pt-3">
              <LanguageToggle uniform />
              <ThemeToggle uniform />
            </div>
          )}
          {collapsed && (
            <>
              <LanguageToggle />
              <ThemeToggle />
            </>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) => desktopLinkClass(isActive)}
            aria-label={t('nav.myProfile')}
            title={collapsed ? t('nav.profile') : undefined}
          >
            <UserCircle className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="text-sm font-medium truncate">{t('nav.profile')}</span>}
          </NavLink>
        </div>
      </aside>

      <nav
        className="app-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch gap-0.5 px-1.5 sm:px-2 py-2 safe-area-pb"
        aria-label={t('nav.main')}
      >
        {mobileNavItems.map(({ to, icon: Icon, label, shortLabel }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className={({ isActive }) => mobileLinkClass(isActive)}
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[9px] sm:text-[10px] font-medium tracking-wide truncate max-w-full px-0.5">
              {shortLabel}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

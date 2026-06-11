import { Outlet, useNavigate } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import { SidebarProvider } from '../../contexts/SidebarContext'
import { BackgroundWaves } from '../brand/BackgroundWaves'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <SidebarProvider>
      <div className="min-h-screen wave-mesh">
        <a href="#main-content" className="skip-link">
          {t('nav.skipToContent')}
        </a>

        <div className="brand-thread" />
        <BackgroundWaves />

        <MobileHeader />
        <Sidebar />

        <main
          id="main-content"
          className="relative z-10 page-shell px-4 sm:px-6 md:pl-[calc(var(--sidebar-width,13rem)+1.25rem)] md:pr-8 lg:pr-10 pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pt-8 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-10 max-w-[1580px] mx-auto w-full transition-[padding] duration-300"
        >
          <ErrorBoundary onReset={() => navigate(0)}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </SidebarProvider>
  )
}

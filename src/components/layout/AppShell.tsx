import { Outlet, useNavigate } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import { BackgroundWaves } from '../brand/BackgroundWaves'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
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
        className="relative z-10 page-shell px-4 sm:px-6 md:pl-[5.5rem] md:pr-10 lg:pr-12 pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pt-8 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-10 max-w-[1380px] mx-auto w-full"
      >
        <ErrorBoundary onReset={() => navigate(0)}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

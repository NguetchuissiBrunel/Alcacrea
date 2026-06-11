import { Outlet } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import { BackgroundWaves } from '../brand/BackgroundWaves'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { t } = useI18n()

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
        className="relative z-10 px-4 md:pl-[5.5rem] md:pr-12 pr-4 pt-[4.25rem] md:pt-8 md:py-10 pb-24 md:pb-10 max-w-[1380px] mx-auto"
      >
        <Outlet />
      </main>
    </div>
  )
}

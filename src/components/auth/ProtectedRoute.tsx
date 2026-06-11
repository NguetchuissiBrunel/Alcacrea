import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { isAuthenticated } from '../../services/authApi'

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()
  const { t } = useI18n()

  if (loading || (isAuthenticated() && !user)) {
    return (
      <div className="min-h-screen wave-mesh flex flex-col items-center justify-center gap-4 px-6">
        <Loader2 className="w-8 h-8 text-breath animate-spin" aria-hidden="true" />
        <p className="text-vellum/50 font-mono text-sm">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

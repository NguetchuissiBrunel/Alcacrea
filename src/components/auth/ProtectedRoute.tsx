import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { enrichAuthUser, isAuthenticated } from '../../services/authApi'
import { hasStoredSession, readCachedAuthUser } from '../../services/authSession'

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()
  const { t } = useI18n()
  const cachedUser = readCachedAuthUser()
  const sessionUser = user ?? (cachedUser ? enrichAuthUser(cachedUser) : null)

  if (loading || (hasStoredSession() && !sessionUser)) {
    return (
      <div className="min-h-screen wave-mesh flex flex-col items-center justify-center gap-4 px-6">
        <Loader2 className="w-8 h-8 text-breath animate-spin" aria-hidden="true" />
        <p className="text-vellum/50 font-mono text-sm">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isAuthenticated() || !sessionUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

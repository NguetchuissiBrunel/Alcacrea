import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthToken } from '../../lib/setupOpenApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export function ProtectedRoute() {
  const { loading } = useAuth()
  const location = useLocation()

  if (USE_MOCK) return <Outlet />

  if (loading) {
    return (
      <div className="py-20 text-center text-vellum/40 font-mono text-sm animate-pulse">
        …
      </div>
    )
  }

  if (!getAuthToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../lib/core/ApiError'
import type { AuthUser } from '../services/authApi'
import * as authApi from '../services/authApi'
import {
  cacheAuthUser,
  clearAuthSession,
  ensureValidAccessToken,
  hasStoredSession,
  readCachedAuthUser,
  registerSessionExpiredHandler,
} from '../services/authSession'
import { invalidateBackendCache } from '../services/backendData'
import { api } from '../services/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

let refreshUserInFlight: Promise<void> | null = null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    hasStoredSession() ? readCachedAuthUser() : null,
  )
  const [loading, setLoading] = useState(true)

  const applyUser = useCallback((me: AuthUser | null) => {
    setUser(me)
    if (me) cacheAuthUser(me)
  }, [])

  const refreshUser = useCallback(async () => {
    if (refreshUserInFlight) return refreshUserInFlight

    refreshUserInFlight = (async () => {
      if (!hasStoredSession()) {
        setUser(null)
        return
      }

      const hasSession = await ensureValidAccessToken()
      if (!hasSession) {
        clearAuthSession()
        setUser(null)
        return
      }

      try {
        const me = await authApi.getMe()
        applyUser(me)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession()
          setUser(null)
          return
        }
        const cached = readCachedAuthUser()
        if (cached) setUser(cached)
      }
    })().finally(() => {
      refreshUserInFlight = null
    })

    return refreshUserInFlight
  }, [applyUser])

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      clearAuthSession()
      setUser(null)
    })
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && hasStoredSession()) {
        void refreshUser().catch(() => {})
      }
    }, 5 * 60 * 1000)
    return () => window.clearInterval(interval)
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const me = await authApi.login(email, password)
      invalidateBackendCache()
      api.invalidateCache()
      applyUser(me)
    },
    [applyUser],
  )

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => {
      const me = await authApi.updateProfile(data)
      applyUser(me)
    },
    [applyUser],
  )

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      updateProfile,
      forgotPassword,
      resetPassword,
    }),
    [user, loading, login, logout, refreshUser, updateProfile, forgotPassword, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

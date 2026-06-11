import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../services/authApi'
import * as authApi from '../services/authApi'
import { getAuthToken } from '../lib/setupOpenApi'
import { invalidateBackendCache } from '../services/backendData'
import { api } from '../services/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null)
      return
    }
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const me = await authApi.login(email, password)
    invalidateBackendCache()
    api.invalidateCache()
    setUser(me)
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    await authApi.register(email, password, fullName)
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => {
      const me = await authApi.updateProfile(data)
      setUser(me)
    },
    [],
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
      register,
      logout,
      refreshUser,
      updateProfile,
      forgotPassword,
      resetPassword,
    }),
    [user, loading, login, register, logout, refreshUser, updateProfile, forgotPassword, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

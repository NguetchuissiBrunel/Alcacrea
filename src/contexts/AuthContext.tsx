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

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isMock: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const mockUser: AuthUser = {
  email: 'dr.martin@alcacrea.fr',
  fullName: 'Sophie Martin',
  prenom: 'Sophie',
  nom: 'Martin',
  role: 'praticien',
  createdAt: '2024-01-15',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(USE_MOCK ? mockUser : null)
  const [loading, setLoading] = useState(!USE_MOCK)

  const refreshUser = useCallback(async () => {
    if (USE_MOCK) {
      setUser(mockUser)
      return
    }
    if (!getAuthToken()) {
      setUser(null)
      return
    }
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  useEffect(() => {
    if (USE_MOCK) {
      setLoading(false)
      return
    }
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    if (USE_MOCK) {
      setUser(mockUser)
      return
    }
    const me = await authApi.login(email, password)
    setUser(me)
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (USE_MOCK) return
    await authApi.register(email, password, fullName)
  }, [])

  const logout = useCallback(() => {
    if (!USE_MOCK) authApi.logout()
    setUser(USE_MOCK ? mockUser : null)
  }, [])

  const updateProfile = useCallback(
    async (data: { fullName?: string; oldPassword?: string; newPassword?: string }) => {
      if (USE_MOCK) {
        if (data.fullName) {
          const parts = data.fullName.split(' ')
          setUser((u) =>
            u
              ? {
                  ...u,
                  fullName: data.fullName!,
                  prenom: parts.slice(0, -1).join(' '),
                  nom: parts[parts.length - 1] ?? u.nom,
                }
              : u,
          )
        }
        return
      }
      const me = await authApi.updateProfile(data)
      setUser(me)
    },
    [],
  )

  const forgotPassword = useCallback(async (email: string) => {
    if (USE_MOCK) return
    await authApi.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    if (USE_MOCK) return
    await authApi.resetPassword(token, newPassword)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isMock: USE_MOCK,
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

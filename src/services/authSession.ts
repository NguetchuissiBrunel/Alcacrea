import { API_BASE_URL } from '../config/env'
import { getAuthToken, setAuthToken } from '../lib/setupOpenApi'
import { unwrapApiEnvelope } from '../utils/apiEnvelope'
import type { AuthUser } from './authApi'

export const REFRESH_TOKEN_KEY = 'alcacrea-refresh-token'
const USER_CACHE_KEY = 'alcacrea-user-cache'

type SessionExpiredHandler = () => void

let onSessionExpired: SessionExpiredHandler | null = null
let refreshInFlight: Promise<boolean> | null = null

export function registerSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearAuthSession() {
  setAuthToken(null)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('alcacrea-user-cache')
}

function decodeJwtExpiry(token: string): number | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const payload = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

export function cacheAuthUser(user: AuthUser) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  } catch {
    /* quota / private mode */
  }
}

export function readCachedAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function hasStoredSession(): boolean {
  return !!(getAuthToken() || getRefreshToken())
}

function isAccessTokenExpired(): boolean {
  const token = getAuthToken()
  if (!token) return true
  const exp = decodeJwtExpiry(token)
  if (!exp) return false
  return Date.now() / 1000 >= exp
}

/** Vrai si le token expire bientôt (refresh proactif en arrière-plan). */
export function isAccessTokenStale(bufferSec = 90): boolean {
  const token = getAuthToken()
  if (!token) return true
  const exp = decodeJwtExpiry(token)
  if (!exp) return false
  return Date.now() / 1000 >= exp - bufferSec
}

export function responseHasAuthTokens(res: unknown): boolean {
  return extractToken(res) !== null
}

function extractToken(res: unknown): string | null {
  if (typeof res === 'string' && res.length > 10) return res
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>

  for (const value of [r.access_token, r.token, r.accessToken, r.jwt, r.auth_token]) {
    if (typeof value === 'string' && value.length > 0) return value
  }

  for (const key of ['data', 'tokens', 'auth', 'result']) {
    const nested = r[key]
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>
      const token = n.access_token ?? n.token ?? n.accessToken
      if (typeof token === 'string' && token.length > 0) return token
    }
  }

  return null
}

function extractRefreshToken(res: unknown): string | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>

  for (const value of [r.refresh_token, r.refreshToken]) {
    if (typeof value === 'string' && value.length > 0) return value
  }

  for (const key of ['data', 'tokens', 'auth', 'result']) {
    const nested = r[key]
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>
      const refresh = n.refresh_token ?? n.refreshToken
      if (typeof refresh === 'string' && refresh.length > 0) return refresh
    }
  }

  return null
}

export function storeAuthTokens(res: unknown) {
  const token = extractToken(res)
  if (!token) throw new Error('Token manquant dans la réponse')
  setAuthToken(token)
  const refresh = extractRefreshToken(res)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function isAuthApiPath(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  )
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    try {
      const base = API_BASE_URL || ''
      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Accept: 'application/json',
        },
      })

      if (!res.ok) return false

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      const payload = unwrapApiEnvelope(data)
      const access = extractToken(payload) ?? extractToken(data)
      if (!access) return false

      setAuthToken(access)
      const rotated = extractRefreshToken(payload) ?? extractRefreshToken(data)
      if (rotated) localStorage.setItem(REFRESH_TOKEN_KEY, rotated)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export async function ensureValidAccessToken(): Promise<boolean> {
  if (!hasStoredSession()) return false

  const token = getAuthToken()
  if (token && !isAccessTokenExpired()) {
    if (isAccessTokenStale() && getRefreshToken() && !refreshInFlight) {
      void refreshAccessToken()
    }
    return true
  }

  if (getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return true
  }

  return !!getAuthToken()
}

/** Fetch authentifié avec refresh automatique sur 401. */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  await ensureValidAccessToken()

  const run = async (retried: boolean): Promise<Response> => {
    const token = getAuthToken()
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const res = await fetch(input, { ...init, headers })
    if (res.status === 401 && !retried) {
      const refreshed = await refreshAccessToken()
      if (refreshed) return run(true)
      notifySessionExpired()
    }
    return res
  }

  return run(false)
}

export function notifySessionExpired() {
  clearAuthSession()
  onSessionExpired?.()
}

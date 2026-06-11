import { AuthenticationService } from '../lib'
import { ApiError } from '../lib/core/ApiError'
import { API_BASE_URL } from '../config/env'
import { getAuthToken, setAuthToken } from '../lib/setupOpenApi'
import { unwrapApiEnvelope } from '../utils/apiEnvelope'

const REFRESH_TOKEN_KEY = 'alcacrea-refresh-token'

export interface AuthUser {
  email: string
  fullName: string
  prenom: string
  nom: string
  role?: string
  createdAt?: string
}

function parseName(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return { prenom: '', nom: parts[0] ?? '' }
  return { prenom: parts.slice(0, -1).join(' '), nom: parts[parts.length - 1] }
}

function mapUser(res: Record<string, unknown>): AuthUser {
  const row = unwrapApiEnvelope(res) as Record<string, unknown>
  const prenom = String(row.prenom ?? '')
  const nom = String(row.nom ?? '')
  const fullName = String(row.full_name ?? row.fullName ?? row.name ?? `${prenom} ${nom}`.trim())
  const parsed = prenom || nom ? { prenom, nom } : parseName(fullName)
  return {
    email: String(row.email ?? ''),
    fullName,
    prenom: parsed.prenom,
    nom: parsed.nom,
    role: row.role ? String(row.role) : undefined,
    createdAt: row.created_at || row.createdAt ? String(row.created_at ?? row.createdAt) : undefined,
  }
}

function mapUserFromLoginResponse(res: unknown): AuthUser | null {
  if (!res || typeof res !== 'object') return null
  const root = res as Record<string, unknown>
  if (root.user && typeof root.user === 'object') {
    return mapUser(root.user as Record<string, unknown>)
  }
  if (root.email) return mapUser(root)
  return null
}

function extractToken(res: unknown): string | null {
  if (typeof res === 'string' && res.length > 10) return res
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>

  const direct = [r.access_token, r.token, r.accessToken, r.jwt, r.auth_token]
  for (const value of direct) {
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
  const refresh = r.refresh_token ?? r.refreshToken
  return typeof refresh === 'string' && refresh.length > 0 ? refresh : null
}

function storeTokens(res: unknown) {
  const token = extractToken(res)
  if (!token) throw new Error('Token manquant dans la réponse')
  setAuthToken(token)
  const refresh = extractRefreshToken(res)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  else localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as Record<string, unknown> | undefined
    if (body?.detail) {
      if (typeof body.detail === 'string') return body.detail
      if (Array.isArray(body.detail)) {
        return body.detail.map((d) => String((d as { msg?: string }).msg ?? d)).join(', ')
      }
    }
    if (body?.message) return String(body.message)
    return err.message
  }
  return err instanceof Error ? err.message : 'Une erreur est survenue'
}

async function loginRequest(email: string, password: string): Promise<unknown> {
  const base = API_BASE_URL || ''
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    throw new Error('Réponse login invalide')
  }

  if (!res.ok) {
    throw new ApiError(
      { method: 'POST', url: '/api/v1/auth/login' },
      { url: res.url, ok: res.ok, status: res.status, statusText: res.statusText, body: data },
      typeof (data as Record<string, unknown>)?.detail === 'string'
        ? String((data as Record<string, unknown>).detail)
        : 'Échec de connexion',
    )
  }

  return unwrapApiEnvelope(data)
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await loginRequest(email, password)
  storeTokens(res)

  const fromLogin = mapUserFromLoginResponse(res)
  if (fromLogin) return fromLogin

  return getMe()
}

export async function register(email: string, password: string, fullName: string): Promise<void> {
  await AuthenticationService.registerApiV1AuthRegisterPost({ email, password, full_name: fullName })
}

export async function getMe(): Promise<AuthUser> {
  const res = await AuthenticationService.getMeApiV1AuthMeGet()
  return mapUser(res as Record<string, unknown>)
}

export async function updateProfile(data: {
  fullName?: string
  oldPassword?: string
  newPassword?: string
}): Promise<AuthUser> {
  const res = await AuthenticationService.updateMeApiV1AuthMePut({
    full_name: data.fullName,
    old_password: data.oldPassword,
    new_password: data.newPassword,
  })
  return mapUser((res ?? {}) as Record<string, unknown>)
}

export async function forgotPassword(email: string): Promise<void> {
  await AuthenticationService.forgotPasswordApiV1AuthForgotPasswordPost({ email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await AuthenticationService.resetPasswordApiV1AuthResetPasswordPost({ token, new_password: newPassword })
}

export function logout() {
  setAuthToken(null)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

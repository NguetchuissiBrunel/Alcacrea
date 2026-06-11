import { AuthenticationService } from '../lib'
import { ApiError } from '../lib/core/ApiError'
import { API_BASE_URL } from '../config/env'
import { getAuthToken } from '../lib/setupOpenApi'
import { unwrapApiEnvelope } from '../utils/apiEnvelope'
import {
  clearAuthSession,
  getRefreshToken,
  refreshAccessToken,
  storeAuthTokens,
} from './authSession'

export interface AuthUser {
  id?: string
  email: string
  fullName: string
  prenom: string
  nom: string
  role?: string
  createdAt?: string
}

function parseName(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { prenom: '', nom: '' }
  if (parts.length === 1) return { prenom: parts[0], nom: '' }
  return { prenom: parts.slice(0, -1).join(' '), nom: parts[parts.length - 1] }
}

function mapUser(res: Record<string, unknown>): AuthUser {
  const row = unwrapApiEnvelope(res) as Record<string, unknown>
  const prenom = String(row.prenom ?? row.first_name ?? row.firstName ?? row.given_name ?? '')
  const nom = String(row.nom ?? row.last_name ?? row.lastName ?? row.family_name ?? '')
  const fullName = String(row.full_name ?? row.fullName ?? row.name ?? `${prenom} ${nom}`.trim())
  const parsed =
    prenom.trim() || nom.trim()
      ? { prenom: prenom.trim(), nom: nom.trim() }
      : parseName(fullName)
  return {
    id: row.id != null ? String(row.id) : undefined,
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

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Session expirée — reconnectez-vous'
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

  const payload = unwrapApiEnvelope(data)
  try {
    storeAuthTokens(payload)
  } catch {
    storeAuthTokens(data)
  }
  return payload
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await loginRequest(email, password)

  const fromLogin = mapUserFromLoginResponse(res)
  if (fromLogin) return fromLogin

  return getMe()
}

export async function getMe(): Promise<AuthUser> {
  try {
    const res = await AuthenticationService.getMeApiV1AuthMeGet()
    return mapUser(res as Record<string, unknown>)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        const res = await AuthenticationService.getMeApiV1AuthMeGet()
        return mapUser(res as Record<string, unknown>)
      }
    }
    throw err
  }
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
  clearAuthSession()
}

export function isAuthenticated(): boolean {
  return !!(getAuthToken() || getRefreshToken())
}

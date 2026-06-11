import { AuthenticationService } from '../lib'
import { ApiError } from '../lib/core/ApiError'
import { API_BASE_URL } from '../config/env'
import { getAuthToken } from '../lib/setupOpenApi'
import { unwrapApiEnvelope } from '../utils/apiEnvelope'
import {
  authenticatedFetch,
  clearAuthSession,
  getRefreshToken,
  readLoginEmail,
  refreshAccessToken,
  storeAuthTokens,
  storeLoginEmail,
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

function decodeJwtClaims(token: string): Record<string, unknown> {
  try {
    const segment = token.split('.')[1]
    if (!segment) return {}
    return JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>
  } catch {
    return {}
  }
}

function extractUserRow(raw: unknown): Record<string, unknown> {
  let row = unwrapApiEnvelope(raw)
  if (!row || typeof row !== 'object' || Array.isArray(row)) return {}

  let obj = { ...(row as Record<string, unknown>) }
  for (const key of ['user', 'profile', 'account', 'me']) {
    const nested = obj[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      obj = { ...(nested as Record<string, unknown>), ...obj }
    }
  }
  return obj
}

export function isProfileUsable(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  return !!(user.email.trim() || user.fullName.trim() || user.prenom.trim() || user.nom.trim())
}

function mergeAuthUsers(primary: AuthUser, fallback?: AuthUser | null): AuthUser {
  if (!fallback) return primary
  return {
    id: primary.id ?? fallback.id,
    email: primary.email.trim() || fallback.email,
    fullName: primary.fullName.trim() || fallback.fullName,
    prenom: primary.prenom.trim() || fallback.prenom,
    nom: primary.nom.trim() || fallback.nom,
    role: primary.role ?? fallback.role,
    createdAt: primary.createdAt ?? fallback.createdAt,
  }
}

export function enrichAuthUser(user: AuthUser, loginEmail?: string | null): AuthUser {
  let enriched = { ...user }
  const storedEmail = loginEmail ?? readLoginEmail()
  const token = getAuthToken()
  const claims = token ? decodeJwtClaims(token) : {}

  if (!enriched.email.trim()) {
    enriched.email = String(
      claims.email ??
        claims.sub ??
        claims.username ??
        claims.user_email ??
        storedEmail ??
        '',
    )
  }

  if (!enriched.fullName.trim()) {
    const claimName = String(claims.full_name ?? claims.name ?? claims.fullName ?? '')
    if (claimName.trim()) enriched.fullName = claimName.trim()
  }

  if (!enriched.prenom.trim() && !enriched.nom.trim() && enriched.fullName.trim()) {
    const parsed = parseName(enriched.fullName)
    enriched = { ...enriched, ...parsed }
  }

  if (!enriched.fullName.trim() && (enriched.prenom.trim() || enriched.nom.trim())) {
    enriched.fullName = `${enriched.prenom} ${enriched.nom}`.trim()
  }

  return enriched
}

function mapUser(raw: unknown): AuthUser {
  const row = extractUserRow(raw)
  const prenom = String(row.prenom ?? row.first_name ?? row.firstName ?? row.given_name ?? '')
  const nom = String(row.nom ?? row.last_name ?? row.lastName ?? row.family_name ?? '')
  const fullName = String(row.full_name ?? row.fullName ?? row.name ?? `${prenom} ${nom}`.trim())
  const parsed =
    prenom.trim() || nom.trim()
      ? { prenom: prenom.trim(), nom: nom.trim() }
      : parseName(fullName)

  const user: AuthUser = {
    id: row.id != null ? String(row.id) : undefined,
    email: String(row.email ?? row.mail ?? row.username ?? ''),
    fullName,
    prenom: parsed.prenom,
    nom: parsed.nom,
    role: row.role ? String(row.role) : undefined,
    createdAt: row.created_at || row.createdAt ? String(row.created_at ?? row.createdAt) : undefined,
  }

  return enrichAuthUser(user)
}

async function fetchMeRaw(): Promise<unknown> {
  const base = API_BASE_URL || ''
  const res = await authenticatedFetch(`${base}/api/v1/auth/me`, {
    headers: { Accept: 'application/json' },
  })

  const text = await res.text()
  let data: unknown = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Réponse profil invalide')
  }

  if (!res.ok) {
    throw new ApiError(
      { method: 'GET', url: '/api/v1/auth/me' },
      { url: res.url, ok: res.ok, status: res.status, statusText: res.statusText, body: data },
      typeof (data as Record<string, unknown>)?.detail === 'string'
        ? String((data as Record<string, unknown>).detail)
        : 'Impossible de charger le profil',
    )
  }

  return data
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
    storeAuthTokens(payload, data)
  } catch {
    storeAuthTokens(data)
  }
  return payload
}

export async function login(email: string, password: string): Promise<AuthUser> {
  storeLoginEmail(email)
  const payload = await loginRequest(email, password)

  try {
    return await getMe()
  } catch {
    const fromLogin = enrichAuthUser(mapUser(payload), email)
    if (isProfileUsable(fromLogin)) return fromLogin
    throw new Error('Connexion réussie mais profil introuvable')
  }
}

export async function getMe(): Promise<AuthUser> {
  const load = async (): Promise<AuthUser> => {
    const raw = await fetchMeRaw()
    let user = mapUser(raw)

    if (!isProfileUsable(user)) {
      try {
        const generated = await AuthenticationService.getMeApiV1AuthMeGet()
        user = mergeAuthUsers(mapUser(generated), user)
      } catch {
        /* fallback déjà tenté */
      }
    }

    if (!isProfileUsable(user)) {
      user = enrichAuthUser(user)
    }

    return user
  }

  try {
    return await load()
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await refreshAccessToken()
      if (refreshed) return load()
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
  const user = mapUser(res ?? {})
  return isProfileUsable(user) ? user : enrichAuthUser(user)
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

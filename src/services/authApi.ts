import { AuthenticationService } from '../lib'
import { ApiError } from '../lib/core/ApiError'
import { getAuthToken, setAuthToken } from '../lib/setupOpenApi'

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
  const fullName = String(res.full_name ?? res.fullName ?? res.name ?? '')
  const { prenom, nom } = parseName(fullName)
  return {
    email: String(res.email ?? ''),
    fullName,
    prenom,
    nom,
    role: res.role ? String(res.role) : undefined,
    createdAt: res.created_at ? String(res.created_at) : undefined,
  }
}

function extractToken(res: unknown): string | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  const token = r.access_token ?? r.token
  return token ? String(token) : null
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as Record<string, unknown> | undefined
    if (body?.detail) {
      if (typeof body.detail === 'string') return body.detail
      if (Array.isArray(body.detail)) return body.detail.map((d) => String((d as { msg?: string }).msg ?? d)).join(', ')
    }
    return err.message
  }
  return err instanceof Error ? err.message : 'Une erreur est survenue'
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await AuthenticationService.loginApiV1AuthLoginPost({ email, password })
  const token = extractToken(res)
  if (!token) throw new Error('Token manquant dans la réponse')
  setAuthToken(token)
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
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

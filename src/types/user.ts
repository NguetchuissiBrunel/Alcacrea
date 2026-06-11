export type UserRole = 'praticien' | 'admin'

/** Profil utilisateur tel que renvoyé par GET /api/v1/auth/me */
export interface User {
  id?: string
  email: string
  full_name?: string
  prenom?: string
  nom?: string
  role?: UserRole
  created_at?: string
  createdAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

/** Corps PUT /api/v1/auth/me (OpenAPI UserUpdate) */
export interface UpdateProfilePayload {
  full_name?: string
  old_password?: string
  new_password?: string
}

export interface AuthResponse {
  access_token?: string
  token?: string
  refresh_token?: string
  user?: User
}

export const roleLabels: Record<UserRole, string> = {
  praticien: 'Praticien',
  admin: 'Administrateur',
}

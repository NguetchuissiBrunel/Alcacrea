export type UserRole = 'praticien' | 'admin'

export interface User {
  id: string
  email: string
  prenom: string
  nom: string
  role: UserRole
  specialite?: string
  etablissement?: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  prenom: string
  nom: string
  specialite?: string
  etablissement?: string
}

export interface UpdateProfilePayload {
  prenom?: string
  nom?: string
  specialite?: string
  etablissement?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const roleLabels: Record<UserRole, string> = {
  praticien: 'Praticien',
  admin: 'Administrateur',
}

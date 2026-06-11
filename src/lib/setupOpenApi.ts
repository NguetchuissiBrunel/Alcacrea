import { API_BASE_URL } from '../config/env'
import { OpenAPI } from './core/OpenAPI'

const TOKEN_KEY = 'alcacrea-token'

export function setupOpenApi() {
  OpenAPI.BASE = API_BASE_URL
  OpenAPI.TOKEN = async () => localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

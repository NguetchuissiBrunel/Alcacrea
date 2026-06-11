import { OpenAPI } from './core/OpenAPI'

const TOKEN_KEY = 'alcacrea-token'

export function setupOpenApi() {
  OpenAPI.BASE = import.meta.env.VITE_API_URL ?? 'https://parser.datapipe.duckdns.org'
  OpenAPI.TOKEN = async () => localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

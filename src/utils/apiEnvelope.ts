import { ApiError } from '../lib/core/ApiError'

/** Déplie les réponses API `{ code, message, data }` du MedicalBackend. */
export function unwrapApiEnvelope<T = unknown>(body: unknown): T {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body as T
  const root = body as Record<string, unknown>
  if ('data' in root && (typeof root.code === 'number' || typeof root.message === 'string')) {
    const code = typeof root.code === 'number' ? root.code : 200
    if (code >= 400) {
      throw new Error(String(root.message ?? 'Erreur API'))
    }
    return root.data as T
  }
  return body as T
}

const NAMED_LIST_KEYS = [
  'items',
  'results',
  'records',
  'list',
  'exams',
  'rows',
  'content',
  'polysomnographies',
  'polygraphies',
  'polygraphie_ppcs',
  'efr_standards',
  'efr_avancees',
  'data',
] as const

function findFirstObjectArray(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 5) return []
  if (Array.isArray(value)) {
    if (value.length === 0 || (typeof value[0] === 'object' && value[0] !== null)) {
      return value as Record<string, unknown>[]
    }
    return []
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      const found = findFirstObjectArray(nested, depth + 1)
      if (found.length > 0) return found
    }
  }
  return []
}

export function extractApiItems(res: unknown): Record<string, unknown>[] {
  const payload = unwrapApiEnvelope(res)

  if (Array.isArray(payload)) return payload as Record<string, unknown>[]

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    for (const key of NAMED_LIST_KEYS) {
      const value = obj[key]
      if (Array.isArray(value)) return value as Record<string, unknown>[]
    }
    const fallback = findFirstObjectArray(obj)
    if (fallback.length > 0) return fallback
  }

  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const root = res as Record<string, unknown>
    const nested = root.data
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const inner = nested as Record<string, unknown>
      for (const key of NAMED_LIST_KEYS) {
        const value = inner[key]
        if (Array.isArray(value)) return value as Record<string, unknown>[]
      }
    }
  }

  return []
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export function extractPaginationMeta(res: unknown): PaginationMeta {
  const payload = unwrapApiEnvelope(res)
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { total: 0, page: 1, limit: 0 }
  }
  const obj = payload as Record<string, unknown>
  return {
    total: Number(obj.total ?? obj.total_count ?? obj.count ?? obj.total_items ?? 0),
    page: Number(obj.page ?? obj.current_page ?? 1),
    limit: Number(obj.limit ?? obj.per_page ?? obj.page_size ?? 0),
  }
}

/** Aplatit les objets imbriqués (`exam`, `attributes`, etc.) renvoyés par le backend. */
export function normalizeExamRawRow(raw: Record<string, unknown>): Record<string, unknown> {
  let row = { ...raw }
  for (const key of ['exam', 'record', 'attributes', 'payload', 'result']) {
    const nested = row[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      row = { ...(nested as Record<string, unknown>), ...row }
    }
  }
  return row
}

export function parseExamRowId(raw: Record<string, unknown>): number {
  const candidates = [
    raw.id,
    raw.exam_id,
    raw.record_id,
    raw.polysomnographie_id,
    raw.polygraphie_ppc_id,
    raw.efr_standard_id,
    raw.efr_avancee_id,
  ]
  for (const value of candidates) {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) return n
  }
  return 0
}

export function isAuthApiError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401
}

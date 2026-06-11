import {
  EfrAvancEService,
  EfrStandardService,
  HealthService,
  PolygraphiePpcService,
  PolysomnographieService,
} from '../lib'
import { API_PAGE_LIMIT } from '../config/api'
import { API_BASE_URL } from '../config/env'
import type { BackendExamType } from '../types/backendExam'
import type { Patient, PatientFilters } from '../types/patient'
import {
  extractApiItems,
  extractPaginationMeta,
  isAuthApiError,
  normalizeExamRawRow,
  parseExamRowId,
  unwrapApiEnvelope,
} from '../utils/apiEnvelope'
import { filterPatients } from '../utils/patientFilters'
import { buildPatientsFromExamRows, patientIdFromName, patientIdsMatch } from './backendMapper'

export interface BackendExamRow {
  type: BackendExamType
  id: number
  raw: Record<string, unknown>
}

function extractItems(res: unknown): Record<string, unknown>[] {
  return extractApiItems(res).map(normalizeExamRawRow)
}

function rethrowUnlessSafe(err: unknown): never | [] {
  if (isAuthApiError(err)) throw err
  return []
}

function mapSeverityToPpcFilter(severity?: string): string | undefined {
  if (!severity || severity === 'all') return undefined
  const map: Record<string, string> = {
    normal: 'normale',
    leger: 'legere',
    modere: 'moderee',
    severe: 'severe',
  }
  return map[severity] ?? severity
}

async function fetchTypePage(
  type: BackendExamType,
  page: number,
  limit: number,
  filters?: PatientFilters,
): Promise<unknown> {
  const patientNom = filters?.search || undefined
  const severite = filters?.severity !== 'all' ? filters?.severity : undefined
  const date = filters?.dateFrom || undefined

  switch (type) {
    case 'polysomnographie':
      if (filters?.examType !== 'all' && filters?.examType !== 'polysomnographie') return { items: [] }
      return PolysomnographieService.listPolysomnographiesApiV1PolysomnographieListGet(
        page, limit, patientNom, date, severite,
      )
    case 'polygraphie-ppc':
      if (filters?.examType !== 'all' && filters?.examType !== 'polygraphie') return { items: [] }
      return PolygraphiePpcService.listPolygraphiePpcsApiV1PolygraphiePpcListGet(
        page, limit, patientNom, date, mapSeverityToPpcFilter(severite),
      )
    case 'efr-standard':
      if (filters?.examType !== 'all' && filters?.examType !== 'efr') return { items: [] }
      return EfrStandardService.listEfrStandardsApiV1EfrStandardListGet(page, limit, patientNom, date)
    case 'efr-avancee':
      if (filters?.examType !== 'all' && filters?.examType !== 'efr') return { items: [] }
      return EfrAvancEService.listEfrAvanceesApiV1EfrAvanceeListGet(page, limit, patientNom, date)
  }
}

async function fetchTypeRows(
  type: BackendExamType,
  limit: number,
  filters?: PatientFilters,
): Promise<BackendExamRow[]> {
  const allItems: Record<string, unknown>[] = []
  let page = 1
  let total = Number.POSITIVE_INFINITY

  while (page <= 50) {
    const res = await fetchTypePage(type, page, limit, filters)
    const items = extractItems(res)
    allItems.push(...items)

    const meta = extractPaginationMeta(res)
    if (meta.total > 0) total = meta.total

    if (items.length === 0 || items.length < limit || allItems.length >= total) break
    page += 1
  }

  return allItems
    .map((raw) => ({ type, id: parseExamRowId(raw), raw }))
    .filter((r) => r.id > 0)
}

let cache: { patients: Patient[]; rows: BackendExamRow[]; at: number } | null = null
const CACHE_MS = 15_000

export function invalidateBackendCache() {
  cache = null
}

export async function fetchAllExamRows(
  limit = API_PAGE_LIMIT,
  filters?: PatientFilters,
  force = false,
): Promise<BackendExamRow[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS && !filters) return cache.rows

  const types: BackendExamType[] = ['polysomnographie', 'polygraphie-ppc', 'efr-standard', 'efr-avancee']
  const chunks = await Promise.all(
    types.map((t) => fetchTypeRows(t, limit, filters).catch((err) => rethrowUnlessSafe(err))),
  )
  const rows = chunks.flat()

  if (!filters) {
    const patients = buildPatientsFromExamRows(rows)
    cache = { patients, rows, at: Date.now() }
  }

  return rows
}

export async function fetchBackendPatients(filters?: PatientFilters, force = false): Promise<Patient[]> {
  if (!filters && !force && cache && Date.now() - cache.at < CACHE_MS) return cache.patients

  const rows = await fetchAllExamRows(API_PAGE_LIMIT, filters, force)
  const patients = buildPatientsFromExamRows(rows)
  return filters ? filterPatients(patients, filters) : patients
}

function findPatientInList(patients: Patient[], id: string): Patient | null {
  const normalized = decodeURIComponent(id).trim()

  const exact = patients.find((p) => patientIdsMatch(p.id, normalized))
  if (exact) return exact

  const slug = normalized.replace(/^p-/, '').toLowerCase()
  if (!slug) return null

  return (
    patients.find((p) => {
      const pSlug = p.id.replace(/^p-/, '').toLowerCase()
      if (pSlug === slug) return true
      const fromName = patientIdFromName(`${p.prenom} ${p.nom}`).replace(/^p-/, '')
      const fromNameRev = patientIdFromName(`${p.nom} ${p.prenom}`).replace(/^p-/, '')
      return fromName === slug || fromNameRev === slug
    }) ?? null
  )
}

export async function fetchBackendPatient(id: string): Promise<Patient | null> {
  const normalized = decodeURIComponent(id).trim()

  if (cache) {
    const cached = findPatientInList(cache.patients, normalized)
    if (cached) return cached
  }

  const patients = await fetchBackendPatients(undefined, true)
  return findPatientInList(patients, normalized)
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const base = API_BASE_URL || ''
    const res = await fetch(`${base}/health`, { method: 'GET' })
    if (res.ok) {
      const text = await res.text()
      if (!text) return true
      try {
        const body = unwrapApiEnvelope(JSON.parse(text)) as Record<string, unknown>
        const status = String(body?.status ?? '')
        return status === '' || status === 'healthy' || status === 'ok'
      } catch {
        return true
      }
    }
    await HealthService.rootGet()
    return true
  } catch {
    return false
  }
}

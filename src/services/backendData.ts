import {
  EfrAvancEService,
  EfrStandardService,
  HealthService,
  PolygraphiePpcService,
  PolysomnographieService,
} from '../lib'
import type { BackendExamType } from '../types/backendExam'
import type { Patient, PatientFilters } from '../types/patient'
import { filterPatients } from '../utils/patientFilters'
import { buildPatientsFromExamRows } from './backendMapper'

export interface BackendExamRow {
  type: BackendExamType
  id: number
  raw: Record<string, unknown>
}

function extractItems(res: unknown): Record<string, unknown>[] {
  if (Array.isArray(res)) return res as Record<string, unknown>[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    const items = obj.items ?? obj.data ?? obj.results
    if (Array.isArray(items)) return items as Record<string, unknown>[]
  }
  return []
}

async function fetchTypeRows(
  type: BackendExamType,
  limit: number,
  filters?: PatientFilters,
): Promise<BackendExamRow[]> {
  const patientNom = filters?.search || undefined
  const severite = filters?.severity !== 'all' ? filters?.severity : undefined
  const date = filters?.dateFrom || undefined

  let res: unknown
  switch (type) {
    case 'polysomnographie':
      if (filters?.examType !== 'all' && filters?.examType !== 'polysomnographie') return []
      res = await PolysomnographieService.listPolysomnographiesApiV1PolysomnographieListGet(
        1, limit, patientNom, date, severite,
      )
      break
    case 'polygraphie-ppc':
      if (filters?.examType !== 'all' && filters?.examType !== 'polygraphie') return []
      res = await PolygraphiePpcService.listPolygraphiePpcsApiV1PolygraphiePpcListGet(
        1, limit, patientNom, date, severite,
      )
      break
    case 'efr-standard':
      if (filters?.examType !== 'all' && filters?.examType !== 'efr') return []
      res = await EfrStandardService.listEfrStandardsApiV1EfrStandardListGet(1, limit, patientNom, date)
      break
    case 'efr-avancee':
      if (filters?.examType !== 'all' && filters?.examType !== 'efr') return []
      res = await EfrAvancEService.listEfrAvanceesApiV1EfrAvanceeListGet(1, limit, patientNom, date)
      break
  }

  return extractItems(res)
    .map((raw) => ({ type, id: Number(raw.id), raw }))
    .filter((r) => r.id > 0)
}

let cache: { patients: Patient[]; rows: BackendExamRow[]; at: number } | null = null
const CACHE_MS = 30_000

export function invalidateBackendCache() {
  cache = null
}

export async function fetchAllExamRows(limit = 200, filters?: PatientFilters, force = false): Promise<BackendExamRow[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS && !filters) return cache.rows

  const types: BackendExamType[] = ['polysomnographie', 'polygraphie-ppc', 'efr-standard', 'efr-avancee']
  const chunks = await Promise.all(types.map((t) => fetchTypeRows(t, limit, filters).catch(() => [])))
  const rows = chunks.flat()

  if (!filters) {
    const patients = buildPatientsFromExamRows(rows)
    cache = { patients, rows, at: Date.now() }
  }

  return rows
}

export async function fetchBackendPatients(filters?: PatientFilters, force = false): Promise<Patient[]> {
  if (!filters && !force && cache && Date.now() - cache.at < CACHE_MS) return cache.patients

  const rows = await fetchAllExamRows(200, filters, force)
  const patients = buildPatientsFromExamRows(rows)
  return filters ? filterPatients(patients, filters) : patients
}

export async function fetchBackendPatient(id: string): Promise<Patient | null> {
  const patients = await fetchBackendPatients()
  return patients.find((p) => p.id === id) ?? null
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await HealthService.healthHealthGet()
    return true
  } catch {
    return false
  }
}

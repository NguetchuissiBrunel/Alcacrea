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
import { defaultFilters } from '../constants/filters'
import {
  normalizePatientKey,
  patientIdFromName,
  patientIdVariants,
  slugToSearchTerms,
} from '../utils/patientIdentity'
import { filterPatients, hasActiveFilters } from '../utils/patientFilters'
import { PdfUploadService } from '../lib'
import { fetchBackendExam, listAllPdfJobs } from './backendExamApi'
import { buildPatientsFromExamRows } from './backendMapper'
import { PDFStatus } from '../lib'
import {
  examRowMatchesPdfFileId,
  inferExamTypeFromPdfType,
  parseExamRefFromStatus,
} from '../utils/pdfJobParser'
import { extractExamDate, normalizeExamDate } from '../utils/examMeta'
import { extractPatientNom } from '../utils/patientIdentity'

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

function dedupeExamRows(rows: BackendExamRow[]): BackendExamRow[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    const key = `${row.type}:${row.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function fallbackExamRaw(
  examRef: { type: BackendExamType; id: number; patientNom?: string; date?: string; severite?: string },
  pdf: { id: number; fileName: string; pdfType?: string },
  statusRow: Record<string, unknown>,
): Record<string, unknown> {
  const patientNom = extractPatientNom(statusRow)
  return normalizeExamRawRow({
    id: examRef.id,
    patient_nom: patientNom !== 'Inconnu' ? patientNom : examRef.patientNom,
    PATIENT_NOM: statusRow.PATIENT_NOM,
    PATIENT_PRENOM: statusRow.PATIENT_PRENOM,
    DATE_EXAMEN: statusRow.DATE_EXAMEN,
    date_enregistrement: examRef.date ?? extractExamDate(statusRow),
    severite: examRef.severite ?? statusRow.severite,
    filename: pdf.fileName,
    pdf_type: pdf.pdfType ?? statusRow.pdf_type,
    pdf_file_id: pdf.id,
  })
}

async function findExamRefByPdfFileId(
  pdfFileId: number,
  pdfType?: string,
): Promise<ReturnType<typeof parseExamRefFromStatus>> {
  const type = inferExamTypeFromPdfType(pdfType ?? '')
  if (!type) return undefined

  try {
    const res = await fetchTypePage(type, 1, API_PAGE_LIMIT)
    for (const item of extractItems(res)) {
      if (!examRowMatchesPdfFileId(item, pdfFileId)) continue
      const examId = parseExamRowId(item)
      if (examId <= 0) continue
      return {
        type,
        id: examId,
        label: `${type} #${examId}`,
        patientNom: extractPatientNom(item),
        date: normalizeExamDate(extractExamDate(item)),
        severite: String(item.severite ?? item.SEVERITE ?? ''),
      }
    }
  } catch (err) {
    rethrowUnlessSafe(err)
  }
  return undefined
}

/** Charge les examens via les PDF parsés (status=done) + détail API. */
async function fetchRowsFromParsedPdfs(): Promise<BackendExamRow[]> {
  const pdfs = await listAllPdfJobs(100).catch(() => [] as Awaited<ReturnType<typeof listAllPdfJobs>>)
  const done = pdfs.filter((p) => p.status === PDFStatus.DONE || p.status === 'done')
  const rows: BackendExamRow[] = []

  for (const pdf of done) {
    let examRef = pdf.examRef
    let statusRow: Record<string, unknown> = {}

    try {
      statusRow = normalizeExamRawRow(
        (await PdfUploadService.getPdfStatusApiV1PdfStatusPdfFileIdGet(pdf.id)) as Record<string, unknown>,
      )
      if (!examRef) {
        examRef = parseExamRefFromStatus({
          ...statusRow,
          pdf_type: statusRow.pdf_type ?? pdf.pdfType,
          filename: statusRow.filename ?? statusRow.file_name ?? pdf.fileName,
        })
      }
    } catch (err) {
      rethrowUnlessSafe(err)
    }

    if (!examRef) {
      examRef = await findExamRefByPdfFileId(pdf.id, String(statusRow.pdf_type ?? pdf.pdfType ?? ''))
    }

    if (!examRef) continue

    const pushRow = (raw: Record<string, unknown>) => {
      if (pdf.fileName) raw.filename = raw.filename ?? raw.file_name ?? pdf.fileName
      raw.pdf_file_id = raw.pdf_file_id ?? pdf.id
      rows.push({ type: examRef!.type, id: examRef!.id, raw: normalizeExamRawRow(raw) })
    }

    try {
      const detail = await fetchBackendExam(examRef.type, examRef.id)
      if (detail && typeof detail === 'object') {
        pushRow(detail as Record<string, unknown>)
      } else {
        pushRow(fallbackExamRaw(examRef, pdf, statusRow))
      }
    } catch (err) {
      if (isAuthApiError(err)) throw err
      pushRow(fallbackExamRaw(examRef, pdf, statusRow))
    }
  }

  return dedupeExamRows(rows)
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
  if (!hasActiveFilters(filters) && !force && cache && Date.now() - cache.at < CACHE_MS) return cache.rows

  const types: BackendExamType[] = ['polysomnographie', 'polygraphie-ppc', 'efr-standard', 'efr-avancee']
  const chunks = await Promise.all(
    types.map((t) => fetchTypeRows(t, limit, filters).catch((err) => rethrowUnlessSafe(err))),
  )
  let rows = dedupeExamRows(chunks.flat())

  if (!hasActiveFilters(filters)) {
    const pdfRows = await fetchRowsFromParsedPdfs()
    rows = dedupeExamRows([...rows, ...pdfRows])
  }

  if (!hasActiveFilters(filters)) {
    const patients = buildPatientsFromExamRows(rows)
    cache = { patients, rows, at: Date.now() }
  }

  return rows
}

export async function fetchBackendPatients(filters?: PatientFilters, force = false): Promise<Patient[]> {
  if (!hasActiveFilters(filters) && !force && cache && Date.now() - cache.at < CACHE_MS) return cache.patients

  const rows = await fetchAllExamRows(API_PAGE_LIMIT, filters, force)
  const patients = buildPatientsFromExamRows(rows)
  return filters ? filterPatients(patients, filters) : patients
}

function findPatientInList(patients: Patient[], targetId: string): Patient | undefined {
  const decoded = decodeURIComponent(targetId)
  const direct = patients.find((p) => p.id === decoded)
  if (direct) return direct

  return patients.find((p) => patientIdVariants(p.prenom, p.nom).includes(decoded))
}

export async function fetchBackendPatient(id: string): Promise<Patient | null> {
  const decodedId = decodeURIComponent(id)

  const all = await fetchBackendPatients(undefined, true)
  const fromAll = findPatientInList(all, decodedId)
  if (fromAll) return fromAll

  for (const term of slugToSearchTerms(decodedId)) {
    const filters = { ...defaultFilters, search: term }
    const rows = await fetchAllExamRows(API_PAGE_LIMIT, filters, true)
    if (rows.length === 0) continue

    const patients = buildPatientsFromExamRows(rows)
    const match = findPatientInList(patients, decodedId)
    if (match) return match

    if (patients.length === 1) return patients[0]
    const loose = patients.find((p) => {
      const key = normalizePatientKey(`${p.prenom} ${p.nom}`)
      return decodedId.includes(patientIdFromName(key).replace(/^p-/, ''))
    })
    if (loose) return loose
  }

  return null
}

export async function countParsedPdfs(): Promise<number> {
  const pdfs = await listAllPdfJobs(100).catch(() => [])
  return pdfs.filter((p) => p.status === PDFStatus.DONE || p.status === 'done').length
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

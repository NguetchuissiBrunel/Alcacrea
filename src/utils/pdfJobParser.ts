import type { BackendExamRef, BackendExamType, PdfUploadJob } from '../types/backendExam'
import { extractExamDate, normalizeExamDate } from './examMeta'
import { extractPatientNom } from './patientIdentity'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function parsePdfFileId(res: unknown): number | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>

  const candidates = [
    r.pdf_file_id,
    r.pdfFileId,
    r.PDF_FILE_ID,
    r.id,
    r.file_id,
    (r.pdf_file as Record<string, unknown> | undefined)?.id,
    (r.data as Record<string, unknown> | undefined)?.pdf_file_id,
    (r.data as Record<string, unknown> | undefined)?.id,
    (r.result as Record<string, unknown> | undefined)?.pdf_file_id,
    (r.result as Record<string, unknown> | undefined)?.id,
  ]

  for (const value of candidates) {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

export function isValidPdfJobId(id: number): boolean {
  return Number.isFinite(id) && id > 0
}

const PDF_TYPE_MAP: Record<string, BackendExamType> = {
  polysomnographie: 'polysomnographie',
  polygraphie_ppc: 'polygraphie-ppc',
  polygraphie: 'polygraphie-ppc',
  efr_standard: 'efr-standard',
  efr_avancee: 'efr-avancee',
  efr: 'efr-standard',
}

export function inferExamTypeFromPdfType(pdfType: string): BackendExamType | undefined {
  const raw = pdfType.trim().toLowerCase()
  if (!raw) return undefined
  const normalized = raw.replace(/-/g, '_')
  return PDF_TYPE_MAP[normalized] ?? PDF_TYPE_MAP[raw]
}

const TYPE_ID_KEYS: Record<BackendExamType, string[]> = {
  polysomnographie: ['polysomnographie_id', 'polysomnographieId', 'POLYSOMNOGRAPHIE_ID'],
  'polygraphie-ppc': ['polygraphie_ppc_id', 'polygraphiePpcId', 'POLYGRAPHIE_PPC_ID'],
  'efr-standard': ['efr_standard_id', 'efrStandardId', 'EFR_STANDARD_ID', 'efr_id'],
  'efr-avancee': ['efr_avancee_id', 'efrAvanceeId', 'EFR_AVANCEE_ID'],
}

function pushId(ids: number[], value: unknown) {
  const n = Number(value)
  if (Number.isFinite(n) && n > 0) ids.push(n)
}

function collectExamIds(res: Record<string, unknown>, examType?: BackendExamType): number[] {
  const ids: number[] = []

  if (examType) {
    for (const key of TYPE_ID_KEYS[examType]) {
      pushId(ids, res[key])
    }
  }

  for (const key of [
    'exam_id',
    'EXAM_ID',
    'result_id',
    'RESULT_ID',
    'parsed_id',
    'id_examen',
    'record_id',
    'linked_exam_id',
    'created_exam_id',
    'parsed_exam_id',
  ]) {
    pushId(ids, res[key])
  }

  for (const nestedKey of ['exam', 'parsed_exam', 'linked_exam', 'parsed_result', 'result', 'data']) {
    const nested = res[nestedKey]
    if (!isRecord(nested)) continue

    if (examType) {
      for (const key of TYPE_ID_KEYS[examType]) pushId(ids, nested[key])
    }
    for (const key of ['exam_id', 'result_id', 'parsed_id', 'id_examen', 'id', 'ID']) {
      if (key === 'id' || key === 'ID') {
        if (['exam', 'parsed_exam', 'linked_exam'].includes(nestedKey)) pushId(ids, nested[key])
      } else {
        pushId(ids, nested[key])
      }
    }
  }

  return ids
}

function parseExamIdFromStatus(res: Record<string, unknown>, examType?: BackendExamType): number {
  const pdfFileId = Number(res.pdf_file_id ?? res.pdfFileId ?? res.PDF_FILE_ID ?? res.id)
  const ids = collectExamIds(res, examType)
  const distinct = [...new Set(ids)]
  const withoutPdfId = pdfFileId > 0 ? distinct.filter((id) => id !== pdfFileId) : distinct
  return withoutPdfId[0] ?? distinct[0] ?? 0
}

export function parseExamRefFromStatus(res: Record<string, unknown>): BackendExamRef | undefined {
  const type = inferExamTypeFromPdfType(
    String(res.pdf_type ?? res.detected_type ?? res.exam_type ?? res.PDF_TYPE ?? ''),
  )
  if (!type) return undefined

  const id = parseExamIdFromStatus(res, type)
  if (!id) return undefined

  const patientNom = extractPatientNom(res)
  return {
    type,
    id,
    label: `${type} #${id}`,
    patientNom: patientNom !== 'Inconnu' ? patientNom : undefined,
    date: normalizeExamDate(extractExamDate(res)),
    severite: String(res.severite ?? res.severite_residuelle ?? res.SEVERITE ?? ''),
  }
}

export function examRowMatchesPdfFileId(row: Record<string, unknown>, pdfFileId: number): boolean {
  const linked = Number(row.PDF_FILE_ID ?? row.pdf_file_id ?? row.pdfFileId)
  return linked > 0 && linked === pdfFileId
}

export function mapRowToPdfJob(row: Record<string, unknown>, fallbackFileName = ''): PdfUploadJob | null {
  const id = parsePdfFileId(row) ?? Number(row.id ?? row.pdf_file_id)
  if (!isValidPdfJobId(id)) return null
  return {
    id,
    fileName: String(row.filename ?? row.file_name ?? row.FILENAME ?? fallbackFileName),
    status: String(row.status ?? 'pending'),
    pdfType: row.pdf_type ? String(row.pdf_type) : row.PDF_TYPE ? String(row.PDF_TYPE) : undefined,
    error: row.error_message ? String(row.error_message) : row.error ? String(row.error) : undefined,
    examRef: parseExamRefFromStatus(row),
  }
}

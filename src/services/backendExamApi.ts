import {
  EfrAvancEService,
  EfrStandardService,
  PdfUploadService,
  PolygraphiePpcService,
  PolysomnographieService,
  PDFStatus,
} from '../lib'
import { ApiError } from '../lib/core/ApiError'
import { API_BASE_URL } from '../config/env'
import { getAuthToken } from '../lib/setupOpenApi'
import type { BackendExamRef, BackendExamType, PdfUploadJob } from '../types/backendExam'
import {
  extractApiItems,
  normalizeExamRawRow,
  parseExamRowId,
  unwrapApiEnvelope,
} from '../utils/apiEnvelope'
import {
  isValidPdfJobId,
  mapRowToPdfJob,
  parseExamRefFromStatus,
  parsePdfFileId,
} from '../utils/pdfJobParser'

export async function fetchBackendExam(type: BackendExamType, id: number): Promise<unknown> {
  switch (type) {
    case 'polysomnographie':
      return PolysomnographieService.getPolysomnographieApiV1PolysomnographieIdGet(id)
    case 'polygraphie-ppc':
      return PolygraphiePpcService.getPolygraphiePpcApiV1PolygraphiePpcIdGet(id)
    case 'efr-standard':
      return EfrStandardService.getEfrStandardApiV1EfrStandardIdGet(id)
    case 'efr-avancee':
      return EfrAvancEService.getEfrAvanceeApiV1EfrAvanceeIdGet(id)
  }
}

export async function uploadPdfFile(file: File): Promise<PdfUploadJob> {
  const base = API_BASE_URL || ''
  const form = new FormData()
  form.append('file', file)
  const token = getAuthToken()

  const res = await fetch(`${base}/api/v1/pdf/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  const text = await res.text()
  let data: unknown = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Réponse upload invalide')
  }

  if (!res.ok && res.status !== 202) {
    const detail = (data as Record<string, unknown>)?.detail
    throw new ApiError(
      { method: 'POST', url: '/api/v1/pdf/upload' },
      { url: res.url, ok: res.ok, status: res.status, statusText: res.statusText, body: data },
      typeof detail === 'string' ? detail : 'Échec de l\'upload PDF',
    )
  }

  const payload = unwrapApiEnvelope(data)
  const id = parsePdfFileId(payload)
  if (!id) {
    throw new Error('ID du PDF introuvable dans la réponse serveur')
  }

  const row = payload as Record<string, unknown>
  return {
    id,
    fileName: file.name,
    status: String(row.status ?? 'pending'),
    pdfType: row.pdf_type ? String(row.pdf_type) : undefined,
  }
}

export async function pollPdfStatus(pdfFileId: number): Promise<PdfUploadJob> {
  if (!isValidPdfJobId(pdfFileId)) {
    throw new Error('ID PDF invalide')
  }
  const res = await PdfUploadService.getPdfStatusApiV1PdfStatusPdfFileIdGet(pdfFileId)
  const row = res as Record<string, unknown>
  const examRef = parseExamRefFromStatus(row)
  return {
    id: pdfFileId,
    fileName: String(row.filename ?? row.file_name ?? ''),
    status: String(row.status ?? 'pending'),
    pdfType: row.pdf_type ? String(row.pdf_type) : undefined,
    error: row.error ? String(row.error) : row.error_message ? String(row.error_message) : undefined,
    examRef,
  }
}

export async function listRecentPdfs(limit = 20): Promise<PdfUploadJob[]> {
  const res = await PdfUploadService.listPdfsApiV1PdfListGet(1, limit)
  return extractApiItems(res)
    .map((item) => mapRowToPdfJob(item))
    .filter((job): job is PdfUploadJob => job !== null)
}

export async function listAllBackendExams(limit = 50): Promise<BackendExamRef[]> {
  const [poly, ppc, efrS, efrA] = await Promise.all([
    PolysomnographieService.listPolysomnographiesApiV1PolysomnographieListGet(1, limit).catch(() => null),
    PolygraphiePpcService.listPolygraphiePpcsApiV1PolygraphiePpcListGet(1, limit).catch(() => null),
    EfrStandardService.listEfrStandardsApiV1EfrStandardListGet(1, limit).catch(() => null),
    EfrAvancEService.listEfrAvanceesApiV1EfrAvanceeListGet(1, limit).catch(() => null),
  ])

  const refs: BackendExamRef[] = []
  const push = (rows: unknown, type: BackendExamType, label: string) => {
    const items = extractApiItems(rows)
    for (const item of items) {
      const row = normalizeExamRawRow(item)
      const id = parseExamRowId(row)
      if (!id) continue
      refs.push({
        type,
        id,
        label,
        patientNom: String(row.patient_nom ?? row.nom_patient ?? ''),
        date: String(row.date_enregistrement ?? row.date_examen ?? ''),
        severite: String(row.severite ?? row.severite_residuelle ?? ''),
      })
    }
  }

  push(poly, 'polysomnographie', 'Polysomnographie')
  push(ppc, 'polygraphie-ppc', 'Polygraphie PPC')
  push(efrS, 'efr-standard', 'EFR Standard')
  push(efrA, 'efr-avancee', 'EFR Avancée')
  return refs
}

export function isPdfProcessing(status: string) {
  return status === PDFStatus.PENDING || status === PDFStatus.PROCESSING || status === 'pending' || status === 'processing'
}

export async function reparsePdf(pdfFileId: number): Promise<void> {
  if (!isValidPdfJobId(pdfFileId)) throw new Error('ID PDF invalide')
  await PdfUploadService.reparsePdfApiV1PdfReparsePdfFileIdPost(pdfFileId)
}

export async function deleteBackendExam(type: BackendExamType, id: number): Promise<void> {
  switch (type) {
    case 'polysomnographie':
      await PolysomnographieService.deletePolysomnographieApiV1PolysomnographieIdDelete(id)
      break
    case 'polygraphie-ppc':
      await PolygraphiePpcService.deletePolygraphiePpcApiV1PolygraphiePpcIdDelete(id)
      break
    case 'efr-standard':
      await EfrStandardService.deleteEfrStandardApiV1EfrStandardIdDelete(id)
      break
    case 'efr-avancee':
      await EfrAvancEService.deleteEfrAvanceeApiV1EfrAvanceeIdDelete(id)
      break
  }
}

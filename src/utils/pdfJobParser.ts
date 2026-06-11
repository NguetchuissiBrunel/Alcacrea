import type { BackendExamRef, BackendExamType, PdfUploadJob } from '../types/backendExam'

export function parsePdfFileId(res: unknown): number | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>

  const candidates = [
    r.pdf_file_id,
    r.pdfFileId,
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

function mapPdfTypeToExamType(pdfType: string): BackendExamType | undefined {
  const map: Record<string, BackendExamType> = {
    polysomnographie: 'polysomnographie',
    polygraphie_ppc: 'polygraphie-ppc',
    efr_standard: 'efr-standard',
    efr_avancee: 'efr-avancee',
  }
  return map[pdfType]
}

export function parseExamRefFromStatus(res: Record<string, unknown>): BackendExamRef | undefined {
  const type = mapPdfTypeToExamType(String(res.pdf_type ?? res.detected_type ?? ''))
  const id = Number(res.exam_id ?? res.result_id ?? res.parsed_id)
  if (!type || !id) return undefined
  return {
    type,
    id,
    label: `${type} #${id}`,
    patientNom: String(res.patient_nom ?? res.patient_name ?? ''),
    date: String(res.date_enregistrement ?? res.date_examen ?? ''),
    severite: String(res.severite ?? res.severite_residuelle ?? ''),
  }
}

export function mapRowToPdfJob(row: Record<string, unknown>, fallbackFileName = ''): PdfUploadJob | null {
  const id = parsePdfFileId(row) ?? Number(row.id ?? row.pdf_file_id)
  if (!isValidPdfJobId(id)) return null
  return {
    id,
    fileName: String(row.filename ?? row.file_name ?? fallbackFileName),
    status: String(row.status ?? 'pending'),
    pdfType: row.pdf_type ? String(row.pdf_type) : undefined,
    error: row.error_message ? String(row.error_message) : row.error ? String(row.error) : undefined,
    examRef: parseExamRefFromStatus(row),
  }
}

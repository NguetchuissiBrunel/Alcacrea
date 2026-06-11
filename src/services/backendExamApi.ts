import {
  EfrAvancEService,
  EfrStandardService,
  PdfUploadService,
  PolygraphiePpcService,
  PolysomnographieService,
  PDFStatus,
} from '../lib'
import type { BackendExamRef, BackendExamType, PdfUploadJob } from '../types/backendExam'

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
  const res = await PdfUploadService.uploadPdfApiV1PdfUploadPost({ file })
  const id = Number(res?.id ?? res?.pdf_file_id ?? res?.file_id)
  return {
    id,
    fileName: file.name,
    status: String(res?.status ?? 'pending'),
    pdfType: res?.pdf_type,
  }
}

export async function pollPdfStatus(pdfFileId: number): Promise<PdfUploadJob> {
  const res = await PdfUploadService.getPdfStatusApiV1PdfStatusPdfFileIdGet(pdfFileId)
  const examRef = parseExamRefFromStatus(res)
  return {
    id: pdfFileId,
    fileName: String(res?.filename ?? res?.file_name ?? ''),
    status: String(res?.status ?? 'pending'),
    pdfType: res?.pdf_type,
    error: res?.error ?? res?.error_message,
    examRef,
  }
}

function parseExamRefFromStatus(res: Record<string, unknown>): BackendExamRef | undefined {
  const type = mapPdfTypeToExamType(String(res?.pdf_type ?? res?.detected_type ?? ''))
  const id = Number(res?.exam_id ?? res?.result_id ?? res?.parsed_id)
  if (!type || !id) return undefined
  return {
    type,
    id,
    label: `${type} #${id}`,
    patientNom: String(res?.patient_nom ?? res?.patient_name ?? ''),
    date: String(res?.date_enregistrement ?? res?.date_examen ?? ''),
    severite: String(res?.severite ?? res?.severite_residuelle ?? ''),
  }
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

export async function listRecentPdfs(limit = 20): Promise<PdfUploadJob[]> {
  const res = await PdfUploadService.listPdfsApiV1PdfListGet(1, limit)
  const items = (res?.items ?? res?.data ?? res) as unknown[]
  if (!Array.isArray(items)) return []
  return items.map((item) => {
    const row = item as Record<string, unknown>
    return {
      id: Number(row.id ?? row.pdf_file_id),
      fileName: String(row.filename ?? row.file_name ?? ''),
      status: String(row.status ?? ''),
      pdfType: String(row.pdf_type ?? ''),
      error: row.error_message ? String(row.error_message) : undefined,
      examRef: parseExamRefFromStatus(row),
    }
  })
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
    const items = ((rows as Record<string, unknown>)?.items ?? (rows as Record<string, unknown>)?.data ?? rows) as unknown[]
    if (!Array.isArray(items)) return
    for (const item of items) {
      const row = item as Record<string, unknown>
      const id = Number(row.id)
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

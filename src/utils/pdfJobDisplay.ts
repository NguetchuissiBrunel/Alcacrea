import type { PdfUploadJob } from '../types/backendExam'
import { inferExamTypeFromPdfType } from './pdfJobParser'

export function normalizePdfTypeKey(pdfType: string): string {
  return pdfType.trim().toLowerCase().replace(/-/g, '_')
}

export function isMeaningfulFileName(fileName: string | undefined): boolean {
  const clean = fileName?.trim()
  if (!clean) return false
  const base = clean.replace(/\.pdf$/i, '')
  return base.length > 0 && !/^#?\d+$/.test(base)
}

export interface PdfJobDisplay {
  title: string
  meta?: string
}

export function getPdfJobDisplay(
  job: PdfUploadJob,
  pdfTypeLabel: string | undefined,
  untitled: string,
  formatDate?: (date: string) => string,
): PdfJobDisplay {
  const fileTitle = isMeaningfulFileName(job.fileName)
    ? job.fileName.trim().replace(/\.pdf$/i, '')
    : undefined
  const patient = job.examRef?.patientNom?.trim()
  const rawDate = job.examRef?.date?.trim()
  const date = rawDate ? (formatDate?.(rawDate) ?? rawDate) : undefined

  const title = patient ?? fileTitle ?? pdfTypeLabel ?? untitled

  const metaParts: string[] = []
  if (pdfTypeLabel && title !== pdfTypeLabel) metaParts.push(pdfTypeLabel)
  if (date) metaParts.push(date)

  return { meta: metaParts.length ? metaParts.join(' · ') : undefined, title }
}

export function examTypeKeyFromPdfType(pdfType: string | undefined): string | undefined {
  const backendType = pdfType ? inferExamTypeFromPdfType(pdfType) : undefined
  if (!backendType) return undefined
  if (backendType === 'polygraphie-ppc') return 'polygraphie'
  if (backendType === 'efr-standard' || backendType === 'efr-avancee') return 'efr'
  return 'polysomnographie'
}

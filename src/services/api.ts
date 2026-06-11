import { API_PAGE_LIMIT } from '../config/api'
import { buildFilterMetadata } from '../data/filterMetadata'
import type { Locale } from '../i18n/translations'
import type { FilterMetadata } from '../types/metadata'
import type {
  DashboardStats,
  ExamType,
  Patient,
  PatientFilters,
  Severity,
} from '../types/patient'
import type {
  AnalyticsScatter,
  AnalyticsSeverityBreakdown,
  AnalyticsTrends,
  SyncStatus,
} from '../types/analytics'
import type { ExamCurvesMeta } from '../types/curves'
import { downloadFile } from '../utils/format'
import { generatePatientsPdf } from '../utils/exportPdf'
import {
  buildScatterFromPatients,
  buildSeverityBreakdownFromPatients,
  buildTrendsFromPatients,
} from '../utils/analyticsFromPatients'
import { defaultFilters } from '../constants/filters'
import {
  checkBackendHealth,
  countParsedPdfs,
  fetchAllExamRows,
  fetchBackendPatient,
  fetchBackendPatients,
  invalidateBackendCache,
  type BackendExamRow,
} from './backendData'
import { fetchBackendExam } from './backendExamApi'
import { mapExamRow } from './backendMapper'
import { extractCurvesFromParsedData } from '../utils/curveExtractor'
import { extractPatientNom, patientIdFromRow } from '../utils/patientIdentity'
import type { BackendExamType } from '../types/backendExam'

function parseBackendExamId(examId: string): { type: BackendExamType; id: number } | null {
  const m = examId.match(/^b:(polysomnographie|polygraphie-ppc|efr-standard|efr-avancee):(\d+)$/)
  if (!m) return null
  return { type: m[1] as BackendExamType, id: Number(m[2]) }
}

/** Calcule les KPIs dashboard directement depuis les lignes d'examens (source de vérité). */
export function buildStatsFromExamRows(
  rows: BackendExamRow[],
  severityLabelMap: Record<string, string>,
): DashboardStats {
  const exams = rows.map(mapExamRow)
  const patientIds = new Set<string>()
  for (const row of rows) {
    const nom = extractPatientNom(row.raw)
    patientIds.add(patientIdFromRow(row.raw, nom))
  }

  const iahValues = exams
    .map((e) => e.metrics.iah)
    .filter((v): v is number => v != null && !Number.isNaN(v))

  const examsByType: Record<ExamType, number> = {
    polysomnographie: 0,
    polygraphie: 0,
    efr: 0,
  }
  const monthMap = new Map<string, number>()
  const severityCounts: Record<Severity, number> = {
    normal: 0,
    leger: 0,
    modere: 0,
    severe: 0,
  }

  for (const exam of exams) {
    examsByType[exam.type]++
    if (exam.date) {
      const month = exam.date.slice(0, 7)
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1)
    }
    severityCounts[exam.severity]++
  }

  return {
    totalPatients: patientIds.size,
    totalExams: exams.length,
    avgIah: iahValues.length
      ? iahValues.reduce((sum, v) => sum + v, 0) / iahValues.length
      : 0,
    severeCases: severityCounts.severe,
    examsByType,
    monthlyExams: [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    severityDistribution: (Object.keys(severityCounts) as Severity[]).map((s) => ({
      severity: s,
      count: severityCounts[s],
      label: severityLabelMap[s] ?? s,
    })),
  }
}

export function getStatsFromPatients(
  patients: Patient[],
  severityLabelMap: Record<string, string>,
): DashboardStats {
  const allExams = patients.flatMap((p) => p.exams)
  if (allExams.length === 0) {
    return buildStatsFromExamRows([], severityLabelMap)
  }

  const patientIds = new Set(patients.map((p) => p.id))
  const iahValues = allExams
    .map((e) => e.metrics.iah)
    .filter((v): v is number => v != null && !Number.isNaN(v))

  const examsByType: Record<ExamType, number> = {
    polysomnographie: 0,
    polygraphie: 0,
    efr: 0,
  }
  const monthMap = new Map<string, number>()
  const severityCounts: Record<Severity, number> = {
    normal: 0,
    leger: 0,
    modere: 0,
    severe: 0,
  }

  for (const exam of allExams) {
    examsByType[exam.type]++
    if (exam.date) {
      const month = exam.date.slice(0, 7)
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1)
    }
    severityCounts[exam.severity]++
  }

  return {
    totalPatients: patientIds.size,
    totalExams: allExams.length,
    avgIah: iahValues.length
      ? iahValues.reduce((sum, v) => sum + v, 0) / iahValues.length
      : 0,
    severeCases: severityCounts.severe,
    examsByType,
    monthlyExams: [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    severityDistribution: (Object.keys(severityCounts) as Severity[]).map((s) => ({
      severity: s,
      count: severityCounts[s],
      label: severityLabelMap[s] ?? s,
    })),
  }
}

function buildCsv(patients: Patient[]): string {
  const headers = [
    'Nom',
    'Prénom',
    'Date naissance',
    'Type examen',
    'Date examen',
    'Sévérité',
    'IAH',
    'IDO',
    'SatO2 min',
    'VEMS',
    'CVF',
  ]
  const rows = patients.flatMap((p) =>
    p.exams.map((e) => [
      p.nom,
      p.prenom,
      p.dateNaissance,
      e.type,
      e.date,
      e.severity,
      e.metrics.iah ?? '',
      e.metrics.ido ?? '',
      e.metrics.satO2Min ?? '',
      e.metrics.vems ?? '',
      e.metrics.cvf ?? '',
    ]),
  )
  return [headers, ...rows].map((r) => r.join(';')).join('\n')
}

function severityLabelsFromLocale(locale: Locale): Record<Severity, string> {
  const { severities } = buildFilterMetadata(locale)
  return Object.fromEntries(
    severities.filter((s) => s.value !== 'all').map((s) => [s.value, s.label]),
  ) as Record<Severity, string>
}

export const api = {
  async getFilterMetadata(locale: Locale): Promise<FilterMetadata> {
    return buildFilterMetadata(locale)
  },

  async getPatients(filters?: PatientFilters, force = false): Promise<Patient[]> {
    return fetchBackendPatients(filters, force)
  },

  async getPatient(id: string): Promise<Patient | null> {
    return fetchBackendPatient(decodeURIComponent(id))
  },

  async getDashboardStats(locale: Locale, force = false): Promise<DashboardStats> {
    const labels = severityLabelsFromLocale(locale)
    const rows = await fetchAllExamRows(API_PAGE_LIMIT, defaultFilters, force)
    const stats = buildStatsFromExamRows(rows, labels)
    const healthy = await checkBackendHealth()
    return { ...stats, lastSyncAt: new Date().toISOString(), dataFreshness: healthy ? 'ok' : 'error' }
  },

  async getSyncStatus(force = false): Promise<SyncStatus> {
    const healthy = await checkBackendHealth()
    const [rows, patients, pdfParsed] = await Promise.all([
      fetchAllExamRows(API_PAGE_LIMIT, undefined, force).catch(() => []),
      fetchBackendPatients(undefined, force).catch(() => []),
      countParsedPdfs().catch(() => 0),
    ])
    const examCount = Math.max(rows.length, patients.flatMap((p) => p.exams).length)
    return {
      status: healthy ? 'idle' : 'error',
      lastSyncAt: new Date().toISOString(),
      lastSync: { filesParsed: pdfParsed, filesFailed: 0, examsCreated: examCount },
    }
  },

  async getAnalyticsStats(filters: PatientFilters, locale: Locale): Promise<DashboardStats> {
    const labels = severityLabelsFromLocale(locale)
    const patients = await fetchBackendPatients(filters)
    return getStatsFromPatients(patients, labels)
  },

  async getAnalyticsScatter(filters: PatientFilters): Promise<AnalyticsScatter> {
    const patients = await fetchBackendPatients(filters)
    return buildScatterFromPatients(patients)
  },

  async getAnalyticsTrends(
    filters: PatientFilters,
    metric: 'iah' | 'ido' | 'satO2Min' | 'vems' = 'iah',
  ): Promise<AnalyticsTrends> {
    const patients = await fetchBackendPatients(filters)
    return buildTrendsFromPatients(patients, metric)
  },

  async getAnalyticsSeverityBreakdown(
    filters: PatientFilters,
    locale: Locale,
  ): Promise<AnalyticsSeverityBreakdown> {
    const patients = await fetchBackendPatients(filters)
    return buildSeverityBreakdownFromPatients(patients, locale)
  },

  async getExamCurves(examId: string): Promise<ExamCurvesMeta | null> {
    const ref = parseBackendExamId(examId)
    if (!ref) return null
    const data = await fetchBackendExam(ref.type, ref.id)
    const curves = extractCurvesFromParsedData(data)
    return {
      examId,
      examType:
        ref.type === 'polygraphie-ppc'
          ? 'polygraphie'
          : ref.type === 'efr-standard' || ref.type === 'efr-avancee'
            ? 'efr'
            : 'polysomnographie',
      durationMinutes: 0,
      curves: curves.map((c) => ({ id: c.id, label: c.label, unit: c.kind === 'line' ? (c.unit ?? '') : '' })),
    }
  },

  async exportCsv(patients: Patient[]): Promise<void> {
    const csv = buildCsv(patients)
    downloadFile(csv, `alcacrea-export-${new Date().toISOString().slice(0, 10)}.csv`)
  },

  async exportPdf(patients: Patient[]): Promise<void> {
    generatePatientsPdf(patients)
  },

  invalidateCache() {
    invalidateBackendCache()
  },
}

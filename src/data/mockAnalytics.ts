import { buildMockFilterMetadata } from './mockFilterMetadata'
import { mockPatients } from './mockPatients'
import type {
  AnalyticsScatter,
  AnalyticsSeverityBreakdown,
  AnalyticsTrends,
  ScatterPoint,
  SyncStatus,
} from '../types/analytics'
import type { Locale } from '../i18n/translations'
import type { ExamType, Patient, PatientFilters, Severity } from '../types/patient'
import { filterPatients } from '../utils/patientFilters'

export function buildMockScatter(patients: Patient[]): AnalyticsScatter {
  const points: ScatterPoint[] = []
  let excluded = 0

  patients.forEach((p) => {
    p.exams.forEach((e) => {
      if (e.metrics.iah == null) {
        excluded++
        return
      }
      points.push({
        patientId: p.id,
        examId: e.id,
        name: `${p.prenom} ${p.nom}`,
        iah: e.metrics.iah,
        satO2: e.metrics.satO2Min ?? 95,
        severity: e.severity,
        examType: e.type,
        date: e.date,
      })
    })
  })

  return { points, meta: { total: points.length, excludedNoIah: excluded } }
}

export function buildMockTrends(
  patients: Patient[],
  metric: 'iah' | 'ido' | 'satO2Min' | 'vems' = 'iah',
): AnalyticsTrends {
  const units: Record<string, string> = {
    iah: '/h',
    ido: '/h',
    satO2Min: '%',
    vems: 'L',
  }
  const monthMap = new Map<string, number[]>()

  patients.forEach((p) => {
    p.exams.forEach((e) => {
      const val = e.metrics[metric]
      if (val == null) return
      const month = e.date.slice(0, 7)
      const arr = monthMap.get(month) ?? []
      arr.push(val)
      monthMap.set(month, arr)
    })
  })

  const series = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      key,
      avg: vals.reduce((s, v) => s + v, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      count: vals.length,
    }))

  return { metric, unit: units[metric], groupBy: 'month', series }
}

export function buildMockSeverityBreakdown(
  patients: Patient[],
  locale: Locale,
): AnalyticsSeverityBreakdown {
  const { examTypes, severities } = buildMockFilterMetadata(locale)
  const typeLabels = Object.fromEntries(
    examTypes.filter((t) => t.value !== 'all').map((t) => [t.value, t.label]),
  ) as Record<ExamType, string>

  const breakdown: AnalyticsSeverityBreakdown['breakdown'] = (
    ['polysomnographie', 'polygraphie', 'efr'] as ExamType[]
  ).map((examType) => {
    const counts: Record<Severity, number> = {
      normal: 0,
      leger: 0,
      modere: 0,
      severe: 0,
    }
    patients.forEach((p) => {
      p.exams.filter((e) => e.type === examType).forEach((e) => counts[e.severity]++)
    })
    const total = Object.values(counts).reduce((s, v) => s + v, 0)
    return { examType, label: typeLabels[examType], severities: counts, total }
  }).filter((b) => b.total > 0)

  void severities
  return { breakdown }
}

export function getMockSyncStatus(): SyncStatus {
  return {
    status: 'idle',
    lastSyncAt: '2026-06-09T14:02:30Z',
    nextSyncAt: '2026-06-09T14:17:30Z',
    lastSync: { filesParsed: 10, filesFailed: 1, examsCreated: 8 },
  }
}

export function getFilteredPatients(filters?: PatientFilters): Patient[] {
  return filters ? filterPatients(mockPatients, filters) : mockPatients
}

import type { ExamType, Severity } from './patient'

export interface ScatterPoint {
  patientId: string
  examId: string
  name: string
  iah: number
  satO2: number
  severity: Severity
  examType: ExamType
  date: string
}

export interface AnalyticsScatter {
  points: ScatterPoint[]
  meta: { total: number; excludedNoIah: number }
}

export interface TrendSeriesPoint {
  key: string
  avg: number
  min: number
  max: number
  count: number
}

export interface AnalyticsTrends {
  metric: string
  unit: string
  groupBy: string
  series: TrendSeriesPoint[]
}

export interface SeverityBreakdownItem {
  examType: ExamType
  label: string
  severities: Record<Severity, number>
  total: number
}

export interface AnalyticsSeverityBreakdown {
  breakdown: SeverityBreakdownItem[]
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'parsing' | 'error'
  lastSyncAt: string
  nextSyncAt?: string
  lastSync?: {
    filesParsed: number
    filesFailed: number
    examsCreated: number
  }
}

export interface PatientTimelinePoint {
  examId: string
  date: string
  type: ExamType
  severity: Severity
  iah?: number
  satO2Min?: number
  vems?: number
}

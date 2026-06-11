import type { BackendExamType } from './backendExam'

export type ExamType = 'polysomnographie' | 'polygraphie' | 'efr'

export type Severity = 'normal' | 'leger' | 'modere' | 'severe'

export interface ExamMetrics {
  iah?: number
  ido?: number
  satO2Min?: number
  satO2Moy?: number
  vems?: number
  cvf?: number
  rapportVemsCvf?: number
  indiceDesaturation?: number
  latenceSommeil?: number
  efficaciteSommeil?: number
}

export interface Exam {
  id: string
  type: ExamType
  date: string
  fileName: string
  metrics: ExamMetrics
  severity: Severity
  notes?: string
  backendRef?: { type: BackendExamType; id: number }
}

export interface Patient {
  id: string
  nom: string
  prenom: string
  dateNaissance: string
  sexe: 'M' | 'F'
  exams: Exam[]
}

export interface PatientFilters {
  search: string
  examType: ExamType | 'all'
  severity: Severity | 'all'
  dateFrom: string
  dateTo: string
}

export interface DashboardStats {
  totalPatients: number
  totalExams: number
  avgIah: number
  severeCases: number
  examsByType: Record<ExamType, number>
  monthlyExams: { month: string; count: number }[]
  severityDistribution: { severity: Severity; count: number; label: string }[]
  lastSyncAt?: string
  dataFreshness?: 'ok' | 'stale' | 'error'
}

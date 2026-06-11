import type { ExamType } from './patient'

export interface CurveMeta {
  id: string
  label: string
  unit: string
  pointCount?: number
  eventCount?: number
  sampleIntervalSeconds?: number
}

export interface ExamCurvesMeta {
  examId: string
  examType: ExamType
  durationMinutes: number
  curves: CurveMeta[]
}

export interface Spo2CurveData {
  examId: string
  unit: string
  durationMinutes: number
  stats: { min: number; max: number; mean: number; timeBelow90Percent: number }
  points: { t: number; value: number }[]
}

export interface SleepStageSegment {
  t: number
  stage: 'wake' | 'n1' | 'n2' | 'n3' | 'rem'
  durationMinutes: number
}

export interface SleepStagesData {
  examId: string
  durationMinutes: number
  stages: SleepStageSegment[]
  distribution: Record<string, number>
}

export interface RespiratoryEvent {
  t: number
  type: 'apnea' | 'hypopnea'
  durationSeconds: number
  satO2Drop: number
}

export interface RespiratoryEventsData {
  examId: string
  durationMinutes: number
  summary: { apnea: number; hypopnea: number; total: number }
  events: RespiratoryEvent[]
}

export interface FlowVolumePoint {
  volume: number
  flow: number
}

export interface FlowVolumeData {
  examId: string
  points: FlowVolumePoint[]
  reference: { vems: number; cvf: number; rapportVemsCvf: number }
}

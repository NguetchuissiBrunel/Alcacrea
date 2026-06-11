import { mockPatients } from './mockPatients'
import type {
  ExamCurvesMeta,
  FlowVolumeData,
  RespiratoryEventsData,
  SleepStagesData,
  Spo2CurveData,
} from '../types/curves'
import type { Exam, ExamType } from '../types/patient'

function findExam(examId: string): Exam | null {
  for (const p of mockPatients) {
    const exam = p.exams.find((e) => e.id === examId)
    if (exam) return exam
  }
  return null
}

function seedFromId(id: string): number {
  return id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
}

export function getMockExamCurvesMeta(examId: string): ExamCurvesMeta | null {
  const exam = findExam(examId)
  if (!exam) return null

  const curves: ExamCurvesMeta['curves'] = []
  if (exam.type === 'polysomnographie' || exam.type === 'polygraphie') {
    curves.push(
      { id: 'spo2', label: 'SpO₂', unit: '%', pointCount: 120, sampleIntervalSeconds: 60 },
      { id: 'respiratory-events', label: 'Events', unit: 'events', eventCount: exam.metrics.iah ?? 20 },
    )
  }
  if (exam.type === 'polysomnographie') {
    curves.push({ id: 'sleep-stages', label: 'Stages', unit: 'stage', pointCount: 120 })
  }
  if (exam.type === 'efr') {
    curves.push({ id: 'flow-volume', label: 'Flow-Volume', unit: 'L', pointCount: 24 })
  }

  return {
    examId,
    examType: exam.type,
    durationMinutes: exam.type === 'efr' ? 0 : 420,
    curves,
  }
}

export function getMockSpo2Curve(examId: string): Spo2CurveData | null {
  const exam = findExam(examId)
  if (!exam || exam.type === 'efr') return null
  const seed = seedFromId(examId)
  const base = exam.metrics.satO2Moy ?? 94
  const points = Array.from({ length: 120 }, (_, i) => ({
    t: i,
    value: Math.round(
      base + Math.sin((i + seed) / 8) * 4 - (i % 17 === 0 ? 8 : 0) + (seed % 3),
    ),
  }))

  return {
    examId,
    unit: '%',
    durationMinutes: 120,
    stats: {
      min: exam.metrics.satO2Min ?? 82,
      max: 99,
      mean: base,
      timeBelow90Percent: Math.round((exam.metrics.indiceDesaturation ?? 10) / 2),
    },
    points,
  }
}

export function getMockSleepStages(examId: string): SleepStagesData | null {
  const exam = findExam(examId)
  if (!exam || exam.type !== 'polysomnographie') return null

  return {
    examId,
    durationMinutes: 420,
    stages: [
      { t: 0, stage: 'wake', durationMinutes: 15 },
      { t: 15, stage: 'n1', durationMinutes: 10 },
      { t: 25, stage: 'n2', durationMinutes: 90 },
      { t: 115, stage: 'n3', durationMinutes: 45 },
      { t: 160, stage: 'rem', durationMinutes: 35 },
      { t: 195, stage: 'n2', durationMinutes: 120 },
      { t: 315, stage: 'rem', durationMinutes: 40 },
      { t: 355, stage: 'n1', durationMinutes: 20 },
      { t: 375, stage: 'wake', durationMinutes: 45 },
    ],
    distribution: { wake: 14, n1: 7, n2: 50, n3: 11, rem: 18 },
  }
}

export function getMockRespiratoryEvents(examId: string): RespiratoryEventsData | null {
  const exam = findExam(examId)
  if (!exam || exam.type === 'efr') return null
  const iah = exam.metrics.iah ?? 15
  const apnea = Math.round(iah * 0.4)
  const hypopnea = Math.round(iah * 0.6)

  return {
    examId,
    durationMinutes: 420,
    summary: { apnea, hypopnea, total: apnea + hypopnea },
    events: Array.from({ length: Math.min(apnea + hypopnea, 30) }, (_, i) => ({
      t: 10 + i * 12,
      type: i % 3 === 0 ? 'apnea' as const : 'hypopnea' as const,
      durationSeconds: 15 + (i % 5) * 4,
      satO2Drop: 4 + (i % 8),
    })),
  }
}

export function getMockFlowVolume(examId: string): FlowVolumeData | null {
  const exam = findExam(examId)
  if (!exam || exam.type !== 'efr') return null
  const vems = exam.metrics.vems ?? 2.5
  const cvf = exam.metrics.cvf ?? 3.8

  const points = [
    { volume: 0, flow: 0 },
    { volume: vems * 0.25, flow: vems * 1.2 },
    { volume: vems * 0.5, flow: vems * 1.8 },
    { volume: vems, flow: vems * 0.9 },
    { volume: cvf * 0.75, flow: vems * 0.4 },
    { volume: cvf, flow: 0 },
  ]

  return {
    examId,
    points,
    reference: {
      vems,
      cvf,
      rapportVemsCvf: exam.metrics.rapportVemsCvf ?? Math.round((vems / cvf) * 100),
    },
  }
}

export function curvesAvailableForType(type: ExamType): string[] {
  if (type === 'efr') return ['flow-volume']
  if (type === 'polygraphie') return ['spo2', 'respiratory-events']
  return ['spo2', 'sleep-stages', 'respiratory-events']
}

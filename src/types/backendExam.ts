export type BackendExamType =
  | 'polysomnographie'
  | 'polygraphie-ppc'
  | 'efr-standard'
  | 'efr-avancee'

export interface BackendExamRef {
  type: BackendExamType
  id: number
  patientNom?: string
  date?: string
  severite?: string
  label: string
}

export interface ExtractedLinePoint {
  t: number
  value: number
}

export interface ExtractedFlowPoint {
  volume: number
  flow: number
}

export interface ExtractedStage {
  t: number
  stage: string
  durationMinutes?: number
}

export interface ExtractedEvent {
  t: number
  type: string
  durationSeconds?: number
  satO2Drop?: number
}

export type ExtractedCurve =
  | { id: string; label: string; kind: 'line'; points: ExtractedLinePoint[]; unit?: string }
  | { id: string; label: string; kind: 'flow-volume'; points: ExtractedFlowPoint[] }
  | { id: string; label: string; kind: 'stages'; stages: ExtractedStage[] }
  | { id: string; label: string; kind: 'events'; events: ExtractedEvent[] }

export interface ParsedField {
  path: string
  label: string
  value: string | number | boolean
}

export interface PdfUploadJob {
  id: number
  fileName: string
  status: string
  pdfType?: string
  error?: string
  examRef?: BackendExamRef
}

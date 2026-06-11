import { FlowVolumeChart } from '../charts/FlowVolumeChart'
import { GenericLineChart } from '../charts/GenericLineChart'
import { RespiratoryEventsList } from '../charts/RespiratoryEventsList'
import { SleepStagesChart } from '../charts/SleepStagesChart'
import { Spo2CurveChart } from '../charts/Spo2CurveChart'
import { useI18n } from '../../contexts/I18nContext'
import type { ExtractedCurve } from '../../types/backendExam'
import type { FlowVolumeData, RespiratoryEventsData, SleepStagesData, Spo2CurveData } from '../../types/curves'

interface BackendCurvesPanelProps {
  curves: ExtractedCurve[]
  examId: string
}

function toSpo2Data(curve: ExtractedCurve & { kind: 'line' }, examId: string): Spo2CurveData {
  const values = curve.points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const below90 = curve.points.filter((p) => p.value < 90).length
  const lastT = curve.points[curve.points.length - 1]?.t ?? 0
  return {
    examId,
    unit: '%',
    durationMinutes: lastT,
    stats: { min, max, mean, timeBelow90Percent: below90 },
    points: curve.points,
  }
}

function toSleepStages(curve: ExtractedCurve & { kind: 'stages' }, examId: string): SleepStagesData {
  const total = curve.stages.reduce((s, st) => s + (st.durationMinutes ?? 1), 0)
  const distribution: Record<string, number> = {}
  for (const st of curve.stages) {
    const d = st.durationMinutes ?? 1
    distribution[st.stage] = Math.round(((distribution[st.stage] ?? 0) + d) / total * 100)
  }
  return {
    examId,
    durationMinutes: curve.stages[curve.stages.length - 1]?.t ?? 0,
    stages: curve.stages.map((s) => ({
      t: s.t,
      stage: s.stage as 'wake' | 'n1' | 'n2' | 'n3' | 'rem',
      durationMinutes: s.durationMinutes ?? 1,
    })),
    distribution,
  }
}

function toRespEvents(curve: ExtractedCurve & { kind: 'events' }, examId: string): RespiratoryEventsData {
  const apnea = curve.events.filter((e) => e.type.toLowerCase().includes('apn')).length
  const hypopnea = curve.events.filter((e) => e.type.toLowerCase().includes('hypo')).length
  return {
    examId,
    durationMinutes: curve.events[curve.events.length - 1]?.t ?? 0,
    summary: { apnea, hypopnea, total: curve.events.length },
    events: curve.events.map((e) => ({
      t: e.t,
      type: (e.type.toLowerCase().includes('hypo') ? 'hypopnea' : 'apnea') as 'apnea' | 'hypopnea',
      durationSeconds: e.durationSeconds ?? 0,
      satO2Drop: e.satO2Drop ?? 0,
    })),
  }
}

function toFlowVolume(curve: ExtractedCurve & { kind: 'flow-volume' }, examId: string): FlowVolumeData {
  const maxVol = Math.max(...curve.points.map((p) => p.volume))
  return {
    examId,
    points: curve.points,
    reference: { vems: maxVol * 0.8, cvf: maxVol, rapportVemsCvf: 80 },
  }
}

function isSpo2Curve(curve: ExtractedCurve): boolean {
  if (curve.kind !== 'line') return false
  const id = curve.id.toLowerCase()
  return id.includes('spo2') || id.includes('sat') || id.includes('oxygen')
}

export function BackendCurvesPanel({ curves, examId }: BackendCurvesPanelProps) {
  const { t } = useI18n()

  if (curves.length === 0) {
    return <p className="text-vellum/40 text-sm font-mono text-center py-12">{t('examCurves.none')}</p>
  }

  return (
    <div className="space-y-6">
      {curves.map((curve) => (
        <div key={curve.id} className="rounded-[var(--radius-organic)] surface-card p-6">
          <h3 className="font-serif text-xl text-vellum mb-4 capitalize">{curve.label}</h3>
          {curve.kind === 'line' && isSpo2Curve(curve) && <Spo2CurveChart data={toSpo2Data(curve, examId)} />}
          {curve.kind === 'line' && !isSpo2Curve(curve) && (
            <GenericLineChart label={curve.label} points={curve.points} unit={curve.unit} />
          )}
          {curve.kind === 'stages' && <SleepStagesChart data={toSleepStages(curve, examId)} />}
          {curve.kind === 'events' && <RespiratoryEventsList data={toRespEvents(curve, examId)} />}
          {curve.kind === 'flow-volume' && <FlowVolumeChart data={toFlowVolume(curve, examId)} />}
        </div>
      ))}
    </div>
  )
}

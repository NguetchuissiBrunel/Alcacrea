import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { FlowVolumeChart } from '../components/charts/FlowVolumeChart'
import { RespiratoryEventsList } from '../components/charts/RespiratoryEventsList'
import { SleepStagesChart } from '../components/charts/SleepStagesChart'
import { Spo2CurveChart } from '../components/charts/Spo2CurveChart'
import { ExamTypeBadge } from '../components/ui/ExamTypeBadge'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useToast } from '../components/ui/Toast'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { useBackendLabels } from '../contexts/FilterMetadataContext'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { ExamMetrics } from '../types/patient'

export function ExamDetailPage() {
  const { t, formatDate } = useI18n()
  const { metricLabels } = useBackendLabels()
  const { showToast } = useToast()
  const { patientId, examId } = useParams<{ patientId: string; examId: string }>()

  const { data: patient, loading: patientLoading, error: patientError, retry } = useAsyncData(
    () => (patientId ? api.getPatient(patientId) : Promise.resolve(null)),
    [patientId],
  )

  const exam = patient?.exams.find((e) => e.id === examId)

  const { data: spo2 } = useAsyncData(
    () => (examId && exam && exam.type !== 'efr' ? api.getSpo2Curve(examId) : Promise.resolve(null)),
    [examId, exam?.type],
  )
  const { data: sleepStages } = useAsyncData(
    () => (examId && exam?.type === 'polysomnographie' ? api.getSleepStages(examId) : Promise.resolve(null)),
    [examId, exam?.type],
  )
  const { data: respEvents } = useAsyncData(
    () => (examId && exam && exam.type !== 'efr' ? api.getRespiratoryEvents(examId) : Promise.resolve(null)),
    [examId, exam?.type],
  )
  const { data: flowVolume } = useAsyncData(
    () => (examId && exam?.type === 'efr' ? api.getFlowVolume(examId) : Promise.resolve(null)),
    [examId, exam?.type],
  )

  if (patientLoading) return <PatientDetailSkeleton />
  if (patientError) return <ErrorMessage message={patientError} onRetry={retry} />

  if (!patient || !exam) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl text-vellum">{t('examDetail.notFound')}</p>
        <Link to={patientId ? `/patients/${patientId}` : '/patients'} className="text-breath text-sm mt-4 inline-block">
          {t('examDetail.back')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to={`/patients/${patient.id}`}
        className="inline-flex items-center gap-2 text-vellum/40 hover:text-breath text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('examDetail.backToPatient')}
      </Link>

      <div className="rounded-[var(--radius-organic)] surface-card p-8 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <ExamTypeBadge type={exam.type} />
          <SeverityBadge severity={exam.severity} />
          <span className="text-vellum/30 text-xs font-mono ml-auto">{formatDate(exam.date)}</span>
        </div>
        <h1 className="font-serif text-3xl text-vellum">
          {patient.prenom} {patient.nom}
        </h1>
        <div className="flex items-center gap-2 mt-3 text-vellum/40 text-xs font-mono">
          <FileText className="w-3.5 h-3.5" />
          {exam.fileName}
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-breath/70 hover:text-breath transition-colors"
          onClick={() => showToast(t('examDetail.downloadSoon'))}
        >
          <Download className="w-3.5 h-3.5" />
          {t('examDetail.downloadPdf')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {(Object.entries(exam.metrics) as [keyof ExamMetrics, number | undefined][]).map(
          ([key, value]) =>
            value != null && (
              <div key={key} className="p-3 rounded-xl bg-ink border border-vellum/8">
                <p className="text-vellum/30 text-xs font-mono uppercase">{metricLabels[key] ?? key}</p>
                <p className="text-vellum font-mono text-lg mt-1">{value}</p>
              </div>
            ),
        )}
      </div>

      {exam.notes && (
        <p className="mb-10 text-vellum/50 text-sm italic border-l-2 border-breath/30 pl-4">{exam.notes}</p>
      )}

      <h2 className="font-serif text-2xl text-vellum mb-6">{t('examDetail.curves')}</h2>
      <div className="space-y-6">
        {spo2 && (
          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('examCurves.spo2')}</h3>
            <Spo2CurveChart data={spo2} />
          </div>
        )}
        {sleepStages && (
          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('examCurves.sleepStages')}</h3>
            <SleepStagesChart data={sleepStages} />
          </div>
        )}
        {respEvents && (
          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('examCurves.respiratory')}</h3>
            <RespiratoryEventsList data={respEvents} />
          </div>
        )}
        {flowVolume && (
          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('examCurves.flowVolume')}</h3>
            <FlowVolumeChart data={flowVolume} />
          </div>
        )}
        {!spo2 && !sleepStages && !respEvents && !flowVolume && (
          <p className="text-vellum/40 text-sm font-mono text-center py-12">{t('examCurves.none')}</p>
        )}
      </div>
    </div>
  )
}

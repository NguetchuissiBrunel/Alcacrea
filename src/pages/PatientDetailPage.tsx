import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, FileText, UserX } from 'lucide-react'
import { PatientEvolutionChart } from '../components/charts/PatientEvolutionChart'
import { WaveLine } from '../components/brand/WaveLine'
import { ExamTypeBadge } from '../components/ui/ExamTypeBadge'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { useBackendLabels } from '../contexts/FilterMetadataContext'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { ExamMetrics, Patient } from '../types/patient'
import { patientIdsMatch } from '../services/backendMapper'

export function PatientDetailPage() {
  const { t, formatDate } = useI18n()
  const { metricLabels } = useBackendLabels()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const statePatient = (location.state as { patient?: Patient } | null)?.patient
  const { data: fetchedPatient, loading, error, retry } = useAsyncData(
    () => (id ? api.getPatient(id) : Promise.resolve(null)),
    [id],
  )

  const patient =
    fetchedPatient ??
    (id && statePatient && patientIdsMatch(statePatient.id, id) ? statePatient : null)

  if (loading && !patient) return <PatientDetailSkeleton />
  if (error && !patient) return <ErrorMessage message={error} onRetry={retry} />

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <UserX className="w-10 h-10 text-vellum/20" aria-hidden="true" />
        <p className="font-serif text-2xl text-vellum">{t('patientDetail.notFound')}</p>
        <p className="text-vellum/40 text-sm">{t('patientDetail.notFoundDesc')}</p>
        <Link to="/patients" className="inline-flex items-center gap-2 text-breath hover:text-breath/80 text-sm mt-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded-lg px-2 py-1">
          <ArrowLeft className="w-4 h-4" />
          {t('patientDetail.back')}
        </Link>
      </div>
    )
  }

  const sortedExams = [...patient.exams].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <Link to="/patients" className="inline-flex items-center gap-2 text-vellum/40 hover:text-breath text-sm mb-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded-lg px-1 py-0.5">
        <ArrowLeft className="w-4 h-4" />
        {t('patientDetail.back')}
      </Link>

      <div className="relative overflow-hidden rounded-[2rem] dossier-surface p-10 pt-12 mb-10">
        <div className="dossier-tab" aria-hidden="true" />
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-vellum-ink/40 uppercase tracking-[0.2em]">{t('patientDetail.fileLabel')}</p>
          <h1 className="font-serif text-5xl text-vellum-ink mt-3 leading-none">
            <span className="font-sans font-light text-vellum-ink/75">{patient.prenom}</span>
            <br />
            <span className="uppercase tracking-wide">{patient.nom}</span>
          </h1>
          <WaveLine className="w-36 h-2.5 mt-4" variant="breath" />
          <p className="mt-4 text-vellum-ink/50 font-mono text-sm">
            {patient.sexe === 'M' ? t('common.man') : t('common.woman')} · {formatDate(patient.dateNaissance)}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-organic)] surface-card p-6 mb-10">
        <h2 className="font-serif text-2xl text-vellum mb-1">{t('patientDetail.evolution')}</h2>
        <p className="text-vellum/40 text-xs font-mono mb-6">{t('patientDetail.evolutionDesc')}</p>
        <PatientEvolutionChart patient={patient} />
      </div>

      <h2 className="font-serif text-2xl text-vellum mb-6">
        {t('patientDetail.exams')} <span className="text-vellum/30">({sortedExams.length})</span>
      </h2>

      <div className="space-y-4">
        {sortedExams.map((exam) => (
          <div key={exam.id} className="rounded-2xl surface-card p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <ExamTypeBadge type={exam.type} />
              <SeverityBadge severity={exam.severity} />
              <span className="text-vellum/30 text-xs font-mono ml-auto">{formatDate(exam.date)}</span>
              <Link
                to={
                  exam.backendRef
                    ? `/exams/${exam.backendRef.type}/${exam.backendRef.id}`
                    : `/patients/${patient.id}/exams/${exam.id}`
                }
                className="inline-flex items-center gap-1 text-xs font-mono text-breath/70 hover:text-breath transition-colors"
              >
                {t('patientDetail.viewCurves')}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-vellum/40 text-xs font-mono mb-4">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              {exam.fileName}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(Object.entries(exam.metrics) as [keyof ExamMetrics, number | undefined][]).map(
                ([key, value]) =>
                  value != null && (
                    <div key={key} className="p-3 rounded-xl bg-ink">
                      <p className="text-vellum/30 text-xs font-mono uppercase">{metricLabels[key] ?? key}</p>
                      <p className="text-vellum font-mono text-lg mt-1">{value}</p>
                    </div>
                  ),
              )}
            </div>
            {exam.notes && (
              <p className="mt-4 text-vellum/50 text-sm italic border-l-2 border-breath/30 pl-4">{exam.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

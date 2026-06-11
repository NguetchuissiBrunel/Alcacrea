import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Download, FileSpreadsheet, FileText, UserX } from 'lucide-react'
import { useState } from 'react'
import { PatientEvolutionChart } from '../components/charts/PatientEvolutionChart'
import { WaveLine } from '../components/brand/WaveLine'
import { ExamTypeBadge } from '../components/ui/ExamTypeBadge'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { useBackendLabels } from '../contexts/FilterMetadataContext'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { ExamMetrics } from '../types/patient'

export function PatientDetailPage() {
  const { t, formatDate } = useI18n()
  const { metricLabels } = useBackendLabels()
  const { showToast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const { data: patient, loading, error, retry } = useAsyncData(
    () => (id ? api.getPatient(id) : Promise.resolve(null)),
    [id],
  )

  if (loading) return <PatientDetailSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={retry} />

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

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format)
    try {
      if (format === 'csv') {
        await api.exportCsv([patient])
        showToast(t('export.toastCsv'))
      } else {
        await api.exportPdf([patient])
        showToast(t('export.toastPdf'))
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : t(format === 'csv' ? 'export.errorCsv' : 'export.errorPdf'), 'error')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <Link to="/patients" className="inline-flex items-center gap-2 text-vellum/40 hover:text-breath text-sm mb-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded-lg px-1 py-0.5">
        <ArrowLeft className="w-4 h-4" />
        {t('patientDetail.back')}
      </Link>

      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] dossier-surface p-6 sm:p-8 md:p-10 pt-10 sm:pt-12 mb-8 sm:mb-10">
        <div className="dossier-tab" aria-hidden="true" />
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-vellum-ink/40 uppercase tracking-[0.2em]">{t('patientDetail.fileLabel')}</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-vellum-ink mt-3 leading-none break-words">
            <span className="font-sans font-light text-vellum-ink/75">{patient.prenom}</span>
            <br />
            <span className="uppercase tracking-wide">{patient.nom}</span>
          </h1>
          <WaveLine className="w-36 h-2.5 mt-4" variant="breath" />
          <p className="mt-4 text-vellum-ink/50 font-mono text-sm">
            {patient.sexe === 'M' ? t('common.man') : t('common.woman')} · {formatDate(patient.dateNaissance)}
          </p>
          {sortedExams.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                onClick={() => void handleExport('csv')}
                disabled={exporting !== null}
                loading={exporting === 'csv'}
                loadingText={t('export.generating')}
                icon={<FileSpreadsheet className="w-4 h-4" />}
              >
                {t('patientDetail.exportCsv')}
              </Button>
              <Button
                variant="dream"
                onClick={() => void handleExport('pdf')}
                disabled={exporting !== null}
                loading={exporting === 'pdf'}
                loadingText={t('export.generating')}
                icon={<Download className="w-4 h-4" />}
              >
                {t('patientDetail.exportPdf')}
              </Button>
            </div>
          )}
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
          <div key={exam.id} className="rounded-2xl surface-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
              <ExamTypeBadge type={exam.type} />
              <SeverityBadge severity={exam.severity} />
              <span className="text-vellum/30 text-xs font-mono sm:ml-auto">{formatDate(exam.date)}</span>
              <Link
                to={
                  exam.backendRef
                    ? `/exams/${exam.backendRef.type}/${exam.backendRef.id}`
                    : `/patients/${patient.id}/exams/${exam.id}`
                }
                className="action-link"
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
                    <div key={key} className="criteria-card">
                      <p className="field-label">{metricLabels[key] ?? key}</p>
                      <p className="field-value-lg mt-2">{value}</p>
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

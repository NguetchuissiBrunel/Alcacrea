import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, FileJson } from 'lucide-react'
import { BackendCurvesPanel } from '../components/exams/BackendCurvesPanel'
import { ParsedFieldsGrid } from '../components/exams/ParsedFieldsGrid'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { fetchBackendExam } from '../services/backendExamApi'
import type { BackendExamType } from '../types/backendExam'
import { extractCurvesFromParsedData, flattenParsedFields } from '../utils/curveExtractor'

const VALID_TYPES: BackendExamType[] = ['polysomnographie', 'polygraphie-ppc', 'efr-standard', 'efr-avancee']

function isValidType(t: string | undefined): t is BackendExamType {
  return !!t && VALID_TYPES.includes(t as BackendExamType)
}

export function BackendExamPage() {
  const { t } = useI18n()
  const { type, id } = useParams<{ type: string; id: string }>()
  const [showRaw, setShowRaw] = useState(false)

  const examId = Number(id)
  const valid = isValidType(type) && !Number.isNaN(examId)

  const { data, loading, error, retry } = useAsyncData(
    () => (valid ? fetchBackendExam(type, examId) : Promise.resolve(null)),
    [type, examId, valid],
  )

  const curves = useMemo(() => (data ? extractCurvesFromParsedData(data) : []), [data])
  const fields = useMemo(() => (data ? flattenParsedFields(data) : []), [data])

  const patientName = useMemo(() => {
    if (!data || typeof data !== 'object') return ''
    const row = data as Record<string, unknown>
    return String(row.patient_nom ?? row.nom_patient ?? row.patient_name ?? '')
  }, [data])

  const examDate = useMemo(() => {
    if (!data || typeof data !== 'object') return ''
    const row = data as Record<string, unknown>
    return String(row.date_enregistrement ?? row.date_examen ?? row.date ?? '')
  }, [data])

  if (!valid) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl text-vellum">{t('backendExam.invalid')}</p>
        <Link to="/import" className="text-breath text-sm mt-4 inline-block">
          {t('import.title')}
        </Link>
      </div>
    )
  }

  if (loading) return <PatientDetailSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={retry} />

  return (
    <div>
      <Link
        to="/import"
        className="inline-flex items-center gap-2 text-vellum/40 hover:text-breath text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backendExam.backToImport')}
      </Link>

      <div className="rounded-[var(--radius-organic)] surface-card p-8 mb-10">
        <p className="text-vellum/30 text-xs font-mono uppercase mb-2">{type}</p>
        <h1 className="font-serif text-3xl text-vellum">
          {patientName || t('backendExam.examTitle', { id: examId })}
        </h1>
        {examDate && <p className="text-vellum/40 text-sm font-mono mt-2">{examDate}</p>}
        <p className="text-vellum/50 text-sm mt-4 max-w-2xl">{t('backendExam.enrichDesc')}</p>
      </div>

      <h2 className="font-serif text-2xl text-vellum mb-6">{t('examDetail.curves')}</h2>
      <BackendCurvesPanel curves={curves} examId={`${type}-${examId}`} />

      <div className="mt-12">
        <ParsedFieldsGrid fields={fields} />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-mono text-vellum/50 hover:text-breath transition-colors"
        >
          <FileJson className="w-4 h-4" />
          {t('backendExam.rawJson')}
          {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showRaw && (
          <pre className="mt-4 p-4 rounded-xl bg-ink border border-vellum/8 text-[11px] font-mono text-vellum/70 overflow-x-auto max-h-[420px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

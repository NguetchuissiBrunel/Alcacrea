import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, FileJson, Trash2 } from 'lucide-react'
import { BackendCurvesPanel } from '../components/exams/BackendCurvesPanel'
import { ParsedFieldsGrid } from '../components/exams/ParsedFieldsGrid'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { deleteBackendExam, fetchBackendExam } from '../services/backendExamApi'
import { invalidateBackendCache } from '../services/backendData'
import { extractMetrics } from '../services/backendMapper'
import { api } from '../services/api'
import { apiErrorMessage } from '../services/authApi'
import { useToast } from '../components/ui/Toast'
import type { BackendExamType } from '../types/backendExam'
import { extractCurvesFromParsedData, flattenParsedFields } from '../utils/curveExtractor'
import { extractExamDate, extractPatientParts, normalizeExamDate } from '../utils/examMeta'
import { patientIdFromName } from '../utils/patientIdentity'

const VALID_TYPES: BackendExamType[] = ['polysomnographie', 'polygraphie-ppc', 'efr-standard', 'efr-avancee']

function isValidType(t: string | undefined): t is BackendExamType {
  return !!t && VALID_TYPES.includes(t as BackendExamType)
}

export function BackendExamPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { type, id } = useParams<{ type: string; id: string }>()
  const [showRaw, setShowRaw] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const examId = Number(id)
  const valid = isValidType(type) && !Number.isNaN(examId)

  const { data, loading, error, retry } = useAsyncData(
    () => (valid ? fetchBackendExam(type, examId) : Promise.resolve(null)),
    [type, examId, valid],
  )

  const curves = useMemo(() => (data ? extractCurvesFromParsedData(data) : []), [data])
  const fields = useMemo(() => (data ? flattenParsedFields(data) : []), [data])
  const scalarMetrics = useMemo(() => {
    if (!data || typeof data !== 'object' || !valid) return undefined
    return extractMetrics(data as Record<string, unknown>)
  }, [data, valid])

  const patientMeta = useMemo(() => {
    if (!data || typeof data !== 'object') return null
    const row = data as Record<string, unknown>
    const { prenom, nom } = extractPatientParts(row)
    const name = `${prenom} ${nom}`.trim()
    const patientId = patientIdFromName(name || nom)
    return { prenom, nom, name, patientId, date: normalizeExamDate(extractExamDate(row)) }
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
      <ConfirmDialog
        open={confirmDeleteOpen}
        title={t('exams.delete')}
        message={t('exams.confirmDelete')}
        confirmLabel={t('exams.delete')}
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true)
          try {
            await deleteBackendExam(type, examId)
            invalidateBackendCache()
            api.invalidateCache()
            showToast(t('exams.deleted'))
            setConfirmDeleteOpen(false)
            navigate('/exams')
          } catch (err) {
            showToast(apiErrorMessage(err), 'error')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => {
          if (!deleting) setConfirmDeleteOpen(false)
        }}
      />

      <Link
        to="/import"
        className="inline-flex items-center gap-2 text-vellum/40 hover:text-breath text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backendExam.backToImport')}
      </Link>

      <div className="rounded-[var(--radius-organic)] surface-card p-8 mb-8 sm:mb-10">
        <p className="text-vellum/30 text-xs font-mono uppercase mb-2">{type}</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-vellum break-words">
          {patientMeta?.name || t('backendExam.examTitle', { id: examId })}
        </h1>
        {patientMeta?.date && (
          <p className="text-vellum/40 text-sm font-mono mt-2">{patientMeta.date}</p>
        )}
        {patientMeta?.name && (
          <Link
            to={`/patients/${encodeURIComponent(patientMeta.patientId)}`}
            className="action-link text-sm"
          >
            {t('patientDetail.viewPatient')}
          </Link>
        )}
        <p className="text-vellum/50 text-sm mt-4 max-w-2xl">{t('backendExam.enrichDesc')}</p>
        {valid && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirmDeleteOpen(true)}
            className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-pulse/70 hover:text-pulse disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('exams.delete')}
          </button>
        )}
      </div>

      <h2 className="font-serif text-2xl text-vellum mb-6">{t('examDetail.curves')}</h2>
      <BackendCurvesPanel curves={curves} examId={`${type}-${examId}`} scalarMetrics={scalarMetrics} />

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

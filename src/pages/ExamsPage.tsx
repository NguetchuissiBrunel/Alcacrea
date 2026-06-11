import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, Trash2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { FilterBar } from '../components/ui/FilterBar'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { useToast } from '../components/ui/Toast'
import { PatientsGridSkeleton } from '../components/ui/Skeleton'
import { defaultFilters } from '../constants/filters'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import { deleteBackendExam } from '../services/backendExamApi'
import { fetchAllExamRows, invalidateBackendCache } from '../services/backendData'
import { mapExamRow } from '../services/backendMapper'
import type { BackendExamType } from '../types/backendExam'
import type { PatientFilters } from '../types/patient'
import { apiErrorMessage } from '../services/authApi'
import { extractPatientNom } from '../utils/patientIdentity'

export function ExamsPage() {
  const { t, formatDate } = useI18n()
  const { showToast } = useToast()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: BackendExamType
    id: number
    key: string
  } | null>(null)

  const { data: rows, loading, error, retry } = useAsyncData(
    () => fetchAllExamRows(undefined, filters),
    [filters],
  )

  const examEntries = (rows ?? [])
    .map((row) => ({ row, exam: mapExamRow(row) }))
    .sort((a, b) => b.exam.date.localeCompare(a.exam.date))

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { type, id, key } = deleteTarget
    setDeleting(key)
    try {
      await deleteBackendExam(type, id)
      invalidateBackendCache()
      api.invalidateCache()
      showToast(t('exams.deleted'))
      setDeleteTarget(null)
      retry()
    } catch (err) {
      showToast(apiErrorMessage(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('exams.delete')}
        message={t('exams.confirmDelete')}
        confirmLabel={t('exams.delete')}
        variant="danger"
        loading={deleting !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />
      <Header title={t('exams.title')} subtitle={t('exams.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <div className="mt-8"><PatientsGridSkeleton /></div>}
      {error && <div className="mt-8"><ErrorMessage message={error} onRetry={retry} /></div>}

      {!loading && !error && (
        <div className="mt-8 rounded-[var(--radius-organic)] surface-card overflow-hidden">
          <div className="table-scroll">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-clinical-border/40 text-left">
                  <th className="py-3 px-4 table-head">{t('exams.type')}</th>
                  <th className="py-3 px-4 table-head">{t('exams.patient')}</th>
                  <th className="py-3 px-4 table-head">{t('exams.date')}</th>
                  <th className="py-3 px-4 table-head">{t('exams.severity')}</th>
                  <th className="py-3 px-4 table-head text-right">{t('exams.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {examEntries.map(({ row, exam }) => {
                  const key = exam.backendRef ? `${exam.backendRef.type}-${exam.backendRef.id}` : exam.id
                  const patientLabel = extractPatientNom(row.raw)
                  const displayPatient =
                    patientLabel !== 'Inconnu' ? patientLabel : exam.fileName.replace(/\.pdf$/i, '')
                  return (
                    <tr key={key} className="border-b border-vellum/5 text-clinical-value hover:bg-ink-muted/30">
                      <td className="py-3 px-4 capitalize font-medium">{exam.backendRef?.type.replace(/-/g, ' ')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-medium">
                          <FileText className="w-3.5 h-3.5 text-clinical-muted" />
                          {displayPatient}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">{formatDate(exam.date)}</td>
                      <td className="py-3 px-4"><SeverityBadge severity={exam.severity} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          {exam.backendRef && (
                            <Link
                              to={`/exams/${exam.backendRef.type}/${exam.backendRef.id}`}
                              className="action-link"
                            >
                              {t('exams.view')}
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {exam.backendRef && (
                            <button
                              type="button"
                              disabled={deleting === key}
                              onClick={() =>
                                setDeleteTarget({
                                  type: exam.backendRef!.type,
                                  id: exam.backendRef!.id,
                                  key,
                                })
                              }
                              className="text-pulse/70 hover:text-pulse disabled:opacity-40"
                              aria-label={t('exams.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {examEntries.length === 0 && (
            <p className="text-center text-vellum/30 py-16 font-serif">{t('exams.empty')}</p>
          )}
        </div>
      )}
    </>
  )
}

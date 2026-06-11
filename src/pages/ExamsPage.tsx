import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, Trash2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { FilterBar } from '../components/ui/FilterBar'
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

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export function ExamsPage() {
  const { t, formatDate } = useI18n()
  const { showToast } = useToast()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { data: rows, loading, error, retry } = useAsyncData(
    () => (USE_MOCK ? Promise.resolve([]) : fetchAllExamRows(200, filters)),
    [filters],
  )

  const examEntries = (rows ?? [])
    .map((row) => ({ row, exam: mapExamRow(row) }))
    .sort((a, b) => b.exam.date.localeCompare(a.exam.date))

  const handleDelete = async (type: string, id: number, key: string) => {
    if (!confirm(t('exams.confirmDelete'))) return
    setDeleting(key)
    try {
      await deleteBackendExam(type as BackendExamType, id)
      invalidateBackendCache()
      api.invalidateCache()
      showToast(t('exams.deleted'))
      retry()
    } catch (err) {
      showToast(apiErrorMessage(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Header title={t('exams.title')} subtitle={t('exams.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />

      {USE_MOCK && (
        <p className="mt-6 text-vellum/40 text-sm font-mono">{t('exams.mockHint')}</p>
      )}

      {loading && <div className="mt-8"><PatientsGridSkeleton /></div>}
      {error && <div className="mt-8"><ErrorMessage message={error} onRetry={retry} /></div>}

      {!loading && !error && !USE_MOCK && (
        <div className="mt-8 rounded-[var(--radius-organic)] surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-vellum/35 border-b border-vellum/8 text-left">
                  <th className="py-3 px-4">{t('exams.type')}</th>
                  <th className="py-3 px-4">{t('exams.patient')}</th>
                  <th className="py-3 px-4">{t('exams.date')}</th>
                  <th className="py-3 px-4">{t('exams.severity')}</th>
                  <th className="py-3 px-4 text-right">{t('exams.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {examEntries.map(({ row, exam }) => {
                  const key = exam.backendRef ? `${exam.backendRef.type}-${exam.backendRef.id}` : exam.id
                  const patientLabel = String(row.raw.patient_nom ?? row.raw.nom_patient ?? exam.fileName)
                  return (
                    <tr key={key} className="border-b border-vellum/5 text-vellum/75 hover:bg-ink-muted/30">
                      <td className="py-3 px-4 capitalize">{exam.backendRef?.type.replace(/-/g, ' ')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-vellum/30" />
                          {patientLabel}
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(exam.date)}</td>
                      <td className="py-3 px-4"><SeverityBadge severity={exam.severity} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          {exam.backendRef && (
                            <Link
                              to={`/exams/${exam.backendRef.type}/${exam.backendRef.id}`}
                              className="inline-flex items-center gap-1 text-breath hover:underline text-xs"
                            >
                              {t('exams.view')}
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {exam.backendRef && (
                            <button
                              type="button"
                              disabled={deleting === key}
                              onClick={() => handleDelete(exam.backendRef!.type, exam.backendRef!.id, key)}
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

import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { FilterBar } from '../components/ui/FilterBar'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { ExportSkeleton } from '../components/ui/Skeleton'
import { Select } from '../components/ui/Select'
import { useToast } from '../components/ui/Toast'
import { defaultFilters } from '../constants/filters'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { Patient, PatientFilters } from '../types/patient'
import { ExportPreviewTable } from '../components/export/ExportPreviewTable'

export function ExportPage() {
  const { t } = useI18n()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [selectedPatientId, setSelectedPatientId] = useState('all')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const { showToast } = useToast()
  const { data: patients, loading, error, retry } = useAsyncData(
    () => api.getPatients(filters),
    [filters],
  )

  const exportPatients = useMemo(() => {
    if (!patients) return []
    if (selectedPatientId === 'all') return patients
    const match = patients.find((p) => p.id === selectedPatientId)
    return match ? [match] : []
  }, [patients, selectedPatientId])

  const examCount = exportPatients.reduce((s, p) => s + p.exams.length, 0)

  const handleExportCsv = async () => {
    if (exportPatients.length === 0) return
    setExporting('csv')
    try {
      await api.exportCsv(exportPatients)
      showToast(t('export.toastCsv'))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('export.errorCsv'), 'error')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPdf = async () => {
    if (exportPatients.length === 0) return
    setExporting('pdf')
    try {
      await api.exportPdf(exportPatients)
      showToast(t('export.toastPdf'))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('export.errorPdf'), 'error')
    } finally {
      setExporting(null)
    }
  }

  const previewSubtitle =
    examCount > 0
      ? t(examCount > 1 ? 'export.previewCount_other' : 'export.previewCount_one', {
          exams: examCount,
          patients: exportPatients.length,
        })
      : t('export.previewEmpty')

  return (
    <>
      <Header title={t('export.title')} subtitle={t('export.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} onRetry={retry} />
        </div>
      )}

      {loading && !error && <ExportSkeleton />}

      {!loading && patients && !error && (
        <>
          <div className="mt-6 max-w-md">
            <Select
              label={t('export.patientFilter')}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="all">{t('export.allPatients')}</option>
              {patients.map((p: Patient) => (
                <option key={p.id} value={p.id}>
                  {p.nom.toUpperCase()} {p.prenom}
                  {p.exams.length > 0 ? ` (${p.exams.length})` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[var(--radius-organic)] dossier-surface p-6 sm:p-8">
              <div className="relative z-10">
                <FileSpreadsheet className="w-8 h-8 text-breath mb-4" aria-hidden="true" />
                <h3 className="font-serif text-2xl text-vellum-ink">{t('export.csvTitle')}</h3>
                <p className="mt-2 text-vellum-ink/50 text-sm">{t('export.csvDesc')}</p>
                <p className="mt-4 font-mono text-sm text-vellum-ink/70">
                  {t('export.count', { patients: exportPatients.length, exams: examCount })}
                </p>
                <Button
                  className="mt-6"
                  onClick={handleExportCsv}
                  disabled={exporting !== null || examCount === 0}
                  loading={exporting === 'csv'}
                  loadingText={t('export.generating')}
                  icon={<Download className="w-4 h-4" />}
                >
                  {t('export.downloadCsv')}
                </Button>
              </div>
            </div>
            <div className="rounded-[var(--radius-organic)] surface-card p-6 sm:p-8">
              <FileText className="w-8 h-8 text-dream mb-4" aria-hidden="true" />
              <h3 className="font-serif text-2xl text-vellum">{t('export.pdfTitle')}</h3>
              <p className="mt-2 text-vellum/50 text-sm">{t('export.pdfDesc')}</p>
              <p className="mt-4 font-mono text-sm text-vellum/60">
                {t('export.count', { patients: exportPatients.length, exams: examCount })}
              </p>
              <Button
                variant="dream"
                className="mt-6"
                onClick={handleExportPdf}
                disabled={exporting !== null || examCount === 0}
                loading={exporting === 'pdf'}
                loadingText={t('export.generating')}
                icon={<Download className="w-4 h-4" />}
              >
                {t('export.downloadPdf')}
              </Button>
            </div>
          </div>

          <div className="mt-10 rounded-[var(--radius-organic)] surface-card overflow-hidden">
            <div className="px-6 py-5 border-b border-vellum/8 bg-ink-muted/30">
              <h4 className="font-serif text-xl text-vellum">{t('export.preview')}</h4>
              <p className="mt-1 text-sm text-vellum/45">{previewSubtitle}</p>
            </div>
            <div className="p-4 sm:p-5 max-h-[420px] overflow-y-auto">
              <ExportPreviewTable patients={exportPatients} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

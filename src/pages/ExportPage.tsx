import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { FilterBar } from '../components/ui/FilterBar'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useToast } from '../components/ui/Toast'
import { defaultFilters } from '../constants/filters'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { PatientFilters } from '../types/patient'
import { ExportPreviewTable } from '../components/export/ExportPreviewTable'

export function ExportPage() {
  const { t } = useI18n()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const { showToast } = useToast()
  const { data: patients, loading, error, retry } = useAsyncData(() => api.getPatients(filters), [filters])

  const examCount = patients?.reduce((s, p) => s + p.exams.length, 0) ?? 0

  const handleExportCsv = async () => {
    if (!patients) return
    setExporting('csv')
    try {
      await api.exportCsv(patients)
      showToast(t('export.toastCsv'))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('export.errorCsv'), 'error')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPdf = async () => {
    if (!patients) return
    setExporting('pdf')
    try {
      await api.exportPdf(patients)
      showToast(t('export.toastPdf'))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('export.errorPdf'), 'error')
    } finally {
      setExporting(null)
    }
  }

  const previewSubtitle = loading
    ? t('common.loading')
    : examCount > 0
      ? t(examCount > 1 ? 'export.previewCount_other' : 'export.previewCount_one', { exams: examCount, patients: patients?.length ?? 0 })
      : t('export.previewEmpty')

  return (
    <>
      <Header title={t('export.title')} subtitle={t('export.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />
      {error && <div className="mt-6"><ErrorMessage message={error} onRetry={retry} /></div>}
      {patients && !error && (
        <>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[var(--radius-organic)] dossier-surface p-8">
              <div className="relative z-10">
                <FileSpreadsheet className="w-8 h-8 text-breath mb-4" aria-hidden="true" />
                <h3 className="font-serif text-2xl text-vellum-ink">{t('export.csvTitle')}</h3>
                <p className="mt-2 text-vellum-ink/50 text-sm">{t('export.csvDesc')}</p>
                <p className="mt-4 font-mono text-sm text-vellum-ink/70">
                  {loading ? '…' : t('export.count', { patients: patients.length, exams: examCount })}
                </p>
                <Button className="mt-6" onClick={handleExportCsv} disabled={exporting !== null || examCount === 0 || loading} loading={exporting === 'csv'} loadingText={t('export.generating')} icon={<Download className="w-4 h-4" />}>
                  {t('export.downloadCsv')}
                </Button>
              </div>
            </div>
            <div className="rounded-[var(--radius-organic)] surface-card p-8">
              <FileText className="w-8 h-8 text-dream mb-4" aria-hidden="true" />
              <h3 className="font-serif text-2xl text-vellum">{t('export.pdfTitle')}</h3>
              <p className="mt-2 text-vellum/50 text-sm">{t('export.pdfDesc')}</p>
              <p className="mt-4 font-mono text-sm text-vellum/60">
                {loading ? '…' : t('export.count', { patients: patients.length, exams: examCount })}
              </p>
              <Button variant="dream" className="mt-6" onClick={handleExportPdf} disabled={exporting !== null || examCount === 0 || loading} loading={exporting === 'pdf'} loadingText={t('export.generating')} icon={<Download className="w-4 h-4" />}>
                {t('export.downloadPdf')}
              </Button>
            </div>
          </div>
          <div className="mt-10 rounded-[var(--radius-organic)] surface-card overflow-hidden">
            <div className="px-6 py-5 border-b border-vellum/8 bg-ink-muted/30">
              <h4 className="font-serif text-xl text-vellum">{t('export.preview')}</h4>
              <p className="mt-1 text-sm text-vellum/45">{previewSubtitle}</p>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              <ExportPreviewTable patients={patients} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

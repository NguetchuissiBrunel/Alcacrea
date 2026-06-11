import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, FileUp, Loader2, RefreshCw, Upload, XCircle } from 'lucide-react'
import { BulkUploadModal } from '../components/import/BulkUploadModal'
import { PdfJobStatusBadge, PdfParsingPanel } from '../components/import/PdfParsingPanel'
import { Header } from '../components/layout/Header'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useToast } from '../components/ui/Toast'
import { useBackendLabels } from '../contexts/FilterMetadataContext'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  isPdfProcessing,
  listRecentPdfs,
  pollPdfStatus,
  reparsePdf,
} from '../services/backendExamApi'
import { api } from '../services/api'
import { invalidateBackendCache } from '../services/backendData'
import { apiErrorMessage } from '../services/authApi'
import type { PdfUploadJob } from '../types/backendExam'
import { PDFStatus } from '../lib'
import { collectPdfsFromDataTransfer, collectPdfsFromFileList, uniqueFiles } from '../utils/collectPdfFiles'
import { examTypeKeyFromPdfType, getPdfJobDisplay, normalizePdfTypeKey } from '../utils/pdfJobDisplay'
import { isValidPdfJobId } from '../utils/pdfJobParser'

function statusIcon(status: string) {
  if (status === PDFStatus.DONE || status === 'done') return <CheckCircle2 className="w-4 h-4 text-breath" />
  if (status === PDFStatus.FAILED || status === 'failed') return <XCircle className="w-4 h-4 text-pulse" />
  return <Loader2 className="w-4 h-4 text-vellum/50 animate-spin" />
}

export function ImportPage() {
  const { t, formatDate } = useI18n()
  const { examTypeLabels } = useBackendLabels()
  const { showToast } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [reparsing, setReparsing] = useState<number | null>(null)
  const [activeJobs, setActiveJobs] = useState<PdfUploadJob[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const filesInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const { data: recent, loading, error, retry } = useAsyncData(() => listRecentPdfs(15), [])

  const refreshJob = useCallback(async (job: PdfUploadJob) => {
    if (!isValidPdfJobId(job.id)) return job
    try {
      const updated = await pollPdfStatus(job.id)
      setActiveJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)))
      return updated
    } catch {
      return job
    }
  }, [])

  useEffect(() => {
    const pending = activeJobs.filter((j) => isValidPdfJobId(j.id) && isPdfProcessing(j.status))
    if (pending.length === 0) return

    const timer = setInterval(() => {
      pending.forEach((job) => {
        void refreshJob(job)
          .then((updated) => {
            if (updated.status === PDFStatus.DONE || updated.status === 'done') {
              showToast(t('import.parseDone'))
              invalidateBackendCache()
              api.invalidateCache()
              retry()
            }
            if (updated.status === PDFStatus.FAILED || updated.status === 'failed') {
              showToast(t('import.parseFailed'))
            }
          })
          .catch(() => {})
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [activeJobs, refreshJob, retry, showToast, t])

  function openBulkUpload(files: File[]) {
    const pdfs = uniqueFiles(files)
    if (pdfs.length === 0) {
      showToast(t('import.pdfOnly'))
      return
    }
    if (files.length > pdfs.length) {
      showToast(t('import.skippedNonPdf', { count: files.length - pdfs.length }))
    }
    setPendingFiles(pdfs)
    setModalOpen(true)
  }

  async function handleFileList(files: FileList | null) {
    if (!files?.length) return
    openBulkUpload(collectPdfsFromFileList(files))
    if (filesInputRef.current) filesInputRef.current.value = ''
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    try {
      const pdfs = uniqueFiles(await collectPdfsFromDataTransfer(e.dataTransfer))
      if (pdfs.length === 0) {
        showToast(t('import.pdfOnly'))
        return
      }
      openBulkUpload(pdfs)
    } catch {
      showToast(t('common.error'))
    }
  }

  const handleBulkComplete = (jobs: PdfUploadJob[]) => {
    const valid = jobs.filter((j) => isValidPdfJobId(j.id))
    if (valid.length > 0) setActiveJobs((prev) => [...valid, ...prev])
    invalidateBackendCache()
    api.invalidateCache()
    showToast(t('import.bulk.complete', { count: valid.length }))
    retry()
  }

  const allJobs = [...activeJobs, ...(recent ?? [])]
    .filter((job) => isValidPdfJobId(job.id))
    .filter((job, i, arr) => arr.findIndex((j) => j.id === job.id) === i)

  function resolvePdfTypeLabel(pdfType: string | undefined): string | undefined {
    if (!pdfType) return undefined
    const key = normalizePdfTypeKey(pdfType)
    const i18nKey = `import.pdfTypes.${key}`
    const fromI18n = t(i18nKey)
    if (fromI18n !== i18nKey) return fromI18n
    const examKey = examTypeKeyFromPdfType(pdfType)
    if (examKey && examTypeLabels[examKey]) return examTypeLabels[examKey]
    return pdfType.replace(/_/g, ' ')
  }

  return (
    <div>
      <Header title={t('import.title')} subtitle={t('import.subtitle')} />

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          filesInputRef.current?.click()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            filesInputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-[var(--radius-organic)] border-2 border-dashed p-6 sm:p-8 md:p-12 text-center transition-colors ${
          dragOver ? 'border-breath bg-breath/5' : 'border-vellum/15 hover:border-breath/40'
        }`}
      >
        <input
          ref={filesInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileList(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          // @ts-expect-error webkitdirectory non typé dans React
          webkitdirectory=""
          directory=""
          onChange={(e) => handleFileList(e.target.files)}
        />

        <div className="flex flex-col items-center gap-4">
          <Upload className="w-10 h-10 text-breath/70" />
          <div className="max-w-md">
            <p className="font-serif text-xl text-vellum">{t('import.dropzoneMulti')}</p>
            <p className="text-vellum/50 text-sm mt-3 leading-relaxed">
              {t('import.dropzoneMultiDesc')}{' '}
              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="action-link text-sm"
              >
                {t('import.selectFiles')}
              </button>
              {' '}{t('import.or')}{' '}
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="action-link text-sm"
              >
                {t('import.selectFolder')}
              </button>
              .
            </p>
            <p className="text-vellum/35 text-xs font-mono mt-3">{t('import.dropzoneHint')}</p>
          </div>
        </div>
      </div>

      <BulkUploadModal
        files={pendingFiles}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={handleBulkComplete}
      />

      <PdfParsingPanel jobs={allJobs} />

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-vellum">{t('import.recent')}</h2>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 text-xs font-mono text-vellum/50 hover:text-breath"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('common.retry')}
          </button>
        </div>

        {loading && <p className="text-vellum/40 font-mono text-sm">{t('common.loading')}</p>}
        {error && <ErrorMessage message={error} onRetry={retry} />}

        {!loading && !error && allJobs.length === 0 && (
          <p className="text-vellum/40 text-sm font-mono text-center py-12">{t('import.empty')}</p>
        )}

        <ul className="space-y-3">
          {allJobs.map((job) => {
            const pdfTypeLabel = resolvePdfTypeLabel(job.pdfType)
            const display = getPdfJobDisplay(job, pdfTypeLabel, t('import.untitledReport'), formatDate)
            return (
            <li
              key={job.id}
              className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-ink border border-vellum/8"
            >
              <FileUp className="w-4 h-4 text-vellum/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-vellum text-sm font-sans font-medium truncate">{display.title}</p>
                <p className="text-vellum/45 text-xs font-sans mt-0.5 flex flex-wrap items-center gap-x-1.5">
                  {display.meta && <span>{display.meta}</span>}
                  {display.meta && <span className="text-vellum/25">·</span>}
                  <PdfJobStatusBadge status={job.status} />
                  {job.error && <span className="text-pulse">— {job.error}</span>}
                </p>
                {isPdfProcessing(job.status) && (
                  <div className="mt-2 h-1 rounded-full bg-vellum/10 overflow-hidden max-w-xs">
                    <div className="h-full w-2/3 bg-breath/60 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              {statusIcon(job.status)}
              {job.examRef && (job.status === PDFStatus.DONE || job.status === 'done') && (
                <Link
                  to={`/exams/${job.examRef.type}/${job.examRef.id}`}
                  className="action-link"
                >
                  {t('import.viewExam')}
                </Link>
              )}
              {(job.status === PDFStatus.FAILED || job.status === 'failed') && (
                <button
                  type="button"
                  disabled={reparsing === job.id}
                  onClick={async () => {
                    setReparsing(job.id)
                    try {
                      await reparsePdf(job.id)
                      showToast(t('import.reparseStarted'))
                      retry()
                    } catch (err) {
                      showToast(apiErrorMessage(err), 'error')
                    } finally {
                      setReparsing(null)
                    }
                  }}
                  className="text-xs font-sans text-breath/70 hover:text-breath disabled:opacity-40"
                >
                  {t('import.reparse')}
                </button>
              )}
            </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

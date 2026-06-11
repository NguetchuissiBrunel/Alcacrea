import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, FileUp, Loader2, RefreshCw, Upload, XCircle } from 'lucide-react'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useToast } from '../components/ui/Toast'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  isPdfProcessing,
  listRecentPdfs,
  pollPdfStatus,
  uploadPdfFile,
} from '../services/backendExamApi'
import type { PdfUploadJob } from '../types/backendExam'
import { PDFStatus } from '../lib'

function statusIcon(status: string) {
  if (status === PDFStatus.DONE || status === 'done') return <CheckCircle2 className="w-4 h-4 text-breath" />
  if (status === PDFStatus.FAILED || status === 'failed') return <XCircle className="w-4 h-4 text-pulse" />
  return <Loader2 className="w-4 h-4 text-vellum/50 animate-spin" />
}

export function ImportPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeJobs, setActiveJobs] = useState<PdfUploadJob[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: recent, loading, error, retry } = useAsyncData(() => listRecentPdfs(15), [])

  const refreshJob = useCallback(async (job: PdfUploadJob) => {
    const updated = await pollPdfStatus(job.id)
    setActiveJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)))
    return updated
  }, [])

  useEffect(() => {
    const pending = activeJobs.filter((j) => isPdfProcessing(j.status))
    if (pending.length === 0) return

    const timer = setInterval(() => {
      pending.forEach((job) => {
        refreshJob(job).then((updated) => {
          if (updated.status === PDFStatus.DONE || updated.status === 'done') {
            showToast(t('import.parseDone'))
            retry()
          }
          if (updated.status === PDFStatus.FAILED || updated.status === 'failed') {
            showToast(t('import.parseFailed'))
          }
        })
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [activeJobs, refreshJob, retry, showToast, t])

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast(t('import.pdfOnly'))
      return
    }

    setUploading(true)
    try {
      const job = await uploadPdfFile(file)
      setActiveJobs((prev) => [job, ...prev])
      showToast(t('import.uploaded'))
      retry()
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const allJobs = [...activeJobs, ...(recent ?? [])].filter(
    (job, i, arr) => arr.findIndex((j) => j.id === job.id) === i,
  )

  return (
    <div>
      <h1 className="font-serif text-4xl text-vellum mb-2">{t('import.title')}</h1>
      <p className="text-vellum/50 text-sm mb-10 max-w-2xl">{t('import.subtitle')}</p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-[var(--radius-organic)] border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-breath bg-breath/5' : 'border-vellum/15 hover:border-breath/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-breath animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-breath/70" />
          )}
          <div>
            <p className="font-serif text-xl text-vellum">{t('import.dropzone')}</p>
            <p className="text-vellum/40 text-sm font-mono mt-2">{t('import.dropzoneHint')}</p>
          </div>
        </div>
      </div>

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
          {allJobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-ink border border-vellum/8"
            >
              <FileUp className="w-4 h-4 text-vellum/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-vellum text-sm font-mono truncate">{job.fileName || `#${job.id}`}</p>
                <p className="text-vellum/35 text-xs font-mono mt-0.5">
                  {job.pdfType && `${job.pdfType} · `}
                  {job.status}
                  {job.error && ` — ${job.error}`}
                </p>
              </div>
              {statusIcon(job.status)}
              {job.examRef && (job.status === PDFStatus.DONE || job.status === 'done') && (
                <Link
                  to={`/exams/${job.examRef.type}/${job.examRef.id}`}
                  className="text-xs font-mono text-breath hover:underline"
                >
                  {t('import.viewExam')}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

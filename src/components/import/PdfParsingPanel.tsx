import { Link } from 'react-router-dom'
import { CheckCircle2, FileSearch, Loader2, Sparkles, User } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import type { PdfUploadJob } from '../../types/backendExam'
import { PDFStatus } from '../../lib'
import { isPdfProcessing } from '../../services/backendExamApi'

interface PdfParsingPanelProps {
  jobs: PdfUploadJob[]
}

function stepIndex(status: string): number {
  if (status === PDFStatus.DONE || status === 'done') return 3
  if (status === PDFStatus.PROCESSING || status === 'processing') return 2
  if (status === PDFStatus.PENDING || status === 'pending') return 1
  return 0
}

export function PdfParsingPanel({ jobs }: PdfParsingPanelProps) {
  const { t } = useI18n()
  const active = jobs.filter((j) => isPdfProcessing(j.status))

  if (active.length === 0) return null

  return (
    <div className="mt-8 rounded-[var(--radius-organic)] surface-card p-6 border border-breath/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-breath/15 flex items-center justify-center">
          <FileSearch className="w-5 h-5 text-breath animate-pulse" />
        </div>
        <div>
          <h2 className="font-serif text-xl text-vellum">{t('import.parsing.title')}</h2>
          <p className="text-vellum/45 text-xs font-mono mt-0.5">{t('import.parsing.subtitle')}</p>
        </div>
      </div>

      <ul className="space-y-4">
        {active.map((job) => {
          const step = stepIndex(job.status)
          const patient = job.examRef?.patientNom
          return (
            <li key={job.id} className="p-4 rounded-xl bg-ink border border-vellum/8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <p className="text-vellum text-sm font-mono truncate">{job.fileName}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-breath">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {job.status}
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-vellum/10 overflow-hidden mb-4">
                <div
                  className="h-full bg-breath rounded-full transition-all duration-700 animate-pulse"
                  style={{ width: step === 1 ? '35%' : step === 2 ? '70%' : '100%' }}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-wider">
                <span className={step >= 1 ? 'text-breath' : 'text-vellum/30'}>
                  {t('import.parsing.stepUpload')}
                </span>
                <span className={step >= 2 ? 'text-breath' : 'text-vellum/30'}>
                  {t('import.parsing.stepParse')}
                </span>
                <span className={step >= 3 ? 'text-breath' : 'text-vellum/30'}>
                  {t('import.parsing.stepDone')}
                </span>
              </div>

              {patient && (
                <p className="mt-3 inline-flex items-center gap-2 text-xs text-vellum/60 font-mono">
                  <User className="w-3.5 h-3.5 text-breath/60" />
                  {patient}
                </p>
              )}

              {job.examRef && step >= 3 && (
                <Link
                  to={`/exams/${job.examRef.type}/${job.examRef.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono text-breath hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('import.viewExam')}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function PdfJobStatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  if (status === PDFStatus.DONE || status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-breath">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t('import.status.done')}
      </span>
    )
  }
  if (status === PDFStatus.FAILED || status === 'failed') {
    return <span className="text-xs font-mono text-pulse">{t('import.status.failed')}</span>
  }
  if (isPdfProcessing(status)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-breath">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {t('import.status.processing')}
      </span>
    )
  }
  return <span className="text-xs font-mono text-vellum/50">{status}</span>
}

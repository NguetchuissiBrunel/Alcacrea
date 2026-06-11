import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Loader2, X, XCircle, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { uploadPdfFile } from '../../services/backendExamApi'
import { apiErrorMessage } from '../../services/authApi'
import type { PdfUploadJob } from '../../types/backendExam'
import { formatFileSize } from '../../utils/collectPdfFiles'

type ItemStatus = 'queued' | 'uploading' | 'done' | 'failed' | 'cancelled'

interface UploadItem {
  id: string
  file: File
  status: ItemStatus
  progress: number
  error?: string
  job?: PdfUploadJob
}

interface BulkUploadModalProps {
  files: File[]
  open: boolean
  onClose: () => void
  onComplete: (jobs: PdfUploadJob[]) => void
}

function ringProgress(progress: number) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (progress / 100) * c
  return { r, c, offset }
}

export function BulkUploadModal({ files, open, onClose, onComplete }: BulkUploadModalProps) {
  const { t } = useI18n()
  const [items, setItems] = useState<UploadItem[]>([])
  const cancelledRef = useRef(false)
  const itemCancelledRef = useRef<Set<string>>(new Set())
  const startedRef = useRef(false)

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }, [])

  const runUploads = useCallback(
    async (queue: UploadItem[]) => {
      const completedJobs: PdfUploadJob[] = []

      for (const item of queue) {
        const { id, file } = item
        if (cancelledRef.current || itemCancelledRef.current.has(id)) {
          updateItem(id, { status: 'cancelled', progress: 0 })
          continue
        }

        updateItem(id, { status: 'uploading', progress: 10 })

        const tick = setInterval(() => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id && it.status === 'uploading' && it.progress < 90
                ? { ...it, progress: it.progress + 8 }
                : it,
            ),
          )
        }, 200)

        try {
          const job = await uploadPdfFile(file)
          clearInterval(tick)
          if (cancelledRef.current || itemCancelledRef.current.has(id)) {
            updateItem(id, { status: 'cancelled', progress: 0 })
            continue
          }
          updateItem(id, { status: 'done', progress: 100, job })
          completedJobs.push(job)
        } catch (err) {
          clearInterval(tick)
          updateItem(id, {
            status: 'failed',
            progress: 0,
            error: apiErrorMessage(err),
          })
        }
      }

      if (completedJobs.length > 0) onComplete(completedJobs)
    },
    [onComplete, updateItem],
  )

  useEffect(() => {
    if (!open) {
      startedRef.current = false
      return
    }
    if (files.length === 0 || startedRef.current) return

    startedRef.current = true
    cancelledRef.current = false
    itemCancelledRef.current = new Set()

    const initial: UploadItem[] = files.map((file, i) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${i}`,
      file,
      status: 'queued',
      progress: 0,
    }))
    setItems(initial)
    runUploads(initial)
  }, [open, files, runUploads])

  if (!open) return null

  const active = items.filter((it) => it.status !== 'cancelled')
  const doneCount = active.filter((it) => it.status === 'done').length
  const totalBytes = active.reduce((s, it) => s + it.file.size, 0)
  const uploadedBytes = active.reduce(
    (s, it) =>
      s +
      (it.status === 'done'
        ? it.file.size
        : it.status === 'uploading'
          ? it.file.size * (it.progress / 100)
          : 0),
    0,
  )
  const globalPercent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0
  const allFinished =
    active.length > 0 && active.every((it) => ['done', 'failed', 'cancelled'].includes(it.status))

  const handleCancelAll = () => {
    cancelledRef.current = true
    setItems((prev) =>
      prev.map((it) =>
        it.status === 'queued' || it.status === 'uploading'
          ? { ...it, status: 'cancelled' as const }
          : it,
      ),
    )
    onClose()
  }

  const cancelOne = (id: string) => {
    itemCancelledRef.current.add(id)
    updateItem(id, { status: 'cancelled', progress: 0 })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-upload-title"
        className="w-full max-w-2xl rounded-2xl bg-vellum text-ink shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <button
            type="button"
            onClick={handleCancelAll}
            className="text-sm text-ink/50 hover:text-ink transition-colors"
          >
            {t('import.bulk.cancel')}
          </button>
          <h2 id="bulk-upload-title" className="font-serif text-lg text-ink">
            {allFinished
              ? t('import.bulk.done', { count: doneCount, total: active.length })
              : t('import.bulk.uploading', { count: active.length })}
          </h2>
          <button
            type="button"
            onClick={allFinished ? onClose : handleCancelAll}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5"
            aria-label={t('import.bulk.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[360px] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => {
              const { r, c, offset } = ringProgress(item.progress)
              return (
                <div key={item.id} className="text-center">
                  <div className="relative mx-auto w-full aspect-[4/3] max-w-[140px] rounded-lg bg-ink/85 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-vellum/30" />
                    {(item.status === 'uploading' || item.status === 'queued') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                          <circle
                            cx="22"
                            cy="22"
                            r={r}
                            fill="none"
                            stroke="#5eb8c9"
                            strokeWidth="3"
                            strokeDasharray={c}
                            strokeDashoffset={item.status === 'queued' ? c : offset}
                            strokeLinecap="round"
                          />
                        </svg>
                        {item.status === 'uploading' && (
                          <Loader2 className="absolute w-4 h-4 text-breath animate-spin" />
                        )}
                      </div>
                    )}
                    {item.status === 'done' && (
                      <CheckCircle2 className="absolute w-6 h-6 text-breath" />
                    )}
                    {item.status === 'failed' && (
                      <XCircle className="absolute w-6 h-6 text-pulse" />
                    )}
                    {!allFinished && item.status !== 'done' && item.status !== 'failed' && (
                      <button
                        type="button"
                        onClick={() => cancelOne(item.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-vellum/90 text-ink/60 hover:text-ink flex items-center justify-center shadow"
                        aria-label={t('import.bulk.cancelFile')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-mono text-ink truncate px-1" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-[10px] font-mono text-ink/45">{formatFileSize(item.file.size)}</p>
                  {item.error && (
                    <p className="text-[10px] text-pulse mt-0.5 truncate" title={item.error}>
                      {item.error}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-ink/10 bg-ink/[0.03]">
          <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div
              className="h-full bg-breath transition-all duration-300 rounded-full"
              style={{ width: `${globalPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 gap-4">
            <p className="text-xs font-mono text-ink/55">
              {t('import.bulk.progress', {
                percent: globalPercent,
                done: doneCount,
                total: active.length,
                uploaded: formatFileSize(Math.round(uploadedBytes)),
                size: formatFileSize(totalBytes),
              })}
            </p>
            {!allFinished && (
              <button
                type="button"
                onClick={handleCancelAll}
                className="shrink-0 w-7 h-7 rounded-full border border-ink/15 flex items-center justify-center text-ink/40 hover:text-ink"
                aria-label={t('import.bulk.cancel')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end border-t border-ink/10">
          <button
            type="button"
            onClick={allFinished ? onClose : handleCancelAll}
            className="px-5 py-2 rounded-full border border-ink/20 text-sm font-mono text-ink hover:bg-ink/5 transition-colors"
          >
            {allFinished ? t('import.bulk.close') : t('import.bulk.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useId } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  variant?: 'danger' | 'default'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, loading, onCancel])

  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'bg-pulse/15 text-pulse border border-pulse/30 hover:bg-pulse/25'
      : undefined

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/70 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-vellum text-ink shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto safe-area-pb"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2 flex gap-4">
          {variant === 'danger' && (
            <div className="shrink-0 w-10 h-10 rounded-xl bg-pulse/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-pulse" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h2 id={titleId} className="font-serif text-xl text-ink">
              {title}
            </h2>
            <p id={descId} className="mt-2 text-sm text-ink/60 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" disabled={loading} onClick={onCancel}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={variant === 'danger' ? 'breath' : 'breath'}
            className={confirmClass}
            loading={loading}
            loadingText={t('common.loading')}
            onClick={onConfirm}
          >
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

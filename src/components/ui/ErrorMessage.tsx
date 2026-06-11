import { AlertCircle, RefreshCw } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useI18n()

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-[var(--radius-organic)] surface-card text-center">
      <AlertCircle className="w-8 h-8 text-pulse" aria-hidden="true" />
      <p className="font-serif text-xl text-vellum">{t('common.errorLoad')}</p>
      <p className="text-vellum/45 text-sm max-w-md">{message}</p>
      {onRetry && (
        <Button variant="ghost" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}

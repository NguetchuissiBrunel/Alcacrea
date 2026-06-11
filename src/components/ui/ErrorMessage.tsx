import { Link } from 'react-router-dom'
import { AlertCircle, LogIn, RefreshCw } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useI18n()
  const sessionExpired =
    message.includes('Session expirée') || message.toLowerCase().includes('reconnectez-vous')

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-[var(--radius-organic)] surface-card text-center">
      <AlertCircle className="w-8 h-8 text-pulse" aria-hidden="true" />
      <p className="font-serif text-xl text-vellum">{t('common.errorLoad')}</p>
      <p className="text-vellum/45 text-sm max-w-md">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {sessionExpired && (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-breath/15 text-breath text-sm font-mono hover:bg-breath/25 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t('auth.loginBtn')}
          </Link>
        )}
        {onRetry && !sessionExpired && (
          <Button variant="ghost" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  )
}

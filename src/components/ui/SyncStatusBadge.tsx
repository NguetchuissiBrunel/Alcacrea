import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import type { SyncStatus } from '../../types/analytics'

interface SyncStatusBadgeProps {
  status: SyncStatus
  dataFreshness?: 'ok' | 'stale' | 'error'
}

export function SyncStatusBadge({ status, dataFreshness }: SyncStatusBadgeProps) {
  const { t } = useI18n()
  const freshness = dataFreshness ?? (status.status === 'error' ? 'error' : 'ok')

  const config = {
    ok: { icon: CheckCircle2, className: 'text-breath border-breath/25 bg-breath/10' },
    stale: { icon: RefreshCw, className: 'text-gold border-gold/25 bg-gold/10' },
    error: { icon: AlertCircle, className: 'text-pulse border-pulse/25 bg-pulse/10' },
  }[freshness]

  const Icon = config.icon
  const syncDate = status.lastSyncAt
    ? new Date(status.lastSyncAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : '—'

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono ${config.className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{t(`sync.freshness.${freshness}`)}</span>
      <span className="text-vellum/30">·</span>
      <span className="text-vellum/50">{t('sync.lastSync', { date: syncDate })}</span>
      {status.lastSync && (
        <>
          <span className="text-vellum/30 hidden sm:inline">·</span>
          <span className="text-vellum/50 hidden sm:inline">
            {t('sync.parsed', { count: status.lastSync.filesParsed })}
          </span>
        </>
      )}
    </div>
  )
}

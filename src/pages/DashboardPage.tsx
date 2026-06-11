import { useCallback, useEffect } from 'react'
import { AlertTriangle, Moon, RefreshCw, Stethoscope, Users } from 'lucide-react'
import { MonthlyChart } from '../components/charts/MonthlyChart'
import { SeverityChart } from '../components/charts/SeverityChart'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { SyncStatusBadge } from '../components/ui/SyncStatusBadge'
import { useBackendLabels } from '../contexts/FilterMetadataContext'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { ExamType } from '../types/patient'

export function DashboardPage() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const { examTypeLabels } = useBackendLabels()
  const { data: stats, loading, error, retry } = useAsyncData(
    () => (user ? api.getDashboardStats(locale, true) : Promise.resolve(null)),
    [locale, user],
  )
  const { data: syncStatus, retry: retrySync } = useAsyncData(
    () => api.getSyncStatus(true),
    [],
  )

  const refreshAll = useCallback(() => {
    api.invalidateCache()
    retry()
    retrySync()
  }, [retry, retrySync])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshAll()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshAll])

  return (
    <>
      <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {syncStatus && stats && (
          <SyncStatusBadge status={syncStatus} dataFreshness={stats.dataFreshness} />
        )}
        <button
          type="button"
          onClick={refreshAll}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs font-mono text-vellum/50 hover:text-breath disabled:opacity-40 ml-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t('common.retry')}
        </button>
      </div>

      {loading && !stats && <DashboardSkeleton />}

      {error && <ErrorMessage message={error} onRetry={refreshAll} />}

      {stats && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label={t('dashboard.patients')} value={stats.totalPatients} accent="breath" icon={<Users className="w-5 h-5 text-breath/50" />} />
            <StatCard label={t('dashboard.exams')} value={stats.totalExams} accent="dream" icon={<Stethoscope className="w-5 h-5 text-dream/50" />} />
            <StatCard label={t('dashboard.avgIah')} value={stats.avgIah.toFixed(1)} unit={t('dashboard.perHour')} accent="gold" icon={<Moon className="w-5 h-5 text-gold/50" />} />
            <StatCard label={t('dashboard.severeCases')} value={stats.severeCases} accent="pulse" icon={<AlertTriangle className="w-5 h-5 text-pulse/50" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="rounded-[var(--radius-organic)] surface-card p-6">
              <h3 className="font-display font-semibold text-xl text-vellum mb-1">{t('dashboard.monthly')}</h3>
              <p className="text-clinical-muted text-sm font-medium mb-4">{t('dashboard.monthlyDesc')}</p>
              <MonthlyChart data={stats.monthlyExams} />
            </div>
            <div className="rounded-[var(--radius-organic)] surface-card p-6">
              <h3 className="font-display font-semibold text-xl text-vellum mb-1">{t('dashboard.severity')}</h3>
              <p className="text-clinical-muted text-sm font-medium mb-4">{t('dashboard.severityDesc')}</p>
              <SeverityChart data={stats.severityDistribution} />
            </div>
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-display font-semibold text-xl text-vellum mb-4">{t('dashboard.byType')}</h3>
            <div className="flex flex-wrap gap-6">
              {Object.entries(stats.examsByType).map(([type, count]) => (
                <div key={type} className="flex items-baseline gap-3">
                  <span className="field-value-lg">{count}</span>
                  <span className="text-clinical-muted text-sm font-semibold">
                    {examTypeLabels[type as ExamType]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

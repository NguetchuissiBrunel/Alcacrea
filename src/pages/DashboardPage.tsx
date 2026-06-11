import { AlertTriangle, Moon, Stethoscope, Users } from 'lucide-react'
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
import { api } from '../services/api'
import type { ExamType } from '../types/patient'

export function DashboardPage() {
  const { t, locale } = useI18n()
  const { examTypeLabels } = useBackendLabels()
  const { data: stats, loading, error, retry } = useAsyncData(
    () => api.getDashboardStats(locale),
    [locale],
  )
  const { data: syncStatus } = useAsyncData(() => api.getSyncStatus(), [])

  return (
    <>
      <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      {syncStatus && stats && (
        <div className="mb-6">
          <SyncStatusBadge status={syncStatus} dataFreshness={stats.dataFreshness} />
        </div>
      )}

      {loading && <DashboardSkeleton />}

      {error && <ErrorMessage message={error} onRetry={retry} />}

      {stats && !loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label={t('dashboard.patients')} value={stats.totalPatients} accent="breath" icon={<Users className="w-5 h-5 text-breath/50" />} />
            <StatCard label={t('dashboard.exams')} value={stats.totalExams} accent="dream" icon={<Stethoscope className="w-5 h-5 text-dream/50" />} />
            <StatCard label={t('dashboard.avgIah')} value={stats.avgIah.toFixed(1)} unit={t('dashboard.perHour')} accent="gold" icon={<Moon className="w-5 h-5 text-gold/50" />} />
            <StatCard label={t('dashboard.severeCases')} value={stats.severeCases} accent="pulse" icon={<AlertTriangle className="w-5 h-5 text-pulse/50" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="rounded-[var(--radius-organic)] surface-card p-6">
              <h3 className="font-serif text-xl text-vellum mb-1">{t('dashboard.monthly')}</h3>
              <p className="text-vellum/40 text-xs font-mono mb-4">{t('dashboard.monthlyDesc')}</p>
              <MonthlyChart data={stats.monthlyExams} />
            </div>
            <div className="rounded-[var(--radius-organic)] surface-card p-6">
              <h3 className="font-serif text-xl text-vellum mb-1">{t('dashboard.severity')}</h3>
              <p className="text-vellum/40 text-xs font-mono mb-4">{t('dashboard.severityDesc')}</p>
              <SeverityChart data={stats.severityDistribution} />
            </div>
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('dashboard.byType')}</h3>
            <div className="flex flex-wrap gap-6">
              {Object.entries(stats.examsByType).map(([type, count]) => (
                <div key={type} className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl text-vellum">{count}</span>
                  <span className="text-vellum/40 text-sm font-mono">
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

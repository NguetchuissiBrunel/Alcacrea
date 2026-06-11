import { useState } from 'react'
import { IahScatterChart } from '../components/charts/IahScatterChart'
import { MonthlyChart } from '../components/charts/MonthlyChart'
import { SeverityBreakdownChart } from '../components/charts/SeverityBreakdownChart'
import { SeverityChart } from '../components/charts/SeverityChart'
import { TrendsChart } from '../components/charts/TrendsChart'
import { Header } from '../components/layout/Header'
import { FilterBar } from '../components/ui/FilterBar'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Select } from '../components/ui/Select'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import { defaultFilters } from '../constants/filters'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { PatientFilters } from '../types/patient'

type TrendMetric = 'iah' | 'ido' | 'satO2Min' | 'vems'

export function AnalysePage() {
  const { t, locale } = useI18n()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('iah')

  const { data: stats, loading: statsLoading, error: statsError, retry: retryStats } = useAsyncData(
    () => api.getAnalyticsStats(filters, locale),
    [filters, locale],
  )
  const { data: scatter, loading: scatterLoading } = useAsyncData(
    () => api.getAnalyticsScatter(filters),
    [filters],
  )
  const { data: trends, loading: trendsLoading } = useAsyncData(
    () => api.getAnalyticsTrends(filters, trendMetric),
    [filters, trendMetric],
  )
  const { data: breakdown, loading: breakdownLoading } = useAsyncData(
    () => api.getAnalyticsSeverityBreakdown(filters, locale),
    [filters, locale],
  )

  const loading = statsLoading || scatterLoading || trendsLoading || breakdownLoading
  const error = statsError

  return (
    <>
      <Header title={t('analysis.title')} subtitle={t('analysis.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />
      {loading && <div className="mt-8"><DashboardSkeleton /></div>}
      {error && <div className="mt-8"><ErrorMessage message={error} onRetry={retryStats} /></div>}
      {stats && scatter && trends && breakdown && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="lg:col-span-2 rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-1">{t('analysis.scatter')}</h3>
            <p className="text-vellum/40 text-xs font-mono mb-4">{t('analysis.scatterDesc')}</p>
            <IahScatterChart scatterPoints={scatter.points} />
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <h3 className="font-serif text-xl text-vellum">{t('analysis.trends')}</h3>
              <Select
                label={t('analysis.trendMetric')}
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value as TrendMetric)}
                className="w-40"
              >
                <option value="iah">{t('metrics.iah')}</option>
                <option value="ido">{t('metrics.ido')}</option>
                <option value="satO2Min">{t('metrics.satO2Min')}</option>
                <option value="vems">{t('metrics.vems')}</option>
              </Select>
            </div>
            <TrendsChart data={trends} showIahThresholds={trendMetric === 'iah'} />
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('analysis.monthly')}</h3>
            <MonthlyChart data={stats.monthlyExams} />
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-1">{t('analysis.breakdown')}</h3>
            <p className="text-vellum/40 text-xs font-mono mb-4">{t('analysis.breakdownDesc')}</p>
            <SeverityBreakdownChart data={breakdown.breakdown} />
          </div>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <h3 className="font-serif text-xl text-vellum mb-4">{t('analysis.severity')}</h3>
            <SeverityChart data={stats.severityDistribution} />
          </div>
        </div>
      )}
    </>
  )
}

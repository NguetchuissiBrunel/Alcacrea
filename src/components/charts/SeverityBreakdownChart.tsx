import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useBackendLabels } from '../../contexts/FilterMetadataContext'
import { useI18n } from '../../contexts/I18nContext'
import type { AnalyticsSeverityBreakdown } from '../../types/analytics'
import { severityColors } from '../../utils/format'
import { getChartTheme } from '../../utils/chartTheme'
import type { Severity } from '../../types/patient'

interface SeverityBreakdownChartProps {
  data: AnalyticsSeverityBreakdown['breakdown']
}

const severityKeys: Severity[] = ['normal', 'leger', 'modere', 'severe']

export function SeverityBreakdownChart({ data }: SeverityBreakdownChartProps) {
  const { t } = useI18n()
  const { severityLabels } = useBackendLabels()
  const chartTheme = getChartTheme()
  const formatted = data.map((d) => ({
    type: d.label,
    ...d.severities,
  }))

  if (formatted.length === 0) {
    return <p className="text-vellum/40 text-sm text-center py-12 font-mono">{t('analysis.noData')}</p>
  }

  return (
    <div className="h-[260px]" role="img" aria-label={t('analysis.breakdownAria')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis dataKey="type" tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          {severityKeys.map((key) => (
            <Bar key={key} dataKey={key} stackId="a" fill={severityColors[key]} name={severityLabels[key] ?? key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

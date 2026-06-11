import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { DashboardStats } from '../../types/patient'
import { severityColors } from '../../utils/format'
import { getChartTheme } from '../../utils/chartTheme'

interface SeverityChartProps {
  data: DashboardStats['severityDistribution']
}

export function SeverityChart({ data }: SeverityChartProps) {
  const { t } = useI18n()
  const chartTheme = getChartTheme()
  const filtered = data.filter((d) => d.count > 0)
  const total = filtered.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <div className="h-[220px]" role="img" aria-label={t('charts.severityAria')}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="none">
              {filtered.map((entry) => (
                <Cell key={entry.severity} fill={severityColors[entry.severity]} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTheme.tooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label={t('charts.severityLegend')}>
        {filtered.map((entry) => (
          <li key={entry.severity} className="flex items-center gap-2 text-xs font-mono text-vellum/60">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: severityColors[entry.severity] }} aria-hidden="true" />
            <span>{entry.label}</span>
            <span className="text-vellum/35">{entry.count} ({total > 0 ? Math.round((entry.count / total) * 100) : 0}%)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

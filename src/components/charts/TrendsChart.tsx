import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { AnalyticsTrends } from '../../types/analytics'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface TrendsChartProps {
  data: AnalyticsTrends
  showIahThresholds?: boolean
}

export function TrendsChart({ data, showIahThresholds }: TrendsChartProps) {
  const { t, formatMonth } = useI18n()
  const chartTheme = getChartTheme()
  const formatted = data.series.map((s) => ({
    ...s,
    label: data.groupBy === 'month' ? formatMonth(s.key) : s.key,
  }))

  if (formatted.length === 0) {
    return <p className="text-vellum/40 text-sm text-center py-12 font-mono">{t('analysis.noData')}</p>
  }

  return (
    <div className="h-[260px]" role="img" aria-label={t('analysis.trendsAria')}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid stroke={chartTheme.grid} />
          <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
          <YAxis unit={` ${data.unit}`} tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
          {showIahThresholds && (
            <>
              <ReferenceLine y={5} stroke={themeColors.breath} strokeDasharray="3 3" />
              <ReferenceLine y={15} stroke={themeColors.gold} strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke={themeColors.pulse} strokeDasharray="3 3" />
            </>
          )}
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Line type="monotone" dataKey="avg" name={t('analysis.trendAvg')} stroke={themeColors.breath} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

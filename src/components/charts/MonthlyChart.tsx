import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { DashboardStats } from '../../types/patient'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface MonthlyChartProps {
  data: DashboardStats['monthlyExams']
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { t, formatMonth } = useI18n()
  const chartTheme = getChartTheme()
  const breath = themeColors.breath
  const formatted = data.map((d) => ({ ...d, label: formatMonth(d.month) }))

  return (
    <div className="h-[260px]" role="img" aria-label={t('charts.monthlyAria')}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="breathGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={breath} stopOpacity={0.2} />
              <stop offset="100%" stopColor={breath} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 11, fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: chartTheme.tick, fontSize: 11, fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Area type="monotone" dataKey="count" name={t('charts.exams')} stroke={breath} strokeWidth={2} fill="url(#breathGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

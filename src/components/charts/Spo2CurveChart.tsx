import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { Spo2CurveData } from '../../types/curves'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface Spo2CurveChartProps {
  data: Spo2CurveData
}

export function Spo2CurveChart({ data }: Spo2CurveChartProps) {
  const { t } = useI18n()
  const chartTheme = getChartTheme()

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-[10px] font-mono text-vellum/50">
        <span>min {data.stats.min}%</span>
        <span>moy {data.stats.mean}%</span>
        <span>&lt;90% : {data.stats.timeBelow90Percent} min</span>
      </div>
      <div className="h-[220px]" role="img" aria-label={t('examCurves.spo2Aria')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.points}>
            <CartesianGrid stroke={chartTheme.grid} />
            <XAxis
              dataKey="t"
              unit=" min"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[75, 100]}
              unit="%"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={90} stroke={themeColors.pulse} strokeDasharray="4 4" label={{ value: '90%', fill: themeColors.pulse, fontSize: 10 }} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Area type="monotone" dataKey="value" name="SpO₂" stroke={themeColors.breath} fill={themeColors.breath} fillOpacity={0.15} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

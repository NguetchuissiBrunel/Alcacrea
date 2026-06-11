import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ExtractedLinePoint } from '../../types/backendExam'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface GenericLineChartProps {
  label: string
  points: ExtractedLinePoint[]
  unit?: string
}

export function GenericLineChart({ label, points, unit }: GenericLineChartProps) {
  const chartTheme = getChartTheme()
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-[10px] font-mono text-vellum/50">
        <span>min {min.toFixed(1)}{unit ? ` ${unit}` : ''}</span>
        <span>moy {mean.toFixed(1)}{unit ? ` ${unit}` : ''}</span>
        <span>max {max.toFixed(1)}{unit ? ` ${unit}` : ''}</span>
        <span>{points.length} points</span>
      </div>
      <div className="h-[220px]" role="img" aria-label={label}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <CartesianGrid stroke={chartTheme.grid} />
            <XAxis
              dataKey="t"
              unit=" min"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              unit={unit ? ` ${unit}` : undefined}
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Area
              type="monotone"
              dataKey="value"
              name={label}
              stroke={themeColors.breath}
              fill={themeColors.breath}
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

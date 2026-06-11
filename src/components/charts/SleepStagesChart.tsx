import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { SleepStagesData } from '../../types/curves'
import { getChartTheme } from '../../utils/chartTheme'

const stageColors: Record<string, string> = {
  wake: '#f0b429',
  n1: '#7eb8da',
  n2: '#4a9fd4',
  n3: '#2d6a9f',
  rem: '#9b7ed9',
}

interface SleepStagesChartProps {
  data: SleepStagesData
}

export function SleepStagesChart({ data }: SleepStagesChartProps) {
  const { t } = useI18n()
  const chartTheme = getChartTheme()
  const bars = data.stages.map((s) => ({
    label: `${s.stage} (${s.t}m)`,
    stage: s.stage,
    minutes: s.durationMinutes,
  }))

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(data.distribution).map(([stage, pct]) => (
          <span key={stage} className="text-[10px] font-mono text-vellum/50">
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: stageColors[stage] }} />
            {stage} {pct}%
          </span>
        ))}
      </div>
      <div className="h-[200px]" role="img" aria-label={t('examCurves.sleepAria')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} layout="vertical" margin={{ left: 4, right: 8 }}>
            <CartesianGrid stroke={chartTheme.grid} horizontal={false} />
            <XAxis type="number" unit=" min" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={72} tick={{ fill: chartTheme.tick, fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Bar dataKey="minutes" name={t('examCurves.duration')} radius={[0, 4, 4, 0]}>
              {bars.map((entry) => (
                <Cell key={entry.label} fill={stageColors[entry.stage]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

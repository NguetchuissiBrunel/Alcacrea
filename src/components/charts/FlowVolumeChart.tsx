import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { FlowVolumeData } from '../../types/curves'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface FlowVolumeChartProps {
  data: FlowVolumeData
}

export function FlowVolumeChart({ data }: FlowVolumeChartProps) {
  const { t } = useI18n()
  const chartTheme = getChartTheme()

  return (
    <div>
      <p className="text-[10px] font-mono text-vellum/50 mb-4">
        VEMS {data.reference.vems} L · CVF {data.reference.cvf} L · {data.reference.rapportVemsCvf}%
      </p>
      <div className="h-[240px]" role="img" aria-label={t('examCurves.flowAria')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.points}>
            <CartesianGrid stroke={chartTheme.grid} />
            <XAxis
              dataKey="volume"
              unit=" L"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'IBM Plex Sans' }}
              axisLine={false}
              tickLine={false}
              label={{ value: t('examCurves.volume'), position: 'bottom', fill: chartTheme.tick, fontSize: 10 }}
            />
            <YAxis
              dataKey="flow"
              unit=" L/s"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'IBM Plex Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Line type="monotone" dataKey="flow" stroke={themeColors.dream} strokeWidth={2} dot={{ r: 3 }} />
            <ReferenceDot x={data.reference.vems} y={data.points.find((p) => p.volume >= data.reference.vems)?.flow ?? 0} r={5} fill={themeColors.pulse} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

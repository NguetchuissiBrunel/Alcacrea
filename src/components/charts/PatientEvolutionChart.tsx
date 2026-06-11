import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useI18n } from '../../contexts/I18nContext'
import type { Patient } from '../../types/patient'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface PatientEvolutionChartProps {
  patient: Patient
}

export function PatientEvolutionChart({ patient }: PatientEvolutionChartProps) {
  const { t, formatDate } = useI18n()
  const chartTheme = getChartTheme()

  const data = [...patient.exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: formatDate(e.date),
      iah: e.metrics.iah ?? null,
      satO2: e.metrics.satO2Min ?? null,
      vems: e.metrics.vems ?? null,
    }))

  const hasIah = data.some((d) => d.iah != null)
  const hasVems = data.some((d) => d.vems != null)

  if (data.length < 2 || (!hasIah && !hasVems)) {
    return (
      <p className="text-vellum/40 text-sm text-center py-12 font-mono">
        {t('patientDetail.evolutionEmpty')}
      </p>
    )
  }

  return (
    <div className="h-[280px]" role="img" aria-label={t('patientDetail.evolutionAria')}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={chartTheme.grid} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          {hasIah && (
            <YAxis
              yAxisId="iah"
              orientation="left"
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              label={{ value: t('metrics.iah'), angle: -90, position: 'insideLeft', fill: chartTheme.tick, fontSize: 10 }}
            />
          )}
          {hasIah && (
            <YAxis
              yAxisId="satO2"
              orientation="right"
              domain={[75, 100]}
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
          )}
          {hasVems && !hasIah && (
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
          )}
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          {hasIah && (
            <>
              <Line
                yAxisId="iah"
                type="monotone"
                dataKey="iah"
                name={t('metrics.iah')}
                stroke={themeColors.breath}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                yAxisId="satO2"
                type="monotone"
                dataKey="satO2"
                name={t('metrics.satO2Min')}
                stroke={themeColors.pulse}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </>
          )}
          {hasVems && (
            <Line
              yAxisId={hasIah ? 'iah' : undefined}
              type="monotone"
              dataKey="vems"
              name={t('metrics.vems')}
              stroke={themeColors.dream}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

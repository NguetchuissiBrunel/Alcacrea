import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { useFilterMetadata, optionsToLabelMap } from '../../contexts/FilterMetadataContext'
import { useI18n } from '../../contexts/I18nContext'
import type { ScatterPoint } from '../../types/analytics'
import type { Patient, Severity } from '../../types/patient'
import { severityColors } from '../../utils/format'
import { getChartTheme } from '../../utils/chartTheme'
import { themeColors } from '../../utils/themeColors'

interface IahScatterChartProps {
  patients?: Patient[]
  scatterPoints?: ScatterPoint[]
}

export function IahScatterChart({ patients, scatterPoints }: IahScatterChartProps) {
  const { t } = useI18n()
  const { metadata } = useFilterMetadata()
  const severityLabels = metadata ? optionsToLabelMap(metadata.severities) : {}
  const chartTheme = getChartTheme()

  const points = scatterPoints
    ? scatterPoints.map((p) => ({
        name: p.name,
        iah: p.iah,
        satO2: p.satO2,
        severity: p.severity,
        fill: severityColors[p.severity],
      }))
    : (patients ?? []).flatMap((p) =>
        p.exams
          .filter((e) => e.metrics.iah != null)
          .map((e) => ({
            name: `${p.prenom} ${p.nom}`,
            iah: e.metrics.iah!,
            satO2: e.metrics.satO2Min ?? 95,
            severity: e.severity,
            fill: severityColors[e.severity],
          })),
      )

  if (points.length === 0) {
    return <p className="text-vellum/40 text-sm text-center py-16 font-mono">{t('analysis.noIah')}</p>
  }

  return (
    <div>
      <div className="h-[320px]" role="img" aria-label={t('analysis.scatterAria')}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={chartTheme.grid} />
            <ReferenceArea x1={0} x2={5} fill={themeColors.breath} fillOpacity={0.04} />
            <ReferenceArea x1={5} x2={15} fill={themeColors.gold} fillOpacity={0.04} />
            <ReferenceArea x1={15} x2={30} fill={themeColors.dream} fillOpacity={0.04} />
            <ReferenceArea x1={30} x2={60} fill={themeColors.pulse} fillOpacity={0.06} />
            <ReferenceLine x={5} stroke={themeColors.breath} strokeDasharray="3 3" />
            <ReferenceLine x={15} stroke={themeColors.gold} strokeDasharray="3 3" />
            <ReferenceLine x={30} stroke={themeColors.pulse} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="iah"
              name={t('analysis.iahAxis')}
              unit="/h"
              domain={[0, 55]}
              tick={{ fill: chartTheme.tick, fontSize: 11, fontFamily: 'IBM Plex Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="satO2"
              name={t('analysis.satO2Axis')}
              unit="%"
              domain={[75, 100]}
              tick={{ fill: chartTheme.tick, fontSize: 11, fontFamily: 'IBM Plex Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis range={[80, 200]} />
            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: chartTheme.cursor }} contentStyle={chartTheme.tooltip} />
            <Scatter data={points} fill={themeColors.breath} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[10px] font-mono text-vellum/35">{t('analysis.iahThresholds')}</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label={t('analysis.severityLegend')}>
        {(Object.keys(severityLabels) as Severity[]).map((key) => (
          <li key={key} className="flex items-center gap-1.5 text-[10px] font-mono text-vellum/50">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[key] }} aria-hidden="true" />
            {severityLabels[key]}
          </li>
        ))}
      </ul>
    </div>
  )
}

import { useI18n } from '../../contexts/I18nContext'
import type { RespiratoryEventsData } from '../../types/curves'

interface RespiratoryEventsListProps {
  data: RespiratoryEventsData
}

export function RespiratoryEventsList({ data }: RespiratoryEventsListProps) {
  const { t } = useI18n()

  return (
    <div>
      <div className="flex gap-6 mb-4 text-sm font-mono text-vellum/60">
        <span>{t('examCurves.apnea')}: {data.summary.apnea}</span>
        <span>{t('examCurves.hypopnea')}: {data.summary.hypopnea}</span>
        <span>{t('examCurves.total')}: {data.summary.total}</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto rounded-xl bg-ink border border-vellum/8">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-vellum/35 border-b border-vellum/8">
              <th className="py-2 px-3 text-left">{t('examCurves.time')}</th>
              <th className="py-2 px-3 text-left">{t('examCurves.eventType')}</th>
              <th className="py-2 px-3 text-right">{t('examCurves.duration')}</th>
              <th className="py-2 px-3 text-right">ΔSpO₂</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((ev, i) => (
              <tr key={i} className="border-b border-vellum/5 text-vellum/70">
                <td className="py-2 px-3">{ev.t} min</td>
                <td className="py-2 px-3 capitalize">{ev.type}</td>
                <td className="py-2 px-3 text-right">{ev.durationSeconds}s</td>
                <td className="py-2 px-3 text-right text-pulse">-{ev.satO2Drop}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

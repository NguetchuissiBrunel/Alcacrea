import { useI18n } from '../../contexts/I18nContext'
import type { Patient } from '../../types/patient'
import { ExamTypeBadge } from '../ui/ExamTypeBadge'
import { SeverityBadge } from '../ui/SeverityBadge'

interface ExportPreviewTableProps {
  patients: Patient[]
}

export function ExportPreviewTable({ patients }: ExportPreviewTableProps) {
  const { t, formatDate } = useI18n()

  const rows = patients.flatMap((p) =>
    p.exams.map((e) => ({
      id: e.id,
      nom: p.nom,
      prenom: p.prenom,
      type: e.type,
      date: e.date,
      severity: e.severity,
      iah: e.metrics.iah,
      satO2: e.metrics.satO2Min,
    })),
  )

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-lg text-vellum/40">{t('export.tableEmpty')}</p>
        <p className="mt-2 text-sm text-vellum/30">{t('export.tableEmptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-[26%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-vellum/10">
            <th className="py-3 px-2 sm:px-3 text-left text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colPatient')}</th>
            <th className="py-3 px-2 sm:px-3 text-left text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colExam')}</th>
            <th className="py-3 px-2 sm:px-3 text-left text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colDate')}</th>
            <th className="py-3 px-2 sm:px-3 text-left text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colSeverity')}</th>
            <th className="py-3 px-2 sm:px-3 text-right text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colIah')}</th>
            <th className="py-3 px-2 sm:px-3 text-right text-[10px] font-mono uppercase tracking-[0.14em] text-vellum/45 font-medium">{t('export.colSatO2')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={`border-b border-vellum/5 transition-colors hover:bg-breath/5 ${i % 2 === 0 ? 'bg-ink/40' : 'bg-transparent'}`}>
              <td className="py-3.5 px-2 sm:px-3 min-w-0">
                <p className="font-medium text-sm text-vellum leading-tight truncate"><span className="uppercase tracking-wide">{row.nom}</span></p>
                <p className="text-xs text-vellum/45 mt-0.5 truncate">{row.prenom}</p>
              </td>
              <td className="py-3.5 px-2 sm:px-3 min-w-0"><ExamTypeBadge type={row.type} /></td>
              <td className="py-3.5 px-2 sm:px-3 text-sm text-vellum/70 whitespace-nowrap">{formatDate(row.date)}</td>
              <td className="py-3.5 px-2 sm:px-3 min-w-0"><SeverityBadge severity={row.severity} /></td>
              <td className="py-3.5 px-2 sm:px-3 text-right font-mono text-sm text-vellum/80 tabular-nums whitespace-nowrap">{row.iah != null ? `${row.iah} /h` : '—'}</td>
              <td className="py-3.5 px-2 sm:px-3 text-right font-mono text-sm text-vellum/80 tabular-nums whitespace-nowrap">{row.satO2 != null ? `${row.satO2} %` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 px-2 sm:px-3 text-[10px] font-mono text-vellum/35">
        {t(rows.length > 1 ? 'export.tableFooter_other' : 'export.tableFooter_one', { count: rows.length })}
      </p>
    </div>
  )
}

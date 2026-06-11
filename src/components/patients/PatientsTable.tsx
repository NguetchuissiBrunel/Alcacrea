import { Link } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import type { Patient } from '../../types/patient'
import { ExamTypeBadge } from '../ui/ExamTypeBadge'
import { SeverityBadge } from '../ui/SeverityBadge'

export type PatientSortKey = 'name' | 'date' | 'iah' | 'severity'
export type SortDir = 'asc' | 'desc'

interface PatientsTableProps {
  patients: Patient[]
  sortKey: PatientSortKey
  sortDir: SortDir
  onSort: (key: PatientSortKey) => void
}

const severityOrder = { normal: 0, leger: 1, modere: 2, severe: 3 }

export function PatientsTable({ patients, sortKey, sortDir, onSort }: PatientsTableProps) {
  const { t, formatDate } = useI18n()

  const sorted = [...patients].sort((a, b) => {
    const latest = (p: Patient) =>
      [...p.exams].sort((x, y) => y.date.localeCompare(x.date))[0]
    const ea = latest(a)
    const eb = latest(b)
    let cmp = 0
    if (sortKey === 'name') {
      cmp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
    } else if (sortKey === 'date') {
      cmp = (ea?.date ?? '').localeCompare(eb?.date ?? '')
    } else if (sortKey === 'iah') {
      cmp = (ea?.metrics.iah ?? -1) - (eb?.metrics.iah ?? -1)
    } else if (sortKey === 'severity') {
      cmp =
        (ea ? severityOrder[ea.severity] : -1) - (eb ? severityOrder[eb.severity] : -1)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const th = (key: PatientSortKey, label: string) => (
    <th className="py-3 px-4 text-left">
      <button
        type="button"
        onClick={() => onSort(key)}
        className="text-[10px] font-mono uppercase tracking-wider text-vellum/40 hover:text-breath transition-colors"
      >
        {label}
        {sortKey === key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
      </button>
    </th>
  )

  return (
    <div className="rounded-[var(--radius-organic)] surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vellum/8 bg-ink-muted/30">
              {th('name', t('patients.colName'))}
              {th('date', t('patients.colDate'))}
              <th className="py-3 px-4 text-left text-[10px] font-mono uppercase tracking-wider text-vellum/40">
                {t('patients.colExam')}
              </th>
              {th('severity', t('patients.colSeverity'))}
              {th('iah', t('patients.colIah'))}
              <th className="py-3 px-4 text-right text-[10px] font-mono uppercase tracking-wider text-vellum/40">
                {t('patients.colExams')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const latest = [...p.exams].sort((a, b) => b.date.localeCompare(a.date))[0]
              return (
                <tr key={p.id} className="border-b border-vellum/5 hover:bg-ink-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/patients/${encodeURIComponent(p.id)}`}
                      state={{ patient: p }}
                      className="text-vellum hover:text-breath font-medium"
                    >
                      {p.prenom} {p.nom}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-vellum/50">
                    {latest ? formatDate(latest.date) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {latest && <ExamTypeBadge type={latest.type} />}
                  </td>
                  <td className="py-3 px-4">
                    {latest && <SeverityBadge severity={latest.severity} />}
                  </td>
                  <td className="py-3 px-4 font-mono text-vellum">
                    {latest?.metrics.iah ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-vellum/50">{p.exams.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

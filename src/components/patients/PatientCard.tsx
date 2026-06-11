import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import type { Patient } from '../../types/patient'
import { ExamTypeBadge } from '../ui/ExamTypeBadge'
import { SeverityBadge } from '../ui/SeverityBadge'

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  const { t, formatDate } = useI18n()
  const latestExam = [...patient.exams].sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <Link
      to={`/patients/${encodeURIComponent(patient.id)}`}
      className="group relative block overflow-hidden rounded-[var(--radius-organic)] dossier-surface p-6 pt-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="dossier-tab" aria-hidden="true" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-[1.65rem] text-vellum-ink leading-tight">
              <span className="font-sans font-light text-vellum-ink/70">{patient.prenom}</span>
              <br />
              <span className="uppercase tracking-[0.06em]">{patient.nom}</span>
            </p>
            <p className="mt-2 text-vellum-ink/45 text-[11px] font-mono tracking-wide">
              {patient.sexe === 'M' ? t('common.sexM') : t('common.sexF')} · {formatDate(patient.dateNaissance)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ArrowUpRight className="w-4 h-4 text-vellum-ink/20 group-hover:text-breath group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            <span className="font-mono text-[10px] text-vellum-ink/30">
              {patient.exams.length} {t('common.exams')}
            </span>
          </div>
        </div>

        {latestExam && (
          <div className="mt-6 pt-4 border-t border-vellum-ink/8 flex flex-wrap items-center gap-2">
            <ExamTypeBadge type={latestExam.type} />
            <SeverityBadge severity={latestExam.severity} />
            <span className="text-vellum-ink/35 text-[10px] font-mono ml-auto tracking-wider">
              {formatDate(latestExam.date)}
            </span>
          </div>
        )}

        {latestExam?.metrics.iah != null && (
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-serif text-2xl text-breath leading-none">{latestExam.metrics.iah}</span>
            <span className="font-mono text-[10px] text-vellum-ink/40 uppercase tracking-wider">{t('metrics.iahUnit')}</span>
            {latestExam.metrics.satO2Min != null && (
              <>
                <span className="text-vellum-ink/15">·</span>
                <span className="font-serif text-xl text-pulse leading-none">{latestExam.metrics.satO2Min}</span>
                <span className="font-mono text-[10px] text-vellum-ink/40 uppercase tracking-wider">{t('metrics.satO2Unit')}</span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

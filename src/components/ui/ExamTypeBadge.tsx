import { useBackendLabels } from '../../contexts/FilterMetadataContext'
import type { ExamType } from '../../types/patient'

const styles: Record<ExamType, string> = {
  polysomnographie: 'text-dream border-dream/18 bg-dream/10',
  polygraphie: 'text-breath border-breath/18 bg-breath/10',
  efr: 'text-gold border-gold/18 bg-gold/10',
}

export function ExamTypeBadge({ type }: { type: ExamType }) {
  const { examTypeLabels } = useBackendLabels()
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-mono border ${styles[type]}`}
    >
      {examTypeLabels[type]}
    </span>
  )
}

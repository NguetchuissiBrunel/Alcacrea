import { useBackendLabels } from '../../contexts/FilterMetadataContext'
import type { Severity } from '../../types/patient'

const styles: Record<Severity, string> = {
  normal: 'bg-breath/12 text-breath border-breath/15',
  leger: 'bg-gold/12 text-gold border-gold/15',
  modere: 'bg-pulse/12 text-pulse border-pulse/15',
  severe: 'bg-pulse/18 text-pulse border-pulse/20 font-medium',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { severityLabels } = useBackendLabels()
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold border ${styles[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  )
}

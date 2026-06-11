import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  accent?: 'breath' | 'pulse' | 'dream' | 'gold'
  icon?: ReactNode
}

const accentMap = {
  breath: 'text-breath border-breath/15 stat-glow-breath',
  pulse: 'text-pulse border-pulse/15 stat-glow-pulse',
  dream: 'text-dream border-dream/15 stat-glow-dream',
  gold: 'text-gold border-gold/15 stat-glow-gold',
}

export function StatCard({ label, value, unit, accent = 'breath', icon }: StatCardProps) {
  return (
    <div
      className={`stat-card-accent relative overflow-hidden rounded-[var(--radius-organic)] surface-card p-6 ${accentMap[accent]}`}
    >
      <div className="flex items-start justify-between">
        <p className="field-label">{label}</p>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <p className="mt-5 field-value-lg">
        {value}
        {unit && <span className="text-sm text-clinical-muted ml-1.5 font-sans font-semibold">{unit}</span>}
      </p>
    </div>
  )
}

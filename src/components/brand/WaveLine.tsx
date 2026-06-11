interface WaveLineProps {
  className?: string
  variant?: 'breath' | 'dream' | 'pulse'
}

const strokeMap = {
  breath: 'var(--color-breath)',
  dream: 'var(--color-dream)',
  pulse: 'var(--color-pulse)',
}

export function WaveLine({ className = '', variant = 'breath' }: WaveLineProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 6 C25 0, 35 12, 60 6 S95 0, 120 6 S155 12, 200 6"
        stroke={strokeMap[variant]}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M0 9 C30 4, 50 11, 80 7 S130 3, 200 8"
        stroke={strokeMap[variant]}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  )
}

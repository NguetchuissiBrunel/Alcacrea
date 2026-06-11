interface RegisterProgressProps {
  step: 1 | 2
  step1Label: string
  step2Label: string
  ariaLabel?: string
}

export function RegisterProgress({ step, step1Label, step2Label, ariaLabel }: RegisterProgressProps) {
  const progress = step === 1 ? 50 : 100

  return (
    <div className="mb-8" aria-label={ariaLabel ?? `Step ${step} of 2`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono transition-colors ${
              step >= 1 ? 'bg-breath/20 text-breath border border-breath/30' : 'bg-ink-muted text-vellum/30 border border-vellum/10'
            }`}
          >
            1
          </span>
          <span className={`text-xs font-mono ${step >= 1 ? 'text-vellum' : 'text-vellum/35'}`}>
            {step1Label}
          </span>
        </div>

        <div className="flex-1 mx-3 h-px bg-vellum/10 relative">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-breath/60 to-dream/60 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono transition-colors ${
              step >= 2 ? 'bg-breath/20 text-breath border border-breath/30' : 'bg-ink-muted text-vellum/30 border border-vellum/10'
            }`}
          >
            2
          </span>
          <span className={`text-xs font-mono ${step >= 2 ? 'text-vellum' : 'text-vellum/35'}`}>
            {step2Label}
          </span>
        </div>
      </div>

      <div className="h-1 rounded-full bg-ink-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-breath to-dream transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

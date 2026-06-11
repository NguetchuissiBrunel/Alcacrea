import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hideLabel?: boolean
}

const baseClass =
  'w-full px-4 py-2.5 rounded-xl bg-ink border border-clinical-border/50 text-clinical-value text-sm font-medium transition-colors placeholder:text-clinical-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 focus-visible:border-breath/60'

const labelClass = 'field-label'

export function Input({ label, hideLabel, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={label ? 'flex flex-col gap-1.5' : undefined}>
      {label && (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'sr-only' : labelClass}
        >
          {label}
        </label>
      )}
      <input id={inputId} className={`${baseClass} ${className}`} {...props} />
    </div>
  )
}

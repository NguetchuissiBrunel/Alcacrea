import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hideLabel?: boolean
}

const baseClass =
  'w-full sm:w-auto px-4 py-2.5 rounded-xl bg-ink border border-clinical-border/50 text-clinical-value text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/50 focus-visible:border-breath/60'

const labelClass = 'field-label'

export function Select({ label, hideLabel, id, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[9rem]">
      {label && (
        <label
          htmlFor={selectId}
          className={hideLabel ? 'sr-only' : labelClass}
        >
          {label}
        </label>
      )}
      <select id={selectId} className={`${baseClass} ${className}`} {...props}>
        {children}
      </select>
    </div>
  )
}

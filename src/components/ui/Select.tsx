import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hideLabel?: boolean
}

const baseClass =
  'px-4 py-2.5 rounded-xl bg-ink border border-vellum/10 text-vellum text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 focus-visible:border-breath/50'

export function Select({ label, hideLabel, id, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={label ? 'flex flex-col gap-1.5' : undefined}>
      {label && (
        <label
          htmlFor={selectId}
          className={hideLabel ? 'sr-only' : 'text-[10px] font-mono uppercase tracking-wider text-vellum/40'}
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

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'breath' | 'dream' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  breath:
    'bg-breath/20 text-breath border border-breath/30 hover:bg-breath/30',
  dream:
    'bg-dream/10 text-dream border border-dream/20 hover:bg-dream/15',
  ghost:
    'bg-transparent text-vellum/60 border border-vellum/10 hover:text-vellum hover:bg-ink-muted/60',
}

export function Button({
  variant = 'breath',
  loading = false,
  loadingText = 'Chargement…',
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium leading-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{loading ? loadingText : children}</span>
    </button>
  )
}

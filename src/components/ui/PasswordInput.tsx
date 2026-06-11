import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  hideLabel?: boolean
}

const inputClass =
  'w-full px-4 py-2.5 pr-11 rounded-xl bg-ink border border-vellum/10 text-vellum text-sm transition-colors placeholder:text-vellum/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 focus-visible:border-breath/50'

export function PasswordInput({ label, hideLabel, id, className = '', ...props }: PasswordInputProps) {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={label ? 'flex flex-col gap-1.5' : undefined}>
      {label && (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'sr-only' : 'text-[10px] font-mono uppercase tracking-wider text-vellum/40'}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`${inputClass} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-vellum/35 hover:text-vellum/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40"
          aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}

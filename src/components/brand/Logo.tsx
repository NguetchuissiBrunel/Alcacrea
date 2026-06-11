import { useI18n } from '../../contexts/I18nContext'

interface LogoProps {
  size?: number
  className?: string
  showWordmark?: boolean
}

export function Logo({ size = 40, className = '', showWordmark = false }: LogoProps) {
  const { t } = useI18n()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#6bbdb4" />
            <stop offset="100%" stopColor="#a396c4" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#logoGrad)" opacity="0.14" />
        <circle cx="30" cy="14" r="5" fill="#d4bc7a" opacity="0.6" />
        <path
          d="M10 26 C14 18, 18 34, 24 22 C30 10, 34 30, 38 24"
          stroke="url(#logoGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M10 32 C16 28, 22 36, 30 30 C34 27, 36 33, 38 31"
          stroke="#d4897c"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </svg>

      {showWordmark && (
        <div className="leading-none">
          <span className="font-sans font-semibold text-xl text-vellum tracking-tight">{t('brand.name')}</span>
          <span className="block text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-breath mt-0.5">
            {t('brand.tagline')}
          </span>
        </div>
      )}
    </div>
  )
}

import { Loader2 } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'

export function PageLoader() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-breath animate-spin" aria-hidden="true" />
      <p className="text-vellum/45 text-sm font-sans">{t('common.loading')}</p>
    </div>
  )
}

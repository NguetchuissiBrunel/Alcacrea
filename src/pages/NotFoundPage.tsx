import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { WaveLine } from '../components/brand/WaveLine'
import { Button } from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'

export function NotFoundPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-breath/60">{t('notFound.label')}</p>
      <h1 className="font-serif text-7xl md:text-8xl text-vellum mt-4 leading-none">404</h1>
      <WaveLine className="w-40 h-3 mt-6" variant="dream" />
      <p className="mt-6 font-serif text-2xl text-vellum">{t('notFound.title')}</p>
      <p className="mt-3 text-vellum/45 text-sm max-w-md font-light leading-relaxed">{t('notFound.desc')}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button icon={<Home className="w-4 h-4" />} onClick={() => navigate('/')}>{t('notFound.home')}</Button>
        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patients')}>{t('notFound.patients')}</Button>
      </div>
    </div>
  )
}

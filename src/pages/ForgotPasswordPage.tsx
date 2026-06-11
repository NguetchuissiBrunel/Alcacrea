import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { apiErrorMessage } from '../services/authApi'

export function ForgotPasswordPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
      showToast(t('auth.forgotSuccess'))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-breath/12 border border-breath/20 flex items-center justify-center mb-6">
          <Mail className="w-6 h-6 text-breath" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-3xl text-vellum">{t('auth.emailSent')}</h1>
        <p className="mt-3 text-vellum/45 text-sm font-light leading-relaxed">
          {t('auth.emailSentDesc', { email })}
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 mt-8 text-sm text-breath hover:text-breath/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded px-2 py-1">
          <ArrowLeft className="w-4 h-4" />
          {t('auth.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-vellum text-center">{t('auth.forgotTitle')}</h1>
      <p className="mt-2 text-vellum/45 text-sm text-center font-light">{t('auth.forgotSubtitle')}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input label={t('common.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('common.emailPlaceholder')} />
        {error && <p role="alert" className="text-pulse text-sm font-mono text-center">{error}</p>}
        <Button type="submit" className="w-full justify-center mt-2" loading={loading} loadingText={t('auth.sending')} icon={<Mail className="w-4 h-4" />}>
          {t('auth.sendLink')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-vellum/40">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-breath hover:text-breath/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}

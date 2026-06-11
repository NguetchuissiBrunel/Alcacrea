import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { apiErrorMessage } from '../services/authApi'

export function LoginPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      showToast(t('auth.loginSuccess'))
      navigate(from)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-vellum text-center">{t('auth.loginTitle')}</h1>
      <p className="mt-2 text-vellum/45 text-sm text-center font-light">{t('auth.loginSubtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input label={t('common.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('common.emailPlaceholder')} />
        <div>
          <PasswordInput label={t('common.password')} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('common.passwordPlaceholder')} />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-xs text-breath/70 hover:text-breath transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded">
              {t('auth.forgot')}
            </Link>
          </div>
        </div>
        {error && <p role="alert" className="text-pulse text-sm font-mono text-center">{error}</p>}
        <Button type="submit" className="w-full justify-center mt-2" loading={loading} loadingText={t('auth.loggingIn')} icon={<LogIn className="w-4 h-4" />}>
          {t('auth.loginBtn')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-vellum/40">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-breath hover:text-breath/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded">
          {t('auth.createAccount')}
        </Link>
      </p>
    </div>
  )
}

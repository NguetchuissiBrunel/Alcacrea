import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { apiErrorMessage } from '../services/authApi'

export function ResetPasswordPage() {
  const { t } = useI18n()
  const { resetPassword } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError(t('auth.resetInvalidToken'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.passwordMin'))
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      showToast(t('auth.resetSuccess'))
      navigate('/login')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-vellum text-center">{t('auth.resetTitle')}</h1>
      <p className="mt-2 text-vellum/45 text-sm text-center font-light">{t('auth.resetSubtitle')}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <PasswordInput
          label={t('auth.newPassword')}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <PasswordInput
          label={t('auth.confirmPassword')}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        {error && <p role="alert" className="text-pulse text-sm font-mono text-center">{error}</p>}
        <Button
          type="submit"
          className="w-full justify-center mt-2"
          loading={loading}
          loadingText={t('auth.resetting')}
          icon={<KeyRound className="w-4 h-4" />}
        >
          {t('auth.resetBtn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-vellum/40">
        <Link to="/login" className="text-breath hover:text-breath/80 transition-colors">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}

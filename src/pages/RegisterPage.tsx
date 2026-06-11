import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react'
import { RegisterProgress } from '../components/auth/RegisterProgress'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { apiErrorMessage } from '../services/authApi'

export function RegisterPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialite: '',
    etablissement: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleNext = () => {
    setError(null)
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim()) {
      setError(t('auth.step1Required'))
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setError(null)
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    if (form.password.length < 6) {
      setError(t('auth.passwordMin'))
      return
    }
    setLoading(true)
    try {
      await register(form.email, form.password, `${form.prenom} ${form.nom}`.trim())
      showToast(t('auth.registerSuccess'))
      navigate('/login')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-vellum text-center">{t('auth.registerTitle')}</h1>
      <p className="mt-2 text-vellum/45 text-sm text-center font-light">{t('auth.registerSubtitle')}</p>

      <RegisterProgress
        step={step}
        step1Label={t('auth.step1')}
        step2Label={t('auth.step2')}
        ariaLabel={t('auth.stepProgress', { step, total: 2 })}
      />

      {step === 1 ? (
        <div className="space-y-4 animate-fade-up">
          <p className="text-[10px] font-mono uppercase tracking-wider text-vellum/35 text-center mb-2">
            {t('auth.step1Desc')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('common.firstName')} required value={form.prenom} onChange={update('prenom')} autoComplete="given-name" />
            <Input label={t('common.lastName')} required value={form.nom} onChange={update('nom')} autoComplete="family-name" />
          </div>
          <Input label={t('common.email')} type="email" required value={form.email} onChange={update('email')} autoComplete="email" placeholder={t('common.emailPlaceholder')} />
          <Input label={t('common.specialty')} value={form.specialite} onChange={update('specialite')} placeholder={t('auth.specialtyPlaceholder')} />
          <Input label={t('common.establishment')} value={form.etablissement} onChange={update('etablissement')} placeholder={t('auth.establishmentPlaceholder')} />
          {error && <p role="alert" className="text-pulse text-sm font-mono text-center">{error}</p>}
          <Button type="button" className="w-full justify-center mt-2" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
            {t('auth.next')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
          <p className="text-[10px] font-mono uppercase tracking-wider text-vellum/35 text-center mb-2">
            {t('auth.step2Desc')}
          </p>
          <PasswordInput label={t('common.password')} required value={form.password} onChange={update('password')} autoComplete="new-password" placeholder={t('auth.passwordMinPlaceholder')} />
          <PasswordInput label={t('auth.confirmPassword')} required value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" />
          {error && <p role="alert" className="text-pulse text-sm font-mono text-center">{error}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              {t('auth.back')}
            </Button>
            <Button type="submit" className="flex-1 min-w-0" loading={loading} loadingText={t('auth.creating')} icon={<UserPlus className="w-4 h-4" />}>
              {t('auth.registerBtn')}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-vellum/40">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-breath hover:text-breath/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-breath/40 rounded">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  )
}

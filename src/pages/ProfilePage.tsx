import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, KeyRound, LogOut, Moon, Save, Shield, Sun, User } from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { ProfileSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { WaveLine } from '../components/brand/WaveLine'
import { apiErrorMessage } from '../services/authApi'

export function ProfilePage() {
  const { t, formatDate } = useI18n()
  const { showToast } = useToast()
  const { isDark } = useTheme()
  const { user, loading, refreshUser, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)

  const [form, setForm] = useState({ prenom: '', nom: '' })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ prenom: user.prenom, nom: user.nom })
    }
  }, [user])

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const updatePassword = (field: keyof typeof passwordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ fullName: `${form.prenom} ${form.nom}`.trim() })
      showToast(t('profile.updated'))
    } catch (err) {
      showToast(apiErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast(t('auth.passwordMismatch'), 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast(t('auth.passwordMin'), 'error')
      return
    }
    setSavingPassword(true)
    try {
      await updateProfile({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      showToast(t('profile.passwordUpdated'))
    } catch (err) {
      showToast(apiErrorMessage(err), 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    logout()
    setLoggingOut(false)
    showToast(t('profile.logoutSuccess'))
    navigate('/login')
  }

  const handleRetry = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
    } finally {
      setRefreshing(false)
    }
  }

  if (loading || refreshing) {
    return (
      <>
        <Header title={t('profile.title')} subtitle={t('profile.subtitle')} />
        <ProfileSkeleton />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header title={t('profile.title')} subtitle={t('profile.subtitle')} />
        <ErrorMessage message={t('profile.loadError')} onRetry={handleRetry} />
      </>
    )
  }

  const initials = `${form.prenom[0] ?? ''}${form.nom[0] ?? ''}`.toUpperCase() || 'U'
  const roleKey = user.role && ['praticien', 'admin'].includes(user.role) ? user.role : 'praticien'
  const createdAt = user.createdAt?.trim() || new Date().toISOString().slice(0, 10)

  return (
    <>
      <Header title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-[var(--radius-organic)] dossier-surface p-6 sm:p-8 text-center">
            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-breath/15 border border-breath/25 flex items-center justify-center">
                <span className="font-serif text-3xl text-breath">{initials}</span>
              </div>
              <h2 className="font-serif text-2xl text-vellum-ink mt-5">
                {form.prenom && (
                  <span className="font-sans font-light text-vellum-ink/75">{form.prenom}</span>
                )}
                {form.prenom && form.nom && <br />}
                {form.nom && <span className="uppercase tracking-wide">{form.nom}</span>}
                {!form.prenom && !form.nom && user.fullName && (
                  <span className="uppercase tracking-wide">{user.fullName}</span>
                )}
              </h2>
              <WaveLine className="w-24 h-2 mx-auto mt-4" variant="breath" />
              <p className="mt-4 text-vellum-ink/50 text-sm font-sans">{user.email}</p>
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dream/10 border border-dream/20">
                <Shield className="w-3.5 h-3.5 text-dream" aria-hidden="true" />
                <span className="text-[10px] font-sans uppercase tracking-wider text-dream">
                  {t(`role.${roleKey}`)}
                </span>
              </div>
              <p className="mt-6 text-[10px] font-sans text-vellum-ink/35 uppercase tracking-wider">
                {t('common.memberSince')} {formatDate(createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-center mt-4" onClick={handleLogout} loading={loggingOut} loadingText={t('common.loggingOut')} icon={<LogOut className="w-4 h-4" />}>
            {t('common.logout')}
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="rounded-[var(--radius-organic)] surface-card p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-breath/50" aria-hidden="true" />
              <h3 className="font-serif text-xl text-vellum">{t('profile.personalInfo')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('common.firstName')} required value={form.prenom} onChange={update('prenom')} autoComplete="given-name" />
              <Input label={t('common.lastName')} required value={form.nom} onChange={update('nom')} autoComplete="family-name" />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-ink border border-vellum/8">
              <p className="text-[10px] font-sans uppercase tracking-wider text-vellum/35 mb-1">{t('common.email')}</p>
              <p className="text-vellum text-sm font-sans">{user.email}</p>
              <p className="mt-1 text-[10px] text-vellum/30">{t('common.emailLocked')}</p>
            </div>
            <Button type="submit" className="mt-6" loading={saving} loadingText={t('common.saving')} icon={<Save className="w-4 h-4" />}>
              {t('common.save')}
            </Button>
          </form>

          <form onSubmit={handlePasswordSave} className="rounded-[var(--radius-organic)] surface-card p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="w-5 h-5 text-breath/50" aria-hidden="true" />
              <h3 className="font-serif text-xl text-vellum">{t('profile.security')}</h3>
            </div>
            <p className="text-vellum/45 text-sm mb-4">{t('profile.passwordHint')}</p>
            <div className="space-y-4">
              <PasswordInput
                label={t('profile.currentPassword')}
                required
                value={passwordForm.oldPassword}
                onChange={updatePassword('oldPassword')}
                autoComplete="current-password"
              />
              <PasswordInput
                label={t('auth.newPassword')}
                required
                value={passwordForm.newPassword}
                onChange={updatePassword('newPassword')}
                autoComplete="new-password"
                placeholder={t('auth.passwordMinPlaceholder')}
              />
              <PasswordInput
                label={t('auth.confirmPassword')}
                required
                value={passwordForm.confirmPassword}
                onChange={updatePassword('confirmPassword')}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="mt-6" loading={savingPassword} loadingText={t('common.saving')} icon={<Save className="w-4 h-4" />}>
              {t('profile.updatePassword')}
            </Button>
          </form>

          <div className="rounded-[var(--radius-organic)] surface-card p-6">
            <div className="flex items-center gap-3 mb-4">
              {isDark ? <Moon className="w-5 h-5 text-dream/60" aria-hidden="true" /> : <Sun className="w-5 h-5 text-gold/60" aria-hidden="true" />}
              <h3 className="font-serif text-xl text-vellum">{t('theme.appearance')}</h3>
            </div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-vellum text-sm">{t('theme.darkMode')}</p>
                <p className="text-vellum/40 text-xs mt-0.5">{isDark ? t('theme.darkOn') : t('theme.darkOff')}</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-vellum/8">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-breath/50" aria-hidden="true" />
                <p className="text-vellum text-sm">{t('lang.label')}</p>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

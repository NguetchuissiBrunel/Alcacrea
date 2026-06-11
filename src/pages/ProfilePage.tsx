import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, LogOut, Moon, Save, Shield, Sun, User } from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { WaveLine } from '../components/brand/WaveLine'

const demoUser = {
  email: 'dr.martin@alcacrea.fr',
  prenom: 'Sophie',
  nom: 'Martin',
  role: 'praticien' as const,
  specialite: 'Pneumologie',
  etablissement: 'Clinique du Sommeil',
  createdAt: '2024-01-15',
}

export function ProfilePage() {
  const { t, formatDate } = useI18n()
  const { showToast } = useToast()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    prenom: demoUser.prenom,
    nom: demoUser.nom,
    specialite: demoUser.specialite,
    etablissement: demoUser.etablissement,
  })
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
    showToast(t('profile.updated'))
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await new Promise((r) => setTimeout(r, 300))
    setLoggingOut(false)
    showToast(t('profile.logoutSuccess'))
    navigate('/login')
  }

  const initials = `${form.prenom[0]}${form.nom[0]}`.toUpperCase()

  return (
    <>
      <Header title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-[var(--radius-organic)] dossier-surface p-8 text-center">
            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-breath/15 border border-breath/25 flex items-center justify-center">
                <span className="font-serif text-3xl text-breath">{initials}</span>
              </div>
              <h2 className="font-serif text-2xl text-vellum-ink mt-5">
                <span className="font-sans font-light text-vellum-ink/75">{form.prenom}</span>
                <br />
                <span className="uppercase tracking-wide">{form.nom}</span>
              </h2>
              <WaveLine className="w-24 h-2 mx-auto mt-4" variant="breath" />
              <p className="mt-4 text-vellum-ink/50 text-sm font-mono">{demoUser.email}</p>
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dream/10 border border-dream/20">
                <Shield className="w-3.5 h-3.5 text-dream" aria-hidden="true" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-dream">
                  {t(`role.${demoUser.role}`)}
                </span>
              </div>
              <p className="mt-6 text-[10px] font-mono text-vellum-ink/35 uppercase tracking-wider">
                {t('common.memberSince')} {formatDate(demoUser.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-center mt-4" onClick={handleLogout} loading={loggingOut} loadingText={t('common.loggingOut')} icon={<LogOut className="w-4 h-4" />}>
            {t('common.logout')}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="rounded-[var(--radius-organic)] surface-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-breath/50" aria-hidden="true" />
              <h3 className="font-serif text-xl text-vellum">{t('profile.personalInfo')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('common.firstName')} required value={form.prenom} onChange={update('prenom')} autoComplete="given-name" />
              <Input label={t('common.lastName')} required value={form.nom} onChange={update('nom')} autoComplete="family-name" />
              <Input label={t('common.specialty')} value={form.specialite} onChange={update('specialite')} className="sm:col-span-2" />
              <Input label={t('common.establishment')} value={form.etablissement} onChange={update('etablissement')} className="sm:col-span-2" />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-ink border border-vellum/8">
              <p className="text-[10px] font-mono uppercase tracking-wider text-vellum/35 mb-1">{t('common.email')}</p>
              <p className="text-vellum text-sm font-mono">{demoUser.email}</p>
              <p className="mt-1 text-[10px] text-vellum/30">{t('common.emailLocked')}</p>
            </div>
            <Button type="submit" className="mt-6" loading={saving} loadingText={t('common.saving')} icon={<Save className="w-4 h-4" />}>
              {t('common.save')}
            </Button>
          </form>

          <div className="mt-6 rounded-[var(--radius-organic)] surface-card p-6">
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

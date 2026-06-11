import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { enUS, fr, type Locale as DateFnsLocale } from 'date-fns/locale'
import { format, isValid, parseISO } from 'date-fns'
import { translations, type Locale } from '../i18n/translations'

const STORAGE_KEY = 'alcacrea-locale'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dateLocale: DateFnsLocale
  formatDate: (date: string) => string
  formatMonth: (ym: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored === 'fr' || stored === 'en') return stored
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

function resolve(obj: Record<string, unknown>, path: string): string | undefined {
  const val = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
  return typeof val === 'string' ? val : undefined
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = translations[locale] as Record<string, unknown>
      const value = resolve(dict, key) ?? resolve(translations.fr as Record<string, unknown>, key) ?? key
      return interpolate(value, params)
    },
    [locale],
  )

  const dateLocale = locale === 'fr' ? fr : enUS

  const formatDate = useCallback(
    (date: string) => {
      if (!date?.trim()) return '—'
      const parsed = parseISO(date)
      if (!isValid(parsed)) return '—'
      return format(parsed, 'd MMM yyyy', { locale: dateLocale })
    },
    [dateLocale],
  )

  const formatMonth = useCallback(
    (ym: string) => {
      if (!ym?.trim() || !ym.includes('-')) return '—'
      const [year, month] = ym.split('-')
      const parsed = new Date(Number(year), Number(month) - 1)
      if (!isValid(parsed)) return '—'
      return format(parsed, 'MMM yy', { locale: dateLocale })
    },
    [dateLocale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, dateLocale, formatDate, formatMonth }),
    [locale, setLocale, t, dateLocale, formatDate, formatMonth],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}


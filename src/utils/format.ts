import { format, parseISO } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import type { ExamMetrics, Severity } from '../types/patient'
import { getThemeColor } from './themeColors'

const dateLocales = { fr, en: enUS }

export function formatDate(date: string, locale: 'fr' | 'en' = 'fr'): string {
  return format(parseISO(date), 'd MMM yyyy', { locale: dateLocales[locale] })
}

export function formatMonth(ym: string, locale: 'fr' | 'en' = 'fr'): string {
  const [year, month] = ym.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return format(date, 'MMM yy', { locale: dateLocales[locale] })
}

export const severityColors: Record<Severity, string> = {
  normal: getThemeColor('breath'),
  leger: getThemeColor('gold'),
  modere: getThemeColor('pulse'),
  severe: getThemeColor('pulseDeep'),
}

export type MetricKey = keyof ExamMetrics

export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

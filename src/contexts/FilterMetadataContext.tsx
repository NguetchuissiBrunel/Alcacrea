import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api'
import type { FilterMetadata } from '../types/metadata'
import { FALLBACK_FILTER_DEFAULTS } from '../types/metadata'
import { useI18n } from './I18nContext'

interface FilterMetadataContextValue {
  metadata: FilterMetadata | null
  loading: boolean
  error: string | null
  retry: () => void
}

const FilterMetadataContext = createContext<FilterMetadataContextValue | null>(null)

export function FilterMetadataProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n()
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const retry = () => setTick((n) => n + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .getFilterMetadata(locale)
      .then((result) => {
        if (!cancelled) setMetadata(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur métadonnées filtres')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [locale, tick])

  const value = useMemo(
    () => ({ metadata, loading, error, retry }),
    [metadata, loading, error],
  )

  return (
    <FilterMetadataContext.Provider value={value}>{children}</FilterMetadataContext.Provider>
  )
}

export function useFilterMetadata() {
  const ctx = useContext(FilterMetadataContext)
  if (!ctx) throw new Error('useFilterMetadata must be used within FilterMetadataProvider')
  return ctx
}

export function optionsToLabelMap(
  options: { value: string; label: string }[],
  excludeAll = true,
): Record<string, string> {
  return Object.fromEntries(
    options.filter((o) => !excludeAll || o.value !== 'all').map((o) => [o.value, o.label]),
  )
}

/** Libellés issus du backend ; map vide tant que les métadonnées ne sont pas chargées. */
export function useBackendLabels() {
  const { metadata } = useFilterMetadata()

  return useMemo(() => {
    if (!metadata) {
      return {
        examTypeLabels: {} as Record<string, string>,
        severityLabels: {} as Record<string, string>,
        metricLabels: {} as Record<string, string>,
      }
    }
    return {
      examTypeLabels: optionsToLabelMap(metadata.examTypes),
      severityLabels: optionsToLabelMap(metadata.severities),
      metricLabels: Object.fromEntries(metadata.metrics.map((m) => [m.key, m.label])),
    }
  }, [metadata])
}

export { FALLBACK_FILTER_DEFAULTS }

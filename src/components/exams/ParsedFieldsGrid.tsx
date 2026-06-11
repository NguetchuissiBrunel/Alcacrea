import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'
import type { ParsedField } from '../../types/backendExam'

interface ParsedFieldsGridProps {
  fields: ParsedField[]
}

export function ParsedFieldsGrid({ fields }: ParsedFieldsGridProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fields
    return fields.filter(
      (f) => f.label.toLowerCase().includes(q) || f.path.toLowerCase().includes(q) || String(f.value).toLowerCase().includes(q),
    )
  }, [fields, query])

  if (fields.length === 0) return null

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-vellum">{t('backendExam.allMetrics')}</h2>
          <p className="text-vellum/40 text-sm mt-1">{t('backendExam.allMetricsDesc', { count: fields.length })}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vellum/30" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('backendExam.searchField')}
            className="pl-9 pr-4 py-2 rounded-xl bg-ink border border-vellum/10 text-vellum text-sm font-mono w-56 focus:outline-none focus:ring-2 focus:ring-breath/40"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((field) => (
          <div key={field.path} className="p-3 rounded-xl bg-ink border border-vellum/8" title={field.path}>
            <p className="text-vellum/30 text-[10px] font-mono uppercase truncate">{field.label}</p>
            <p className="text-vellum font-mono text-sm mt-1 break-words">{String(field.value)}</p>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-vellum/40 text-sm font-mono text-center py-8">{t('backendExam.noFieldMatch')}</p>
      )}
    </section>
  )
}

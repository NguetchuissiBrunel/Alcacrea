import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useFilterMetadata } from '../../contexts/FilterMetadataContext'
import { useI18n } from '../../contexts/I18nContext'
import type { PatientFilters } from '../../types/patient'
import { useDebounce } from '../../hooks/useDebounce'
import { Input } from './Input'
import { Select } from './Select'

interface FilterBarProps {
  filters: PatientFilters
  onChange: (filters: PatientFilters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { t } = useI18n()
  const { metadata, loading } = useFilterMetadata()
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch })
    }
  }, [debouncedSearch, filters, onChange])

  const update = (patch: Partial<PatientFilters>) => onChange({ ...filters, ...patch })

  if (loading || !metadata) {
    return (
      <div
        className="flex flex-wrap items-end gap-3 p-4 rounded-2xl surface-card animate-pulse"
        role="search"
        aria-label={t('filters.aria')}
        aria-busy="true"
      >
        <div className="h-10 flex-1 min-w-[200px] rounded-xl bg-vellum/5" />
        <div className="h-10 w-36 rounded-xl bg-vellum/5" />
        <div className="h-10 w-36 rounded-xl bg-vellum/5" />
        <div className="h-10 w-32 rounded-xl bg-vellum/5" />
        <div className="h-10 w-32 rounded-xl bg-vellum/5" />
      </div>
    )
  }

  const selectOptions: Record<string, { value: string; label: string }[]> = {
    examType: metadata.examTypes,
    severity: metadata.severities,
  }

  return (
    <div
      className="flex flex-wrap items-end gap-3 p-4 rounded-2xl surface-card"
      role="search"
      aria-label={t('filters.aria')}
    >
      <SlidersHorizontal className="w-4 h-4 text-vellum/30 shrink-0 mb-2.5" aria-hidden="true" />

      {metadata.fields.map((field) => {
        if (field.type === 'search') {
          return (
            <div key={field.key} className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vellum/30 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                label={field.label}
                hideLabel
                type="search"
                placeholder={field.placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                aria-label={field.label}
              />
            </div>
          )
        }

        if (field.type === 'select') {
          const options = selectOptions[field.key] ?? []
          return (
            <Select
              key={field.key}
              label={field.label}
              value={filters[field.key]}
              onChange={(e) =>
                update({ [field.key]: e.target.value } as Partial<PatientFilters>)
              }
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          )
        }

        if (field.type === 'date') {
          return (
            <Input
              key={field.key}
              label={field.label}
              type="date"
              value={filters[field.key]}
              onChange={(e) =>
                update({ [field.key]: e.target.value } as Partial<PatientFilters>)
              }
            />
          )
        }

        return null
      })}
    </div>
  )
}

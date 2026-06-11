import { useState } from 'react'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { PatientCard } from '../components/patients/PatientCard'
import { PatientsTable, type PatientSortKey, type SortDir } from '../components/patients/PatientsTable'
import { FilterBar } from '../components/ui/FilterBar'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PatientsGridSkeleton } from '../components/ui/Skeleton'
import { defaultFilters } from '../constants/filters'
import { useI18n } from '../contexts/I18nContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import type { PatientFilters } from '../types/patient'

type ViewMode = 'cards' | 'table'

export function PatientsPage() {
  const { t } = useI18n()
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [sortKey, setSortKey] = useState<PatientSortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const { data: patients, loading, error, retry } = useAsyncData(() => api.getPatients(filters), [filters])

  const countLabel = patients
    ? t(patients.length > 1 ? 'patients.found_other' : 'patients.found_one', { count: patients.length })
    : ''

  const handleSort = (key: PatientSortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <>
      <Header title={t('patients.title')} subtitle={t('patients.subtitle')} />
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        {!loading && !error && patients && (
          <p className="text-vellum/30 text-xs font-mono">{countLabel}</p>
        )}
        <div className="flex rounded-xl border border-vellum/10 overflow-hidden ml-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors ${
              viewMode === 'cards' ? 'bg-breath/15 text-breath' : 'text-vellum/40 hover:text-vellum'
            }`}
            aria-pressed={viewMode === 'cards'}
          >
            <LayoutGrid className="w-4 h-4" />
            {t('patients.viewCards')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors ${
              viewMode === 'table' ? 'bg-breath/15 text-breath' : 'text-vellum/40 hover:text-vellum'
            }`}
            aria-pressed={viewMode === 'table'}
          >
            <Table2 className="w-4 h-4" />
            {t('patients.viewTable')}
          </button>
        </div>
      </div>
      {loading && <PatientsGridSkeleton />}
      {error && <div className="mt-6"><ErrorMessage message={error} onRetry={retry} /></div>}
      {patients && !loading && !error && (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {patients.map((p) => <PatientCard key={p.id} patient={p} />)}
            </div>
          ) : (
            <PatientsTable
              patients={patients}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )}
          {patients.length === 0 && (
            <p className="text-center text-vellum/30 py-20 font-serif text-xl">{t('patients.empty')}</p>
          )}
        </>
      )}
    </>
  )
}

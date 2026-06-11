import type { PatientFilters } from './patient'

export interface FilterOption {
  value: string
  label: string
}

export type FilterFieldType = 'search' | 'select' | 'date'

export interface FilterField {
  key: keyof PatientFilters
  type: FilterFieldType
  label: string
  placeholder?: string
}

export interface MetricDefinition {
  key: string
  label: string
  unit?: string
}

export interface FilterMetadata {
  defaults: PatientFilters
  fields: FilterField[]
  examTypes: FilterOption[]
  severities: FilterOption[]
  metrics: MetricDefinition[]
}

export const FALLBACK_FILTER_DEFAULTS: PatientFilters = {
  search: '',
  examType: 'all',
  severity: 'all',
  dateFrom: '',
  dateTo: '',
}

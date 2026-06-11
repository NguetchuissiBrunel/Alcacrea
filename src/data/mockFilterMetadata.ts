import { translations, type Locale } from '../i18n/translations'
import type { FilterMetadata } from '../types/metadata'
import { FALLBACK_FILTER_DEFAULTS } from '../types/metadata'

/** Simule la réponse backend `GET /filters` localisée via Accept-Language. */
export function buildMockFilterMetadata(locale: Locale): FilterMetadata {
  const tr = translations[locale]

  return {
    defaults: { ...FALLBACK_FILTER_DEFAULTS },
    fields: [
      {
        key: 'search',
        type: 'search',
        label: tr.filters.search,
        placeholder: tr.filters.searchPlaceholder,
      },
      { key: 'examType', type: 'select', label: tr.filters.examType },
      { key: 'severity', type: 'select', label: tr.filters.severity },
      { key: 'dateFrom', type: 'date', label: tr.filters.dateFrom },
      { key: 'dateTo', type: 'date', label: tr.filters.dateTo },
    ],
    examTypes: [
      { value: 'all', label: tr.filters.allExams },
      { value: 'polysomnographie', label: tr.examType.polysomnographie },
      { value: 'polygraphie', label: tr.examType.polygraphie },
      { value: 'efr', label: tr.examType.efr },
    ],
    severities: [
      { value: 'all', label: tr.severity.all },
      { value: 'normal', label: tr.severity.normal },
      { value: 'leger', label: tr.severity.leger },
      { value: 'modere', label: tr.severity.modere },
      { value: 'severe', label: tr.severity.severe },
    ],
    metrics: [
      { key: 'iah', label: tr.metrics.iah, unit: '/h' },
      { key: 'ido', label: tr.metrics.ido, unit: '/h' },
      { key: 'satO2Min', label: tr.metrics.satO2Min, unit: '%' },
      { key: 'satO2Moy', label: tr.metrics.satO2Moy, unit: '%' },
      { key: 'vems', label: tr.metrics.vems, unit: 'L' },
      { key: 'cvf', label: tr.metrics.cvf, unit: 'L' },
      { key: 'rapportVemsCvf', label: tr.metrics.rapportVemsCvf, unit: '%' },
      { key: 'indiceDesaturation', label: tr.metrics.indiceDesaturation },
      { key: 'latenceSommeil', label: tr.metrics.latenceSommeil, unit: 'min' },
      { key: 'efficaciteSommeil', label: tr.metrics.efficaciteSommeil, unit: '%' },
    ],
  }
}

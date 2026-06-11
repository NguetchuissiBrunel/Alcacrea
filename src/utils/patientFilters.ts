import type { Patient, PatientFilters } from '../types/patient'

export function filterPatients(patients: Patient[], filters: PatientFilters): Patient[] {
  return patients.filter((p) => {
    const fullName = `${p.prenom} ${p.nom}`.toLowerCase()
    if (filters.search && !fullName.includes(filters.search.toLowerCase())) return false

    const matchingExams = p.exams.filter((e) => {
      if (filters.examType !== 'all' && e.type !== filters.examType) return false
      if (filters.severity !== 'all' && e.severity !== filters.severity) return false
      if (filters.dateFrom && e.date < filters.dateFrom) return false
      if (filters.dateTo && e.date > filters.dateTo) return false
      return true
    })

    return matchingExams.length > 0
  })
}

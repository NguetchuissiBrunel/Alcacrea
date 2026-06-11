import { extractPatientNom, parsePatientName } from './patientIdentity'

export function extractPatientParts(row: Record<string, unknown>): { nom: string; prenom: string } {
  const nom = String(row.PATIENT_NOM ?? row.patient_nom ?? row.nom_patient ?? row.nom ?? '').trim()
  const prenom = String(row.PATIENT_PRENOM ?? row.patient_prenom ?? row.prenom_patient ?? row.prenom ?? '').trim()
  if (nom || prenom) return { nom: nom || 'Inconnu', prenom }

  const full = extractPatientNom(row)
  return parsePatientName(full)
}

export function extractExamDate(row: Record<string, unknown>): string {
  return String(
    row.date_enregistrement ??
      row.date_examen ??
      row.DATE_EXAMEN ??
      row.date ??
      '',
  ).trim()
}

export function normalizeExamDate(raw: string): string {
  if (!raw?.trim()) return new Date().toISOString().slice(0, 10)

  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const iso = raw.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

  return new Date().toISOString().slice(0, 10)
}

export function extractPatientDob(row: Record<string, unknown>): string {
  const raw = String(row.PATIENT_DOB ?? row.date_naissance ?? row.dateNaissance ?? '').trim()
  return raw ? normalizeExamDate(raw) : ''
}

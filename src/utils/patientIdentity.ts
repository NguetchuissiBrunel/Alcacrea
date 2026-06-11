const EXAM_TYPE_TOKEN = /polysomnographie|polygraphie|polygraph|ppc|efr|standard|avancee|avancée|advanced|ventilatory/i

export function normalizePatientKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
}

export function patientIdFromName(name: string): string {
  const key = normalizePatientKey(name).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return key ? `p-${key}` : 'p-inconnu'
}

export function patientIdFromRow(row: Record<string, unknown>, patientNom: string): string {
  const backendId = row.patient_id ?? row.patientId ?? row.id_patient
  if (backendId != null && String(backendId).trim() !== '') {
    return `p-${String(backendId).trim()}`
  }
  return patientIdFromName(patientNom)
}

export function extractPatientNomFromFilename(filename: string): string | null {
  const base = filename.replace(/\.pdf$/i, '').trim()
  if (!base) return null

  const parts = base.split(/[_\s]+/).filter(Boolean)
  if (parts.length < 2) return null

  const typeIdx = parts.findIndex((p) => EXAM_TYPE_TOKEN.test(p))
  const nameParts = typeIdx > 0 ? parts.slice(0, typeIdx) : parts.slice(0, Math.min(2, parts.length))
  if (nameParts.length === 0) return null

  return nameParts.join(' ').replace(/_/g, ' ')
}

export function extractPatientNom(row: Record<string, unknown>): string {
  const nom = String(row.PATIENT_NOM ?? row.patient_nom ?? row.nom_patient ?? row.nom ?? '').trim()
  const prenom = String(row.PATIENT_PRENOM ?? row.patient_prenom ?? row.prenom_patient ?? row.prenom ?? '').trim()
  const splitFields = `${prenom} ${nom}`.trim()
  if (splitFields) return splitFields

  const direct = row.patient_name ?? row.nom_complet ?? row.full_name
  if (direct) return String(direct).trim()

  const combined = `${String(row.prenom_patient ?? '').trim()} ${String(row.nom_famille ?? '').trim()}`.trim()
  if (combined) return combined

  const file = String(row.filename ?? row.file_name ?? row.pdf_filename ?? row.nom_fichier ?? '')
  const fromFile = extractPatientNomFromFilename(file)
  if (fromFile) return fromFile

  return 'Inconnu'
}

export function parsePatientName(name: string): { nom: string; prenom: string } {
  const trimmed = name.trim()
  if (!trimmed || trimmed === 'Inconnu') return { nom: 'Inconnu', prenom: '' }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { nom: parts[0], prenom: '' }

  // PDF médical : NOM PRENOM (souvent en majuscules)
  if (parts[0] === parts[0].toUpperCase() && parts.length === 2) {
    return { nom: parts[0], prenom: parts[1] }
  }

  return { nom: parts[parts.length - 1], prenom: parts.slice(0, -1).join(' ') }
}

export function patientIdVariants(prenom: string, nom: string): string[] {
  const variants = new Set<string>()
  const combos = [
    `${prenom} ${nom}`.trim(),
    `${nom} ${prenom}`.trim(),
    nom.trim(),
    prenom.trim(),
  ].filter(Boolean)

  for (const combo of combos) {
    variants.add(patientIdFromName(combo))
  }
  return [...variants]
}

export function slugToSearchTerms(id: string): string[] {
  const decoded = decodeURIComponent(id).replace(/^p-/, '').trim()
  const base = decoded.replace(/-/g, ' ').trim()
  if (!base) return []

  const parts = base.split(/\s+/).filter(Boolean)
  const terms = new Set<string>([base])
  if (parts.length >= 2) {
    terms.add(`${parts[0]} ${parts.slice(1).join(' ')}`)
    terms.add(`${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`)
    terms.add(parts[0])
    terms.add(parts[parts.length - 1])
  }
  return [...terms].filter((t) => t.length >= 2)
}

import type { BackendExamRow } from './backendData'
import type { BackendExamType } from '../types/backendExam'
import type { Exam, ExamMetrics, ExamType, Patient, Severity } from '../types/patient'

function toNum(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  return undefined
}

function mapBackendType(type: BackendExamType): ExamType {
  if (type === 'polygraphie-ppc') return 'polygraphie'
  if (type === 'efr-standard' || type === 'efr-avancee') return 'efr'
  return 'polysomnographie'
}

function mapSeverity(raw: string): Severity {
  const s = raw.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (s.includes('sever') || s.includes('grave')) return 'severe'
  if (s.includes('moder')) return 'modere'
  if (s.includes('leger') || s.includes('mild')) return 'leger'
  return 'normal'
}

function parsePatientName(name: string): { nom: string; prenom: string } {
  const trimmed = name.trim()
  if (!trimmed) return { nom: 'Inconnu', prenom: '' }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { nom: parts[0], prenom: '' }
  return { nom: parts[parts.length - 1], prenom: parts.slice(0, -1).join(' ') }
}

export function patientIdFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug ? `p-${slug}` : 'p-inconnu'
}

export function patientIdFromRow(row: Record<string, unknown>, patientNom: string): string {
  const backendId = row.patient_id ?? row.patientId ?? row.id_patient
  if (backendId != null && String(backendId).trim() !== '') {
    return `p-${String(backendId).trim()}`
  }
  return patientIdFromName(patientNom)
}

export function patientIdsMatch(a: string, b: string): boolean {
  const na = decodeURIComponent(a).trim().toLowerCase()
  const nb = decodeURIComponent(b).trim().toLowerCase()
  if (na === nb) return true
  const slugA = na.replace(/^p-/, '')
  const slugB = nb.replace(/^p-/, '')
  return slugA.length > 0 && slugA === slugB
}

function extractPatientNom(row: Record<string, unknown>): string {
  const direct = row.patient_nom ?? row.nom_patient ?? row.patient_name ?? row.nom_complet ?? row.full_name
  if (direct) return String(direct).trim()
  const prenom = String(row.prenom ?? row.prenom_patient ?? '').trim()
  const nom = String(row.nom ?? row.nom_famille ?? '').trim()
  const combined = `${prenom} ${nom}`.trim()
  return combined || 'Inconnu'
}

function extractMetrics(row: Record<string, unknown>): ExamMetrics {
  return {
    iah: toNum(
      row.iah ?? row.iah_residuel ?? row.iah_residuelle ?? row.index_apnee_hypopnee ?? row.index_ah,
    ),
    ido: toNum(row.ido ?? row.ido_residuel ?? row.index_obstructif),
    satO2Min: toNum(
      row.sat_o2_min ?? row.sato2_min ?? row.saturation_min ?? row.spo2_min ?? row.sat_o2_minimum,
    ),
    satO2Moy: toNum(row.sat_o2_moy ?? row.sato2_moy ?? row.saturation_moyenne ?? row.sat_o2_moyenne),
    vems: toNum(row.vems ?? row.vems_l ?? row.vems_measured),
    cvf: toNum(row.cvf ?? row.cvf_l ?? row.cvf_measured),
    rapportVemsCvf: toNum(row.rapport_vems_cvf ?? row.vems_cvf ?? row.tiffeneau),
    indiceDesaturation: toNum(row.indice_desaturation ?? row.index_desaturation),
    latenceSommeil: toNum(row.latence_sommeil ?? row.latence_endormissement),
    efficaciteSommeil: toNum(row.efficacite_sommeil ?? row.efficience_sommeil),
  }
}

function normalizeDate(raw: string): string {
  if (!raw?.trim()) return new Date().toISOString().slice(0, 10)
  const iso = raw.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

export function mapExamRow(row: BackendExamRow): Exam {
  const r = row.raw
  const date = normalizeDate(String(r.date_enregistrement ?? r.date_examen ?? r.date ?? ''))
  const severite = String(r.severite ?? r.severite_residuelle ?? r.severity ?? 'normal')
  const fileName = String(r.filename ?? r.file_name ?? r.pdf_filename ?? `${row.type}-${row.id}.pdf`)

  return {
    id: `b:${row.type}:${row.id}`,
    type: mapBackendType(row.type),
    date,
    fileName,
    metrics: extractMetrics(r),
    severity: mapSeverity(severite),
    notes: r.notes ? String(r.notes) : undefined,
    backendRef: { type: row.type, id: row.id },
  }
}

export function buildPatientsFromExamRows(rows: BackendExamRow[]): Patient[] {
  const byPatient = new Map<string, Patient>()

  for (const row of rows) {
    const r = row.raw
    const patientNom = extractPatientNom(r)
    const pid = patientIdFromRow(r, patientNom)
    const { nom, prenom } = parsePatientName(patientNom)
    const exam = mapExamRow(row)

    const existing = byPatient.get(pid)
    if (existing) {
      existing.exams.push(exam)
    } else {
      byPatient.set(pid, {
        id: pid,
        nom,
        prenom,
        dateNaissance: String(r.date_naissance ?? r.dateNaissance ?? '1970-01-01'),
        sexe: String(r.sexe ?? r.sex ?? 'M').toUpperCase().startsWith('F') ? 'F' : 'M',
        exams: [exam],
      })
    }
  }

  return [...byPatient.values()].map((p) => ({
    ...p,
    exams: [...p.exams].sort((a, b) => b.date.localeCompare(a.date)),
  }))
}

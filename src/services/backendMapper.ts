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
  return `p-${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
}

function extractMetrics(row: Record<string, unknown>): ExamMetrics {
  return {
    iah: toNum(row.iah ?? row.iah_residuel ?? row.iah_residuelle ?? row.index_apnee_hypopnee),
    ido: toNum(row.ido ?? row.ido_residuel),
    satO2Min: toNum(row.sat_o2_min ?? row.sato2_min ?? row.saturation_min ?? row.spo2_min),
    satO2Moy: toNum(row.sat_o2_moy ?? row.sato2_moy ?? row.saturation_moyenne),
    vems: toNum(row.vems ?? row.vems_l),
    cvf: toNum(row.cvf ?? row.cvf_l),
    rapportVemsCvf: toNum(row.rapport_vems_cvf ?? row.vems_cvf),
    indiceDesaturation: toNum(row.indice_desaturation ?? row.index_desaturation),
    latenceSommeil: toNum(row.latence_sommeil),
    efficaciteSommeil: toNum(row.efficacite_sommeil),
  }
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10)
  return raw.slice(0, 10)
}

export function mapExamRow(row: BackendExamRow): Exam {
  const r = row.raw
  const patientNom = String(r.patient_nom ?? r.nom_patient ?? r.patient_name ?? '')
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
    const patientNom = String(r.patient_nom ?? r.nom_patient ?? r.patient_name ?? 'Inconnu')
    const pid = patientIdFromName(patientNom)
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

import type { BackendExamRow } from './backendData'
import type { BackendExamType } from '../types/backendExam'
import type { Exam, ExamMetrics, ExamType, Patient, Severity } from '../types/patient'
import { extractPatientDob, extractPatientParts, normalizeExamDate, extractExamDate } from '../utils/examMeta'
import {
  extractPatientNom,
  patientIdFromRow,
} from '../utils/patientIdentity'

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

export { patientIdFromName } from '../utils/patientIdentity'

export function extractMetrics(row: Record<string, unknown>): ExamMetrics {
  return {
    iah: toNum(
      row.iah ?? row.IAH ?? row.iah_residuel ?? row.iah_residuelle ?? row.index_apnee_hypopnee ?? row.index_ah,
    ),
    ido: toNum(row.ido ?? row.IDO ?? row.ido_residuel ?? row.index_obstructif),
    satO2Min: toNum(
      row.sat_o2_min ?? row.sato2_min ?? row.saturation_min ?? row.spo2_min ?? row.sat_o2_minimum ?? row.SAT_O2_MIN,
    ),
    satO2Moy: toNum(
      row.sat_o2_moy ?? row.sato2_moy ?? row.saturation_moyenne ?? row.sat_o2_moyenne ?? row.SAT_O2_MOY,
    ),
    vems: toNum(row.vems ?? row.VEMS ?? row.vems_l ?? row.vems_measured),
    cvf: toNum(row.cvf ?? row.CVF ?? row.cvf_l ?? row.cvf_measured),
    rapportVemsCvf: toNum(row.rapport_vems_cvf ?? row.RAPPORT_VEMS_CVF ?? row.vems_cvf ?? row.tiffeneau),
    indiceDesaturation: toNum(row.indice_desaturation ?? row.index_desaturation),
    latenceSommeil: toNum(row.latence_sommeil ?? row.latence_endormissement),
    efficaciteSommeil: toNum(row.efficacite_sommeil ?? row.efficience_sommeil),
  }
}

export function mapExamRow(row: BackendExamRow): Exam {
  const r = row.raw
  const date = normalizeExamDate(extractExamDate(r))
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
    const { nom, prenom } = extractPatientParts(r)
    const exam = mapExamRow(row)

    const existing = byPatient.get(pid)
    if (existing) {
      existing.exams.push(exam)
    } else {
      byPatient.set(pid, {
        id: pid,
        nom,
        prenom,
        dateNaissance: extractPatientDob(r) || '1970-01-01',
        sexe: String(r.GENRE ?? r.sexe ?? r.sex ?? 'M').toUpperCase().startsWith('F') ? 'F' : 'M',
        exams: [exam],
      })
    }
  }

  return [...byPatient.values()].map((p) => ({
    ...p,
    exams: [...p.exams].sort((a, b) => b.date.localeCompare(a.date)),
  }))
}

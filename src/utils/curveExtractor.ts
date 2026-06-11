import type { ExtractedCurve, ExtractedEvent, ExtractedFlowPoint, ExtractedLinePoint, ExtractedStage, ParsedField } from '../types/backendExam'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  return null
}

function labelFromPath(path: string): string {
  return path
    .split('.')
    .pop()!
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function flattenParsedFields(data: unknown, prefix = ''): ParsedField[] {
  const fields: ParsedField[] = []
  if (!isRecord(data)) return fields

  for (const [key, value] of Object.entries(data)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value == null) continue
    if (Array.isArray(value)) {
      if (value.length > 0 && value.length <= 3 && typeof value[0] !== 'object') {
        fields.push({ path, label: labelFromPath(path), value: String(value.join(', ')) })
      }
      continue
    }
    if (isRecord(value)) {
      const nested = flattenParsedFields(value, path)
      if (nested.length <= 8) fields.push(...nested)
      continue
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      if (String(value).length > 200) continue
      fields.push({ path, label: labelFromPath(path), value })
    }
  }
  return fields
}

function extractLinePoints(arr: unknown[]): ExtractedLinePoint[] | null {
  const points: ExtractedLinePoint[] = []
  for (const item of arr) {
    if (!isRecord(item)) continue
    const t = toNumber(
      item.t ?? item.time ?? item.minute ?? item.min ?? item.x ?? item.timestamp ?? item.index,
    )
    const value = toNumber(
      item.value ??
        item.spo2 ??
        item.saturation ??
        item.sat_o2 ??
        item.y ??
        item.valeur ??
        item.debit ??
        item.flow,
    )
    if (t != null && value != null) points.push({ t, value })
  }
  return points.length >= 2 ? points : null
}

function extractFlowPoints(arr: unknown[]): ExtractedFlowPoint[] | null {
  const points: ExtractedFlowPoint[] = []
  for (const item of arr) {
    if (!isRecord(item)) continue
    const volume = toNumber(
      item.volume ?? item.vol ?? item.volume_l ?? item.vol_l ?? item.x ?? item.abscisse,
    )
    const flow = toNumber(
      item.flow ?? item.debit ?? item.debit_ls ?? item.flow_l_s ?? item.flux ?? item.y ?? item.ordonnee,
    )
    if (volume != null && flow != null) points.push({ volume, flow })
  }
  return points.length >= 2 ? points : null
}

function extractFlowFromParallelArrays(obj: Record<string, unknown>): ExtractedFlowPoint[] | null {
  const volKey = ['volumes', 'volume', 'vol', 'vol_l', 'volume_l', 'x']
  const flowKey = ['flows', 'flow', 'debit', 'debit_ls', 'flow_l_s', 'flux', 'y']
  let vols: unknown[] | null = null
  let flows: unknown[] | null = null

  for (const k of volKey) {
    if (Array.isArray(obj[k])) {
      vols = obj[k] as unknown[]
      break
    }
  }
  for (const k of flowKey) {
    if (Array.isArray(obj[k])) {
      flows = obj[k] as unknown[]
      break
    }
  }

  if (!vols || !flows || vols.length < 2 || vols.length !== flows.length) return null

  const points: ExtractedFlowPoint[] = []
  for (let i = 0; i < vols.length; i++) {
    const volume = toNumber(vols[i])
    const flow = toNumber(flows[i])
    if (volume != null && flow != null) points.push({ volume, flow })
  }
  return points.length >= 2 ? points : null
}

function extractStages(arr: unknown[]): ExtractedStage[] | null {
  const stages: ExtractedStage[] = []
  for (const item of arr) {
    if (!isRecord(item)) continue
    const t = toNumber(item.t ?? item.time ?? item.minute ?? item.debut)
    const stage = String(item.stage ?? item.stade ?? item.sommeil ?? item.label ?? '')
    if (t != null && stage) {
      stages.push({
        t,
        stage,
        durationMinutes: toNumber(item.durationMinutes ?? item.duree ?? item.duration) ?? undefined,
      })
    }
  }
  return stages.length >= 1 ? stages : null
}

function extractEvents(arr: unknown[]): ExtractedEvent[] | null {
  const events: ExtractedEvent[] = []
  for (const item of arr) {
    if (!isRecord(item)) continue
    const t = toNumber(item.t ?? item.time ?? item.minute)
    const type = String(item.type ?? item.event_type ?? item.evenement ?? 'event')
    if (t != null) {
      events.push({
        t,
        type,
        durationSeconds: toNumber(item.durationSeconds ?? item.duree ?? item.duration) ?? undefined,
        satO2Drop: toNumber(item.satO2Drop ?? item.desaturation ?? item.chute_spo2) ?? undefined,
      })
    }
  }
  return events.length >= 1 ? events : null
}

const CURVE_KEY_HINTS = [
  'spo2', 'saturation', 'sat_o2', 'courbe', 'curve', 'courbes', 'graph', 'graphique',
  'hypnogramme', 'stades', 'stages', 'sommeil', 'events', 'evenements',
  'respiratory', 'apnee', 'flow', 'debit', 'volume', 'spirometrie', 'spirometry',
  'time_series', 'boucle', 'loop', 'debit_volume', 'flow_volume', 'mesures_courbes',
]

const NESTED_POINT_KEYS = ['points', 'data', 'values', 'series', 'courbe', 'curve']

function tryExtractCurve(path: string, value: unknown): ExtractedCurve | null {
  if (Array.isArray(value) && value.length >= 2) {
    const label = labelFromPath(path)
    const id = path.replace(/\./g, '_')

    const line = extractLinePoints(value)
    if (line) {
      return {
        id,
        label,
        kind: 'line',
        points: line,
        unit: path.toLowerCase().includes('spo2') || path.toLowerCase().includes('sat') ? '%' : undefined,
      }
    }

    const flow = extractFlowPoints(value)
    if (flow) return { id, label, kind: 'flow-volume', points: flow }

    const stages = extractStages(value)
    if (stages) return { id, label, kind: 'stages', stages }

    const events = extractEvents(value)
    if (events) return { id, label, kind: 'events', events }
  }

  if (isRecord(value)) {
    for (const key of NESTED_POINT_KEYS) {
      const nested = value[key]
      if (Array.isArray(nested)) {
        const curve = tryExtractCurve(path ? `${path}.${key}` : key, nested)
        if (curve) return curve
      }
    }

    const parallel = extractFlowFromParallelArrays(value)
    if (parallel) {
      return {
        id: path.replace(/\./g, '_') || 'flow_volume',
        label: labelFromPath(path) || 'Débit-Volume',
        kind: 'flow-volume',
        points: parallel,
      }
    }
  }

  return null
}

export function extractCurvesFromParsedData(data: unknown): ExtractedCurve[] {
  const curves: ExtractedCurve[] = []
  const seen = new Set<string>()

  function push(curve: ExtractedCurve | null) {
    if (!curve || seen.has(curve.id)) return
    seen.add(curve.id)
    curves.push(curve)
  }

  function walk(node: unknown, path: string) {
    if (!isRecord(node)) return

    for (const [key, value] of Object.entries(node)) {
      const childPath = path ? `${path}.${key}` : key
      const keyLower = key.toLowerCase()

      if (Array.isArray(value)) {
        const hint = CURVE_KEY_HINTS.some((h) => keyLower.includes(h) || childPath.toLowerCase().includes(h))
        if (hint || value.length >= 2) {
          push(tryExtractCurve(childPath, value))
        }
      } else if (isRecord(value)) {
        const hint = CURVE_KEY_HINTS.some((h) => keyLower.includes(h) || childPath.toLowerCase().includes(h))
        if (hint) push(tryExtractCurve(childPath, value))
        walk(value, childPath)
      }
    }
  }

  walk(data, '')
  return curves
}

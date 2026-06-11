/** Générateur PDF minimal (sans dépendance externe) pour rapports tabulaires. */

export interface PdfColumn {
  header: string
  width: number
  maxChars?: number
}

export interface PdfTable {
  title: string
  subtitle?: string
  columns: PdfColumn[]
  rows: string[][]
  footer?: string
}

const PAGE_LEFT = 42
const PAGE_WIDTH = 511
const ROW_HEIGHT = 13
const FONT_SIZE = 8

function normalizePdfText(text: string): string {
  return text
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/[^\x20-\x7E]/g, '?')
}

function escapePdfText(text: string): string {
  return normalizePdfText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function truncateCell(text: string, maxChars: number): string {
  const normalized = normalizePdfText(text)
  if (normalized.length <= maxChars) return normalized
  return `${normalized.slice(0, Math.max(1, maxChars - 1))}.`
}

function drawText(lines: string[], text: string, x: number, y: number, size = FONT_SIZE) {
  lines.push(`BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`)
}

function columnStarts(columns: PdfColumn[]): number[] {
  const starts: number[] = []
  let x = PAGE_LEFT
  for (const col of columns) {
    starts.push(x)
    x += col.width
  }
  return starts
}

function buildPageStream(table: PdfTable, pageIndex: number, totalPages: number): string {
  const lines: string[] = []
  const colStarts = columnStarts(table.columns)
  let y = 800

  drawText(lines, table.title, PAGE_LEFT, y, 16)
  y -= 22

  if (table.subtitle) {
    drawText(lines, table.subtitle, PAGE_LEFT, y, 9)
    y -= 16
  }

  drawText(lines, `Page ${pageIndex + 1} / ${totalPages}`, PAGE_LEFT + PAGE_WIDTH - 52, y + 16, 8)

  y -= 6
  const headerY = y

  for (let c = 0; c < table.columns.length; c++) {
    const col = table.columns[c]
    const maxChars = col.maxChars ?? Math.max(4, Math.floor(col.width / 4.8))
    drawText(lines, truncateCell(col.header, maxChars), colStarts[c], headerY, FONT_SIZE)
  }

  y = headerY - 10
  lines.push(`${PAGE_LEFT} ${y} m ${PAGE_LEFT + PAGE_WIDTH} ${y} l S`)
  y -= ROW_HEIGHT

  for (const row of table.rows) {
    if (y < 52) break
    for (let c = 0; c < table.columns.length; c++) {
      const col = table.columns[c]
      const maxChars = col.maxChars ?? Math.max(4, Math.floor(col.width / 4.8))
      const cell = truncateCell(String(row[c] ?? '-'), maxChars)
      drawText(lines, cell, colStarts[c], y, FONT_SIZE)
    }
    y -= ROW_HEIGHT
  }

  if (table.footer && pageIndex === totalPages - 1) {
    drawText(lines, table.footer, PAGE_LEFT, 32, 7)
  }

  return lines.join('\n')
}

function paginateRows(rows: string[][], rowsPerPage = 28): string[][][] {
  const pages: string[][][] = []
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage))
  }
  if (pages.length === 0) pages.push([])
  return pages
}

export function buildPdfBlob(table: PdfTable): Blob {
  const rowPages = paginateRows(table.rows)
  const totalPages = rowPages.length
  const streams = rowPages.map((pageRows, index) =>
    buildPageStream({ ...table, rows: pageRows }, index, totalPages),
  )

  const offsets: number[] = []
  let body = ''

  const append = (chunk: string) => {
    offsets.push(body.length)
    body += chunk
  }

  append('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n')

  const pageRefs = streams.map((_, i) => `${3 + i * 2} 0 R`).join(' ')
  append(`2 0 obj<</Type/Pages/Kids[${pageRefs}]/Count ${streams.length}>>endobj\n`)

  streams.forEach((stream, i) => {
    const pageObj = 3 + i * 2
    const contentObj = pageObj + 1
    append(
      `${pageObj} 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents ${contentObj} 0 R/Resources<</Font<</F1 ${3 + streams.length * 2} 0 R>>>>>>endobj\n`,
    )
    append(`${contentObj} 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream\nendobj\n`)
  })

  const fontObj = 3 + streams.length * 2
  append(`${fontObj} 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n`)

  const xrefStart = body.length
  let xref = `xref\n0 ${fontObj + 1}\n0000000000 65535 f \n`
  for (const off of offsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`
  }

  const pdf = `%PDF-1.4\n${body}${xref}trailer<</Size ${fontObj + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

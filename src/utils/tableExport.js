import { DOWNLOAD_FORMATS } from '../config.js'
import { transposeMatrix } from './eventCounts.js'

const asText = (value) => (value === null || value === undefined ? '' : String(value))

const escapeCsv = (value) => {
  const text = asText(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const escapeXml = (value) =>
  asText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const rowsToObjects = (table) =>
  table.rows.map((row) =>
    Object.fromEntries(
      table.columns.map((column, index) => [
        column,
        row[index] === undefined ? null : row[index],
      ])
    )
  )

export function serializeCsv(table) {
  const lines = [table.columns, ...table.rows].map((row) => row.map(escapeCsv).join(','))
  return `${lines.join('\n')}\n`
}

export function serializeJson(table) {
  return `${JSON.stringify(rowsToObjects(table), null, 2)}\n`
}

export function serializeXml(table) {
  const rows = table.rows
    .map((row) => {
      const fields = table.columns
        .map(
          (column, index) =>
            `    <field name="${escapeXml(column)}">${escapeXml(row[index])}</field>`
        )
        .join('\n')
      return `  <row>\n${fields}\n  </row>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<table name="${escapeXml(table.title)}">\n${rows}\n</table>\n`
}

export function serializeTxt(table) {
  const lines = [table.columns, ...table.rows].map((row) => row.map(asText).join('\t'))
  return `${lines.join('\n')}\n`
}

export function serializeTable(table, formatId) {
  const format = DOWNLOAD_FORMATS.find((option) => option.id === formatId)
  if (!format) throw new Error(`Unsupported download format: ${formatId}`)

  switch (format.id) {
    case 'csv':
      return serializeCsv(table)
    case 'json':
      return serializeJson(table)
    case 'xml':
      return serializeXml(table)
    case 'txt':
      return serializeTxt(table)
    default:
      throw new Error(`Unsupported download format: ${formatId}`)
  }
}

export function safeFilename(value) {
  const slug = asText(value)
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase()
  return slug || 'table'
}

export function downloadTable(table, formatId) {
  const format = DOWNLOAD_FORMATS.find((option) => option.id === formatId)
  if (!format) throw new Error(`Unsupported download format: ${formatId}`)

  const blob = new Blob([serializeTable(table, formatId)], { type: format.mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeFilename(table.filename || table.title)}.${format.id}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function matrixToTable({
  matrix,
  transposed = false,
  title,
  filename,
  rowLabel,
  columnLabel,
  rowTotalLabel,
  columnTotalLabel,
}) {
  const display = transposed ? transposeMatrix(matrix) : matrix
  const headerLabel = transposed ? columnLabel : rowLabel
  const totalColumnLabel = transposed ? rowTotalLabel : columnTotalLabel
  const totalRowLabel = transposed ? columnTotalLabel : rowTotalLabel
  const columns = [
    headerLabel,
    ...display.columns.map((column) => column.name),
    totalColumnLabel,
  ]
  const rows = display.rows.map((row) => [
    row.name,
    ...display.columns.map((column) => row.cells[column.name] ?? 0),
    row.total,
  ])
  rows.push([
    totalRowLabel,
    ...display.columns.map((column) => column.total),
    matrix.total,
  ])

  return { title, filename, columns, rows }
}

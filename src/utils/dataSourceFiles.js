// Pure helpers for the Data Source Files view: date-range expansion, missing
// date placeholders and sorting. Keeping them outside the component makes the
// table behaviour testable without rendering.
import { LOCALE } from '../config.js'

const DAY_MS = 24 * 60 * 60 * 1000

const parseIsoDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(time)) return null
  return new Date(time).toISOString().slice(0, 10) === value ? time : null
}

export function dateRange(startDate, endDate) {
  const start = parseIsoDate(startDate)
  const end = parseIsoDate(endDate)
  if (start === null || end === null || start > end) return []

  const dates = []
  for (let time = start; time <= end; time += DAY_MS) {
    dates.push(new Date(time).toISOString().slice(0, 10))
  }
  return dates
}

const missingRow = (sourceName, snapshotDate) => ({
  sourceName,
  fileName: null,
  snapshotDate,
  createdAt: null,
  records: null,
  sizeKb: null,
  missing: true,
})

export function buildSourceRows(files, sourceName, startDate, latestDate) {
  const sourceFiles = (Array.isArray(files) ? files : []).filter(
    (file) => file && file.sourceName === sourceName
  )
  const datedFiles = sourceFiles.filter((file) => file.snapshotDate)
  const dates = datedFiles.map((file) => file.snapshotDate).sort()

  const byDate = new Map()
  for (const file of datedFiles) {
    const bucket = byDate.get(file.snapshotDate) ?? []
    bucket.push(file)
    byDate.set(file.snapshotDate, bucket)
  }

  const rangeStart = startDate || dates[0] || null
  const rangeEnd = latestDate || dates.at(-1) || null
  const rows = []

  for (const date of dateRange(rangeStart, rangeEnd)) {
    const filesForDate = byDate.get(date)
    if (filesForDate?.length) {
      rows.push(...filesForDate.map((file) => ({ ...file, missing: false })))
    } else {
      rows.push(missingRow(sourceName, date))
    }
  }

  // Keep files whose date is missing or outside the configured range visible.
  const included = new Set(rows.filter((row) => !row.missing).map((row) => row.fileName))
  for (const file of sourceFiles) {
    if (!included.has(file.fileName)) rows.push({ ...file, missing: false })
  }

  return rows
}

const sortValue = (row, key) => {
  if (key === 'createdAt') {
    if (!row.createdAt) return null
    const time = Date.parse(row.createdAt)
    return Number.isFinite(time) ? time : null
  }
  return row[key]
}

export function sortSourceRows(rows, sortKey, sortDir) {
  const direction = sortDir === 'desc' ? -1 : 1

  return [...rows].sort((a, b) => {
    // Missing rows carry no file metadata; keep them at the bottom when the
    // sort key describes a file. Date sorting keeps them in chronological order.
    if (sortKey !== 'snapshotDate' && a.missing !== b.missing) {
      return a.missing ? 1 : -1
    }

    const left = sortValue(a, sortKey)
    const right = sortValue(b, sortKey)
    if (left === right) return 0
    if (left === null || left === undefined) return 1
    if (right === null || right === undefined) return -1
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction
    }
    return String(left).localeCompare(String(right)) * direction
  })
}

export const formatCreatedAt = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'medium' })
}

export const formatRecords = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return value.toLocaleString(LOCALE)
}

export const formatSizeKb = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return value.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

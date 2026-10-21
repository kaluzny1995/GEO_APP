import {
  COUNTRY_REGIONS,
  DEFAULT_REGION,
  DANGER_LEVELS,
  LOCALE,
  REGION_ORDER,
  UNRATED_DANGER_RATINGS,
} from '../config.js'

const emptyLevels = () => Object.fromEntries(DANGER_LEVELS.map((level) => [level, 0]))

export function dangerLevel(value) {
  if (typeof value !== 'string') return null
  const level = value.trim().toLowerCase()
  return DANGER_LEVELS.includes(level) ? level : null
}

export function isUnrated(value) {
  if (typeof value !== 'string') return true
  const rating = value.trim().toLowerCase()
  return UNRATED_DANGER_RATINGS.includes(rating)
}

const share = (part, whole) => (whole ? (part / whole) * 100 : 0)

export function summarizeEventCounts(rows) {
  const counts = emptyLevels()
  let total = 0

  for (const row of Array.isArray(rows) ? rows : []) {
    const count = Number(row?.count)
    if (!Number.isFinite(count)) continue
    total += count
    const level = dangerLevel(row.danger_rating)
    if (level) counts[level] += count
  }

  const levels = Object.fromEntries(
    DANGER_LEVELS.map((level) => [level, { count: counts[level], share: share(counts[level], total) }])
  )
  const rated = DANGER_LEVELS.reduce((sum, level) => sum + counts[level], 0)

  return { total, levels, unrated: total - rated }
}

// Flatten long-format rows into one row per source/subsource + taxonomy (or
// location) group, with counts per danger level and the percentages the UI
// shows: `share` is the group's share of all events, `levelShares[level]` is
// the level's share of the group's own count.
export function eventCountRows(rows, dimension) {
  const groups = new Map()

  for (const row of Array.isArray(rows) ? rows : []) {
    const count = Number(row?.count)
    if (!Number.isFinite(count)) continue

    const source = row.source_name || '—'
    const subsource = row.subsource_name || '—'
    const primary = (dimension === 'location' ? row.country_code : row.event_category) || '—'
    const secondary = (dimension === 'location' ? row.state_province : row.event_subcategory) || '—'
    const key = [source, subsource, primary, secondary].join('\u0000')

    if (!groups.has(key)) {
      groups.set(key, { key, source, subsource, primary, secondary, count: 0, levels: emptyLevels() })
    }

    const group = groups.get(key)
    group.count += count
    const level = dangerLevel(row.danger_rating)
    if (level) group.levels[level] += count
  }

  const total = [...groups.values()].reduce((sum, group) => sum + group.count, 0)

  return [...groups.values()]
    .map((group) => ({
      ...group,
      share: share(group.count, total),
      levelShares: Object.fromEntries(
        DANGER_LEVELS.map((level) => [level, share(group.levels[level], group.count)])
      ),
    }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source))
}

const REGION_BY_CODE = Object.fromEntries(
  Object.entries(COUNTRY_REGIONS).flatMap(([region, codes]) => codes.map((code) => [code, region]))
)

export function countryRegion(code) {
  if (typeof code !== 'string') return DEFAULT_REGION
  return REGION_BY_CODE[code.trim().toUpperCase()] ?? DEFAULT_REGION
}

// Aggregate long-format rows into a row × column matrix (all lower grouping
// levels summed), with row/column totals. `columnOrder` keeps a fixed axis
// (e.g. the region groups) even when a column has no rows.
function buildMatrix(rows, rowKey, columnKey, columnOrder) {
  const columns = new Set()
  const cellsByRow = new Map()
  const rowTotals = new Map()
  const columnTotals = new Map()
  let total = 0

  for (const row of Array.isArray(rows) ? rows : []) {
    const count = Number(row?.count)
    if (!Number.isFinite(count)) continue
    const rowName = rowKey(row) || '—'
    const columnName = columnKey(row) || '—'

    columns.add(columnName)
    if (!cellsByRow.has(rowName)) cellsByRow.set(rowName, new Map())
    const cells = cellsByRow.get(rowName)
    cells.set(columnName, (cells.get(columnName) ?? 0) + count)
    rowTotals.set(rowName, (rowTotals.get(rowName) ?? 0) + count)
    columnTotals.set(columnName, (columnTotals.get(columnName) ?? 0) + count)
    total += count
  }

  const columnNames = columnOrder
    ? [...columnOrder, ...[...columns].filter((name) => !columnOrder.includes(name)).sort()]
    : [...columns].sort()

  return {
    total,
    columns: columnNames.map((name) => ({ name, total: columnTotals.get(name) ?? 0 })),
    rows: [...cellsByRow.keys()].sort().map((name) => ({
      name,
      total: rowTotals.get(name),
      cells: Object.fromEntries(cellsByRow.get(name)),
    })),
  }
}

export function categorySourceMatrix(rows) {
  return buildMatrix(
    rows,
    (row) => row.event_category,
    (row) => row.source_name
  )
}

export function sourceRegionMatrix(rows) {
  return buildMatrix(
    rows,
    (row) => row.source_name,
    (row) => countryRegion(row.country_code),
    REGION_ORDER
  )
}

export const formatCount = (value) => Number(value).toLocaleString(LOCALE)

export const formatPercent = (value) => `${Number(value).toFixed(1)}%`

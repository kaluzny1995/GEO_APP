import { LOCALE, QUALITY_METRICS, TABLE_FLOW } from '../config.js'

export const formatQuantity = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const count = Number(value)
  return Number.isFinite(count) ? count.toLocaleString(LOCALE) : '—'
}

export function totalRecordsFromMetrics(metrics) {
  if (!Array.isArray(metrics)) return null
  const row = metrics.find((metric) => metric?.metric === QUALITY_METRICS.totalRecords)
  if (!row || row.value === null || row.value === undefined || row.value === '') return null
  const value = Number(row.value)
  return Number.isFinite(value) ? value : null
}

export function sumQuantities(values) {
  const known = (Array.isArray(values) ? values : []).filter((value) => typeof value === 'number')
  return known.length ? known.reduce((total, value) => total + value, 0) : null
}

export function quantityDifference(plainCount, etlCount) {
  return typeof plainCount === 'number' && typeof etlCount === 'number'
    ? plainCount - etlCount
    : null
}

export function differenceTone(difference) {
  if (difference === null) return 'missing'
  if (difference > 0) return 'filtered'
  if (difference < 0) return 'added'
  return 'even'
}

export function differenceLabel(difference) {
  if (difference === null) return 'No count'
  if (difference > 0) return `${formatQuantity(difference)} filtered out`
  if (difference < 0) return `${formatQuantity(-difference)} more in ETL`
  return 'No rows filtered'
}

export function buildQuantityFlow(counts = {}) {
  return TABLE_FLOW.map(({ plain, etl }) => {
    const plainCount = counts[plain] ?? null
    const etlCount = counts[etl] ?? null
    const difference = quantityDifference(plainCount, etlCount)
    return {
      plain,
      etl,
      plainCount,
      etlCount,
      difference,
      differenceLabel: differenceLabel(difference),
      differenceTone: differenceTone(difference),
    }
  })
}

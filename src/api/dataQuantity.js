// GEO_API data-quantity service
// Endpoints:
//   GET /data-quantity/dates          — every snapshot date in geo.union_etl
//   GET /data-quantity/{file_date}    — actual COUNT(*) per tracked table
//
// These are real database counts, not the `total_records` metric stored in
// geo.data_quality: the metric is computed by GEO_ETL and can lag behind later
// backfills (e.g. union_etl gained IBTRACS rows after its last metric run), so
// the quantity view would otherwise disagree with the tables it describes.
import { apiUrl, fetchWithTimeout } from './client.js'
import { API_PATHS, TABLE_NAMES } from '../config.js'

const quantityPath = (fileDate) =>
  `${API_PATHS.dataQuantity}/${encodeURIComponent(fileDate)}`

export async function fetchDataQuantityDates() {
  const dates = await fetchWithTimeout(
    apiUrl(`${API_PATHS.dataQuantity}/${API_PATHS.dataQuantityDates}`)
  )
  return Array.isArray(dates)
    ? dates.filter((date) => typeof date === 'string' && date.length > 0)
    : []
}

export async function fetchDataQuantities(fileDate) {
  const rows = await fetchWithTimeout(apiUrl(quantityPath(fileDate)))
  if (!Array.isArray(rows)) return {}

  const tracked = new Set(TABLE_NAMES)
  const counts = {}
  for (const row of rows) {
    if (!row || !tracked.has(row.table_name)) continue
    const count = Number(row.count)
    if (Number.isFinite(count)) counts[row.table_name] = count
  }
  return counts
}

export default { fetchDataQuantityDates, fetchDataQuantities }

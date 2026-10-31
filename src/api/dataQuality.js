// GEO_API data-quality service
// Endpoints (see DATA_QUALITY_METRICS.md):
//   GET /data-quality/{table_name}/{file_date}
//   GET /data-quality/{table_name}/file-dates?file_dates=overall
import { dimensionsFromMetrics, overallScore } from '../utils/quality.js'
import { apiUrl, fetchWithTimeout } from './client.js'
import { API_PATHS, API_QUERY_PARAMS, FILE_DATES_LIMIT, PROBE_WINDOW_DAYS, OVERALL_DATE } from '../config.js'

const tablePath = (tableName) => `${API_PATHS.dataQuality}/${encodeURIComponent(tableName)}`

export async function fetchDataQuality(tableName, fileDate) {
  return fetchWithTimeout(
    apiUrl(`${tablePath(tableName)}/${encodeURIComponent(fileDate)}`)
  )
}

// The API has no "list dates" endpoint, so the app probes a rolling window of
// candidate dates plus `overall` and keeps the `file_date` values that returned
// rows. The probe response (long-format metric rows for every snapshot) is used
// to derive both the date list and the quality-score trend, and is cached per
// table for the session because it can be large.
const indexCache = new Map()

const isoDaysAgo = (days) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function clearIndexCache() {
  indexCache.clear()
}

export async function fetchTableIndex(tableName, fileDate) {
  const cached = indexCache.get(tableName)
  if (cached) return cached

  const candidates = new Set([OVERALL_DATE])
  if (fileDate) candidates.add(fileDate)
  for (let i = 0; i <= PROBE_WINDOW_DAYS; i += 1) candidates.add(isoDaysAgo(i))

  // GEO_API caps /file-dates at FILE_DATES_LIMIT (100) dates per request, so the
  // rolling window is probed in batches and the row arrays are merged. Without
  // this the 120-day window (122 candidates with `overall`) returns HTTP 422.
  const dates = [...candidates]
  const batches = []
  for (let i = 0; i < dates.length; i += FILE_DATES_LIMIT) {
    batches.push(dates.slice(i, i + FILE_DATES_LIMIT))
  }

  const results = await Promise.all(
    batches.map((batch) =>
      fetchWithTimeout(
        apiUrl(
          `${tablePath(tableName)}/${API_PATHS.dataQualityFileDates}?${API_QUERY_PARAMS.fileDates}=${batch.map(encodeURIComponent).join(',')}`
        )
      )
    )
  )
  const rows = results.flatMap((result) => (Array.isArray(result) ? result : []))
  if (rows.length === 0) return { dates: [], trend: [] }

  const snapshotDates = [...new Set(rows.map((r) => r && r.file_date).filter((d) => typeof d === 'string' && d.length > 0))]
  snapshotDates.sort()

  const trend = snapshotDates
    .filter((date) => date !== OVERALL_DATE)
    .map((date) => {
      const dateRows = rows.filter((r) => r.file_date === date)
      const dimensions = dimensionsFromMetrics(dateRows)
      return { date, score: overallScore(dimensions), dimensions, rows: dateRows }
    })

  const index = { dates: snapshotDates, trend }
  indexCache.set(tableName, index)
  return index
}

export default { fetchDataQuality, fetchTableIndex, clearIndexCache }

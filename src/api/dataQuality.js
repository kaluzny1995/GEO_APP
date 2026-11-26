// GEO_API data-quality service
// Endpoints (see DATA_QUALITY_METRICS.md):
//   GET /data-quality/tables
//   GET /data-quality/{table_name}/{file_date}
//   GET /data-quality/{table_name}/file-dates?file_dates=overall
import { dimensionsFromMetrics, overallScore } from '../utils/quality.js'
import { apiUrl, fetchWithTimeout } from './client.js'
import {
  API_PATHS,
  API_QUERY_PARAMS,
  DATA_QUALITY_INDEX_CACHE_MAX_ENTRIES,
  DATA_QUALITY_INDEX_CACHE_TTL_MS,
  FILE_DATES_LIMIT,
  PROBE_WINDOW_DAYS,
  OVERALL_DATE,
  VIEW_SUFFIX,
} from '../config.js'

const tablePath = (tableName) => `${API_PATHS.dataQuality}/${encodeURIComponent(tableName)}`

// Authoritative measured-table list for the dropdown. GEO_API introspects the
// geo schema, so newly added source/ETL tables appear without a frontend
// release. Views are returned by the endpoint too, but the DATA_QUALITY job
// does not measure them, so they would only produce the "no snapshots" state;
// filter them out here. Returns [] on an invalid payload; the view falls back
// to TABLE_NAMES.
export async function fetchDataQualityTables() {
  const tables = await fetchWithTimeout(apiUrl(`${API_PATHS.dataQuality}/${API_PATHS.dataQualityTables}`))
  if (!Array.isArray(tables)) return []
  return [
    ...new Set(
      tables.filter(
        (table) =>
          typeof table === 'string' &&
          table.length > 0 &&
          !table.endsWith(VIEW_SUFFIX)
      )
    ),
  ].sort()
}

export async function fetchDataQuality(tableName, fileDate) {
  return fetchWithTimeout(
    apiUrl(`${tablePath(tableName)}/${encodeURIComponent(fileDate)}`)
  )
}

// The API exposes GET /data-quality/{table}/dates, but the dashboard also needs
// the metric rows behind each snapshot to draw the quality-score trend. It
// therefore probes /file-dates for a rolling window of candidate dates plus
// `overall`; the response is reused for both the date list and the trend.
const isoDaysAgo = (days) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

// The probe response is large: one long-format metric row per snapshot date,
// for every metric of the selected table. It is cached per table so switching
// tables back and forth does not re-download it, but an unbounded cache would
// retain one such payload for every table visited in the session. The limits
// live in config.js so they are tuned with the rest of the app settings.
const indexCache = new Map()

const cachedIndex = (tableName) => {
  const entry = indexCache.get(tableName)
  if (!entry) return null
  if (Date.now() - entry.storedAt >= DATA_QUALITY_INDEX_CACHE_TTL_MS) {
    indexCache.delete(tableName)
    return null
  }
  // Re-insert so the Map order tracks recency (oldest key is evicted first).
  indexCache.delete(tableName)
  indexCache.set(tableName, entry)
  return entry.index
}

const storeIndex = (tableName, index) => {
  indexCache.delete(tableName)
  indexCache.set(tableName, { index, storedAt: Date.now() })
  while (indexCache.size > DATA_QUALITY_INDEX_CACHE_MAX_ENTRIES) {
    indexCache.delete(indexCache.keys().next().value)
  }
}

export function clearIndexCache() {
  indexCache.clear()
}

export async function fetchTableIndex(tableName, fileDate) {
  const cached = cachedIndex(tableName)
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
  storeIndex(tableName, index)
  return index
}

export default { fetchDataQuality, fetchDataQualityTables, fetchTableIndex, clearIndexCache }

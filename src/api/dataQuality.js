// GEO_API data-quality service
// Endpoints (see DATA_QUALITY_METRICS.md):
//   GET /data-quality/{table_name}/{file_date}
//   GET /data-quality/{table_name}/file-dates?file_dates=overall
import { dimensionsFromMetrics, overallScore } from '../utils/quality.js'
import { API_BASE, API_TIMEOUT_MS, PROBE_WINDOW_DAYS, OVERALL_DATE } from '../config.js'

const apiDownError = () => {
  const err = new Error('API server is down! Please check the API server.')
  err.isConnectionError = true
  return err
}

const fetchWithTimeout = async (url, options = {}, timeoutMs = API_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    return response.json()
  } catch (err) {
    // Network-level failures (unreachable host) and timeouts mean the API is down
    if (err.name === 'AbortError') throw apiDownError()
    if (err instanceof TypeError) throw apiDownError()
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchDataQuality(tableName, fileDate) {
  return fetchWithTimeout(`${API_BASE}/data-quality/${encodeURIComponent(tableName)}/${encodeURIComponent(fileDate)}`)
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

  const rows = await fetchWithTimeout(
    `${API_BASE}/data-quality/${encodeURIComponent(tableName)}/file-dates?file_dates=${[...candidates].map(encodeURIComponent).join(',')}`
  )
  if (!Array.isArray(rows)) return { dates: [], trend: [] }

  const dates = [...new Set(rows.map((r) => r && r.file_date).filter((d) => typeof d === 'string' && d.length > 0))]
  dates.sort()

  const trend = dates
    .filter((date) => date !== OVERALL_DATE)
    .map((date) => {
      const dateRows = rows.filter((r) => r.file_date === date)
      const dimensions = dimensionsFromMetrics(dateRows)
      return { date, score: overallScore(dimensions), dimensions, rows: dateRows }
    })

  const index = { dates, trend }
  indexCache.set(tableName, index)
  return index
}

export default { fetchDataQuality, fetchTableIndex, clearIndexCache }

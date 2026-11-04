// GEO_API data-source files service
// Endpoint: GET /data-source-files
//
// The response contains every CSV found in the GEO_Download source folders.
// The view filters it by the selected source, so switching the dropdown does
// not need another request.
import { apiUrl, fetchWithTimeout } from './client.js'
import { API_PATHS } from '../config.js'

const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeFile = (file) => {
  if (!file || typeof file !== 'object') return null
  const sourceName = typeof file.source_name === 'string' ? file.source_name : ''
  const fileName = typeof file.file_name === 'string' ? file.file_name : ''
  if (!sourceName || !fileName) return null
  return {
    sourceName,
    fileName,
    snapshotDate: typeof file.snapshot_date === 'string' ? file.snapshot_date : null,
    createdAt: typeof file.created_at === 'string' ? file.created_at : null,
    records: asNumber(file.records),
    sizeKb: asNumber(file.size_kb),
  }
}

export async function fetchDataSourceFiles() {
  const data = await fetchWithTimeout(apiUrl(API_PATHS.dataSourceFiles))
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { sources: [], files: [], startDate: null, latestDate: null }
  }

  const files = Array.isArray(data.files)
    ? data.files.map(normalizeFile).filter(Boolean)
    : []
  const apiSources = Array.isArray(data.sources)
    ? data.sources.filter((source) => typeof source === 'string' && source.length > 0)
    : []
  const sources = [...new Set(apiSources.length ? apiSources : files.map((file) => file.sourceName))].sort()

  return {
    sources,
    files,
    startDate: typeof data.start_date === 'string' ? data.start_date : null,
    latestDate: typeof data.latest_date === 'string' ? data.latest_date : null,
  }
}

export default { fetchDataSourceFiles }

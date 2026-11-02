// GEO_API event-count service: aggregated union_etl counts.
//   GET /event-counts/category
//   GET /event-counts/location
import { apiUrl, fetchWithTimeout } from './client.js'
import { API_PATHS, EVENT_COUNTS_LIMIT } from '../config.js'

const withLimit = (path) => `${apiUrl(path)}?limit=${EVENT_COUNTS_LIMIT}`

export async function fetchEventCountsByCategory() {
  return fetchWithTimeout(withLimit(API_PATHS.eventCountsCategory))
}

export async function fetchEventCountsByLocation() {
  return fetchWithTimeout(withLimit(API_PATHS.eventCountsLocation))
}

export default { fetchEventCountsByCategory, fetchEventCountsByLocation }

// GEO_API event-count service: aggregated union_etl counts.
//   GET /event-counts/category
//   GET /event-counts/location
import { apiUrl, fetchWithTimeout } from './client.js'
import { API_PATHS } from '../config.js'

export async function fetchEventCountsByCategory() {
  return fetchWithTimeout(apiUrl(API_PATHS.eventCountsCategory))
}

export async function fetchEventCountsByLocation() {
  return fetchWithTimeout(apiUrl(API_PATHS.eventCountsLocation))
}

export default { fetchEventCountsByCategory, fetchEventCountsByLocation }

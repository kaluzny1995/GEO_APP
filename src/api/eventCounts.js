// GEO_API event-count service: aggregated union_etl counts.
//   GET /event-counts/category
//   GET /event-counts/location
import { apiUrl, fetchWithTimeout } from './client.js'

export async function fetchEventCountsByCategory() {
  return fetchWithTimeout(apiUrl('/event-counts/category'))
}

export async function fetchEventCountsByLocation() {
  return fetchWithTimeout(apiUrl('/event-counts/location'))
}

export default { fetchEventCountsByCategory, fetchEventCountsByLocation }

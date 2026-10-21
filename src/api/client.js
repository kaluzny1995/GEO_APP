import { API_BASE, API_TIMEOUT_MS, API_DOWN_MESSAGE } from '../config.js'

export const apiDownError = () => {
  const err = new Error(API_DOWN_MESSAGE)
  err.isConnectionError = true
  return err
}

export const apiUrl = (path) => `${API_BASE}${path}`

export const fetchWithTimeout = async (url, options = {}, timeoutMs = API_TIMEOUT_MS) => {
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

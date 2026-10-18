import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDataQuality } from './dataQuality.js'

describe('dataQuality API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('classifies network failures as API-down connection errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(fetchDataQuality('eonet_event', 'overall')).rejects.toMatchObject({
      message: 'API server is down! Please check the API server.',
      isConnectionError: true,
    })
  })

  it('classifies aborted requests (timeout) as API-down connection errors', async () => {
    const abortErr = new Error('The operation was aborted')
    abortErr.name = 'AbortError'
    globalThis.fetch = vi.fn().mockRejectedValue(abortErr)
    await expect(fetchDataQuality('eonet_event', 'overall')).rejects.toMatchObject({
      message: 'API server is down! Please check the API server.',
      isConnectionError: true,
    })
  })

  it('passes through HTTP errors without the connection flag', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })
    await expect(fetchDataQuality('eonet_event', 'overall')).rejects.toThrow(
      'HTTP 500: Internal Server Error'
    )
    try {
      await fetchDataQuality('eonet_event', 'overall')
    } catch (err) {
      expect(err.isConnectionError).toBeUndefined()
    }
  })
})

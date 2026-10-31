import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDataQuality, fetchTableIndex, clearIndexCache } from './dataQuality.js'
import { FILE_DATES_LIMIT, PROBE_WINDOW_DAYS } from '../config.js'

describe('dataQuality API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearIndexCache()
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

  describe('fetchTableIndex', () => {
    const mockApi = (calls) => {
      globalThis.fetch = vi.fn(async (url) => {
        const raw = new URL(url).searchParams.get('file_dates')
        const dates = decodeURIComponent(raw).split(',')
        calls.push(dates)
        return {
          ok: true,
          status: 200,
          json: async () =>
            dates.map((file_date) => ({
              table_name: 'union_etl',
              file_date,
              metric: 'total_records',
              value: 1,
              computed_at: '2026-09-21T02:15:00',
            })),
        }
      })
    }

    it('splits the probe into batches the API accepts (<= FILE_DATES_LIMIT)', async () => {
      const calls = []
      mockApi(calls)

      await fetchTableIndex('union_etl', 'overall')

      // The 120-day window plus `overall` exceeds the API's 100-date cap, so the
      // probe must be split — this is the regression that produced HTTP 422.
      expect(calls.length).toBeGreaterThan(1)
      for (const batch of calls) {
        expect(batch.length).toBeLessThanOrEqual(FILE_DATES_LIMIT)
      }
    })

    it('requests every candidate date exactly once across the batches', async () => {
      const calls = []
      mockApi(calls)

      const index = await fetchTableIndex('union_etl', 'overall')

      const allDates = calls.flat()
      expect(new Set(allDates).size).toBe(allDates.length)
      expect(allDates.length).toBe(PROBE_WINDOW_DAYS + 2) // `overall` + the 121-day window
      expect(index.dates).toContain('overall')
      expect(index.dates.length).toBe(allDates.length)
      // Trend excludes the `overall` aggregate snapshot.
      expect(index.trend.length).toBe(index.dates.length - 1)
    })

    it('merges rows from every batch into one sorted snapshot list', async () => {
      const calls = []
      mockApi(calls)

      const index = await fetchTableIndex('avalanche_org', 'overall')

      expect(index.dates).toEqual([...index.dates].sort())
    })
  })
})

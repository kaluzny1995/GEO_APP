import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDataQuantities } from './dataQuantity.js'

const respondWith = (rows) => ({ ok: true, json: async () => rows })

describe('dataQuantity API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches total_records for every requested table in parallel', async () => {
    const fetchMock = vi.fn(async (url) => {
      const target = String(url)
      if (target.includes('/data-quality/plain/2026-10-09')) {
        return respondWith([{ metric: 'total_records', value: '1200' }])
      }
      return respondWith([{ metric: 'total_records', value: 0 }])
    })
    globalThis.fetch = fetchMock

    const counts = await fetchDataQuantities(['plain', 'etl'], '2026-10-09')

    expect(counts).toEqual({ plain: 1200, etl: 0 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/data-quality/plain/2026-10-09'),
      expect.anything()
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/data-quality/etl/2026-10-09'),
      expect.anything()
    )
  })

  it('returns null when a table has no total_records metric', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      respondWith([{ metric: 'bad_row_pct', value: 8 }])
    )

    await expect(fetchDataQuantities(['plain'], 'overall')).resolves.toEqual({
      plain: null,
    })
  })

  it('propagates request failures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchDataQuantities(['plain'], 'overall')).rejects.toThrow(
      'HTTP 500: Internal Server Error'
    )
  })
})

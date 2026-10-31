import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDataQuantityDates, fetchDataQuantities } from './dataQuantity.js'
import { TABLE_NAMES } from '../config.js'

const respondWith = (body) => ({ ok: true, json: async () => body })

describe('dataQuantity API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the snapshot dates from the data-quantity endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respondWith(['2026-10-25', '', '2026-10-26', 'overall'])
    )
    globalThis.fetch = fetchMock

    const dates = await fetchDataQuantityDates()

    expect(dates).toEqual(['2026-10-25', '2026-10-26', 'overall'])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/data-quantity/dates'),
      expect.anything()
    )
  })

  it('fetches actual row counts for a snapshot and maps them by table', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respondWith([
        { table_name: 'eonet_event', file_date: '2026-10-26', count: 4 },
        { table_name: 'union_etl', file_date: '2026-10-26', count: '717' },
      ])
    )
    globalThis.fetch = fetchMock

    const counts = await fetchDataQuantities('2026-10-26')

    expect(counts).toEqual({ eonet_event: 4, union_etl: 717 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/data-quantity/2026-10-26'),
      expect.anything()
    )
  })

  it('ignores untracked tables and non-numeric counts', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      respondWith([
        { table_name: 'unexpected_table', count: 10 },
        { table_name: 'eonet_event', count: 'not-a-number' },
        { table_name: 'nifc_fire', count: 19 },
      ])
    )

    await expect(fetchDataQuantities('overall')).resolves.toEqual({ nifc_fire: 19 })
  })

  it('returns an empty object when the API returns a non-list body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(respondWith({ counts: [] }))

    await expect(fetchDataQuantities('overall')).resolves.toEqual({})
  })

  it('propagates request failures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchDataQuantities('overall')).rejects.toThrow(
      'HTTP 500: Internal Server Error'
    )
  })

  it('tracks every table configured in the app', () => {
    expect(TABLE_NAMES).toHaveLength(19)
    expect(TABLE_NAMES).toContain('union_etl')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchDataSourceFiles } from './dataSourceFiles.js'

describe('dataSourceFiles API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes the API payload and sorts source names', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        start_date: '2026-09-01',
        latest_date: '2026-09-03',
        sources: ['NIFC', 'EONET', 'EONET'],
        files: [
          {
            source_name: 'EONET',
            file_name: 'eonet_events_2026-09-01.csv',
            snapshot_date: '2026-09-01',
            created_at: '2026-10-04T00:14:50Z',
            records: 12,
            size_kb: 0.7,
          },
          { source_name: '', file_name: 'invalid.csv' },
        ],
      }),
    })

    const data = await fetchDataSourceFiles()

    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://localhost:8000/data-source-files')
    expect(data.sources).toEqual(['EONET', 'NIFC'])
    expect(data.startDate).toBe('2026-09-01')
    expect(data.latestDate).toBe('2026-09-03')
    expect(data.files).toEqual([
      {
        sourceName: 'EONET',
        fileName: 'eonet_events_2026-09-01.csv',
        snapshotDate: '2026-09-01',
        createdAt: '2026-10-04T00:14:50Z',
        records: 12,
        sizeKb: 0.7,
      },
    ])
  })

  it('keeps missing numeric fields as null', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sources: ['EONET'],
        files: [
          {
            source_name: 'EONET',
            file_name: 'undated.csv',
            snapshot_date: null,
            created_at: null,
            records: null,
            size_kb: null,
          },
        ],
      }),
    })

    const data = await fetchDataSourceFiles()

    expect(data.files[0]).toMatchObject({
      snapshotDate: null,
      createdAt: null,
      records: null,
      sizeKb: null,
    })
  })

  it('derives sources from files when the API omits the source list', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        files: [
          {
            source_name: 'USGS_Volcano',
            file_name: 'usgs_volcanoes_2026-09-09.csv',
            snapshot_date: '2026-09-09',
            created_at: '2026-10-07T19:32:00Z',
            records: 3,
            size_kb: 0.7,
          },
        ],
      }),
    })

    const data = await fetchDataSourceFiles()

    expect(data.sources).toEqual(['USGS_Volcano'])
    expect(data.startDate).toBeNull()
    expect(data.latestDate).toBeNull()
  })

  it('returns an empty payload for an invalid response body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    })

    await expect(fetchDataSourceFiles()).resolves.toEqual({
      sources: [],
      files: [],
      startDate: null,
      latestDate: null,
    })
  })

  it('classifies network failures as API-down connection errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchDataSourceFiles()).rejects.toMatchObject({
      message: 'API server is down! Please check the API server.',
      isConnectionError: true,
    })
  })
})

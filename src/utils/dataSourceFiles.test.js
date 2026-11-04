import { describe, expect, it } from 'vitest'
import {
  buildSourceRows,
  dateRange,
  formatCreatedAt,
  formatRecords,
  formatSizeKb,
  sortSourceRows,
} from './dataSourceFiles.js'

const file = (overrides = {}) => ({
  sourceName: 'EONET',
  fileName: 'eonet_events_2026-09-01.csv',
  snapshotDate: '2026-09-01',
  createdAt: '2026-10-04T00:14:50Z',
  records: 10,
  sizeKb: 1.2,
  ...overrides,
})

describe('dataSourceFiles helpers', () => {
  describe('dateRange', () => {
    it('returns every calendar date inclusively', () => {
      expect(dateRange('2026-09-01', '2026-09-03')).toEqual([
        '2026-09-01',
        '2026-09-02',
        '2026-09-03',
      ])
    })

    it('returns an empty list for invalid or reversed ranges', () => {
      expect(dateRange(null, '2026-09-03')).toEqual([])
      expect(dateRange('2026-09-03', '2026-09-01')).toEqual([])
      expect(dateRange('not-a-date', '2026-09-03')).toEqual([])
      expect(dateRange('2026-02-30', '2026-03-02')).toEqual([])
    })
  })

  describe('buildSourceRows', () => {
    it('inserts a missing row for every date without a file', () => {
      const rows = buildSourceRows(
        [
          file(),
          file({
            fileName: 'eonet_events_2026-09-03.csv',
            snapshotDate: '2026-09-03',
          }),
        ],
        'EONET',
        '2026-09-01',
        '2026-09-03'
      )

      expect(rows.map((row) => row.snapshotDate)).toEqual([
        '2026-09-01',
        '2026-09-02',
        '2026-09-03',
      ])
      expect(rows[1]).toMatchObject({
        sourceName: 'EONET',
        snapshotDate: '2026-09-02',
        fileName: null,
        createdAt: null,
        records: null,
        sizeKb: null,
        missing: true,
      })
      expect(rows.filter((row) => row.missing)).toHaveLength(1)
    })

    it('shows missing dates before a source first file when the range starts earlier', () => {
      const rows = buildSourceRows([file()], 'EONET', '2026-08-31', '2026-09-01')

      expect(rows).toHaveLength(2)
      expect(rows[0]).toMatchObject({ snapshotDate: '2026-08-31', missing: true })
      expect(rows[1]).toMatchObject({ snapshotDate: '2026-09-01', missing: false })
    })

    it('filters by source and keeps undated files visible', () => {
      const rows = buildSourceRows(
        [
          file(),
          file({ sourceName: 'NIFC', fileName: 'nifc_fires_2026-09-01.csv' }),
          file({ fileName: 'latest.csv', snapshotDate: null }),
        ],
        'EONET',
        '2026-09-01',
        '2026-09-01'
      )

      expect(rows).toHaveLength(2)
      expect(rows[0].fileName).toBe('eonet_events_2026-09-01.csv')
      expect(rows[1]).toMatchObject({ fileName: 'latest.csv', snapshotDate: null, missing: false })
    })
  })

  describe('sortSourceRows', () => {
    const rows = [
      file({ fileName: 'b.csv', records: 20, sizeKb: 2.5, snapshotDate: '2026-09-02' }),
      file({ fileName: 'a.csv', records: 10, sizeKb: 1.5, snapshotDate: '2026-09-01' }),
      {
        sourceName: 'EONET',
        fileName: null,
        snapshotDate: '2026-09-03',
        createdAt: null,
        records: null,
        sizeKb: null,
        missing: true,
      },
    ]

    it('sorts file names ascending and descending, keeping missing rows last', () => {
      expect(sortSourceRows(rows, 'fileName', 'asc').map((row) => row.fileName)).toEqual([
        'a.csv',
        'b.csv',
        null,
      ])
      expect(sortSourceRows(rows, 'fileName', 'desc').map((row) => row.fileName)).toEqual([
        'b.csv',
        'a.csv',
        null,
      ])
    })

    it('sorts records and size numerically', () => {
      expect(sortSourceRows(rows, 'records', 'asc').map((row) => row.records)).toEqual([10, 20, null])
      expect(sortSourceRows(rows, 'records', 'desc').map((row) => row.records)).toEqual([20, 10, null])
      expect(sortSourceRows(rows, 'sizeKb', 'asc').map((row) => row.sizeKb)).toEqual([1.5, 2.5, null])
    })

    it('keeps missing rows in chronological order when sorting by date', () => {
      expect(sortSourceRows(rows, 'snapshotDate', 'asc').map((row) => row.snapshotDate)).toEqual([
        '2026-09-01',
        '2026-09-02',
        '2026-09-03',
      ])
      expect(sortSourceRows(rows, 'snapshotDate', 'desc').map((row) => row.snapshotDate)).toEqual([
        '2026-09-03',
        '2026-09-02',
        '2026-09-01',
      ])
    })
  })

  describe('formatters', () => {
    it('formats records, sizes and missing values', () => {
      expect(formatRecords(12345)).toBe('12,345')
      expect(formatRecords(null)).toBe('—')
      expect(formatSizeKb(12.34)).toBe('12.3')
      expect(formatSizeKb(null)).toBe('—')
      expect(formatCreatedAt(null)).toBe('—')
      expect(formatCreatedAt('2026-10-04T00:14:50Z')).not.toBe('—')
    })
  })
})

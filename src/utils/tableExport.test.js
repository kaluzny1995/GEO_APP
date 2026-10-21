import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  downloadTable,
  matrixToTable,
  safeFilename,
  serializeCsv,
  serializeJson,
  serializeTable,
  serializeTxt,
  serializeXml,
} from './tableExport.js'

const TABLE = {
  title: 'Sample & table',
  filename: 'sample-table',
  columns: ['Name', 'Count', 'Note'],
  rows: [
    ['A, "quoted"', 2, 'line\nbreak'],
    ['B', 0, null],
  ],
}

const MATRIX = {
  total: 10,
  columns: [
    { name: 'Cat A', total: 6 },
    { name: 'Cat B', total: 4 },
  ],
  rows: [
    { name: 'SRC', total: 10, cells: { 'Cat A': 6, 'Cat B': 4 } },
  ],
}

describe('tableExport', () => {
  it('serializes CSV with headers, escaping and empty values', () => {
    expect(serializeCsv(TABLE)).toBe(
      'Name,Count,Note\n"A, ""quoted""",2,"line\nbreak"\nB,0,\n'
    )
  })

  it('serializes JSON as an array of row objects', () => {
    expect(JSON.parse(serializeJson(TABLE))).toEqual([
      { Name: 'A, "quoted"', Count: 2, Note: 'line\nbreak' },
      { Name: 'B', Count: 0, Note: null },
    ])
  })

  it('serializes XML with escaped fields', () => {
    const xml = serializeXml(TABLE)
    expect(xml).toContain('<table name="Sample &amp; table">')
    expect(xml).toContain('<field name="Name">A, &quot;quoted&quot;</field>')
    expect(xml).toContain('<field name="Note">line\nbreak</field>')
    expect(xml).toContain('<field name="Note"></field>')
  })

  it('serializes TXT as tab-separated rows', () => {
    expect(serializeTxt(TABLE)).toBe(
      'Name\tCount\tNote\nA, "quoted"\t2\tline\nbreak\nB\t0\t\n'
    )
  })

  it('rejects unsupported formats', () => {
    expect(() => serializeTable(TABLE, 'yaml')).toThrow(/Unsupported download format/)
    expect(() => downloadTable(TABLE, 'yaml')).toThrow(/Unsupported download format/)
  })

  it('builds safe filenames', () => {
    expect(safeFilename('Data-quality table · avalanche_org / overall')).toBe(
      'data-quality-table-avalanche_org-overall'
    )
    expect(safeFilename('')).toBe('table')
  })

  it('builds a matrix export in the displayed orientation', () => {
    const rows = matrixToTable({
      matrix: MATRIX,
      title: 'Event category by source',
      filename: 'event-category-by-source',
      rowLabel: 'Event category',
      columnLabel: 'Source',
      rowTotalLabel: 'All categories',
      columnTotalLabel: 'All sources',
    })

    expect(rows.columns).toEqual(['Event category', 'Cat A', 'Cat B', 'All sources'])
    expect(rows.rows).toEqual([
      ['SRC', 6, 4, 10],
      ['All categories', 6, 4, 10],
    ])
  })

  it('builds a transposed matrix export', () => {
    const rows = matrixToTable({
      matrix: MATRIX,
      transposed: true,
      title: 'Event category by source',
      filename: 'event-category-by-source-transposed',
      rowLabel: 'Event category',
      columnLabel: 'Source',
      rowTotalLabel: 'All categories',
      columnTotalLabel: 'All sources',
    })

    expect(rows.columns).toEqual(['Source', 'SRC', 'All categories'])
    expect(rows.rows).toEqual([
      ['Cat A', 6, 6],
      ['Cat B', 4, 4],
      ['All sources', 10, 10],
    ])
  })

  describe('downloadTable', () => {
    let clickSpy
    let clickedAnchor
    let createObjectUrl
    let revokeObjectUrl

    beforeEach(() => {
      createObjectUrl = vi.fn(() => 'blob:geo-table')
      revokeObjectUrl = vi.fn()
      URL.createObjectURL = createObjectUrl
      URL.revokeObjectURL = revokeObjectUrl
      clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
        clickedAnchor = this
      })
    })

    afterEach(() => {
      clickSpy.mockRestore()
      delete URL.createObjectURL
      delete URL.revokeObjectURL
    })

    it('creates a typed blob link, clicks it and revokes the URL', () => {
      downloadTable(TABLE, 'json')

      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
      expect(clickSpy).toHaveBeenCalledTimes(1)
      expect(clickedAnchor.download).toBe('sample-table.json')
      expect(clickedAnchor.href).toBe('blob:geo-table')
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:geo-table')
    })
  })
})

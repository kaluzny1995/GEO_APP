import { describe, it, expect } from 'vitest'
import {
  buildQuantityFlow,
  differenceLabel,
  differenceTone,
  formatQuantity,
  quantityDifference,
  sumQuantities,
  totalRecordsFromMetrics,
} from './dataQuantity.js'
import { TABLE_FLOW, TABLE_NAMES } from '../config.js'

const baseCounts = () => Object.fromEntries(TABLE_NAMES.map((table) => [table, 100]))

describe('dataQuantity utils', () => {
  it('formats quantities with the configured locale and handles missing values', () => {
    expect(formatQuantity(35799)).toBe('35,799')
    expect(formatQuantity('1200')).toBe('1,200')
    expect(formatQuantity(0)).toBe('0')
    expect(formatQuantity(null)).toBe('—')
    expect(formatQuantity(undefined)).toBe('—')
    expect(formatQuantity('')).toBe('—')
    expect(formatQuantity('not-a-number')).toBe('—')
  })

  it('extracts total_records from long-format metric rows', () => {
    expect(totalRecordsFromMetrics([
      { metric: 'bad_row_pct', value: 1.5 },
      { metric: 'total_records', value: '145' },
    ])).toBe(145)
    expect(totalRecordsFromMetrics([{ metric: 'total_records', value: 0 }])).toBe(0)
    expect(totalRecordsFromMetrics([{ metric: 'total_records', value: null }])).toBeNull()
    expect(totalRecordsFromMetrics([{ metric: 'bad_row_pct', value: 3 }])).toBeNull()
    expect(totalRecordsFromMetrics(null)).toBeNull()
  })

  it('sums known quantities and ignores missing values', () => {
    expect(sumQuantities([100, null, 25, undefined, 5])).toBe(130)
    expect(sumQuantities([0, null])).toBe(0)
    expect(sumQuantities([])).toBeNull()
    expect(sumQuantities(null)).toBeNull()
  })

  it('computes differences and labels only when both counts are known', () => {
    expect(quantityDifference(100, 90)).toBe(10)
    expect(quantityDifference(90, 100)).toBe(-10)
    expect(quantityDifference(null, 100)).toBeNull()
    expect(quantityDifference(100, null)).toBeNull()

    expect(differenceLabel(10)).toBe('10 filtered out')
    expect(differenceLabel(-5)).toBe('5 more in ETL')
    expect(differenceLabel(0)).toBe('No rows filtered')
    expect(differenceLabel(null)).toBe('No count')

    expect(differenceTone(1)).toBe('filtered')
    expect(differenceTone(-1)).toBe('added')
    expect(differenceTone(0)).toBe('even')
    expect(differenceTone(null)).toBe('missing')
  })

  it('builds one flow row per configured plain/ETL pair', () => {
    const counts = baseCounts()
    counts.eonet_event = 120
    counts.eonet_event_etl = 100
    counts.ibtracs_cyclone = 100
    counts.ibtracs_cyclone_etl = 105
    delete counts.usgs_earthquake

    const flows = buildQuantityFlow(counts)

    expect(flows).toHaveLength(TABLE_FLOW.length)
    expect(flows).toHaveLength(9)
    expect(flows.map(({ plain, etl }) => ({ plain, etl }))).toEqual(TABLE_FLOW)

    expect(flows.find((flow) => flow.plain === 'eonet_event')).toMatchObject({
      plainCount: 120,
      etlCount: 100,
      difference: 20,
      differenceLabel: '20 filtered out',
      differenceTone: 'filtered',
    })
    expect(flows.find((flow) => flow.plain === 'nifc_fire')).toMatchObject({
      difference: 0,
      differenceLabel: 'No rows filtered',
      differenceTone: 'even',
    })
    expect(flows.find((flow) => flow.plain === 'ibtracs_cyclone')).toMatchObject({
      difference: -5,
      differenceLabel: '5 more in ETL',
      differenceTone: 'added',
    })
    expect(flows.find((flow) => flow.plain === 'usgs_earthquake')).toMatchObject({
      plainCount: null,
      etlCount: 100,
      difference: null,
      differenceLabel: 'No count',
      differenceTone: 'missing',
    })
  })
})

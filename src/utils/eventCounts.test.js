import { describe, it, expect } from 'vitest'
import {
  categorySourceMatrix,
  countryRegion,
  dangerLevel,
  eventCountRows,
  formatCount,
  formatPercent,
  isUnrated,
  sourceRegionMatrix,
  summarizeEventCounts,
} from './eventCounts.js'
import { COUNTRY_REGIONS, REGION_ORDER } from '../config.js'

const CATEGORY_ROWS = [
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'none', count: 50 },
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'low', count: 10 },
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'high', count: 30 },
  { source_name: 'EONET', subsource_name: null, event_category: 'storm', event_subcategory: null, danger_rating: 'no_rating', count: 10 },
]

const LOCATION_ROWS = [
  { source_name: 'OPENMETEO', subsource_name: 'GLOFAS', country_code: 'PL', state_province: null, danger_rating: 'extreme', count: 3 },
  { source_name: 'OPENMETEO', subsource_name: 'GLOFAS', country_code: 'PL', state_province: null, danger_rating: 'low', count: 1 },
  { source_name: 'GDACS', subsource_name: null, country_code: 'US', state_province: 'CA', danger_rating: 'high', count: 2 },
]

describe('eventCounts utils', () => {
  it('normalizes danger levels and flags ratings outside the four levels', () => {
    expect(dangerLevel(' HIGH ')).toBe('high')
    expect(dangerLevel('Extreme')).toBe('extreme')
    expect(dangerLevel('none')).toBeNull()
    expect(dangerLevel('no_rating')).toBeNull()
    expect(dangerLevel(null)).toBeNull()

    expect(isUnrated('none')).toBe(true)
    expect(isUnrated('no_rating')).toBe(true)
    expect(isUnrated('low')).toBe(false)
    expect(isUnrated(null)).toBe(true)
  })

  it('summarizes total and per-level counts with shares', () => {
    const summary = summarizeEventCounts(CATEGORY_ROWS)

    expect(summary.total).toBe(100)
    expect(summary.unrated).toBe(60)
    expect(summary.levels.low).toEqual({ count: 10, share: 10 })
    expect(summary.levels.medium.count).toBe(0)
    expect(summary.levels.high).toEqual({ count: 30, share: 30 })
    expect(summary.levels.extreme.count).toBe(0)
  })

  it('groups category rows by source/subsource/category/subcategory', () => {
    const rows = eventCountRows(CATEGORY_ROWS, 'category')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      source: 'GDACS',
      subsource: 'GWIS',
      primary: 'fire',
      secondary: 'wildfire',
      count: 90,
      share: 90,
    })
    expect(rows[0].levels).toEqual({ low: 10, medium: 0, high: 30, extreme: 0 })
    expect(rows[0].levelShares.low).toBeCloseTo(11.111, 3)
    expect(rows[0].levelShares.high).toBeCloseTo(33.333, 3)
    expect(rows[1]).toMatchObject({ source: 'EONET', subsource: '—', primary: 'storm', secondary: '—', count: 10 })
  })

  it('groups location rows by country/state and uses placeholders for missing values', () => {
    const rows = eventCountRows(LOCATION_ROWS, 'location')

    expect(rows[0]).toMatchObject({ source: 'OPENMETEO', primary: 'PL', secondary: '—', count: 4 })
    expect(rows[0].levelShares.extreme).toBeCloseTo(75, 5)
    expect(rows[1]).toMatchObject({ source: 'GDACS', primary: 'US', secondary: 'CA', count: 2 })
  })

  it('builds a category × source matrix with row and column totals', () => {
    const matrix = categorySourceMatrix(CATEGORY_ROWS)

    expect(matrix.total).toBe(100)
    expect(matrix.columns).toEqual([
      { name: 'EONET', total: 10 },
      { name: 'GDACS', total: 90 },
    ])
    expect(matrix.rows).toEqual([
      { name: 'fire', total: 90, cells: { GDACS: 90 } },
      { name: 'storm', total: 10, cells: { EONET: 10 } },
    ])
  })

  it('maps country codes to region groups', () => {
    expect(countryRegion('US')).toBe('USA')
    expect(countryRegion('pr')).toBe('USA')
    expect(countryRegion('CA')).toBe('Canada')
    expect(countryRegion('MX')).toBe('South and Central America')
    expect(countryRegion('BR')).toBe('South and Central America')
    expect(countryRegion('RU')).toBe('Europe')
    expect(countryRegion('CY')).toBe('Europe')
    expect(countryRegion('JP')).toBe('Asia')
    expect(countryRegion('ZA')).toBe('Africa')
    expect(countryRegion('AU')).toBe('Oceania')
    expect(countryRegion('ZZ')).toBe('Waters/Oceans')
    expect(countryRegion('AQ')).toBe('Antarctica')
    expect(countryRegion('XX')).toBe('Other')
    expect(countryRegion(null)).toBe('Other')
    expect(countryRegion(' us ')).toBe('USA')
  })

  it('assigns every configured country code to exactly one region', () => {
    const codes = Object.values(COUNTRY_REGIONS).flat()
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('keeps every region group in the configured column order', () => {
    expect(Object.keys(COUNTRY_REGIONS)).toEqual(REGION_ORDER)
  })

  it('builds a source × region matrix in the configured region order', () => {
    const matrix = sourceRegionMatrix(LOCATION_ROWS)

    expect(matrix.total).toBe(6)
    expect(matrix.columns.map((column) => column.name)).toEqual([
      'USA',
      'Canada',
      'South and Central America',
      'Europe',
      'Asia',
      'Africa',
      'Oceania',
      'Waters/Oceans',
      'Antarctica',
    ])
    expect(matrix.columns.find((column) => column.name === 'Europe')).toEqual({ name: 'Europe', total: 4 })
    expect(matrix.rows).toEqual([
      { name: 'GDACS', total: 2, cells: { USA: 2 } },
      { name: 'OPENMETEO', total: 4, cells: { Europe: 4 } },
    ])
  })

  it('formats counts and percentages with the configured locale', () => {
    expect(formatCount(35799)).toBe('35,799')
    expect(formatPercent(12.345)).toBe('12.3%')
  })
})

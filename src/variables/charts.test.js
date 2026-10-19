import { describe, it, expect } from 'vitest'
import { passRateBarOptions } from './charts.js'

describe('passRateBarOptions', () => {
  it('starts the y-axis just below the weakest rule', () => {
    const opts = passRateBarOptions([92, 97, 95, 98])
    expect(opts.scales.y.min).toBe(90)
    expect(opts.scales.y.max).toBe(100)
  })

  it('caps the axis at 95 when all rules are near-perfect', () => {
    expect(passRateBarOptions([100, 99, 100]).scales.y.min).toBe(95)
  })

  it('keeps the full range for low pass rates and never goes below zero', () => {
    expect(passRateBarOptions([72, 60]).scales.y.min).toBe(60)
    expect(passRateBarOptions([0, 12]).scales.y.min).toBe(0)
  })

  it('defaults to a 95-100 axis for empty input', () => {
    expect(passRateBarOptions([]).scales.y.min).toBe(95)
  })
})

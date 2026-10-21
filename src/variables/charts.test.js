import { describe, it, expect } from 'vitest'
import { heatTextColor, passRateBarOptions } from './charts.js'

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

describe('heatTextColor', () => {
  it('blends from a readable gray to the accent color', () => {
    expect(heatTextColor('#00f2c3', 0)).toBe('rgb(138, 138, 154)')
    expect(heatTextColor('#00f2c3', 1)).toBe('rgb(0, 242, 195)')
    expect(heatTextColor('#e14eca', 0.5)).toBe('rgb(182, 108, 178)')
  })

  it('clamps intensity to the 0-1 range', () => {
    expect(heatTextColor('#fd5d93', -1)).toBe('rgb(138, 138, 154)')
    expect(heatTextColor('#fd5d93', 2)).toBe('rgb(253, 93, 147)')
  })
})

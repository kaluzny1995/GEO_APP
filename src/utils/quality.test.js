import { describe, it, expect } from 'vitest'
import { dimensionsFromMetrics, overallScore, toneFor, changeTone } from './quality.js'

describe('quality utils', () => {
  describe('overallScore', () => {
    it('calculates average of metrics', () => {
      const metrics = { completeness: 90, validity: 80, uniqueness: 70, consistency: 60 }
      expect(overallScore(metrics)).toBe(75)
    })

    it('returns 0 for empty metrics', () => {
      expect(overallScore({})).toBe(0)
    })

    it('handles single metric', () => {
      expect(overallScore({ completeness: 85 })).toBe(85)
    })

    it('rounds correctly', () => {
      const metrics = { a: 10, b: 20, c: 30 }
      expect(overallScore(metrics)).toBe(20)
    })
  })

  describe('dimensionsFromMetrics', () => {
    const rows = [
      { metric: 'bad_row_pct', value: 8 },
      { metric: 'dup_row_pct', value: 3 },
      { metric: 'null_pct__a', value: 5 },
      { metric: 'null_pct__b', value: 2 },
      { metric: 'bad_pct__latitude_range', value: 1 },
      { metric: 'bad_pct__longitude_range', value: 2 },
      { metric: 'bad_pct__not_blank__event_id', value: 50 },
    ]

    it('computes all four DAMA dimensions from long-format rows', () => {
      expect(dimensionsFromMetrics(rows)).toEqual({
        completeness: 97,
        validity: 92,
        uniqueness: 97,
        consistency: 99,
      })
    })

    it('includes domain/range rules but excludes blank checks for consistency', () => {
      const withDomainRule = [...rows, { metric: 'bad_pct__acres_non_negative', value: 6 }]
      // mean(1, 2, 6) = 3 -> 97; the not_blank check (50) is excluded
      expect(dimensionsFromMetrics(withDomainRule).consistency).toBe(97)
    })

    it('returns null consistency when only blank checks exist', () => {
      const blankOnly = [
        { metric: 'bad_pct__not_blank__a', value: 10 },
        { metric: 'bad_pct__not_blank__b', value: 20 },
      ]
      expect(dimensionsFromMetrics(blankOnly).consistency).toBeNull()
    })

    it('returns nulls when no metrics are present', () => {
      expect(dimensionsFromMetrics([])).toEqual({
        completeness: null,
        validity: null,
        uniqueness: null,
        consistency: null,
      })
    })

    it('tolerates invalid input', () => {
      expect(dimensionsFromMetrics(null)).toEqual({
        completeness: null,
        validity: null,
        uniqueness: null,
        consistency: null,
      })
    })
  })

  describe('changeTone', () => {
    it('returns ok for improvements and bad for regressions', () => {
      expect(changeTone(2)).toBe('ok')
      expect(changeTone(-2)).toBe('bad')
    })

    it('returns warn for no change or missing delta', () => {
      expect(changeTone(0)).toBe('warn')
      expect(changeTone(null)).toBe('warn')
    })

    it('inverts when an increase is bad (fail rate)', () => {
      expect(changeTone(1, true)).toBe('bad')
      expect(changeTone(-1, true)).toBe('ok')
      expect(changeTone(0, true)).toBe('warn')
    })
  })

  describe('toneFor', () => {
    it('returns ok for >= 90', () => {
      expect(toneFor(90)).toBe('ok')
      expect(toneFor(100)).toBe('ok')
    })

    it('returns warn for 75-89', () => {
      expect(toneFor(75)).toBe('warn')
      expect(toneFor(89)).toBe('warn')
    })

    it('returns bad for < 75', () => {
      expect(toneFor(74)).toBe('bad')
      expect(toneFor(0)).toBe('bad')
    })
  })
})
import { describe, it, expect } from 'vitest'
import { datasets, kpis, gaugesFor } from './mockData.js'

describe('mockData', () => {
  describe('datasets', () => {
    it('has 3 datasets', () => {
      expect(datasets).toHaveLength(3)
    })

    it('each dataset has required fields', () => {
      datasets.forEach((ds) => {
        expect(ds).toHaveProperty('id')
        expect(ds).toHaveProperty('name')
        expect(ds).toHaveProperty('metrics')
        expect(ds).toHaveProperty('trend')
        expect(ds).toHaveProperty('rules')
      })
    })

    it('metrics have all four dimensions', () => {
      datasets.forEach((ds) => {
        expect(ds.metrics).toHaveProperty('completeness')
        expect(ds.metrics).toHaveProperty('validity')
        expect(ds.metrics).toHaveProperty('uniqueness')
        expect(ds.metrics).toHaveProperty('consistency')
      })
    })

    it('trend has month and score', () => {
      datasets.forEach((ds) => {
        ds.trend.forEach((t) => {
          expect(t).toHaveProperty('month')
          expect(t).toHaveProperty('score')
        })
      })
    })

    it('rules have id, rule, scope, passRate, fails, status', () => {
      datasets.forEach((ds) => {
        ds.rules.forEach((r) => {
          expect(r).toHaveProperty('id')
          expect(r).toHaveProperty('rule')
          expect(r).toHaveProperty('scope')
          expect(r).toHaveProperty('passRate')
          expect(r).toHaveProperty('fails')
          expect(r).toHaveProperty('status')
        })
      })
    })
  })

  describe('kpis', () => {
    it('has 4 KPIs', () => {
      expect(kpis).toHaveLength(4)
    })

    it('each KPI has id, label, value, delta, up', () => {
      kpis.forEach((k) => {
        expect(k).toHaveProperty('id')
        expect(k).toHaveProperty('label')
        expect(k).toHaveProperty('value')
        expect(k).toHaveProperty('delta')
        expect(k).toHaveProperty('up')
      })
    })
  })

  describe('gaugesFor', () => {
    it('returns 4 gauges for a dataset', () => {
      const gauges = gaugesFor(datasets[0])
      expect(gauges).toHaveLength(4)
    })

    it('each gauge has id, label, value', () => {
      const gauges = gaugesFor(datasets[0])
      gauges.forEach((g) => {
        expect(g).toHaveProperty('id')
        expect(g).toHaveProperty('label')
        expect(g).toHaveProperty('value')
      })
    })

    it('gauge ids match metric keys', () => {
      const gauges = gaugesFor(datasets[0])
      const ids = gauges.map((g) => g.id).sort()
      expect(ids).toEqual(['completeness', 'consistency', 'uniqueness', 'validity'])
    })
  })
})
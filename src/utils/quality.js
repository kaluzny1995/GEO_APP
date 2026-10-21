import { QUALITY_METRICS, SCORE_DECIMALS, SCORE_THRESHOLDS, SCORE_LABELS } from '../config.js'

// Scores are floored (never rounded up): rounding would show 100% for tables
// that still have (small) defects, e.g. 99.8% -> 100%.
const SCORE_FACTOR = 10 ** SCORE_DECIMALS
const floorScore = (value) => Math.floor(value * SCORE_FACTOR + 1e-9) / SCORE_FACTOR

export function overallScore(metrics) {
  if (!metrics || typeof metrics !== 'object') return 0
  const vals = Object.values(metrics).filter((v) => typeof v === 'number')
  if (!vals.length) return 0
  return floorScore(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function toneFor(value) {
  if (value >= SCORE_THRESHOLDS.good) return 'ok'
  if (value >= SCORE_THRESHOLDS.warn) return 'warn'
  return 'bad'
}

export function scoreLabel(value) {
  return SCORE_LABELS[toneFor(value)]
}

// Tone for a change indicator: green = improvement, red = regression,
// yellow = no change. Pass invert when an increase is bad (e.g. fail rate).
export function changeTone(delta, invert = false) {
  if (typeof delta !== 'number' || delta === 0) return 'warn'
  const improved = invert ? delta < 0 : delta > 0
  return improved ? 'ok' : 'bad'
}

const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length

// Map long-format metric rows to DAMA-DMBOK quality dimensions.
// Dimension values are null when no underlying metric is present.
export function dimensionsFromMetrics(rows) {
  const metrics = Array.isArray(rows) ? rows.filter((r) => r && typeof r.metric === 'string') : []

  const nullPcts = metrics
    .filter((r) => r.metric.startsWith(QUALITY_METRICS.nullPctPrefix))
    .map((r) => r.value)
  const completeness = nullPcts.length ? floorScore(100 - mean(nullPcts)) : null

  const badRow = metrics.find((r) => r.metric === QUALITY_METRICS.badRowPct)
  const validity = badRow ? floorScore(100 - badRow.value) : null

  const dupRow = metrics.find((r) => r.metric === QUALITY_METRICS.dupRowPct)
  const uniqueness = dupRow ? floorScore(100 - dupRow.value) : null

  // Consistency = domain/range/logic rules (all bad_pct__ checks except
  // blank checks, which are completeness/validity concerns).
  const badPcts = metrics
    .filter(
      (r) =>
        r.metric.startsWith(QUALITY_METRICS.badPctPrefix) &&
        !r.metric.includes(QUALITY_METRICS.notBlank)
    )
    .map((r) => r.value)
  const consistency = badPcts.length ? floorScore(100 - mean(badPcts)) : null

  return { completeness, validity, uniqueness, consistency }
}

export function overallScore(metrics) {
  if (!metrics || typeof metrics !== 'object') return 0
  const vals = Object.values(metrics).filter((v) => typeof v === 'number')
  if (!vals.length) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function toneFor(value) {
  if (value >= 90) return 'ok'
  if (value >= 75) return 'warn'
  return 'bad'
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

  const nullPcts = metrics.filter((r) => r.metric.startsWith('null_pct__')).map((r) => r.value)
  const completeness = nullPcts.length ? Math.round(100 - mean(nullPcts)) : null

  const badRow = metrics.find((r) => r.metric === 'bad_row_pct')
  const validity = badRow ? Math.round(100 - badRow.value) : null

  const dupRow = metrics.find((r) => r.metric === 'dup_row_pct')
  const uniqueness = dupRow ? Math.round(100 - dupRow.value) : null

  // Consistency = domain/range/logic rules (all bad_pct__ checks except
  // blank checks, which are completeness/validity concerns).
  const badPcts = metrics
    .filter((r) => r.metric.startsWith('bad_pct__') && !r.metric.includes('not_blank__'))
    .map((r) => r.value)
  const consistency = badPcts.length ? Math.round(100 - mean(badPcts)) : null

  return { completeness, validity, uniqueness, consistency }
}

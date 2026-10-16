export function overallScore(metrics) {
  const vals = Object.values(metrics)
  if (!vals.length) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function toneFor(value) {
  if (value >= 90) return 'ok'
  if (value >= 75) return 'warn'
  return 'bad'
}

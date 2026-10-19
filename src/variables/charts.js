// Chart.js defaults for dark Black-Dashboard-like theme
export const chartColors = {
  primary: '#e14eca',
  primarySoft: 'rgba(225,78,202,0.2)',
  info: '#1d8cf8',
  success: '#00f2c3',
  warning: '#ff8d72',
  danger: '#fd5d93',
  grid: 'rgba(255,255,255,0.08)',
  tick: '#9a9a9a',
  label: '#d4d4e0',
}

// Y-axis for pass-rate bar charts: zoom in on the weakest value (rounded down
// to a 5% step, never above 95) so small differences between high scores stay
// visible instead of every bar looking like a full 100% block.
export function passRateBarOptions(values = []) {
  const weakest = values.length ? Math.min(...values) : 100
  const min = Math.min(95, Math.max(0, Math.floor(weakest / 5) * 5))
  return baseOptions({
    scales: {
      x: { grid: { color: chartColors.grid }, ticks: { color: chartColors.tick } },
      y: { min, max: 100, grid: { color: chartColors.grid }, ticks: { color: chartColors.tick } },
    },
  })
}

// Radar chart for the four DAMA dimensions (0-100 scale).
export function radarOptions() {
  return baseOptions({
    scales: {
      r: {
        min: 0,
        max: 100,
        grid: { color: chartColors.grid },
        pointLabels: { color: chartColors.label },
        ticks: { color: chartColors.tick, stepSize: 20, backdropColor: 'transparent' },
      },
    },
    elements: {
      line: { borderWidth: 2 },
    },
  })
}

export function baseOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartColors.label, boxWidth: 12 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.tick },
      },
      y: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.tick },
      },
    },
    ...extra,
  }
}

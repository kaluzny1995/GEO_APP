// Chart.js defaults for dark Black-Dashboard-like theme
export const chartColors = {
  primary: '#e14eca',
  info: '#1d8cf8',
  success: '#00f2c3',
  warning: '#ff8d72',
  danger: '#fd5d93',
  grid: 'rgba(255,255,255,0.08)',
  tick: '#9a9a9a',
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

export function baseOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#d4d4e0', boxWidth: 12 } },
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

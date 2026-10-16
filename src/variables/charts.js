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

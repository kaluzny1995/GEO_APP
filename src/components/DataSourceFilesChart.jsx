import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { chartColors } from '../variables/charts.js'
import { formatRecords, formatSizeKb } from '../utils/dataSourceFiles.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const MISSING_LABEL = 'Missing date'

// Draw a soft red band behind every date that has no CSV, so missing
// snapshots stay visible even when both series break at that x position.
const missingBandsPlugin = {
  id: 'dataSourceFilesMissingBands',
  beforeDatasetsDraw(chart) {
    const missing = chart.data.datasets.find((dataset) => dataset.label === MISSING_LABEL)
    if (!missing || !chart.chartArea || !chart.scales?.x) return

    const { ctx, chartArea } = chart
    const slot = (chartArea.right - chartArea.left) / Math.max(1, missing.data.length)

    ctx.save()
    ctx.fillStyle = 'rgba(253, 93, 147, 0.12)'
    missing.data.forEach((value, index) => {
      if (value === null || value === undefined) return
      const x = chart.scales.x.getPixelForValue(index)
      ctx.fillRect(x - slot / 2, chartArea.top, slot, chartArea.bottom - chartArea.top)
    })
    ctx.restore()
  },
}

const buildData = (timeline) => ({
  labels: timeline.labels,
  datasets: [
    {
      label: 'Records',
      data: timeline.records,
      yAxisID: 'records',
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primarySoft,
      pointBackgroundColor: chartColors.primary,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.25,
      spanGaps: false,
    },
    {
      label: 'Size (kB)',
      data: timeline.sizes,
      yAxisID: 'size',
      borderColor: chartColors.info,
      backgroundColor: 'rgba(29, 140, 248, 0.2)',
      pointBackgroundColor: chartColors.info,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.25,
      spanGaps: false,
    },
    {
      label: MISSING_LABEL,
      data: timeline.missing,
      yAxisID: 'records',
      showLine: false,
      pointStyle: 'crossRot',
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: chartColors.danger,
      pointBorderColor: chartColors.danger,
      pointBorderWidth: 2,
    },
  ],
})

const buildOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: chartColors.label, boxWidth: 12, usePointStyle: true } },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (context) => {
          if (context.dataset.label === MISSING_LABEL) return 'Missing date — no CSV'
          if (context.dataset.yAxisID === 'records') {
            return `Records: ${formatRecords(context.parsed.y)}`
          }
          return `Size: ${formatSizeKb(context.parsed.y)} kB`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: chartColors.grid },
      ticks: { color: chartColors.tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
    },
    records: {
      type: 'linear',
      position: 'left',
      beginAtZero: true,
      grid: { color: chartColors.grid },
      ticks: { color: chartColors.tick, callback: (value) => formatRecords(value) },
      title: { display: true, text: 'Records', color: chartColors.label },
    },
    size: {
      type: 'linear',
      position: 'right',
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      ticks: { color: chartColors.tick, callback: (value) => `${formatSizeKb(value)} kB` },
      title: { display: true, text: 'Size (kB)', color: chartColors.label },
    },
  },
})

export default function DataSourceFilesChart({ timeline }) {
  return <Line data={buildData(timeline)} options={buildOptions()} plugins={[missingBandsPlugin]} />
}

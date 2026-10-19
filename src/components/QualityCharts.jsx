import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { baseOptions, chartColors, passRateBarOptions } from '../variables/charts.js'
import { SCORE_THRESHOLDS } from '../config.js'

// Register Chart.js components at module load time
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

export default function QualityCharts({ dataset }) {

  const trendLabels = dataset.trend.map((t) => t.month)
  const trendData = dataset.trend.map((t) => t.score)

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: `${dataset.name} score`,
        data: trendData,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primarySoft,
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const passRates = dataset.rules.map((r) => r.passRate)

  const barData = {
    labels: dataset.rules.map((r) => r.id),
    datasets: [
      {
        label: 'Pass %',
        data: passRates,
        backgroundColor: dataset.rules.map((r) =>
          r.passRate >= SCORE_THRESHOLDS.good
            ? chartColors.success
            : r.passRate >= SCORE_THRESHOLDS.warn
              ? chartColors.warning
              : chartColors.danger
        ),
      },
    ],
  }

  const doughnutData = {
    labels: ['Pass', 'Warn', 'Fail'],
    datasets: [
      {
        data: [
          dataset.rules.filter((r) => r.status === 'pass').length,
          dataset.rules.filter((r) => r.status === 'warn').length,
          dataset.rules.filter((r) => r.status === 'fail').length,
        ],
        backgroundColor: [chartColors.success, chartColors.warning, chartColors.danger],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="charts">
      <div className="card">
        <h3>Quality trend</h3>
        <p className="sub muted">Overall score over time</p>
        <div style={{ height: 240 }}>
          <Line data={lineData} options={baseOptions()} />
        </div>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Rule pass %</h3>
          <p className="sub muted">Per-rule bar chart</p>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={passRateBarOptions(passRates)} />
          </div>
        </div>
        <div className="card">
          <h3>Rule status</h3>
          <p className="sub muted">Pass / warn / fail split</p>
          <div style={{ height: 220 }}>
            <Doughnut
              data={doughnutData}
              options={{ ...baseOptions(), scales: {} }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

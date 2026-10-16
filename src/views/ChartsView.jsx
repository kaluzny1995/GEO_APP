import QualityCharts from '../components/QualityCharts.jsx'
import { datasets } from '../data/mockData.js'

export default function ChartsView({ datasetId, onDatasetChange }) {
  const dataset = datasets.find((d) => d.id === datasetId) ?? datasets[0]
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Charts</h2>
          <p className="muted">Trend · per-rule bars · status doughnut (Chart.js)</p>
        </div>
        <select value={dataset.id} onChange={(e) => onDatasetChange(e.target.value)}>
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <QualityCharts dataset={dataset} />
    </>
  )
}

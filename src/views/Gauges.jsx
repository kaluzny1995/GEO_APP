import GaugeCard from '../components/GaugeCard.jsx'
import { datasets, gaugesFor } from '../data/mockData.js'
import { overallScore } from '../utils/quality.js'

export default function Gauges({ datasetId, onDatasetChange }) {
  const dataset = datasets.find((d) => d.id === datasetId) ?? datasets[0]
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Gauges</h2>
          <p className="muted">
            {dataset.name} · overall {overallScore(dataset.metrics)}%
          </p>
        </div>
        <select value={dataset.id} onChange={(e) => onDatasetChange(e.target.value)}>
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="card">
        <h3>Dimension scores</h3>
        <p className="sub muted">SVG gauges — no extra gauge library needed.</p>
        <div className="gauges">
          {gaugesFor(dataset).map((g) => (
            <GaugeCard key={g.id} {...g} />
          ))}
        </div>
      </div>
    </>
  )
}

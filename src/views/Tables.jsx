import DataQualityTable from '../components/DataQualityTable.jsx'
import { datasets } from '../data/mockData.js'

export default function Tables({ datasetId, onDatasetChange }) {
  const dataset = datasets.find((d) => d.id === datasetId) ?? datasets[0]
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Data-quality tables</h2>
          <p className="muted">Sortable + filterable rule results</p>
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
        <h3>{dataset.name} — {dataset.rules.length} rules</h3>
        <p className="sub muted">Click headers to sort, type to filter.</p>
        <DataQualityTable rows={dataset.rules} />
      </div>
    </>
  )
}

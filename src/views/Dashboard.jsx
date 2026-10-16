import { useMemo, useState } from 'react'
import StatCard from '../components/StatCard.jsx'
import DataQualityTable from '../components/DataQualityTable.jsx'
import QualityCharts from '../components/QualityCharts.jsx'
import GaugeCard from '../components/GaugeCard.jsx'
import Badge from '../components/Badge.jsx'
import { datasets, kpis, gaugesFor } from '../data/mockData.js'
import { overallScore } from '../utils/quality.js'

export default function Dashboard({ datasetId, onDatasetChange }) {
  const dataset = useMemo(
    () => datasets.find((d) => d.id === datasetId) ?? datasets[0],
    [datasetId]
  )
  const score = overallScore(dataset.metrics)

  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Data-quality overview</h2>
          <p className="muted">
            {dataset.name} · overall <strong style={{ color: '#fff' }}>{score}%</strong>{' '}
            <Badge tone={score >= 90 ? 'ok' : score >= 75 ? 'warn' : 'bad'}>
              {score >= 90 ? 'Healthy' : score >= 75 ? 'Needs attention' : 'Critical'}
            </Badge>
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

      <div className="grid stats">
        {kpis.map((k) => (
          <StatCard key={k.id} {...k} />
        ))}
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <QualityCharts dataset={dataset} />
        <div className="card">
          <h3>Quality gauges</h3>
          <p className="sub muted">≥90 good · 75–89 warning · &lt;75 critical</p>
          <div className="gauges">
            {gaugesFor(dataset).map((g) => (
              <GaugeCard key={g.id} {...g} />
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Data-quality table</h3>
        <p className="sub muted">Rule-level checks for {dataset.name}</p>
        <DataQualityTable rows={dataset.rules} />
      </div>
    </>
  )
}

// keep useState import used via wrapper below (Vite lint safe)
export function useDataset(initial) {
  const [id, setId] = useState(initial)
  return [id, setId]
}

import { useMemo, useState } from 'react'
import StatCard from '../components/StatCard.jsx'
import DataQualityTable from '../components/DataQualityTable.jsx'
import QualityCharts from '../components/QualityCharts.jsx'
import GaugeCard from '../components/GaugeCard.jsx'
import Badge from '../components/Badge.jsx'
import { datasets, kpis, gaugesFor } from '../data/mockData.js'
import { overallScore, toneFor, scoreLabel } from '../utils/quality.js'
import { SCORE_THRESHOLDS } from '../config.js'

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
            <Badge tone={toneFor(score)}>{scoreLabel(score)}</Badge>
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
          <p className="sub muted">
            ≥{SCORE_THRESHOLDS.good} good · {SCORE_THRESHOLDS.warn}–{SCORE_THRESHOLDS.good - 1} warning · &lt;
            {SCORE_THRESHOLDS.warn} critical
          </p>
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

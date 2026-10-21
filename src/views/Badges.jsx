import Badge from '../components/Badge.jsx'
import { datasets } from '../data/mockData.js'
import { GAUGE_LABELS, SCORE_THRESHOLDS } from '../config.js'

const toneMap = { pass: 'ok', warn: 'warn', fail: 'bad' }

export default function Badges({ datasetId }) {
  const dataset = datasets.find((d) => d.id === datasetId) ?? datasets[0]
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Badges</h2>
          <p className="muted">Status pills for rules, datasets and thresholds</p>
        </div>
      </div>
      <div className="grid three">
        <div className="card">
          <h3>Tones</h3>
          <p className="sub muted">Base badge variants</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="ok">Good</Badge>
            <Badge tone="warn">Warning</Badge>
            <Badge tone="bad">Critical</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="neutral">Neutral</Badge>
          </div>
        </div>
        <div className="card">
          <h3>Threshold guide</h3>
          <p className="sub muted">How scores map to badges</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="ok">≥ {SCORE_THRESHOLDS.good} {GAUGE_LABELS.ok}</Badge>
            <Badge tone="warn">
              {SCORE_THRESHOLDS.warn}–{SCORE_THRESHOLDS.good - 1} {GAUGE_LABELS.warn}
            </Badge>
            <Badge tone="bad">&lt; {SCORE_THRESHOLDS.warn} {GAUGE_LABELS.bad}</Badge>
          </div>
        </div>
        <div className="card">
          <h3>{dataset.name}</h3>
          <p className="sub muted">Live rule statuses</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dataset.rules.map((r) => (
              <Badge key={r.id} tone={toneMap[r.status]}>
                {r.id} · {r.status}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

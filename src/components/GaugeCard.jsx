import Badge from './Badge.jsx'
import { toneFor, changeTone } from '../utils/quality.js'

export default function GaugeCard({ label, value, description, delta, deltaTitle }) {
  const hasData = typeof value === 'number'
  const hasDelta = hasData && typeof delta === 'number'
  const deltaText = hasDelta ? ` (${delta > 0 ? '+' : ''}${delta})` : ''
  const deltaClass = hasDelta ? `change-${changeTone(delta)}` : ''
  const tone = hasData ? toneFor(value) : 'neutral'
  const statusText = !hasData ? 'No data' : tone === 'ok' ? 'Good' : tone === 'warn' ? 'Warning' : 'Critical'
  const color = tone === 'ok' ? '#00f2c3' : tone === 'warn' ? '#ff8d72' : '#fd5d93'
  const r = 34
  const c = 2 * Math.PI * r
  const off = hasData ? c - (value / 100) * c : c

  return (
    <div className="gauge">
      <div className="gauge-title" title={description}>{label}</div>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform="rotate(-90 45 45)"
        />
        <text
          x="45"
          y="50"
          textAnchor="middle"
          fill={hasData ? '#fff' : 'rgba(255,255,255,0.35)'}
          fontSize="16"
          fontWeight="700"
        >
          {hasData ? value : '—'}
        </text>
      </svg>
      <strong style={{ color: hasData ? color : 'var(--bd-muted)' }}>{hasData ? `${value}%` : '—'}</strong>
      <div style={{ marginTop: 6 }} title={hasDelta ? deltaTitle : undefined}>
        <Badge tone={tone}>
          {statusText}
          {hasDelta && <span className={deltaClass}>{deltaText}</span>}
        </Badge>
      </div>
      {description && <div className="gauge-desc">{description}</div>}
    </div>
  )
}

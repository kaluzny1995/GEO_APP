import Badge from './Badge.jsx'
import { toneFor } from '../utils/quality.js'

export default function GaugeCard({ label, value }) {
  const tone = toneFor(value)
  const color = tone === 'ok' ? '#00f2c3' : tone === 'warn' ? '#ff8d72' : '#fd5d93'
  const r = 34
  const c = 2 * Math.PI * r
  const off = c - (value / 100) * c

  return (
    <div className="gauge">
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
        <text x="45" y="50" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700">
          {value}
        </text>
      </svg>
      <div>{label}</div>
      <strong style={{ color }}>{value}%</strong>
      <div style={{ marginTop: 6 }}>
        <Badge tone={tone}>{tone === 'ok' ? 'Good' : tone === 'warn' ? 'Warning' : 'Critical'}</Badge>
      </div>
    </div>
  )
}

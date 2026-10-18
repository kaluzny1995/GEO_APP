export default function StatCard({ label, value, delta, up, change, changeTone }) {
  return (
    <div className="card stat">
      <div className="muted">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={up ? 'delta-up' : 'delta-down'}>
        {delta}
        {change && <span className={changeTone ? `change-${changeTone}` : undefined}>{change}</span>}
      </div>
    </div>
  )
}

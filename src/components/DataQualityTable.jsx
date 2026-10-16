import { useMemo, useState } from 'react'
import Badge from './Badge.jsx'

const toneMap = { pass: 'ok', warn: 'warn', fail: 'bad' }

export default function DataQualityTable({ rows }) {
  const [sortKey, setSortKey] = useState('passRate')
  const [sortDir, setSortDir] = useState(1)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? rows.filter((r) => [r.id, r.rule, r.scope, r.status].join(' ').toLowerCase().includes(q))
      : [...rows]
    base.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number') return (av - bv) * sortDir
      return String(av).localeCompare(String(bv)) * sortDir
    })
    return base
  }, [rows, query, sortKey, sortDir])

  const toggle = (key) => {
    if (key === sortKey) setSortDir((d) => -d)
    else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Filter rules… (e.g. latitude, fail)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', maxWidth: 420 }}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><button onClick={() => toggle('id')}>Rule ID {sortKey === 'id' ? (sortDir === 1 ? '▲' : '▼') : ''}</button></th>
              <th><button onClick={() => toggle('rule')}>Rule {sortKey === 'rule' ? (sortDir === 1 ? '▲' : '▼') : ''}</button></th>
              <th><button onClick={() => toggle('scope')}>Scope</button></th>
              <th><button onClick={() => toggle('passRate')}>Pass % {sortKey === 'passRate' ? (sortDir === 1 ? '▲' : '▼') : ''}</button></th>
              <th><button onClick={() => toggle('fails')}>Fails</button></th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.rule}</td>
                <td className="muted">{r.scope}</td>
                <td>{r.passRate.toFixed(1)}%</td>
                <td>{r.fails.toLocaleString()}</td>
                <td>
                  <Badge tone={toneMap[r.status] ?? 'neutral'}>{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

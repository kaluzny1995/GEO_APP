import { useMemo, useState } from 'react'
import Badge from './Badge.jsx'
import DownloadMenu from './DownloadMenu.jsx'
import { LOCALE, PERCENT_DECIMALS } from '../config.js'

const toneMap = { pass: 'ok', warn: 'warn', fail: 'bad' }

export default function DataQualityTable({ rows, tableName, fileDate }) {
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

  const downloadTable = useMemo(
    () => ({
      title: 'Data-quality table',
      filename: ['data-quality-table', tableName, fileDate].filter(Boolean).join('-'),
      columns: ['Rule ID', 'Rule', 'Scope', 'Pass %', 'Fails', 'Status'],
      rows: filtered.map((row) => [
        row.id,
        row.rule,
        row.scope,
        row.passRate,
        row.fails,
        row.status,
      ]),
    }),
    [filtered, tableName, fileDate]
  )

  const toggle = (key) => {
    if (key === sortKey) setSortDir((d) => -d)
    else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  return (
    <div className="dq-table">
      <div className="table-toolbar">
        <input
          placeholder="Filter rules… (e.g. latitude, fail)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <DownloadMenu table={downloadTable} />
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
                <td>{r.passRate.toFixed(PERCENT_DECIMALS)}%</td>
                <td>{r.fails.toLocaleString(LOCALE)}</td>
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

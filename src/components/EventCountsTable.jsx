import { useMemo, useState } from 'react'
import { DANGER_LEVELS } from '../config.js'
import { formatCount, formatPercent } from '../utils/eventCounts.js'
import { chartColors, dangerColors, heatIntensity, heatTextColor } from '../variables/charts.js'

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const sortValue = (row, key) => (key === 'count' ? row.count : row[key] ?? '')

// Zero counts stay muted; non-zero values ramp from light gray to the bright
// accent using a square-root scale so small counts still get a visible tint.
const heatStyle = (value, max, color) => {
  const intensity = heatIntensity(value, max)
  return {
    color: intensity === null ? 'var(--bd-muted)' : heatTextColor(color, intensity),
  }
}

export default function EventCountsTable({ rows, dimension }) {
  const [sortKey, setSortKey] = useState('count')
  const [sortDir, setSortDir] = useState(-1)
  const [query, setQuery] = useState('')

  const primaryLabel = dimension === 'location' ? 'Country' : 'Category'
  const secondaryLabel = dimension === 'location' ? 'State / province' : 'Subcategory'
  const filterHint =
    dimension === 'location'
      ? 'Filter by source, subsource, country or state…'
      : 'Filter by source, subsource, category or subcategory…'

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? rows.filter((row) =>
          [row.source, row.subsource, row.primary, row.secondary].join(' ').toLowerCase().includes(q)
        )
      : [...rows]

    filtered.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir
      return String(av).localeCompare(String(bv)) * sortDir
    })

    return filtered
  }, [rows, query, sortKey, sortDir])

  const maxima = useMemo(
    () => ({
      count: Math.max(0, ...visible.map((row) => row.count)),
      levels: Object.fromEntries(
        DANGER_LEVELS.map((level) => [level, Math.max(0, ...visible.map((row) => row.levels[level]))])
      ),
    }),
    [visible]
  )

  const toggle = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => -dir)
      return
    }
    setSortKey(key)
    setSortDir(key === 'count' ? -1 : 1)
  }

  const arrow = (key) => (sortKey === key ? (sortDir === 1 ? ' ▲' : ' ▼') : '')

  return (
    <div className="dq-table">
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder={filterHint}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', maxWidth: 420 }}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><button onClick={() => toggle('source')}>Source{arrow('source')}</button></th>
              <th><button onClick={() => toggle('subsource')}>Subsource{arrow('subsource')}</button></th>
              <th><button onClick={() => toggle('primary')}>{primaryLabel}{arrow('primary')}</button></th>
              <th><button onClick={() => toggle('secondary')}>{secondaryLabel}{arrow('secondary')}</button></th>
              <th><button onClick={() => toggle('count')}>Count{arrow('count')}</button></th>
              <th>% of all</th>
              {DANGER_LEVELS.map((level) => (
                <th key={level}>
                  <span className="level-dot" style={{ background: dangerColors[level] }} />
                  {capitalize(level)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.key}>
                <td>{row.source}</td>
                <td className="muted">{row.subsource}</td>
                <td>{row.primary}</td>
                <td className="muted">{row.secondary}</td>
                <td style={heatStyle(row.count, maxima.count, chartColors.primary)}>
                  {formatCount(row.count)}
                </td>
                <td>{formatPercent(row.share)}</td>
                {DANGER_LEVELS.map((level) => (
                  <td key={level} style={heatStyle(row.levels[level], maxima.levels[level], dangerColors[level])}>
                    {formatCount(row.levels[level])}{' '}
                    <span className="muted">({formatPercent(row.levelShares[level])})</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p className="muted">No events match the current filter.</p>}
      </div>
    </div>
  )
}

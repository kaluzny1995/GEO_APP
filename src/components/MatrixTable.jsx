import { useMemo } from 'react'
import { formatCount, formatPercent } from '../utils/eventCounts.js'
import { chartColors, heatTextColor } from '../variables/charts.js'

const share = (value, total) => (total ? (value / total) * 100 : 0)

const heatStyle = (value, max) => ({
  color:
    value > 0 && max > 0
      ? heatTextColor(chartColors.primary, 0.25 + 0.75 * Math.sqrt(value / max))
      : 'var(--bd-muted)',
})

export default function MatrixTable({ matrix, rowHeader, columnTotalLabel, footerLabel }) {
  const maxCell = useMemo(
    () => matrix.rows.reduce((max, row) => Math.max(max, ...Object.values(row.cells)), 0),
    [matrix]
  )

  if (!matrix.total) {
    return <p className="muted">No events to summarize.</p>
  }

  return (
    <div className="table-wrap">
      <table className="heatmap">
        <thead>
          <tr>
            <th scope="col">{rowHeader}</th>
            {matrix.columns.map((column) => (
              <th key={column.name} scope="col">{column.name}</th>
            ))}
            <th scope="col">{columnTotalLabel}</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              {matrix.columns.map((column) => {
                const count = row.cells[column.name] ?? 0
                return (
                  <td key={column.name} style={count > 0 ? heatStyle(count, maxCell) : undefined}>
                    {count > 0 ? (
                      <>
                        {formatCount(count)}{' '}
                        <span className="muted">({formatPercent(share(count, matrix.total))})</span>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                )
              })}
              <td>
                {formatCount(row.total)}{' '}
                <span className="muted">({formatPercent(share(row.total, matrix.total))})</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{footerLabel}</th>
            {matrix.columns.map((column) => (
              <td key={column.name}>
                {formatCount(column.total)}{' '}
                <span className="muted">({formatPercent(share(column.total, matrix.total))})</span>
              </td>
            ))}
            <td>
              {formatCount(matrix.total)} <span className="muted">(100.0%)</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

import { useMemo } from 'react'
import { formatCount, formatPercent, transposeMatrix } from '../utils/eventCounts.js'
import { chartColors, heatIntensity, heatTextColor } from '../variables/charts.js'

const share = (value, total) => (total ? (value / total) * 100 : 0)

const heatStyle = (value, max) => {
  const intensity = heatIntensity(value, max)
  return {
    color:
      intensity === null
        ? 'var(--bd-muted)'
        : heatTextColor(chartColors.primary, intensity),
  }
}

export default function MatrixTable({
  matrix,
  transposed = false,
  rowLabel,
  columnLabel,
  rowTotalLabel,
  columnTotalLabel,
}) {
  const display = useMemo(
    () => (transposed ? transposeMatrix(matrix) : matrix),
    [matrix, transposed]
  )
  const maxCell = useMemo(
    () => display.rows.reduce((max, row) => Math.max(max, ...Object.values(row.cells)), 0),
    [display]
  )

  if (!matrix.total) {
    return <p className="muted">No events to summarize.</p>
  }

  const headerLabel = transposed ? columnLabel : rowLabel
  const totalColumnLabel = transposed ? rowTotalLabel : columnTotalLabel
  const totalRowLabel = transposed ? columnTotalLabel : rowTotalLabel

  return (
    <div className="table-wrap">
      <table className="heatmap">
        <thead>
          <tr>
            <th scope="col">{headerLabel}</th>
            {display.columns.map((column) => (
              <th key={column.name} scope="col">{column.name}</th>
            ))}
            <th scope="col">{totalColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {display.rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              {display.columns.map((column) => {
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
            <th scope="row">{totalRowLabel}</th>
            {display.columns.map((column) => (
              <td key={column.name}>
                {formatCount(column.total)}{' '}
                <span className="muted">({formatPercent(share(column.total, matrix.total))})</span>
              </td>
            ))}
            <td>
              {formatCount(matrix.total)} <span className="muted">({formatPercent(100)})</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

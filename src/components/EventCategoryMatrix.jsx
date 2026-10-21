import { useMemo } from 'react'
import MatrixTable from './MatrixTable.jsx'
import { categorySourceMatrix } from '../utils/eventCounts.js'

export default function EventCategoryMatrix({ rows, transposed = false }) {
  const matrix = useMemo(() => categorySourceMatrix(rows), [rows])

  return (
    <MatrixTable
      matrix={matrix}
      transposed={transposed}
      rowLabel="Event category"
      columnLabel="Source"
      rowTotalLabel="All categories"
      columnTotalLabel="All sources"
    />
  )
}

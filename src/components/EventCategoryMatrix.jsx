import { useMemo } from 'react'
import MatrixTable from './MatrixTable.jsx'
import { categorySourceMatrix } from '../utils/eventCounts.js'

export default function EventCategoryMatrix({ rows }) {
  const matrix = useMemo(() => categorySourceMatrix(rows), [rows])

  return (
    <MatrixTable
      matrix={matrix}
      rowHeader="Event category"
      columnTotalLabel="All sources"
      footerLabel="All categories"
    />
  )
}

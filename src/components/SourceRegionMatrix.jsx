import { useMemo } from 'react'
import MatrixTable from './MatrixTable.jsx'
import { sourceRegionMatrix } from '../utils/eventCounts.js'

export default function SourceRegionMatrix({ rows, transposed = false }) {
  const matrix = useMemo(() => sourceRegionMatrix(rows), [rows])

  return (
    <MatrixTable
      matrix={matrix}
      transposed={transposed}
      rowLabel="Source"
      columnLabel="Region"
      rowTotalLabel="All sources"
      columnTotalLabel="All regions"
    />
  )
}

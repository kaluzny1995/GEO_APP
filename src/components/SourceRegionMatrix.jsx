import { useMemo } from 'react'
import MatrixTable from './MatrixTable.jsx'
import { sourceRegionMatrix } from '../utils/eventCounts.js'

export default function SourceRegionMatrix({ rows }) {
  const matrix = useMemo(() => sourceRegionMatrix(rows), [rows])

  return (
    <MatrixTable
      matrix={matrix}
      rowHeader="Source"
      columnTotalLabel="All regions"
      footerLabel="All sources"
    />
  )
}

import { fetchDataQuality } from './dataQuality.js'
import { totalRecordsFromMetrics } from '../utils/dataQuantity.js'

export async function fetchDataQuantities(tableNames, fileDate) {
  const entries = await Promise.all(
    tableNames.map(async (tableName) => {
      const metrics = await fetchDataQuality(tableName, fileDate)
      return [tableName, totalRecordsFromMetrics(metrics)]
    })
  )
  return Object.fromEntries(entries)
}

export default { fetchDataQuantities }

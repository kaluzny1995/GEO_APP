import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import DataQuantityDiagram from '../components/DataQuantityDiagram.jsx'
import { fetchDataQuantityDates, fetchDataQuantities } from '../api/dataQuantity.js'
import { buildQuantityFlow } from '../utils/dataQuantity.js'
import { OVERALL_DATE, ROUTES, TABLE_NAMES, UNION_TABLE } from '../config.js'

export default function DataQuantityView() {
  const [fileDate, setFileDate] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [counts, setCounts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiDown, setIsApiDown] = useState(false)
  const [requestId, setRequestId] = useState(0)
  // The date list is stable for the lifetime of the view; cache it so changing
  // the snapshot does not re-fetch it (the old data-quality probe was cached too).
  const datesRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setIsApiDown(false)
      try {
        let dates = datesRef.current
        if (!dates) {
          dates = await fetchDataQuantityDates()
          if (cancelled) return
          if (dates.length > 0) datesRef.current = dates
        }

        if (dates.length === 0) {
          setAvailableDates([])
          setCounts({})
          setError(`No data-quantity snapshots available for ${UNION_TABLE}.`)
          setIsLoading(false)
          return
        }

        setAvailableDates(dates)
        const latestDate = [...dates]
          .filter((date) => date !== OVERALL_DATE)
          .sort()
          .at(-1)
        const targetDate = fileDate && dates.includes(fileDate)
          ? fileDate
          : latestDate ?? OVERALL_DATE

        if (targetDate !== fileDate) {
          setFileDate(targetDate)
          return
        }

        const nextCounts = await fetchDataQuantities(targetDate)
        if (cancelled) return
        setCounts(nextCounts && typeof nextCounts === 'object' ? nextCounts : {})
        setIsLoading(false)
      } catch (err) {
        if (cancelled) return
        setCounts({})
        setError(err.message)
        setIsApiDown(Boolean(err.isConnectionError))
        setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [fileDate, requestId])

  const flows = useMemo(() => buildQuantityFlow(counts), [counts])
  const sortedDates = [...availableDates].sort()
  const unionCount = counts[UNION_TABLE] ?? null

  const retry = () => setRequestId((value) => value + 1)

  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Data Quantity</h2>
          <p className="muted">
            {fileDate
              ? `Showing row quantities for the ${fileDate} snapshot across ${TABLE_NAMES.length} tables.`
              : `Loading the latest snapshot across ${TABLE_NAMES.length} tables.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to={ROUTES.overview} className="btn btn-sm btn-outline-secondary">
            ← Back to Overview
          </NavLink>
          <select
            aria-label="Snapshot date"
            value={fileDate ?? ''}
            onChange={(event) => setFileDate(event.target.value)}
            style={{ minWidth: 140 }}
            disabled={!availableDates.length || isLoading}
          >
            {sortedDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      {error && isApiDown && (
        <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={retry}>Retry</button>
        </div>
      )}

      {error && !isApiDown && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Error</h3>
          <p className="muted">{error}</p>
          <button className="btn btn-sm" onClick={retry}>Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Loading…</h3>
          <p className="muted">Fetching table quantities from GEO_API…</p>
        </div>
      ) : error ? null : (
        <div className="card quantity-panel" style={{ marginTop: 16 }}>
          <div className="card-title-row">
            <h3>Plain → ETL → Union</h3>
            <span className="quantity-snapshot">Snapshot {fileDate}</span>
          </div>
          <p className="sub muted">
            Counts are read directly from each database table for the selected snapshot.
            Each row compares a plain table with its ETL table. Arrow badges show rows
            removed by filtering/deduplication; when the ETL table has more rows than the
            selected plain snapshot, the badge reports how many more. Every ETL table
            feeds the union table.
          </p>
          <DataQuantityDiagram flows={flows} unionCount={unionCount} fileDate={fileDate} />
        </div>
      )}
    </>
  )
}

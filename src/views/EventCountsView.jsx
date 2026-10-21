import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import EventCountsTable from '../components/EventCountsTable.jsx'
import EventCategoryMatrix from '../components/EventCategoryMatrix.jsx'
import SourceRegionMatrix from '../components/SourceRegionMatrix.jsx'
import { fetchEventCountsByCategory, fetchEventCountsByLocation } from '../api/eventCounts.js'
import { eventCountRows, formatCount, formatPercent, summarizeEventCounts } from '../utils/eventCounts.js'
import { DANGER_LEVELS, UNRATED_DANGER_RATINGS } from '../config.js'
import { dangerColors } from '../variables/charts.js'

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const DIMENSIONS = {
  category: {
    title: 'Event Categories',
    subtitle:
      'The union_etl dataset counts events by category and subcategory for each source and subsource. Totals are shown overall and for the four danger levels.',
    tableTitle: 'Categories by source',
    tableSub:
      'Each row combines source, subsource, event category and subcategory. Danger-level cells show the count and its share of the row total.',
    load: fetchEventCountsByCategory,
  },
  location: {
    title: 'Event Locations',
    subtitle:
      'The union_etl dataset counts events by country and state/province for each source and subsource. Totals are shown overall and for the four danger levels.',
    tableTitle: 'Locations by source',
    tableSub:
      'Each row combines source, subsource, country and state/province. Danger-level cells show the count and its share of the row total.',
    load: fetchEventCountsByLocation,
  },
}

function EventCountsView({ dimension }) {
  const config = DIMENSIONS[dimension]
  const { load } = config
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiDown, setIsApiDown] = useState(false)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError(null)
      setIsApiDown(false)
      try {
        const data = await load()
        if (cancelled) return
        setRows(Array.isArray(data) ? data : [])
      } catch (err) {
        if (cancelled) return
        setRows([])
        setError(err.message)
        setIsApiDown(Boolean(err.isConnectionError))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [load, requestId])

  const summary = useMemo(() => summarizeEventCounts(rows), [rows])
  const tableRows = useMemo(() => eventCountRows(rows, dimension), [rows, dimension])

  const retry = () => setRequestId((n) => n + 1)

  return (
    <>
      <div className="toolbar">
        <div>
          <h2>{config.title}</h2>
          <p className="muted">{config.subtitle}</p>
        </div>
        <NavLink to="/overview" className="btn btn-sm btn-outline-secondary ms-auto">
          ← Back to Overview
        </NavLink>
      </div>

      {error && isApiDown && (
        <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {error && !isApiDown && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Error</h3>
          <p className="muted">{error}</p>
          <button className="btn btn-sm" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Loading…</h3>
          <p className="muted">Fetching event counts from GEO_API…</p>
        </div>
      ) : error ? null : (
        <>
          <div className="grid stats stats-5" style={{ marginTop: 16 }}>
            <div className="card stat">
              <div className="muted">Total events</div>
              <div className="stat-value">{formatCount(summary.total)}</div>
              <div className="muted">{formatCount(summary.unrated)} outside levels</div>
            </div>
            {DANGER_LEVELS.map((level) => (
              <div className="card stat" key={level}>
                <div className="muted">
                  <span className="level-dot" style={{ background: dangerColors[level] }} />
                  {capitalize(level)}
                </div>
                <div className="stat-value">{formatCount(summary.levels[level].count)}</div>
                <div className="muted">{formatPercent(summary.levels[level].share)} of all events</div>
              </div>
            ))}
          </div>

          {dimension === 'category' && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Event category by source</h3>
              <p className="sub muted">
                Heatmap of event counts (and % of all events) for each category and source;
                subsources and danger levels are summed.
              </p>
              <EventCategoryMatrix rows={rows} />
            </div>
          )}

          {dimension === 'location' && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Source by region</h3>
              <p className="sub muted">
                Heatmap of event counts (and % of all events) for each source and region group;
                subsources, countries and danger levels are summed.
              </p>
              <SourceRegionMatrix rows={rows} />
            </div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <h3>{config.tableTitle}</h3>
            <p className="sub muted">{config.tableSub}</p>
            <EventCountsTable rows={tableRows} dimension={dimension} />
            <p className="sub muted" style={{ marginTop: 12 }}>
              Overall counts include events rated <code>{UNRATED_DANGER_RATINGS.join(' or ')}</code>,
              which are outside the four danger levels. Count text is heat-colored by magnitude
              (brighter color = more events); zero counts stay muted.
            </p>
          </div>
        </>
      )}
    </>
  )
}

export function EventCategoriesView() {
  return <EventCountsView dimension="category" />
}

export function EventLocationsView() {
  return <EventCountsView dimension="location" />
}

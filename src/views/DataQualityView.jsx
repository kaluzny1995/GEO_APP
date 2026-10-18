import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import StatCard from '../components/StatCard.jsx'
import DataQualityTable from '../components/DataQualityTable.jsx'
import GaugeCard from '../components/GaugeCard.jsx'
import Badge from '../components/Badge.jsx'
import { dimensionsFromMetrics, overallScore, toneFor, changeTone } from '../utils/quality.js'
import { baseOptions, chartColors } from '../variables/charts.js'
import { fetchDataQuality, fetchTableIndex } from '../api/dataQuality.js'

// Register Chart.js components at module load time
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const DEFAULT_TABLE = 'avalanche_org'

// 19 tables: 9 plain data source, 9 ETL, 1 union
const tableNames = [
  // Plain data source tables (9)
  'eonet_event',
  'nifc_fire',
  'ibtracs_cyclone',
  'usgs_earthquake',
  'usgs_volcano',
  'openmeteo_flood',
  'gdacs_event',
  'usgs_nwis',
  'avalanche_org',
  // ETL tables (9)
  'eonet_event_etl',
  'nifc_fire_etl',
  'ibtracs_cyclone_etl',
  'usgs_earthquake_etl',
  'usgs_volcano_etl',
  'openmeteo_flood_etl',
  'gdacs_event_etl',
  'usgs_nwis_etl',
  'avalanche_org_etl',
  // Union table (1)
  'union_etl',
]

// Dropdowns render their items alphabetically
const sortedTableNames = [...tableNames].sort()

// Default KPI cards (shown while data loads or when API unavailable)
const defaultKpis = [
  { id: 'rows', label: 'Rows scanned', value: '—', delta: '—', up: true },
  { id: 'rules', label: 'Rules evaluated', value: '—', delta: '—', up: true },
  { id: 'fail-rate', label: 'Fail rate', value: '—', delta: '—', up: true },
  { id: 'datasets', label: 'Datasets', value: '—', delta: '—', up: true },
]

// Extract rule-level checks from flat metrics for the data-quality table
const metricsToRules = (metrics) => {
  const rules = []

  const badRow = metrics.find((r) => r.metric === 'bad_row_pct')
  if (badRow) {
    rules.push({
      id: 'R-101',
      rule: 'Row validity (bad_row_pct)',
      scope: 'table',
      passRate: Math.round(100 - badRow.value),
      fails: Math.round((badRow.value / 100) * 1000),
      status: badRow.value >= 10 ? 'fail' : badRow.value >= 1 ? 'warn' : 'pass',
    })
  }

  const dupRow = metrics.find((r) => r.metric === 'dup_row_pct')
  if (dupRow) {
    rules.push({
      id: 'R-102',
      rule: 'Row uniqueness (dup_row_pct)',
      scope: 'table',
      passRate: Math.round(100 - dupRow.value),
      fails: Math.round((dupRow.value / 100) * 1000),
      status: dupRow.value >= 10 ? 'fail' : dupRow.value >= 1 ? 'warn' : 'pass',
    })
  }

  metrics.filter((r) => r.metric.startsWith('null_pct__')).forEach((r, i) => {
    rules.push({
      id: `R-20${i}`,
      rule: `Field completeness: ${r.metric.replace('null_pct__', '')}`,
      scope: 'table',
      passRate: Math.round(100 - r.value),
      fails: Math.round((r.value / 100) * 1000),
      status: r.value >= 10 ? 'fail' : r.value >= 1 ? 'warn' : 'pass',
    })
  })

  metrics.filter((r) => r.metric.startsWith('bad_pct__')).forEach((r, i) => {
    rules.push({
      id: `R-30${i}`,
      rule: `Field validity: ${r.metric.replace('bad_pct__', '')}`,
      scope: 'table',
      passRate: Math.round(100 - r.value),
      fails: Math.round((r.value / 100) * 1000),
      status: r.value >= 10 ? 'fail' : r.value >= 1 ? 'warn' : 'pass',
    })
  })

  return rules
}

export default function DataQualityView() {
  const { tableName, fileDate } = useParams()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState([])
  const [rules, setRules] = useState([])
  const [trend, setTrend] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiDown, setIsApiDown] = useState(false)

  const resolvedTableName = tableName || DEFAULT_TABLE

  const applyError = useCallback((err) => {
    setError(err.message)
    setIsApiDown(Boolean(err.isConnectionError))
  }, [])

  const fetchData = useCallback(async (table, date) => {
    setIsLoading(true)
    setError(null)
    setIsApiDown(false)
    try {
      const data = await fetchDataQuality(table, date)
      const rows = Array.isArray(data) ? data : []
      setMetrics(rows)
      setRules(metricsToRules(rows))
    } catch (err) {
      setMetrics([])
      setRules([])
      applyError(err)
    } finally {
      setIsLoading(false)
    }
  }, [applyError])

  useEffect(() => {
    const loadIndex = async () => {
      try {
        const index = await fetchTableIndex(resolvedTableName, fileDate)
        const validDates = Array.isArray(index.dates) ? index.dates.filter((d) => typeof d === 'string' && d) : []
        setAvailableDates(validDates)
        setTrend(Array.isArray(index.trend) ? index.trend : [])
        if (validDates.length === 0) {
          setIsLoading(false)
          setError('No data-quality snapshots available for this table.')
          return
        }
        const targetDate = validDates.includes(fileDate) ? fileDate : validDates[0]
        await fetchData(resolvedTableName, targetDate)
        if (targetDate !== fileDate) {
          navigate(`/admin/data-quality/${resolvedTableName}/${targetDate}`)
        }
      } catch (err) {
        setAvailableDates([])
        setIsLoading(false)
        applyError(err)
      }
    }
    loadIndex()
  }, [resolvedTableName, fileDate, navigate, fetchData, applyError])

  const dimensionScores = dimensionsFromMetrics(metrics)
  const score = overallScore(dimensionScores)

  const previousSnapshot = useMemo(() => {
    if (!fileDate || fileDate === 'overall') return null
    const idx = trend.findIndex((t) => t.date === fileDate)
    return idx > 0 ? trend[idx - 1] : null
  }, [trend, fileDate])

  const kpis = useMemo(() => {
    if (!metrics.length) return defaultKpis
    const totalRecords = metrics.find((r) => r.metric === 'total_records')?.value
    const badRowPct = metrics.find((r) => r.metric === 'bad_row_pct')?.value
    const passCount = rules.filter((r) => r.status === 'pass').length

    const prevRows = previousSnapshot?.rows
    const prevTotal = prevRows?.find((r) => r.metric === 'total_records')?.value
    const prevBadRow = prevRows?.find((r) => r.metric === 'bad_row_pct')?.value
    const prevPass = prevRows ? metricsToRules(prevRows).filter((r) => r.status === 'pass').length : null

    const makeChange = (current, prev, { pct = false, invert = false } = {}) => {
      if (typeof current !== 'number' || typeof prev !== 'number') return null
      let d = current - prev
      if (pct && Math.abs(d) < 0.05) d = 0
      const text = ` (${d > 0 ? '+' : ''}${pct ? d.toFixed(1) : d.toLocaleString('en-US')})`
      return { text, tone: changeTone(d, invert) }
    }

    const rowsChange = makeChange(totalRecords, prevTotal)
    const passChange = makeChange(passCount, prevPass)
    const failChange = makeChange(badRowPct, prevBadRow, { pct: true, invert: true })

    return [
      {
        id: 'rows',
        label: 'Rows scanned',
        value: typeof totalRecords === 'number' ? totalRecords.toLocaleString('en-US') : '—',
        delta: `${metrics.length} metrics`,
        change: rowsChange?.text,
        changeTone: rowsChange?.tone,
        up: true,
      },
      {
        id: 'rules',
        label: 'Rules evaluated',
        value: rules.length,
        delta: `${passCount} pass`,
        change: passChange?.text,
        changeTone: passChange?.tone,
        up: true,
      },
      {
        id: 'fail-rate',
        label: 'Fail rate',
        value: typeof badRowPct === 'number' ? `${badRowPct.toFixed(1)}%` : '—',
        delta: 'bad rows',
        change: failChange?.text,
        changeTone: failChange?.tone,
        up: typeof badRowPct === 'number' ? badRowPct < 1 : true,
      },
      {
        id: 'datasets',
        label: 'Datasets',
        value: tableNames.length,
        delta: 'tracked tables',
        up: true,
      },
    ]
  }, [metrics, rules, previousSnapshot])

  const gaugeDelta = (key) => {
    if (!previousSnapshot) return null
    const current = dimensionScores[key]
    const prev = previousSnapshot.dimensions?.[key]
    return typeof current === 'number' && typeof prev === 'number' ? current - prev : null
  }

  const deltaTitle = previousSnapshot ? `vs previous snapshot (${previousSnapshot.date})` : undefined

  const gauges = [
    {
      id: 'completeness',
      label: 'Completeness',
      value: dimensionScores.completeness,
      description: 'avg % of non-NULL values across fields',
      delta: gaugeDelta('completeness'),
      deltaTitle,
    },
    {
      id: 'validity',
      label: 'Validity',
      value: dimensionScores.validity,
      description: '% of rows passing all rules',
      delta: gaugeDelta('validity'),
      deltaTitle,
    },
    {
      id: 'uniqueness',
      label: 'Uniqueness',
      value: dimensionScores.uniqueness,
      description: '% of unique (non-duplicate) rows',
      delta: gaugeDelta('uniqueness'),
      deltaTitle,
    },
    {
      id: 'consistency',
      label: 'Consistency',
      value: dimensionScores.consistency,
      description: 'avg % of domain/range rules passing',
      delta: gaugeDelta('consistency'),
      deltaTitle,
    },
  ]

  const sortedDates = [...availableDates].sort()

  const trendLabels = trend.map((t) => t.date)
  const trendData = trend.map((t) => t.score)

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: `${resolvedTableName} quality score`,
      data: trendData,
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(225,78,202,0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: chartColors.primary,
    }],
  }

  const barData = {
    labels: rules.map((r) => r.id),
    datasets: [{
      label: 'Pass %',
      data: rules.map((r) => r.passRate),
      backgroundColor: rules.map((r) =>
        r.passRate >= 90 ? chartColors.success : r.passRate >= 75 ? chartColors.warning : chartColors.danger
      ),
      borderRadius: 6,
    }],
  }

  const doughnutData = {
    labels: ['Pass', 'Warn', 'Fail'],
    datasets: [{
      data: [
        rules.filter((r) => r.status === 'pass').length,
        rules.filter((r) => r.status === 'warn').length,
        rules.filter((r) => r.status === 'fail').length,
      ],
      backgroundColor: [chartColors.success, chartColors.warning, chartColors.danger],
      borderWidth: 0,
    }],
  }

  const radarData = {
    labels: ['Completeness', 'Validity', 'Uniqueness', 'Consistency'],
    datasets: [{
      label: `Quality dimensions (${fileDate})`,
      data: [
        dimensionScores.completeness ?? null,
        dimensionScores.validity ?? null,
        dimensionScores.uniqueness ?? null,
        dimensionScores.consistency ?? null,
      ],
      backgroundColor: 'rgba(225,78,202,0.2)',
      borderColor: chartColors.primary,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: chartColors.primary,
    }],
  }

  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Data Quality Metrics</h2>
          <p className="muted">
            {resolvedTableName} · {fileDate || '—'}{' '}
            {isLoading ? <span className="muted">—</span> : (
              <strong style={{ color: '#fff' }}>{score}%</strong>
            )}{' '}
            {isLoading ? <span className="muted">—</span> : (
              <Badge tone={toneFor(score)}>
                {score >= 90 ? 'Healthy' : score >= 75 ? 'Needs attention' : 'Critical'}
              </Badge>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to="/admin/overview" className="btn btn-sm btn-outline-secondary">
            ← Back to Overview
          </NavLink>
          <select
            value={resolvedTableName}
            onChange={(e) => navigate(`/admin/data-quality/${e.target.value}/overall`)}
            style={{ minWidth: 220 }}
          >
            {sortedTableNames.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <select
            value={fileDate || ''}
            onChange={(e) => navigate(`/admin/data-quality/${resolvedTableName}/${e.target.value}`)}
            style={{ minWidth: 140 }}
            disabled={!availableDates.length || isLoading}
          >
            {sortedDates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {error && isApiDown && (
        <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {error && !isApiDown && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Error</h3>
          <p className="muted">{error}</p>
          <button className="btn btn-sm" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid stats" style={{ marginTop: 16 }}>
        {kpis.map((k) => (
          <StatCard key={k.id} {...k} />
        ))}
      </div>

      {isLoading ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Loading…</h3>
          <p className="muted">Fetching data quality metrics from GEO_API…</p>
        </div>
      ) : error ? null : (
        <>
          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Quality trend</h3>
              <p className="sub muted">Overall score per available snapshot date</p>
              <div style={{ height: 240 }}>
                <Line data={lineData} options={baseOptions()} />
              </div>
            </div>
            <div className="card">
              <h3>Radar: Quality dimensions</h3>
              <p className="sub muted">Four key metrics for {fileDate}</p>
              <div style={{ height: 240 }}>
                <Radar
                  data={radarData}
                  options={{
                    ...baseOptions(),
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        grid: { color: chartColors.grid },
                        pointLabels: { color: '#d4d4e0' },
                        ticks: { color: chartColors.tick, stepSize: 20, backdropColor: 'transparent' },
                      },
                    },
                    elements: {
                      line: { borderWidth: 2 },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Rule pass %</h3>
              <p className="sub muted">Per-rule bar chart for {fileDate}</p>
              <div style={{ height: 280 }}>
                <Bar data={barData} options={baseOptions()} />
              </div>
            </div>
            <div className="card">
              <h3>Rule status</h3>
              <p className="sub muted">Pass / warn / fail split</p>
              <div style={{ height: 280 }}>
                <Doughnut data={doughnutData} options={{ ...baseOptions(), scales: {} }} />
              </div>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card table-card">
              <h3>Data-quality table</h3>
              <p className="sub muted">Rule-level checks for {resolvedTableName} on {fileDate}</p>
              <DataQualityTable rows={rules} />
            </div>
            <div className="card">
              <h3>Quality gauges</h3>
              <p className="sub muted">≥90 good · 75–89 warning · {'<75'} critical</p>
              <div className="gauges">
                {gauges.map((g) => (
                  <GaugeCard key={g.id} {...g} value={g.value} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
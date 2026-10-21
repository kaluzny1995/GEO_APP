import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import StatCard from '../components/StatCard.jsx'
import DataQualityTable from '../components/DataQualityTable.jsx'
import GaugeCard from '../components/GaugeCard.jsx'
import Badge from '../components/Badge.jsx'
import { dimensionsFromMetrics, overallScore, toneFor, changeTone, scoreLabel } from '../utils/quality.js'
import { baseOptions, chartColors, passRateBarOptions, radarOptions, statusColors } from '../variables/charts.js'
import { fetchDataQuality, fetchTableIndex } from '../api/dataQuality.js'
import {
  DEFAULT_TABLE,
  TABLE_NAMES,
  OVERALL_DATE,
  RULE_THRESHOLDS,
  FAIL_ESTIMATE_ROWS,
  LOCALE,
  SCORE_THRESHOLDS,
  SCORE_DECIMALS,
  PERCENT_DECIMALS,
  CHANGE_EPSILON,
  QUALITY_METRICS,
  QUALITY_DIMENSIONS,
  RULE_IDS,
  KPI_LABELS,
  RULE_STATUSES,
  RULE_STATUS_LABELS,
  ROUTES,
} from '../config.js'

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

// Dropdowns render their items alphabetically
const sortedTableNames = [...TABLE_NAMES].sort()

// Default KPI cards (shown while data loads or when API unavailable)
const defaultKpis = [
  { id: 'rows', label: KPI_LABELS.rows, value: '—', delta: '—', up: true },
  { id: 'rules', label: KPI_LABELS.rules, value: '—', delta: '—', up: true },
  { id: 'fail-rate', label: KPI_LABELS.failRate, value: '—', delta: '—', up: true },
  { id: 'datasets', label: KPI_LABELS.datasets, value: '—', delta: '—', up: true },
]

// Extract rule-level checks from flat metrics for the data-quality table
const ruleStatus = (value) =>
  value >= RULE_THRESHOLDS.fail ? 'fail' : value >= RULE_THRESHOLDS.warn ? 'warn' : 'pass'

const metricsToRules = (metrics) => {
  const rules = []

  const badRow = metrics.find((r) => r.metric === QUALITY_METRICS.badRowPct)
  if (badRow) {
    rules.push({
      id: RULE_IDS.rowValidity,
      rule: `Row validity (${QUALITY_METRICS.badRowPct})`,
      scope: 'table',
      passRate: Math.round(100 - badRow.value),
      fails: Math.round((badRow.value / 100) * FAIL_ESTIMATE_ROWS),
      status: ruleStatus(badRow.value),
    })
  }

  const dupRow = metrics.find((r) => r.metric === QUALITY_METRICS.dupRowPct)
  if (dupRow) {
    rules.push({
      id: RULE_IDS.rowUniqueness,
      rule: `Row uniqueness (${QUALITY_METRICS.dupRowPct})`,
      scope: 'table',
      passRate: Math.round(100 - dupRow.value),
      fails: Math.round((dupRow.value / 100) * FAIL_ESTIMATE_ROWS),
      status: ruleStatus(dupRow.value),
    })
  }

  metrics.filter((r) => r.metric.startsWith(QUALITY_METRICS.nullPctPrefix)).forEach((r, i) => {
    rules.push({
      id: `${RULE_IDS.completenessPrefix}${i}`,
      rule: `Field completeness: ${r.metric.replace(QUALITY_METRICS.nullPctPrefix, '')}`,
      scope: 'table',
      passRate: Math.round(100 - r.value),
      fails: Math.round((r.value / 100) * FAIL_ESTIMATE_ROWS),
      status: ruleStatus(r.value),
    })
  })

  metrics.filter((r) => r.metric.startsWith(QUALITY_METRICS.badPctPrefix)).forEach((r, i) => {
    rules.push({
      id: `${RULE_IDS.validityPrefix}${i}`,
      rule: `Field validity: ${r.metric.replace(QUALITY_METRICS.badPctPrefix, '')}`,
      scope: 'table',
      passRate: Math.round(100 - r.value),
      fails: Math.round((r.value / 100) * FAIL_ESTIMATE_ROWS),
      status: ruleStatus(r.value),
    })
  })

  return rules
}

export default function DataQualityView() {
  // Selections live in component state; the URL always stays /data-quality.
  // The defaults (avalanche_org / overall) load automatically on mount and
  // every dropdown change triggers a reload.
  const [tableName, setTableName] = useState(DEFAULT_TABLE)
  const [fileDate, setFileDate] = useState(OVERALL_DATE)
  const [requestId, setRequestId] = useState(0)
  const [metrics, setMetrics] = useState([])
  const [rules, setRules] = useState([])
  const [trend, setTrend] = useState([])
  const [availableDates, setAvailableDates] = useState([OVERALL_DATE])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiDown, setIsApiDown] = useState(false)

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
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setIsApiDown(false)
      try {
        const index = await fetchTableIndex(tableName, fileDate)
        if (cancelled) return
        const validDates = Array.isArray(index.dates) ? index.dates.filter((d) => typeof d === 'string' && d) : []
        setTrend(Array.isArray(index.trend) ? index.trend : [])
        setAvailableDates(validDates)
        if (validDates.length === 0) {
          setIsLoading(false)
          setError('No data-quality snapshots available for this table.')
          return
        }
        const targetDate = validDates.includes(fileDate) ? fileDate : OVERALL_DATE
        if (targetDate !== fileDate) setFileDate(targetDate)
        await fetchData(tableName, targetDate)
      } catch (err) {
        if (cancelled) return
        setAvailableDates([])
        setTrend([])
        setIsLoading(false)
        applyError(err)
      }
    }
    load()

    return () => { cancelled = true }
  }, [requestId, tableName, fileDate, fetchData, applyError])

  const handleTableChange = (e) => {
    setTableName(e.target.value)
    setFileDate(OVERALL_DATE)
    setMetrics([])
    setRules([])
    setTrend([])
    setAvailableDates([OVERALL_DATE])
    setIsLoading(true)
  }

  const handleDateChange = (e) => {
    setFileDate(e.target.value)
    setIsLoading(true)
  }

  const retry = () => {
    setRequestId((n) => n + 1)
  }

  const dimensionScores = dimensionsFromMetrics(metrics)
  const score = overallScore(dimensionScores)
  const showScore = !isLoading && !error

  const previousSnapshot = useMemo(() => {
    if (!fileDate || fileDate === OVERALL_DATE) return null
    const idx = trend.findIndex((t) => t.date === fileDate)
    return idx > 0 ? trend[idx - 1] : null
  }, [trend, fileDate])

  const kpis = useMemo(() => {
    if (!metrics.length) return defaultKpis
    const totalRecords = metrics.find((r) => r.metric === QUALITY_METRICS.totalRecords)?.value
    const badRowPct = metrics.find((r) => r.metric === QUALITY_METRICS.badRowPct)?.value
    const passCount = rules.filter((r) => r.status === 'pass').length

    const prevRows = previousSnapshot?.rows
    const prevTotal = prevRows?.find((r) => r.metric === QUALITY_METRICS.totalRecords)?.value
    const prevBadRow = prevRows?.find((r) => r.metric === QUALITY_METRICS.badRowPct)?.value
    const prevPass = prevRows ? metricsToRules(prevRows).filter((r) => r.status === 'pass').length : null

    const makeChange = (current, prev, { pct = false, invert = false } = {}) => {
      if (typeof current !== 'number' || typeof prev !== 'number') return null
      let d = current - prev
      if (pct && Math.abs(d) < CHANGE_EPSILON) d = 0
      const text = ` (${d > 0 ? '+' : ''}${pct ? d.toFixed(PERCENT_DECIMALS) : d.toLocaleString(LOCALE)})`
      return { text, tone: changeTone(d, invert) }
    }

    const rowsChange = makeChange(totalRecords, prevTotal)
    const passChange = makeChange(passCount, prevPass)
    const failChange = makeChange(badRowPct, prevBadRow, { pct: true, invert: true })

    return [
      {
        id: 'rows',
        label: KPI_LABELS.rows,
        value: typeof totalRecords === 'number' ? totalRecords.toLocaleString(LOCALE) : '—',
        delta: `${metrics.length} metrics`,
        change: rowsChange?.text,
        changeTone: rowsChange?.tone,
        up: true,
      },
      {
        id: 'rules',
        label: KPI_LABELS.rules,
        value: rules.length,
        delta: `${passCount} pass`,
        change: passChange?.text,
        changeTone: passChange?.tone,
        up: true,
      },
      {
        id: 'fail-rate',
        label: KPI_LABELS.failRate,
        value: typeof badRowPct === 'number' ? `${badRowPct.toFixed(PERCENT_DECIMALS)}%` : '—',
        delta: 'bad rows',
        change: failChange?.text,
        changeTone: failChange?.tone,
        up: typeof badRowPct === 'number' ? badRowPct < RULE_THRESHOLDS.warn : true,
      },
      {
        id: 'datasets',
        label: KPI_LABELS.datasets,
        value: TABLE_NAMES.length,
        delta: 'tracked tables',
        up: true,
      },
    ]
  }, [metrics, rules, previousSnapshot])

  const gaugeDelta = (key) => {
    if (!previousSnapshot) return null
    const current = dimensionScores[key]
    const prev = previousSnapshot.dimensions?.[key]
    if (typeof current !== 'number' || typeof prev !== 'number') return null
    const factor = 10 ** SCORE_DECIMALS
    const diff = Math.round((current - prev) * factor) / factor
    return diff === 0 ? 0 : diff
  }

  const deltaTitle = previousSnapshot ? `vs previous snapshot (${previousSnapshot.date})` : undefined

  const gauges = QUALITY_DIMENSIONS.map((dimension) => ({
    ...dimension,
    value: dimensionScores[dimension.id],
    delta: gaugeDelta(dimension.id),
    deltaTitle,
  }))

  const sortedDates = [...availableDates].sort()

  const trendLabels = trend.map((t) => t.date)
  const trendData = trend.map((t) => t.score)

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: `${tableName} quality score`,
      data: trendData,
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primarySoft,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: chartColors.primary,
    }],
  }

  const passRates = rules.map((r) => r.passRate)

  const barData = {
    labels: rules.map((r) => r.id),
    datasets: [{
      label: 'Pass %',
      data: passRates,
      backgroundColor: rules.map((r) =>
        r.passRate >= SCORE_THRESHOLDS.good
          ? chartColors.success
          : r.passRate >= SCORE_THRESHOLDS.warn
            ? chartColors.warning
            : chartColors.danger
      ),
      borderRadius: 6,
    }],
  }

  const barOptions = passRateBarOptions(passRates)

  const doughnutData = {
    labels: RULE_STATUSES.map((status) => RULE_STATUS_LABELS[status]),
    datasets: [{
      data: RULE_STATUSES.map((status) => rules.filter((r) => r.status === status).length),
      backgroundColor: RULE_STATUSES.map((status) => statusColors[status]),
      borderWidth: 0,
    }],
  }

  const radarData = {
    labels: QUALITY_DIMENSIONS.map((dimension) => dimension.label),
    datasets: [{
      label: `Quality dimensions (${fileDate})`,
      data: QUALITY_DIMENSIONS.map((dimension) => dimensionScores[dimension.id] ?? null),
      backgroundColor: chartColors.primarySoft,
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
            {tableName} · {fileDate}{' '}
            {showScore ? (
              <>
                <strong style={{ color: '#fff' }}>{score}%</strong>{' '}
                <Badge tone={toneFor(score)}>
                  {scoreLabel(score)}
                </Badge>
              </>
            ) : (
              <span className="muted">—</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to={ROUTES.overview} className="btn btn-sm btn-outline-secondary">
            ← Back to Overview
          </NavLink>
          <select
            value={tableName}
            onChange={handleTableChange}
            style={{ minWidth: 220 }}
          >
            {sortedTableNames.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <select
            value={fileDate}
            onChange={handleDateChange}
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
                <Radar data={radarData} options={radarOptions()} />
              </div>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Rule pass %</h3>
              <p className="sub muted">Per-rule bar chart for {fileDate}</p>
              <div style={{ height: 280 }}>
                <Bar data={barData} options={barOptions} />
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
              <p className="sub muted">Rule-level checks for {tableName} on {fileDate}</p>
              <DataQualityTable rows={rules} />
            </div>
            <div className="card">
              <h3>Quality gauges</h3>
              <p className="sub muted">
                ≥{SCORE_THRESHOLDS.good} good · {SCORE_THRESHOLDS.warn}–{SCORE_THRESHOLDS.good - 1} warning · {'<'}
                {SCORE_THRESHOLDS.warn} critical
              </p>
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
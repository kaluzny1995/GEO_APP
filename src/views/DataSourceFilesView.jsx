import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import DataSourceFilesChart from '../components/DataSourceFilesChart.jsx'
import DownloadMenu from '../components/DownloadMenu.jsx'
import Pagination from '../components/Pagination.jsx'
import { fetchDataSourceFiles } from '../api/dataSourceFiles.js'
import {
  buildSourceRows,
  buildTimeline,
  formatCreatedAt,
  formatRecords,
  formatSizeKb,
  paginateRows,
  sortSourceRows,
} from '../utils/dataSourceFiles.js'
import { DATA_SOURCE_FILES_PAGE_SIZE, ROUTES } from '../config.js'

const COLUMNS = [
  { key: 'snapshotDate', label: 'Date', title: 'Snapshot date parsed from the file name' },
  { key: 'fileName', label: 'File name' },
  { key: 'createdAt', label: 'Created', title: 'Filesystem modification time' },
  { key: 'records', label: 'Records', numeric: true, title: 'Data rows excluding the header' },
  { key: 'sizeKb', label: 'Size (kB)', numeric: true, title: 'File size in 1024-byte kilobytes' },
]

export default function DataSourceFilesView() {
  const [sources, setSources] = useState([])
  const [files, setFiles] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [latestDate, setLatestDate] = useState(null)
  const [source, setSource] = useState('')
  const [sortKey, setSortKey] = useState('snapshotDate')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiDown, setIsApiDown] = useState(false)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setIsApiDown(false)
      try {
        const data = await fetchDataSourceFiles()
        if (cancelled) return
        setSources(data.sources)
        setFiles(data.files)
        setStartDate(data.startDate)
        setLatestDate(data.latestDate)
        setSource((current) => (data.sources.includes(current) ? current : data.sources[0] ?? ''))
        setPage(1)
        setIsLoading(false)
      } catch (err) {
        if (cancelled) return
        setSources([])
        setFiles([])
        setError(err.message)
        setIsApiDown(Boolean(err.isConnectionError))
        setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [requestId])

  const rows = useMemo(
    () => (source ? buildSourceRows(files, source, startDate, latestDate) : []),
    [files, source, startDate, latestDate]
  )
  const sortedRows = useMemo(
    () => sortSourceRows(rows, sortKey, sortDir),
    [rows, sortKey, sortDir]
  )
  const timeline = useMemo(() => buildTimeline(rows), [rows])
  const pagination = useMemo(
    () => paginateRows(sortedRows, page, DATA_SOURCE_FILES_PAGE_SIZE),
    [sortedRows, page]
  )

  const summary = useMemo(() => {
    const present = rows.filter((row) => !row.missing)
    const missing = rows.length - present.length
    const records = present.reduce((total, row) => total + (row.records ?? 0), 0)
    const sizeKb = present.reduce((total, row) => total + (row.sizeKb ?? 0), 0)
    return {
      present: present.length,
      missing,
      records,
      sizeKb,
    }
  }, [rows])

  // The download always contains every row for the selected source, not just
  // the current page. Missing dates stay in the export with an empty file name
  // and a `Missing` status so the full calendar range is preserved.
  const downloadTable = useMemo(
    () => ({
      title: `Data source files — ${source}`,
      filename: `data-source-files-${source}`,
      columns: ['Source', 'Date', 'File name', 'Created', 'Records', 'Size (kB)', 'Status'],
      rows: sortedRows.map((row) => [
        row.sourceName,
        row.snapshotDate ?? '',
        row.fileName ?? '',
        row.createdAt ?? '',
        row.missing ? '' : row.records,
        row.missing ? '' : row.sizeKb,
        row.missing ? 'Missing' : 'Present',
      ]),
    }),
    [sortedRows, source]
  )

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const changeSource = (value) => {
    setSource(value)
    setPage(1)
  }

  const sortIndicator = (key) => {
    if (key !== sortKey) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  const ariaSort = (key) => {
    if (key !== sortKey) return 'none'
    return sortDir === 'asc' ? 'ascending' : 'descending'
  }

  const retry = () => setRequestId((value) => value + 1)

  const fileLabel = summary.present === 1 ? 'file' : 'files'
  const missingLabel = summary.missing === 1 ? 'missing date' : 'missing dates'
  const undatedNote =
    timeline.undated > 0
      ? ` ${timeline.undated} undated ${timeline.undated === 1 ? 'file appears' : 'files appear'} in the table only.`
      : ''

  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Data Source Files</h2>
          <p className="muted">
            {source
              ? `${source} · ${summary.present} ${fileLabel} · ${summary.missing} ${missingLabel} · ${formatRecords(summary.records)} records · ${formatSizeKb(summary.sizeKb)} kB`
              : 'CSV snapshots downloaded into GEO_Download/data'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to={ROUTES.overview} className="btn btn-sm btn-outline-secondary">
            ← Back to Overview
          </NavLink>
          <select
            aria-label="Data source"
            value={source}
            onChange={(event) => changeSource(event.target.value)}
            style={{ minWidth: 200 }}
            disabled={!sources.length || isLoading}
          >
            {sources.map((name) => (
              <option key={name} value={name}>{name}</option>
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
          <p className="muted">Fetching CSV file metadata from GEO_API…</p>
        </div>
      ) : error ? null : sources.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>No CSV files found</h3>
          <p className="muted">
            No source folders with .csv files were found in GEO_Download/data.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>No files for {source}</h3>
          <p className="muted">This source has no CSV files in the data folder.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <h3>Records &amp; file size over time</h3>
            <p className="sub muted">
              Two linear axes — records on the left, size in kB on the right. Red bands and
              crosses mark dates with no CSV.{undatedNote}
            </p>
            {timeline.labels.length ? (
              <div className="source-files-chart">
                <DataSourceFilesChart timeline={timeline} />
              </div>
            ) : (
              <p className="muted">No dated snapshots to plot for {source}.</p>
            )}
          </div>

          <div className="card table-card" style={{ marginTop: 16 }}>
            <div className="card-title-row">
              <h3>CSV files</h3>
              <div className="card-actions">
                <DownloadMenu table={downloadTable} />
              </div>
            </div>
            <p className="sub muted">
              Missing dates are highlighted in red. Click a column header to sort; the download
              contains every row for {source}, not just the current page.
            </p>
            <div className="table-wrap">
              <table className="source-files-table" aria-label={`CSV files for ${source}`}>
                <thead>
                  <tr>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        className={column.numeric ? 'numeric' : undefined}
                        title={column.title}
                        aria-sort={ariaSort(column.key)}
                      >
                        <button type="button" onClick={() => toggleSort(column.key)}>
                          {column.label}{sortIndicator(column.key)}
                        </button>
                      </th>
                    ))}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.rows.map((row) => (
                    <tr
                      key={`${row.sourceName}-${row.snapshotDate ?? 'undated'}-${row.fileName ?? 'missing'}`}
                      className={row.missing ? 'row-missing' : undefined}
                    >
                      <td>{row.snapshotDate ?? '—'}</td>
                      <td>{row.fileName ?? <span className="muted">No file</span>}</td>
                      <td>{formatCreatedAt(row.createdAt)}</td>
                      <td className="numeric">{row.missing ? '—' : formatRecords(row.records)}</td>
                      <td className="numeric">{row.missing ? '—' : formatSizeKb(row.sizeKb)}</td>
                      <td>
                        <Badge tone={row.missing ? 'bad' : 'ok'}>
                          {row.missing ? 'Missing' : 'Present'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onPageChange={setPage}
              label="CSV files"
            />
          </div>
        </>
      )}
    </>
  )
}

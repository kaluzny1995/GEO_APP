import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import DataQualityView from './DataQualityView.jsx'
import { clearIndexCache } from '../api/dataQuality.js'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    NavLink: ({ children, to, className, ...props }) => (
      <a
        href={typeof to === 'string' ? to : '#'}
        className={typeof className === 'function' ? className({ isActive: false }) : className}
        {...props}
      >
        {children}
      </a>
    ),
  }
})

const metricRows = (fileDate) => [
  { table_name: 'eonet_event', file_date: fileDate, metric: 'bad_row_pct', value: 8.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'dup_row_pct', value: 3.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'null_pct__category_id', value: 5.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'null_pct__event_name', value: 2.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'bad_pct__latitude_range', value: 1.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'bad_pct__longitude_range', value: 2.0, computed_at: '2026-10-04T01:14:08.910374' },
  { table_name: 'eonet_event', file_date: fileDate, metric: 'total_records', value: 1000, computed_at: '2026-10-04T01:14:08.910374' },
]

const respondWith = (rows) => ({ ok: true, json: async () => rows })

const defaultFetchImpl = async (url) => {
  const target = String(url)
  if (target.includes('/file-dates')) {
    return respondWith([...metricRows('2024-10-15'), ...metricRows('overall')])
  }
  return respondWith(metricRows('2024-10-15'))
}

const mockFetch = vi.fn()

describe('DataQualityView', () => {
  beforeEach(() => {
    clearIndexCache()
    mockFetch.mockReset()
    mockFetch.mockImplementation(defaultFetchImpl)
    globalThis.fetch = mockFetch
  })

  const selects = () => screen.getAllByRole('combobox')
  const selectTable = (value) => fireEvent.change(selects()[0], { target: { value } })
  const selectDate = (value) => fireEvent.change(selects()[1], { target: { value } })

  const renderLoaded = async () => {
    render(<DataQualityView />)
    return screen.findByText('Quality gauges')
  }

  it('loads the default table and overall snapshot on mount', async () => {
    render(<DataQualityView />)
    expect(await screen.findByText('Quality gauges')).toBeInTheDocument()
    expect(selects()[0]).toHaveValue('avalanche_org')
    expect(selects()[1]).toHaveValue('overall')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/data-quality/avalanche_org/overall'),
      expect.anything()
    )
  })

  it('loads metrics when the table dropdown changes', async () => {
    render(<DataQualityView />)
    await screen.findByText('Quality gauges')
    selectTable('eonet_event')
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/data-quality/eonet_event/overall'),
      expect.anything()
    ))
  })

  it('renders the title, dataset name and date', async () => {
    await renderLoaded()
    expect(screen.getByText('Data Quality Metrics')).toBeInTheDocument()
    expect(screen.getByText(/avalanche_org · overall/)).toBeInTheDocument()
    expect(screen.getAllByText('avalanche_org').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2024-10-15').length).toBeGreaterThan(0)
  })

  it('renders back to overview link', async () => {
    await renderLoaded()
    expect(screen.getByText('← Back to Overview')).toBeInTheDocument()
  })

  it('renders dataset selector with all 19 tables', async () => {
    await renderLoaded()
    expect(selects()).toHaveLength(2)
    const tableSelect = selects()[0]
    expect(within(tableSelect).getAllByRole('option')).toHaveLength(19)
    const names = within(tableSelect).getAllByRole('option').map((o) => o.value)
    expect(names).toEqual([...names].sort())
    expect(names[0]).toBe('avalanche_org')
    expect(within(tableSelect).getByRole('option', { name: 'nifc_fire' })).toBeInTheDocument()
    expect(within(tableSelect).getByRole('option', { name: 'avalanche_org_etl' })).toBeInTheDocument()
    expect(within(tableSelect).getByRole('option', { name: 'union_etl' })).toBeInTheDocument()
  })

  it('renders date selector with available snapshots', async () => {
    await renderLoaded()
    const dateSelect = selects()[1]
    const values = within(dateSelect).getAllByRole('option').map((o) => o.value)
    expect(values).toEqual(['2024-10-15', 'overall'])
  })

  it('displays quality gauges computed from long-format metrics', async () => {
    await renderLoaded()
    for (const label of ['Completeness', 'Validity', 'Uniqueness', 'Consistency']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('97%')).toBeInTheDocument()
    expect(screen.getByText('96.5%')).toBeInTheDocument()
    expect(screen.getByText('98.5%')).toBeInTheDocument()
  })

  it('places the rule table before the gauges in the layout', async () => {
    await renderLoaded()
    const table = screen.getByText('Data-quality table')
    const gauges = screen.getByText('Quality gauges')
    expect(table.compareDocumentPosition(gauges) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('explains each quality gauge with a description', async () => {
    await renderLoaded()
    expect(screen.getByText('avg % of non-NULL values across fields')).toBeInTheDocument()
    expect(screen.getByText('% of rows passing all rules')).toBeInTheDocument()
    expect(screen.getByText('% of unique (non-duplicate) rows')).toBeInTheDocument()
    expect(screen.getByText('avg % of domain/range rules passing')).toBeInTheDocument()
  })

  it('shows +/- change vs the previous snapshot for dated snapshots', async () => {
    const rowsWithBadRow = (fileDate, badRowPct) =>
      metricRows(fileDate).map((r) => (r.metric === 'bad_row_pct' ? { ...r, value: badRowPct } : r))
    mockFetch.mockImplementation(async (url) => {
      const target = String(url)
      if (target.includes('/file-dates')) {
        return respondWith([
          ...rowsWithBadRow('2024-10-14', 10),
          ...rowsWithBadRow('2024-10-15', 8),
          ...rowsWithBadRow('overall', 8),
        ])
      }
      return respondWith(rowsWithBadRow(target.slice(target.lastIndexOf('/') + 1), 8))
    })
    await renderLoaded()
    selectDate('2024-10-15')
    expect(await screen.findByText('(+2)')).toHaveClass('change-ok')
    expect(screen.getAllByText('(0)')).toHaveLength(5)
    expect(screen.getAllByText('(0)').every((el) => el.classList.contains('change-warn'))).toBe(true)
    expect(screen.getAllByTitle('vs previous snapshot (2024-10-14)')).toHaveLength(4)

    const rowsCard = screen.getByText('Rows scanned').closest('.card')
    expect(within(rowsCard).getByText('7 metrics')).toBeInTheDocument()
    expect(within(rowsCard).getByText('(0)')).toHaveClass('change-warn')

    const rulesCard = screen.getByText('Rules evaluated').closest('.card')
    expect(within(rulesCard).getByText('0 pass')).toBeInTheDocument()

    const failCard = screen.getByText('Fail rate').closest('.card')
    expect(within(failCard).getByText('bad rows')).toBeInTheDocument()
    expect(within(failCard).getByText('(-2.0)')).toHaveClass('change-ok')
  })

  it('does not show change badges for the overall snapshot', async () => {
    await renderLoaded()
    expect(screen.getAllByText('Good')).toHaveLength(4)
    expect(screen.queryByText(/\(\+/)).not.toBeInTheDocument()

    const rowsCard = screen.getByText('Rows scanned').closest('.card')
    expect(within(rowsCard).getByText('7 metrics')).toBeInTheDocument()

    const rulesCard = screen.getByText('Rules evaluated').closest('.card')
    expect(within(rulesCard).getByText('0 pass')).toBeInTheDocument()

    const failCard = screen.getByText('Fail rate').closest('.card')
    expect(within(failCard).getByText('bad rows')).toBeInTheDocument()
  })

  it('shows No data for dimensions with no underlying metrics', async () => {
    mockFetch.mockImplementation(async () => {
      const rows = metricRows('2024-10-15').filter((r) => !r.metric.startsWith('bad_pct__'))
      return respondWith(rows)
    })
    await renderLoaded()
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('renders KPI cards with real values', async () => {
    await renderLoaded()
    const rowsCard = screen.getByText('Rows scanned').closest('.card')
    expect(within(rowsCard).getByText('1,000')).toBeInTheDocument()

    const rulesCard = screen.getByText('Rules evaluated').closest('.card')
    expect(within(rulesCard).getByText('6')).toBeInTheDocument()
    expect(within(rulesCard).getByText('0 pass')).toBeInTheDocument()

    const failCard = screen.getByText('Fail rate').closest('.card')
    expect(within(failCard).getByText('8.0%')).toBeInTheDocument()

    const datasetsCard = screen.getByText('Datasets').closest('.card')
    expect(within(datasetsCard).getByText('19')).toBeInTheDocument()
  })

  it('renders Quality trend chart from the fetched snapshot', async () => {
    await renderLoaded()
    expect(screen.getByText('Quality trend')).toBeInTheDocument()
    const lineData = JSON.parse(screen.getByTestId('line-chart').getAttribute('data-data'))
    expect(lineData.labels).toEqual(['2024-10-15'])
    expect(lineData.datasets[0].data).toEqual([96])
  })

  it('plots the trend across all available snapshot dates', async () => {
    const rowsWithBadRow = (fileDate, badRowPct) =>
      metricRows(fileDate).map((r) => (r.metric === 'bad_row_pct' ? { ...r, value: badRowPct } : r))
    mockFetch.mockImplementation(async (url) => {
      const target = String(url)
      if (target.includes('/file-dates')) {
        return respondWith([
          ...rowsWithBadRow('2026-09-01', 0),
          ...rowsWithBadRow('2026-09-02', 10),
          ...rowsWithBadRow('overall', 8),
        ])
      }
      return respondWith(rowsWithBadRow('2026-09-02', 10))
    })
    await renderLoaded()
    const lineData = JSON.parse(screen.getByTestId('line-chart').getAttribute('data-data'))
    expect(lineData.labels).toEqual(['2026-09-01', '2026-09-02'])
    expect(lineData.datasets[0].data).toEqual([98, 95.5])
  })

  it('renders Radar chart with the four quality dimensions', async () => {
    await renderLoaded()
    expect(screen.getByText('Radar: Quality dimensions')).toBeInTheDocument()
    const radarData = JSON.parse(screen.getByTestId('radar-chart').getAttribute('data-data'))
    expect(radarData.labels).toEqual(['Completeness', 'Validity', 'Uniqueness', 'Consistency'])
    expect(radarData.datasets[0].data).toEqual([96.5, 92, 97, 98.5])
  })

  it('renders Rule pass % chart', async () => {
    await renderLoaded()
    expect(screen.getByText('Rule pass %')).toBeInTheDocument()
    const barData = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-data'))
    expect(barData.labels).toEqual(['R-101', 'R-102', 'R-200', 'R-201', 'R-300', 'R-301'])
    expect(barData.datasets[0].data).toEqual([92, 97, 95, 98, 99, 98])

    const barOptions = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-options'))
    expect(barOptions.scales.y.min).toBe(90)
    expect(barOptions.scales.y.max).toBe(100)
  })

  it('renders Rule status chart', async () => {
    await renderLoaded()
    expect(screen.getByText('Rule status')).toBeInTheDocument()
    const doughnutData = JSON.parse(screen.getByTestId('doughnut-chart').getAttribute('data-data'))
    expect(doughnutData.datasets[0].data).toEqual([0, 6, 0])
  })

  it('renders Data quality table with rule-level checks', async () => {
    await renderLoaded()
    expect(screen.getByText('Data-quality table')).toBeInTheDocument()
    expect(screen.getByText('R-101')).toBeInTheDocument()
    expect(screen.getByText('Row validity (bad_row_pct)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Filter rules/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Download Data-quality table' })
    ).toBeInTheDocument()
  })

  it('shows the overall score and health badge', async () => {
    await renderLoaded()
    expect(screen.getByText('96%')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('shows an error card when the API request fails', async () => {
    mockFetch.mockImplementation(async () => {
      throw new Error('Network down')
    })
    render(<DataQualityView />)
    expect(await screen.findByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Network down')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('shows a red API-down alert when the API is unreachable', async () => {
    mockFetch.mockImplementation(async () => {
      throw new TypeError('Failed to fetch')
    })
    render(<DataQualityView />)
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('API server is down! Please check the API server.')).toBeInTheDocument()
    expect(within(alert).getByText('Retry')).toBeInTheDocument()
    expect(screen.queryByText('Quality gauges')).not.toBeInTheDocument()
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })

  it('shows a message when no snapshots are available', async () => {
    mockFetch.mockImplementation(async () => respondWith([]))
    render(<DataQualityView />)
    expect(await screen.findByText('No data-quality snapshots available for this table.')).toBeInTheDocument()
  })

  it('discovers all snapshot dates for the table', async () => {
    mockFetch.mockImplementation(async (url) => {
      const target = String(url)
      if (target.includes('/file-dates')) {
        return respondWith([
          ...metricRows('2026-09-01'),
          ...metricRows('2026-09-02'),
          ...metricRows('2026-09-03'),
          ...metricRows('overall'),
        ])
      }
      return respondWith(metricRows('overall'))
    })
    await renderLoaded()
    const values = within(selects()[1]).getAllByRole('option').map((o) => o.value)
    expect(values).toEqual(['2026-09-01', '2026-09-02', '2026-09-03', 'overall'])
  })

  it('fetches the selected snapshot via the per-date endpoint', async () => {
    mockFetch.mockImplementation(async (url) => {
      const target = String(url)
      if (target.includes('/file-dates')) {
        return respondWith([...metricRows('2026-10-09'), ...metricRows('overall')])
      }
      return respondWith(metricRows(target.slice(target.lastIndexOf('/') + 1)))
    })
    await renderLoaded()
    selectDate('2026-10-09')
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/data-quality/avalanche_org/2026-10-09'),
      expect.anything()
    ))
  })

  it('caches the discovered date list per table (no extra probe on re-render)', async () => {
    const probeCalls = () => mockFetch.mock.calls.filter(([u]) => String(u).includes('/file-dates')).length
    const { unmount } = render(<DataQualityView />)
    await screen.findByText('Quality gauges')
    // The probe is split into batches (GEO_API caps /file-dates at 100 dates),
    // so a single discovery is more than one request — but a fixed number.
    const firstProbeCount = probeCalls()
    expect(firstProbeCount).toBeGreaterThan(0)
    unmount()
    render(<DataQualityView />)
    await screen.findByText('Quality gauges')
    expect(probeCalls()).toBe(firstProbeCount)
  })
})

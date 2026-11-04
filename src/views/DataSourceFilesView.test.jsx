import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DataSourceFilesView from './DataSourceFilesView.jsx'
import { fetchDataSourceFiles } from '../api/dataSourceFiles.js'
import { downloadTable } from '../utils/tableExport.js'
import { ROUTER_FUTURE_FLAGS } from '../config.js'

vi.mock('../api/dataSourceFiles.js', () => ({
  fetchDataSourceFiles: vi.fn(),
}))

vi.mock('../utils/tableExport.js', () => ({
  downloadTable: vi.fn(),
}))

const API_DATA = {
  sources: ['EONET', 'NIFC'],
  startDate: '2026-09-01',
  latestDate: '2026-09-03',
  files: [
    {
      sourceName: 'EONET',
      fileName: 'eonet_events_2026-09-01.csv',
      snapshotDate: '2026-09-01',
      createdAt: '2026-10-04T00:14:50Z',
      records: 10,
      sizeKb: 1,
    },
    {
      sourceName: 'EONET',
      fileName: 'eonet_events_2026-09-03.csv',
      snapshotDate: '2026-09-03',
      createdAt: '2026-10-04T00:15:50Z',
      records: 5,
      sizeKb: 1,
    },
    {
      sourceName: 'NIFC',
      fileName: 'nifc_fires_2026-09-02.csv',
      snapshotDate: '2026-09-02',
      createdAt: '2026-10-04T00:16:50Z',
      records: 7,
      sizeKb: 2,
    },
  ],
}

const MANY_FILES = Array.from({ length: 12 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0')
  return {
    sourceName: 'EONET',
    fileName: `eonet_events_2026-09-${day}.csv`,
    snapshotDate: `2026-09-${day}`,
    createdAt: '2026-10-04T00:14:50Z',
    records: index + 1,
    sizeKb: index + 0.5,
  }
})

const MANY_FILES_DATA = {
  sources: ['EONET'],
  startDate: '2026-09-01',
  latestDate: '2026-09-12',
  files: MANY_FILES,
}

const renderView = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <DataSourceFilesView />
    </MemoryRouter>
  )

const bodyRows = () => screen.getAllByRole('row').slice(1)

const fileNames = () =>
  bodyRows().map((row) => within(row).getAllByRole('cell')[1].textContent)

describe('DataSourceFilesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchDataSourceFiles.mockResolvedValue({ ...API_DATA })
  })

  it('lists sources and renders files with a red row for a missing date', async () => {
    renderView()

    expect(await screen.findByText('eonet_events_2026-09-01.csv')).toBeInTheDocument()
    const select = screen.getByLabelText('Data source')
    expect(select).toHaveValue('EONET')
    expect([...select.options].map((option) => option.value)).toEqual(['EONET', 'NIFC'])

    expect(screen.getByText(/2 files · 1 missing date · 15 records · 2\.0 kB/)).toBeInTheDocument()
    expect(screen.getByText('Missing')).toBeInTheDocument()
    expect(screen.getByText('No file').closest('tr')).toHaveClass('row-missing')
    expect(bodyRows()).toHaveLength(3)
  })

  it('reloads the list from the already-fetched files when the source changes', async () => {
    renderView()
    const select = screen.getByLabelText('Data source')
    await waitFor(() => expect(select).toHaveValue('EONET'))

    fireEvent.change(select, { target: { value: 'NIFC' } })

    expect(await screen.findByText('nifc_fires_2026-09-02.csv')).toBeInTheDocument()
    expect(screen.getAllByText('Missing')).toHaveLength(2)
    expect(fetchDataSourceFiles).toHaveBeenCalledTimes(1)
  })

  it('sorts by file name ascending and descending', async () => {
    renderView()
    await screen.findByText('eonet_events_2026-09-01.csv')

    fireEvent.click(screen.getByRole('button', { name: /File name/ }))
    expect(fileNames()).toEqual([
      'eonet_events_2026-09-01.csv',
      'eonet_events_2026-09-03.csv',
      'No file',
    ])

    fireEvent.click(screen.getByRole('button', { name: /File name/ }))
    expect(fileNames()).toEqual([
      'eonet_events_2026-09-03.csv',
      'eonet_events_2026-09-01.csv',
      'No file',
    ])
  })

  it('plots records and file sizes with missing dates marked', async () => {
    renderView()
    await screen.findByText('eonet_events_2026-09-01.csv')

    const chart = screen.getByTestId('line-chart')
    const data = JSON.parse(chart.dataset.data)

    expect(data.labels).toEqual(['2026-09-01', '2026-09-02', '2026-09-03'])
    expect(data.datasets[0].data).toEqual([10, null, 5])
    expect(data.datasets[1].data).toEqual([1, null, 1])
    expect(data.datasets[2].data).toEqual([null, 0, null])
  })

  it('paginates the table and downloads every row, not just the current page', async () => {
    fetchDataSourceFiles.mockResolvedValue(MANY_FILES_DATA)
    renderView()
    await screen.findByText('eonet_events_2026-09-12.csv')

    expect(screen.getByText('Showing 1–10 of 12 CSV files')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(10)

    fireEvent.click(screen.getByRole('button', { name: 'Next page of CSV files' }))
    expect(screen.getByText('Showing 11–12 of 12 CSV files')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(2)

    fireEvent.mouseOver(screen.getByRole('button', { name: /Download Data source files/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: '.csv' }))

    expect(downloadTable).toHaveBeenCalledTimes(1)
    const [table, format] = downloadTable.mock.calls[0]
    expect(format).toBe('csv')
    expect(table.columns).toEqual([
      'Source',
      'Date',
      'File name',
      'Created',
      'Records',
      'Size (kB)',
      'Status',
    ])
    expect(table.rows).toHaveLength(12)
    expect(table.rows[0]).toEqual([
      'EONET',
      '2026-09-12',
      'eonet_events_2026-09-12.csv',
      '2026-10-04T00:14:50Z',
      12,
      11.5,
      'Present',
    ])
  })

  it('returns to the first page when the sort changes', async () => {
    fetchDataSourceFiles.mockResolvedValue(MANY_FILES_DATA)
    renderView()
    await screen.findByText('eonet_events_2026-09-12.csv')

    fireEvent.click(screen.getByRole('button', { name: 'Next page of CSV files' }))
    expect(screen.getByText('Showing 11–12 of 12 CSV files')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /File name/ }))

    expect(screen.getByText('Showing 1–10 of 12 CSV files')).toBeInTheDocument()
  })

  it('shows the API-down alert and retries the request', async () => {
    const error = new Error('API server is down! Please check the API server.')
    error.isConnectionError = true
    fetchDataSourceFiles.mockRejectedValueOnce(error).mockResolvedValueOnce({ ...API_DATA })

    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent(error.message)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('eonet_events_2026-09-01.csv')).toBeInTheDocument()
    expect(fetchDataSourceFiles).toHaveBeenCalledTimes(2)
  })

  it('shows an empty state when no source folders contain CSV files', async () => {
    fetchDataSourceFiles.mockResolvedValue({
      sources: [],
      files: [],
      startDate: null,
      latestDate: null,
    })

    renderView()

    expect(await screen.findByText('No CSV files found')).toBeInTheDocument()
  })
})

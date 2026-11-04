import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DataSourceFilesView from './DataSourceFilesView.jsx'
import { fetchDataSourceFiles } from '../api/dataSourceFiles.js'
import { ROUTER_FUTURE_FLAGS } from '../config.js'

vi.mock('../api/dataSourceFiles.js', () => ({
  fetchDataSourceFiles: vi.fn(),
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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DataQuantityView from './DataQuantityView.jsx'
import { fetchDataQuantityDates, fetchDataQuantities } from '../api/dataQuantity.js'
import { ROUTER_FUTURE_FLAGS, TABLE_NAMES } from '../config.js'

vi.mock('../api/dataQuantity.js', () => ({
  fetchDataQuantityDates: vi.fn(),
  fetchDataQuantities: vi.fn(),
}))

const countsFor = () => Object.fromEntries(TABLE_NAMES.map((table) => [table, 100]))

const renderView = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <DataQuantityView />
    </MemoryRouter>
  )

describe('DataQuantityView', () => {
  let counts

  beforeEach(() => {
    vi.clearAllMocks()
    counts = countsFor()
    counts.avalanche_org = 168
    counts.avalanche_org_etl = 84
    counts.eonet_event = 145
    counts.eonet_event_etl = 217
    counts.union_etl = 796

    fetchDataQuantityDates.mockResolvedValue(['2026-10-08', 'overall', '2026-10-09'])
    fetchDataQuantities.mockImplementation(async () => ({ ...counts }))
  })

  it('defaults to the latest dated snapshot and fetches all table counts', async () => {
    renderView()

    expect(await screen.findByText('Snapshot 2026-10-09')).toBeInTheDocument()
    expect(screen.getByLabelText('Snapshot date')).toHaveValue('2026-10-09')
    expect(fetchDataQuantityDates).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(fetchDataQuantities).toHaveBeenCalledWith('2026-10-09')
    )
    expect(
      screen.getByText(/Showing row quantities for the 2026-10-09 snapshot across 19 tables\./)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Counts are read directly from each database table/)
    ).toBeInTheDocument()
  })

  it('lists the available dates in sorted order and reloads on selection', async () => {
    renderView()
    const select = screen.getByLabelText('Snapshot date')
    await waitFor(() => expect(select).toHaveValue('2026-10-09'))

    expect([...select.options].map((option) => option.value)).toEqual([
      '2026-10-08',
      '2026-10-09',
      'overall',
    ])

    fireEvent.change(select, { target: { value: 'overall' } })
    await waitFor(() =>
      expect(fetchDataQuantities).toHaveBeenCalledWith('overall')
    )
    expect(await screen.findByText('Snapshot overall')).toBeInTheDocument()
    expect(
      screen.getByText(/Showing row quantities for the overall snapshot across 19 tables\./)
    ).toBeInTheDocument()
  })

  it('renders filtered-out, added and union row labels', async () => {
    renderView()

    expect(await screen.findByText('84 filtered out')).toBeInTheDocument()
    expect(screen.getByText('72 more in ETL')).toBeInTheDocument()
    expect(screen.getByText('union_etl')).toBeInTheDocument()
    expect(screen.getByText('796')).toBeInTheDocument()
    expect(screen.getByText(/every ETL table feeds the union table/i)).toBeInTheDocument()
  })

  it('shows an error and retries the request', async () => {
    fetchDataQuantityDates.mockRejectedValueOnce(new Error('Network down'))
    renderView()

    expect(await screen.findByText('Network down')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Retry'))
    expect(await screen.findByText('Snapshot 2026-10-09')).toBeInTheDocument()
    expect(fetchDataQuantityDates).toHaveBeenCalledTimes(2)
  })

  it('shows an API-down alert when the API is unreachable', async () => {
    const err = Object.assign(new Error('API server is down! Please check the API server.'), {
      isConnectionError: true,
    })
    fetchDataQuantityDates.mockRejectedValueOnce(err)
    renderView()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('API server is down! Please check the API server.')
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('shows a message when no snapshots are available', async () => {
    fetchDataQuantityDates.mockResolvedValueOnce([])
    renderView()

    expect(await screen.findByText(/no data-quantity snapshots available for union_etl/i))
      .toBeInTheDocument()
  })
})

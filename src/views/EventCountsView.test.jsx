import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EventCategoriesView, EventLocationsView } from './EventCountsView.jsx'
import { fetchEventCountsByCategory, fetchEventCountsByLocation } from '../api/eventCounts.js'
import { ROUTER_FUTURE_FLAGS } from '../config.js'
import { downloadTable } from '../utils/tableExport.js'

vi.mock('../api/eventCounts.js', () => ({
  fetchEventCountsByCategory: vi.fn(),
  fetchEventCountsByLocation: vi.fn(),
}))

vi.mock('../utils/tableExport.js', async () => {
  const actual = await vi.importActual('../utils/tableExport.js')
  return { ...actual, downloadTable: vi.fn() }
})

const CATEGORY_ROWS = [
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'none', count: 50 },
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'high', count: 30 },
  { source_name: 'EONET', subsource_name: 'EO', event_category: 'storm', event_subcategory: 'hurricane', danger_rating: 'no_rating', count: 20 },
]

const LOCATION_ROWS = [
  { source_name: 'OPENMETEO', subsource_name: 'GLOFAS', country_code: 'PL', state_province: null, danger_rating: 'extreme', count: 4 },
  { source_name: 'GDACS', subsource_name: 'GWIS', country_code: 'US', state_province: 'CA', danger_rating: 'medium', count: 6 },
]

const renderView = (view) =>
  render(<MemoryRouter future={ROUTER_FUTURE_FLAGS}>{view}</MemoryRouter>)

describe('EventCountsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and summarizes event categories', async () => {
    fetchEventCountsByCategory.mockResolvedValue(CATEGORY_ROWS)
    renderView(<EventCategoriesView />)

    expect(await screen.findByRole('heading', { name: 'Event Categories' })).toBeInTheDocument()
    expect(screen.getByText(/counts events by category and subcategory for each source and subsource/i)).toBeInTheDocument()
    expect(screen.getByText(/totals are shown overall and for the four danger levels/i)).toBeInTheDocument()
    expect(fetchEventCountsByCategory).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Total events')).toBeInTheDocument()
    expect(screen.getByText('Total events').parentElement).toHaveTextContent('100')
    expect(screen.getByText('30.0% of all events')).toBeInTheDocument()
    expect(screen.getAllByText('GDACS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('fire').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Event category by source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download Event category by source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download Categories by source' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Source by region' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to overview/i })).toHaveClass('ms-auto')
    expect(screen.getByText(/outside the four danger levels/i)).toBeInTheDocument()
  })

  it('loads and summarizes event locations', async () => {
    fetchEventCountsByLocation.mockResolvedValue(LOCATION_ROWS)
    renderView(<EventLocationsView />)

    expect(await screen.findByRole('heading', { name: 'Event Locations' })).toBeInTheDocument()
    expect(screen.getByText(/counts events by country and state\/province for each source and subsource/i)).toBeInTheDocument()
    expect(screen.getByText(/totals are shown overall and for the four danger levels/i)).toBeInTheDocument()
    expect(fetchEventCountsByLocation).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('columnheader', { name: 'Country' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'State / province' })).toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
    expect(screen.getByText('CA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source by region' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download Source by region' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download Locations by source' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'All regions' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Waters/Oceans' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Event category by source' })).not.toBeInTheDocument()

    const transpose = screen.getByRole('button', { name: 'Transpose' })
    expect(transpose).toHaveAttribute('aria-pressed', 'false')
    expect(transpose.querySelector('svg')).toBeInTheDocument()

    fireEvent.click(transpose)
    expect(screen.getByRole('columnheader', { name: 'Region' })).toBeInTheDocument()
    expect(transpose).toHaveAttribute('aria-pressed', 'true')
  })

  it('transposes the category matrix and restores the original layout', async () => {
    fetchEventCountsByCategory.mockResolvedValue(CATEGORY_ROWS)
    renderView(<EventCategoriesView />)

    const heading = await screen.findByRole('heading', { name: 'Event category by source' })
    const matrixTable = () => heading.closest('.card').querySelector('.heatmap')
    expect(within(matrixTable()).getByRole('columnheader', { name: 'Event category' })).toBeInTheDocument()

    const transpose = screen.getByRole('button', { name: 'Transpose' })
    expect(transpose).toHaveAttribute('aria-pressed', 'false')
    fireEvent.mouseOver(transpose)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Transpose')
    fireEvent.mouseOut(transpose)

    fireEvent.click(transpose)

    expect(within(matrixTable()).getByRole('columnheader', { name: 'Source' })).toBeInTheDocument()
    expect(within(matrixTable()).getByRole('columnheader', { name: 'All categories' })).toBeInTheDocument()
    expect(within(matrixTable()).getByRole('rowheader', { name: 'EONET' })).toBeInTheDocument()
    expect(transpose).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(transpose)

    expect(within(matrixTable()).getByRole('columnheader', { name: 'Event category' })).toBeInTheDocument()
    expect(transpose).toHaveAttribute('aria-pressed', 'false')
  })

  it('downloads the matrix in its current transposition state', async () => {
    fetchEventCountsByCategory.mockResolvedValue(CATEGORY_ROWS)
    renderView(<EventCategoriesView />)

    const heading = await screen.findByRole('heading', { name: 'Event category by source' })
    const card = heading.closest('.card')
    fireEvent.click(within(card).getByRole('button', { name: 'Transpose' }))

    fireEvent.mouseOver(within(card).getByRole('button', { name: 'Download Event category by source' }))
    fireEvent.click(within(card).getByRole('menuitem', { name: '.csv' }))

    expect(downloadTable).toHaveBeenCalledTimes(1)
    const [table, format] = downloadTable.mock.calls[0]
    expect(format).toBe('csv')
    expect(table.filename).toBe('event-category-by-source-transposed')
    expect(table.columns[0]).toBe('Source')
    expect(table.columns).toContain('fire')
    expect(table.rows.find((row) => row[0] === 'GDACS')).toEqual(['GDACS', 80, 0, 80])
  })

  it('shows the API-down alert and retries the request', async () => {
    const down = Object.assign(new Error('API server is down! Please check the API server.'), {
      isConnectionError: true,
    })
    fetchEventCountsByCategory.mockRejectedValueOnce(down).mockResolvedValueOnce(CATEGORY_ROWS)
    renderView(<EventCategoriesView />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('API server is down! Please check the API server.')

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => expect(fetchEventCountsByCategory).toHaveBeenCalledTimes(2))
    expect((await screen.findAllByText('GDACS')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

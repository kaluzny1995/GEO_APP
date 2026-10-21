import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EventCategoriesView, EventLocationsView } from './EventCountsView.jsx'
import { fetchEventCountsByCategory, fetchEventCountsByLocation } from '../api/eventCounts.js'

vi.mock('../api/eventCounts.js', () => ({
  fetchEventCountsByCategory: vi.fn(),
  fetchEventCountsByLocation: vi.fn(),
}))

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
  render(<MemoryRouter>{view}</MemoryRouter>)

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
    expect(screen.getByRole('columnheader', { name: 'All regions' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Waters/Oceans' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Event category by source' })).not.toBeInTheDocument()
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

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import EventCategoryMatrix from './EventCategoryMatrix.jsx'

const ROWS = [
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'none', count: 30 },
  { source_name: 'GDACS', subsource_name: 'GWIS', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'high', count: 10 },
  { source_name: 'EONET', subsource_name: 'EO', event_category: 'fire', event_subcategory: 'wildfire', danger_rating: 'no_rating', count: 40 },
  { source_name: 'EONET', subsource_name: 'EO', event_category: 'storm', event_subcategory: 'hurricane', danger_rating: 'no_rating', count: 20 },
]

describe('EventCategoryMatrix', () => {
  it('renders the matrix with totals and heat-colored non-zero cells', () => {
    render(<EventCategoryMatrix rows={ROWS} />)

    expect(screen.getByRole('columnheader', { name: 'Event category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'GDACS' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'EONET' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'All sources' })).toBeInTheDocument()

    const fireCells = within(screen.getByRole('rowheader', { name: 'fire' }).closest('tr')).getAllByRole('cell')
    expect(fireCells[0]).toHaveTextContent('40 (40.0%)')
    expect(fireCells[0].style.color).toBe('rgb(225, 78, 202)')
    expect(fireCells[1]).toHaveTextContent('40 (40.0%)')
    expect(fireCells[2]).toHaveTextContent('80 (80.0%)')

    const stormCells = within(screen.getByRole('rowheader', { name: 'storm' }).closest('tr')).getAllByRole('cell')
    expect(stormCells[0]).toHaveTextContent('20 (20.0%)')
    expect(stormCells[1]).toHaveTextContent('—')
    expect(stormCells[1].style.color).toBe('')

    const totalCells = within(screen.getByRole('rowheader', { name: 'All categories' }).closest('tr')).getAllByRole('cell')
    expect(totalCells[0]).toHaveTextContent('60 (60.0%)')
    expect(totalCells[1]).toHaveTextContent('40 (40.0%)')
    expect(totalCells[2]).toHaveTextContent('100 (100.0%)')
  })

  it('swaps rows and columns when transposed', () => {
    render(<EventCategoryMatrix rows={ROWS} transposed />)

    expect(screen.getByRole('columnheader', { name: 'Source' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'fire' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'storm' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'All categories' })).toBeInTheDocument()

    const eonet = within(screen.getByRole('rowheader', { name: 'EONET' }).closest('tr')).getAllByRole('cell')
    expect(eonet[0]).toHaveTextContent('40 (40.0%)')
    expect(eonet[1]).toHaveTextContent('20 (20.0%)')
    expect(eonet[2]).toHaveTextContent('60 (60.0%)')

    const totals = within(screen.getByRole('rowheader', { name: 'All sources' }).closest('tr')).getAllByRole('cell')
    expect(totals[0]).toHaveTextContent('80 (80.0%)')
    expect(totals[1]).toHaveTextContent('20 (20.0%)')
    expect(totals[2]).toHaveTextContent('100 (100.0%)')
  })

  it('shows an empty message when there are no counts', () => {
    render(<EventCategoryMatrix rows={[]} />)
    expect(screen.getByText(/no events to summarize/i)).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import EventCountsTable from './EventCountsTable.jsx'

const rows = [
  {
    key: 'gdacs-gwis-fire-wildfire',
    source: 'GDACS',
    subsource: 'GWIS',
    primary: 'fire',
    secondary: 'wildfire',
    count: 90,
    share: 90,
    levels: { low: 10, medium: 0, high: 30, extreme: 0 },
    levelShares: { low: 11.111, medium: 0, high: 33.333, extreme: 0 },
  },
  {
    key: 'eonet—-storm-—',
    source: 'EONET',
    subsource: '—',
    primary: 'storm',
    secondary: '—',
    count: 10,
    share: 10,
    levels: { low: 0, medium: 0, high: 0, extreme: 0 },
    levelShares: { low: 0, medium: 0, high: 0, extreme: 0 },
  },
]

describe('EventCountsTable', () => {
  it('renders category rows with overall share and danger-level cells', () => {
    render(<EventCountsTable rows={rows} dimension="category" />)

    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Subcategory' })).toBeInTheDocument()
    expect(screen.getByText('GDACS')).toBeInTheDocument()
    expect(screen.getByText('GWIS')).toBeInTheDocument()
    expect(screen.getByText('fire')).toBeInTheDocument()
    expect(screen.getByText('wildfire')).toBeInTheDocument()
    expect(screen.getByText('90.0%')).toBeInTheDocument()
    expect(screen.getByText('(11.1%)')).toBeInTheDocument()
    expect(screen.getByText('(33.3%)')).toBeInTheDocument()
  })

  it('heat-colors non-zero count text and mutes zero counts', () => {
    render(<EventCountsTable rows={rows} dimension="category" />)

    const cells = within(screen.getByText('GWIS').closest('tr')).getAllByRole('cell')

    expect(cells[4].style.color).toBe('rgb(225, 78, 202)')
    expect(cells[5].style.color).toBe('')
    expect(cells[6].style.color).toBe('rgb(0, 242, 195)')
    expect(cells[7].style.color).toBe('var(--bd-muted)')
    expect(cells[8].style.color).toBe('rgb(255, 141, 114)')
  })

  it('renders location column labels', () => {
    render(<EventCountsTable rows={rows} dimension="location" />)
    expect(screen.getByRole('columnheader', { name: 'Country' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'State / province' })).toBeInTheDocument()
  })

  it('filters rows by the search query', () => {
    render(<EventCountsTable rows={rows} dimension="category" />)

    fireEvent.change(screen.getByPlaceholderText(/filter by source/i), { target: { value: 'storm' } })

    expect(screen.getByText('EONET')).toBeInTheDocument()
    expect(screen.queryByText('GDACS')).not.toBeInTheDocument()
  })

  it('shows an empty message when nothing matches', () => {
    render(<EventCountsTable rows={rows} dimension="category" />)

    fireEvent.change(screen.getByPlaceholderText(/filter by source/i), { target: { value: 'zzz' } })

    expect(screen.getByText(/no events match the current filter/i)).toBeInTheDocument()
  })

  it('sorts by source when the header is clicked', () => {
    render(<EventCountsTable rows={rows} dimension="category" />)

    fireEvent.click(screen.getByRole('button', { name: /^source/i }))

    const sourceCells = screen.getAllByRole('cell').filter((cell) => ['GDACS', 'EONET'].includes(cell.textContent))
    expect(sourceCells[0]).toHaveTextContent('EONET')
    expect(sourceCells[1]).toHaveTextContent('GDACS')
  })
})

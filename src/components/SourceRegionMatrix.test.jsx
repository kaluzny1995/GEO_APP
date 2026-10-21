import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SourceRegionMatrix from './SourceRegionMatrix.jsx'

const ROWS = [
  { source_name: 'USGS_EARTHQUAKE', country_code: 'US', count: 30 },
  { source_name: 'USGS_EARTHQUAKE', country_code: 'JP', count: 20 },
  { source_name: 'GDACS', country_code: 'ZZ', count: 10 },
  { source_name: 'OPENMETEO', country_code: 'PL', count: 5 },
]

describe('SourceRegionMatrix', () => {
  it('renders the source × region matrix with totals and heat-colored non-zero cells', () => {
    render(<SourceRegionMatrix rows={ROWS} />)

    expect(screen.getByRole('columnheader', { name: 'Source' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'USA' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Europe' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Waters/Oceans' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Antarctica' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'All regions' })).toBeInTheDocument()

    const gdacs = within(screen.getByRole('rowheader', { name: 'GDACS' }).closest('tr')).getAllByRole('cell')
    expect(gdacs[0]).toHaveTextContent('—')
    expect(gdacs[7]).toHaveTextContent('10 (15.4%)')
    expect(gdacs[7].style.color).not.toBe('')
    expect(gdacs[8]).toHaveTextContent('—')
    expect(gdacs[9]).toHaveTextContent('10 (15.4%)')

    const openmeteo = within(screen.getByRole('rowheader', { name: 'OPENMETEO' }).closest('tr')).getAllByRole('cell')
    expect(openmeteo[3]).toHaveTextContent('5 (7.7%)')

    const usgs = within(screen.getByRole('rowheader', { name: 'USGS_EARTHQUAKE' }).closest('tr')).getAllByRole('cell')
    expect(usgs[0]).toHaveTextContent('30 (46.2%)')
    expect(usgs[4]).toHaveTextContent('20 (30.8%)')

    const totals = within(screen.getByRole('rowheader', { name: 'All sources' }).closest('tr')).getAllByRole('cell')
    expect(totals[0]).toHaveTextContent('30 (46.2%)')
    expect(totals[7]).toHaveTextContent('10 (15.4%)')
    expect(totals[8]).toHaveTextContent('0 (0.0%)')
    expect(totals[9]).toHaveTextContent('65 (100.0%)')
  })

  it('groups unknown country codes under Other', () => {
    render(<SourceRegionMatrix rows={[{ source_name: 'GDACS', country_code: 'XX', count: 3 }]} />)

    expect(screen.getByRole('columnheader', { name: 'Other' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'GDACS' }).closest('tr')).toHaveTextContent('3 (100.0%)')
  })

  it('shows an empty message when there are no counts', () => {
    render(<SourceRegionMatrix rows={[]} />)
    expect(screen.getByText(/no events to summarize/i)).toBeInTheDocument()
  })
})

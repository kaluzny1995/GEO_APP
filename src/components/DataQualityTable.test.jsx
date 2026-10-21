import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataQualityTable from './DataQualityTable.jsx'
import { LOCALE } from '../config.js'

const mockRules = [
  { id: 'R-101', rule: 'latitude in [-90, 90]', scope: 'places', passRate: 99.2, fails: 412, status: 'pass' },
  { id: 'R-102', rule: 'longitude in [-180, 180]', scope: 'places', passRate: 99.6, fails: 208, status: 'pass' },
  { id: 'R-103', rule: 'name not null', scope: 'places', passRate: 92.4, fails: 3910, status: 'warn' },
  { id: 'R-104', rule: 'country_code ISO-3166', scope: 'places', passRate: 88.1, fails: 6120, status: 'warn' },
  { id: 'R-105', rule: 'no duplicate place_id', scope: 'places', passRate: 97.3, fails: 1390, status: 'pass' },
  { id: 'R-106', rule: 'admin hierarchy consistent', scope: 'places', passRate: 71.5, fails: 14680, status: 'fail' },
]

describe('DataQualityTable', () => {
  it('renders table with headers', () => {
    render(<DataQualityTable rows={mockRules} />)
    expect(screen.getByText('Rule ID')).toBeInTheDocument()
    expect(screen.getByText('Rule')).toBeInTheDocument()
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Pass %'))).toBeInTheDocument()
    expect(screen.getByText('Fails')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders all rows', () => {
    render(<DataQualityTable rows={mockRules} />)
    mockRules.forEach((r) => {
      expect(screen.getByText(r.id)).toBeInTheDocument()
      expect(screen.getByText(r.rule)).toBeInTheDocument()
      expect(screen.getByText(`${r.passRate.toFixed(1)}%`)).toBeInTheDocument()
      expect(screen.getByText(r.fails.toLocaleString(LOCALE))).toBeInTheDocument()
    })
    // Check status badges
    expect(screen.getAllByText('pass')).toHaveLength(3)
    expect(screen.getAllByText('warn')).toHaveLength(2)
    expect(screen.getAllByText('fail')).toHaveLength(1)
  })

  it('renders filter input', () => {
    render(<DataQualityTable rows={mockRules} />)
    expect(screen.getByPlaceholderText('Filter rules… (e.g. latitude, fail)')).toBeInTheDocument()
  })

  it('filters rows by query', () => {
    render(<DataQualityTable rows={mockRules} />)
    const input = screen.getByPlaceholderText('Filter rules… (e.g. latitude, fail)')
    fireEvent.change(input, { target: { value: 'latitude' } })
    expect(screen.getByText('R-101')).toBeInTheDocument()
    expect(screen.queryByText('R-102')).not.toBeInTheDocument()
  })

  it('sorts by passRate when clicking header', () => {
    render(<DataQualityTable rows={mockRules} />)
    const passRateHeader = screen.getByText((content) => content.includes('Pass %'))
    // Initial sort is ascending, click to toggle to descending
    fireEvent.click(passRateHeader)
    // First row should be highest passRate (R-102: 99.6%)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('R-102')
  })

  it('shows correct badge tones', () => {
    render(<DataQualityTable rows={mockRules} />)
    const passBadges = screen.getAllByText('pass')
    const warnBadges = screen.getAllByText('warn')
    const failBadges = screen.getAllByText('fail')
    expect(passBadges).toHaveLength(3)
    expect(warnBadges).toHaveLength(2)
    expect(failBadges).toHaveLength(1)
    passBadges.forEach((badge) => expect(badge).toHaveClass('badge-ok'))
    warnBadges.forEach((badge) => expect(badge).toHaveClass('badge-warn'))
    failBadges.forEach((badge) => expect(badge).toHaveClass('badge-bad'))
  })
})
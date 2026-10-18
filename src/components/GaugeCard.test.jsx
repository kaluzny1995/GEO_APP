import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GaugeCard from './GaugeCard.jsx'

// Mock toneFor / changeTone
vi.mock('../utils/quality.js', () => ({
  toneFor: (value) => (value >= 90 ? 'ok' : value >= 75 ? 'warn' : 'bad'),
  changeTone: (delta) => (delta > 0 ? 'ok' : delta < 0 ? 'bad' : 'warn'),
}))

describe('GaugeCard', () => {
  it('renders label and value', () => {
    render(<GaugeCard label="Completeness" value={92} />)
    expect(screen.getByText('Completeness')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('renders description and title tooltip when provided', () => {
    render(<GaugeCard label="Completeness" value={92} description="100 - avg % NULL values" />)
    expect(screen.getByText('100 - avg % NULL values')).toBeInTheDocument()
    expect(screen.getByText('Completeness')).toHaveAttribute('title', '100 - avg % NULL values')
  })

  it('renders the title above the gauge', () => {
    render(<GaugeCard label="Completeness" value={92} />)
    const title = screen.getByText('Completeness')
    const svg = document.querySelector('svg')
    expect(title.compareDocumentPosition(svg) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders gauge SVG', () => {
    render(<GaugeCard label="Test" value={85} />)
    // SVG doesn't have accessible role by default, check for element
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows Good badge for >= 90', () => {
    render(<GaugeCard label="Test" value={95} />)
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('shows Warning badge for 75-89', () => {
    render(<GaugeCard label="Test" value={80} />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('shows Critical badge for < 75', () => {
    render(<GaugeCard label="Test" value={70} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('shows the +/- change in the badge when delta is provided', () => {
    render(<GaugeCard label="Validity" value={92} delta={2} deltaTitle="vs previous snapshot (2024-10-14)" />)
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('(+2)')).toHaveClass('change-ok')
    expect(screen.getByTitle('vs previous snapshot (2024-10-14)')).toBeInTheDocument()
  })

  it('shows negative deltas in red with a minus sign', () => {
    render(<GaugeCard label="Validity" value={80} delta={-5} />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('(-5)')).toHaveClass('change-bad')
  })

  it('shows unchanged deltas in yellow', () => {
    render(<GaugeCard label="Validity" value={92} delta={0} />)
    expect(screen.getByText('(0)')).toHaveClass('change-warn')
  })

  it('does not show a delta when there is no data', () => {
    render(<GaugeCard label="Consistency" value={null} delta={3} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('shows No data instead of 0% when value is null', () => {
    render(<GaugeCard label="Consistency" value={null} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})
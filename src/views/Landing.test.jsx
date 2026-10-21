import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from './Landing.jsx'
import { ROUTER_FUTURE_FLAGS } from '../config.js'

const renderLanding = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <Landing />
    </MemoryRouter>
  )

describe('Landing', () => {
  it('renders title and description', () => {
    renderLanding()
    expect(screen.getByText('GEO_APP')).toBeInTheDocument()
    expect(screen.getByText('Geographic data quality & quantity overview')).toBeInTheDocument()
  })

  it('renders what is GEO_APP section', () => {
    renderLanding()
    expect(screen.getByText('What is GEO_APP for?')).toBeInTheDocument()
    expect(screen.getByText(/GEO_APP is a React front-end for exploring data quality and event quantity/i)).toBeInTheDocument()
  })

  it('renders dashboard buttons for quality, categories and locations', () => {
    renderLanding()
    const group = screen.getByRole('group', { name: /dashboards/i })
    const quality = within(group).getByRole('link', { name: 'Data Quality' })
    const categories = within(group).getByRole('link', { name: 'Event Categories' })
    const locations = within(group).getByRole('link', { name: 'Event Locations' })

    expect(quality).toHaveAttribute('href', '/data-quality')
    expect(categories).toHaveAttribute('href', '/event-categories')
    expect(locations).toHaveAttribute('href', '/event-locations')
  })

  it('lists the data quality rules and what they mean', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: 'Data quality rules' })).toBeInTheDocument()
    expect(screen.getByText('bad_row_pct')).toBeInTheDocument()
    expect(screen.getByText(/share of rows that violate any rule/i)).toBeInTheDocument()
    expect(screen.getByText('latitude_range')).toBeInTheDocument()
    expect(screen.getByText(/latitude must be within −90\.\.90/i)).toBeInTheDocument()
    expect(screen.getByText('danger_level_domain')).toBeInTheDocument()
    expect(screen.getByText(/1\.\.5, or −1 for “no rating”/i)).toBeInTheDocument()
    expect(screen.getByText(/under 1% passes/i)).toBeInTheDocument()
  })

  it('explains that defaults load automatically and dropdowns reload metrics', () => {
    renderLanding()
    expect(screen.getByText(/load automatically when the dashboard opens/i)).toBeInTheDocument()
    expect(screen.getByText(/changing either dropdown reloads the metrics/i)).toBeInTheDocument()
    expect(screen.getByText('/data-quality')).toBeInTheDocument()
  })

  it('renders instructions for the Data Quality dashboard', () => {
    renderLanding()
    expect(screen.getByText('How to read the Data Quality dashboard')).toBeInTheDocument()
    expect(screen.getByText(/pick a dataset table in the first dropdown/i)).toBeInTheDocument()
    expect(screen.getByText(/check the four quality gauges/i)).toBeInTheDocument()
    expect(screen.getByText(/read the scores/i)).toBeInTheDocument()
    expect(screen.getByText(/the trend line covers all available snapshot dates/i)).toBeInTheDocument()
    expect(screen.getByText(/change vs the previous snapshot in parentheses/i)).toBeInTheDocument()
  })

  it('describes the event count tabs', () => {
    renderLanding()
    const card = screen.getByRole('heading', { name: 'Event counts' }).closest('.card')
    expect(card).toHaveTextContent('Event Categories tab groups union_etl events')
    expect(card).toHaveTextContent('four danger levels (low, medium, high, extreme)')
    expect(card).toHaveTextContent('source-by-region heatmap')
    expect(card).toHaveTextContent('Waters/Oceans and Antarctica')
    expect(card).toHaveTextContent(/transpose icon/i)
  })

  it('lists available datasets', () => {
    renderLanding()
    expect(screen.getByText(/19 tables are available through the API/i)).toBeInTheDocument()
    expect(screen.getByText(/union_etl/, { selector: 'li' })).toBeInTheDocument()
  })
})

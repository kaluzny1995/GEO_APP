import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from './Landing.jsx'

const renderLanding = () =>
  render(
    <MemoryRouter>
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
  })

  it('lists available datasets', () => {
    renderLanding()
    expect(screen.getByText(/19 tables are available through the API/i)).toBeInTheDocument()
    expect(screen.getByText(/union_etl/, { selector: 'li' })).toBeInTheDocument()
  })
})

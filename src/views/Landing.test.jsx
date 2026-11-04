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

  it('renders dashboard buttons for source files, quality, quantity, categories and locations', () => {
    renderLanding()
    const group = screen.getByRole('group', { name: /dashboards/i })
    const sourceFiles = within(group).getByRole('link', { name: 'Data Source Files' })
    const quality = within(group).getByRole('link', { name: 'Data Quality' })
    const quantity = within(group).getByRole('link', { name: 'Data Quantity' })
    const categories = within(group).getByRole('link', { name: 'Event Categories' })
    const locations = within(group).getByRole('link', { name: 'Event Locations' })

    expect(sourceFiles).toHaveAttribute('href', '/data-source-files')
    expect(quality).toHaveAttribute('href', '/data-quality')
    expect(quantity).toHaveAttribute('href', '/data-quantity')
    expect(categories).toHaveAttribute('href', '/event-categories')
    expect(locations).toHaveAttribute('href', '/event-locations')
    expect(group.firstElementChild).toBe(sourceFiles)
  })

  it('renders instructions for the Data Source Files dashboard', () => {
    renderLanding()
    const card = screen.getByRole('heading', { name: 'How to read the Data Source Files dashboard' }).closest('.card')

    expect(card).toHaveTextContent('/data-source-files')
    expect(card).toHaveTextContent(/one row per calendar date/i)
    expect(card).toHaveTextContent(/record counts on the left linear axis/i)
    expect(card).toHaveTextContent(/red bands and crosses mark the missing dates/i)
    expect(card).toHaveTextContent(/page through the table/i)
    expect(card).toHaveTextContent(/every row for the selected source/i)
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

  it('renders instructions for the Data Quantity dashboard', () => {
    renderLanding()
    expect(screen.getByText('How to read the Data Quantity dashboard')).toBeInTheDocument()
    expect(screen.getByText('/data-quantity')).toBeInTheDocument()
    expect(screen.getByText(/starts on the latest dated snapshot/i)).toBeInTheDocument()
    expect(screen.getByText(/shows how many rows were filtered out/i)).toBeInTheDocument()
    expect(screen.getByText(/every ETL table feeds the union card/i)).toBeInTheDocument()
  })

  it('renders instructions for the Event Categories dashboard', () => {
    renderLanding()
    const card = screen
      .getByRole('heading', { name: 'How to read the Event Categories dashboard' })
      .closest('.card')

    expect(card).toHaveTextContent('/event-categories')
    expect(card).toHaveTextContent(/groups union_etl events by category\/subcategory/i)
    expect(card).toHaveTextContent(/four danger levels \(low, medium, high, extreme\)/i)
    expect(card).toHaveTextContent(/category-by-source heatmap/i)
    expect(card).toHaveTextContent(/transpose icon/i)
  })

  it('renders instructions for the Event Locations dashboard', () => {
    renderLanding()
    const card = screen
      .getByRole('heading', { name: 'How to read the Event Locations dashboard' })
      .closest('.card')

    expect(card).toHaveTextContent('/event-locations')
    expect(card).toHaveTextContent(/groups union_etl events by country\/state\/province/i)
    expect(card).toHaveTextContent(/four danger levels \(low, medium, high, extreme\)/i)
    expect(card).toHaveTextContent(/source-by-region heatmap/i)
    expect(card).toHaveTextContent(/Waters\/Oceans and Antarctica/i)
    expect(card).toHaveTextContent(/transpose icon/i)
  })

  it('orders the view cards like the sidebar navigation', () => {
    renderLanding()
    const headings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

    expect(headings).toEqual([
      'What is GEO_APP for?',
      'How to read the Data Source Files dashboard',
      'How to read the Data Quality dashboard',
      'How to read the Data Quantity dashboard',
      'How to read the Event Categories dashboard',
      'How to read the Event Locations dashboard',
      'Data quality rules',
      'Available dataset tables',
    ])
  })

  it('lists available datasets', () => {
    renderLanding()
    expect(screen.getByText(/19 tables are available through the API/i)).toBeInTheDocument()
    expect(screen.getByText(/union_etl/, { selector: 'li' })).toBeInTheDocument()
  })
})

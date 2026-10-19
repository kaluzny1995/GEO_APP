import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('Geographic data-quality overview')).toBeInTheDocument()
  })

  it('renders what is GEO_APP section', () => {
    renderLanding()
    expect(screen.getByText('What is GEO_APP for?')).toBeInTheDocument()
    expect(screen.getByText(/GEO_APP is a React front-end for exploring the quality of geographic datasets/i)).toBeInTheDocument()
  })

  it('renders a link button to the Data Quality dashboard', () => {
    renderLanding()
    const link = screen.getByRole('link', { name: /open data quality dashboard/i })
    expect(link).toHaveAttribute('href', '/data-quality')
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

  it('lists available datasets', () => {
    renderLanding()
    expect(screen.getByText(/19 tables are available through the API/i)).toBeInTheDocument()
    expect(screen.getByText(/union_etl/)).toBeInTheDocument()
  })
})

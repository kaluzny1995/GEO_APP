import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'

vi.mock('./components/Sidebar.jsx', () => ({
  default: function Sidebar() {
    return (
      <aside className="sidebar">
        <div className="brand">GEO_APP</div>
        <nav className="nav">
          <a href="/admin/overview" className="nav-link">Overview</a>
          <a href="/admin/data-quality/avalanche_org/overall" className="nav-link">Data Quality</a>
        </nav>
      </aside>
    )
  },
}))

vi.mock('./components/TopNavbar.jsx', () => ({
  default: function TopNavbar({ title, subtitle }) {
    return (
      <div className="top-navbar">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    )
  },
}))

vi.mock('./components/Footer.jsx', () => ({
  default: function Footer() {
    return <footer className="footer">Footer</footer>
  },
}))

vi.mock('./views/Landing.jsx', () => ({
  default: function Landing() {
    return <div className="landing">Landing page</div>
  },
}))

vi.mock('./views/DataQualityView.jsx', () => ({
  default: function DataQualityView() {
    return <div className="data-quality-view">Data Quality View</div>
  },
}))

const renderWithRouter = (component) => {
  return render(<HashRouter>{component}</HashRouter>)
}

describe('App', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('renders sidebar, navbar, and content', () => {
    renderWithRouter(<App />)
    expect(screen.getByText('GEO_APP')).toBeInTheDocument()
    expect(screen.getByText('GEO_APP · Data Quality')).toBeInTheDocument()
    expect(
      screen.getByText('Monitor completeness, validity, uniqueness and consistency across 19 geographic dataset tables')
    ).toBeInTheDocument()
    expect(screen.getByText('Landing page')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('navigates to overview by default', () => {
    renderWithRouter(<App />)
    expect(screen.getByText('Landing page')).toBeInTheDocument()
  })

  it('navigates to data quality view when route matches', () => {
    window.location.hash = '#/admin/data-quality/avalanche_org/overall'
    renderWithRouter(<App />)
    expect(screen.getByText('Data Quality View')).toBeInTheDocument()
    expect(screen.queryByText('Landing page')).not.toBeInTheDocument()
  })

  it('redirects unknown routes to overview', () => {
    window.location.hash = '#/admin/unknown'
    renderWithRouter(<App />)
    expect(screen.getByText('Landing page')).toBeInTheDocument()
  })
})
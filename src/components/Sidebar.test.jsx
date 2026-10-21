import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

vi.mock('../routes.js', () => ({
  default: [
    { path: '/overview', name: 'Overview', layout: '' },
    { path: '/data-quality', name: 'Data Quality', layout: '' },
  ],
}))

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  it('renders brand logo and name', () => {
    renderSidebar()
    expect(screen.getByText('GEO_APP')).toBeInTheDocument()
    expect(screen.getByText('Data Quality & Quantity')).toBeInTheDocument()
    expect(screen.getAllByText('Data Quality')).toHaveLength(1)
  })

  it('renders Overview nav link', () => {
    renderSidebar()
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('renders Data Quality nav link pointing to /data-quality', () => {
    renderSidebar()
    const navLinks = screen.getAllByRole('link', { name: /Data Quality/i })
    expect(navLinks).toHaveLength(1)
    expect(navLinks[0]).toHaveAttribute('href', '/data-quality')
  })

  it('renders footer text', () => {
    renderSidebar()
    expect(screen.getByText((content) => content.includes('Black Dashboard UI'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('ported to Vite'))).toBeInTheDocument()
  })
})
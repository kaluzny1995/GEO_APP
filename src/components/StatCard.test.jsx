import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from './StatCard.jsx'

describe('StatCard', () => {
  it('renders label, value, and delta', () => {
    render(<StatCard label="Rows" value="2.4M" delta="+3.1%" up={true} />)
    expect(screen.getByText('Rows')).toBeInTheDocument()
    expect(screen.getByText('2.4M')).toBeInTheDocument()
    expect(screen.getByText('+3.1%')).toBeInTheDocument()
  })

  it('applies delta-up class when up is true', () => {
    render(<StatCard label="Test" value="100" delta="+5%" up={true} />)
    expect(screen.getByText('+5%')).toHaveClass('delta-up')
  })

  it('applies delta-down class when up is false', () => {
    render(<StatCard label="Test" value="100" delta="-5%" up={false} />)
    expect(screen.getByText('-5%')).toHaveClass('delta-down')
  })

  it('renders a colored change indicator when provided', () => {
    render(<StatCard label="Rows" value="12" delta="7 metrics" change=" (+7)" changeTone="ok" up={true} />)
    expect(screen.getByText('(+7)')).toHaveClass('change-ok')
  })
})
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge.jsx'

describe('Badge', () => {
  it('renders with default tone', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toHaveClass('badge-neutral')
  })

  it('renders with ok tone', () => {
    render(<Badge tone="ok">Good</Badge>)
    expect(screen.getByText('Good')).toHaveClass('badge-ok')
  })

  it('renders with warn tone', () => {
    render(<Badge tone="warn">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('badge-warn')
  })

  it('renders with bad tone', () => {
    render(<Badge tone="bad">Critical</Badge>)
    expect(screen.getByText('Critical')).toHaveClass('badge-bad')
  })

  it('renders children', () => {
    render(<Badge>Custom text</Badge>)
    expect(screen.getByText('Custom text')).toBeInTheDocument()
  })
})
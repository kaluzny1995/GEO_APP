import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Icon from './Icon.jsx'

describe('Icon', () => {
  it('renders the circular-arrows-couple icon as a decorative SVG', () => {
    const { container } = render(<Icon name="circular-arrows-couple" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '18')
    expect(svg).toHaveClass('icon')
  })

  it('accepts a custom size and class name', () => {
    const { container } = render(
      <Icon name="circular-arrows-couple" size={22} className="transpose-icon" />
    )
    expect(container.querySelector('svg')).toHaveAttribute('width', '22')
    expect(container.querySelector('svg')).toHaveClass('icon', 'transpose-icon')
  })

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<Icon name="missing" />)
    expect(container).toBeEmptyDOMElement()
  })
})

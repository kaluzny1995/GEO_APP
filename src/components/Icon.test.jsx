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

  it('renders download and file-format icons', () => {
    const { container, rerender } = render(<Icon name="download" />)
    expect(container.querySelector('svg')).toHaveClass('icon-download')

    for (const format of ['csv', 'json', 'sql', 'xml', 'txt']) {
      rerender(<Icon name={`file-${format}`} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass(`icon-file-${format}`)
      expect(svg.querySelector('text')).toHaveTextContent(format.toUpperCase())
    }

    rerender(<Icon name="http" />)
    expect(container.querySelector('svg')).toHaveClass('icon-http')
    rerender(<Icon name="terminal" />)
    expect(container.querySelector('svg')).toHaveClass('icon-terminal')
  })

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<Icon name="missing" />)
    expect(container).toBeEmptyDOMElement()
  })
})

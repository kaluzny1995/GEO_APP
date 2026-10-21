import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Tooltip from './Tooltip.jsx'

const renderTooltip = () =>
  render(
    <Tooltip label="Transpose">
      <button type="button">Toggle</button>
    </Tooltip>
  )

describe('Tooltip', () => {
  it('shows the label on hover and hides it when the pointer leaves', () => {
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Toggle' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.mouseOver(trigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Transpose')
    expect(trigger).toHaveAttribute('aria-describedby')

    fireEvent.mouseOut(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(trigger).not.toHaveAttribute('aria-describedby')
  })

  it('shows the label on focus and hides it on Escape', () => {
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Toggle' })

    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Transpose')

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})

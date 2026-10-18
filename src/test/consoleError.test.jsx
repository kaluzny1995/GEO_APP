import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import App from '../App.jsx'

describe('Console error detection', () => {
  let consoleErrorSpy
  let consoleWarnSpy
  let errors
  let warnings

  beforeEach(() => {
    errors = []
    warnings = []
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.join(' '))
    })
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
      warnings.push(args.join(' '))
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  const renderWithRouter = (component) => {
    return render(<HashRouter>{component}</HashRouter>)
  }

  it('should not log Chart.js registration errors when rendering DataQualityView', async () => {
    await act(async () => {
      renderWithRouter(<App />)
    })

    const chartErrors = errors.filter(e => 
      e.includes('not a registered scale') || 
      e.includes('not a registered element') ||
      e.includes('CategoryScale') ||
      e.includes('RadialLinearScale') ||
      e.includes('ArcElement')
    )
    expect(chartErrors).toHaveLength(0)
  })

  it('should not log Chart.js registration errors when rendering Dashboard', async () => {
    await act(async () => {
      renderWithRouter(<App />)
    })

    const chartErrors = errors.filter(e => 
      e.includes('not a registered scale') || 
      e.includes('not a registered element')
    )
    expect(chartErrors).toHaveLength(0)
  })

  it('should not log Chart.js registration errors when rendering ChartsView', async () => {
    await act(async () => {
      renderWithRouter(<App />)
    })

    const chartErrors = errors.filter(e => 
      e.includes('not a registered scale') || 
      e.includes('not a registered element')
    )
    expect(chartErrors).toHaveLength(0)
  })

  it('should not log canvas reuse errors', async () => {
    await act(async () => {
      renderWithRouter(<App />)
    })

    const canvasErrors = errors.filter(e => 
      e.includes('Canvas is already in use') || 
      e.includes('must be destroyed')
    )
    expect(canvasErrors).toHaveLength(0)
  })

  it('should not log any uncaught errors during initial render', async () => {
    await act(async () => {
      renderWithRouter(<App />)
    })

    // Filter out expected warnings (like React Router future flags)
    const unexpectedErrors = errors.filter(e => 
      !e.includes('React Router Future Flag') &&
      !e.includes('download the React DevTools') &&
      !e.includes('extension://') &&
      !e.includes('gpc.js')
    )
    expect(unexpectedErrors).toHaveLength(0)
  })
})

// Helper to check for console errors in any component test
export function expectNoConsoleErrors(consoleErrors, allowedPatterns = []) {
  const unexpectedErrors = consoleErrors.filter(e => 
    !allowedPatterns.some(pattern => pattern.test(e))
  )
  expect(unexpectedErrors).toHaveLength(0)
}
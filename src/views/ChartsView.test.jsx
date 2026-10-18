import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChartsView from './ChartsView.jsx'

const mockOnDatasetChange = vi.fn()

describe('ChartsView', () => {
  it('renders title and description', () => {
    render(<ChartsView datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Charts')).toBeInTheDocument()
    expect(screen.getByText('Trend · per-rule bars · status doughnut (Chart.js)')).toBeInTheDocument()
  })

  it('renders dataset selector', () => {
    render(<ChartsView datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('calls onDatasetChange when selecting different dataset', () => {
    render(<ChartsView datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'geo-rivers' } })
    expect(mockOnDatasetChange).toHaveBeenCalledWith('geo-rivers')
  })

  it('renders QualityCharts', () => {
    render(<ChartsView datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Quality trend')).toBeInTheDocument()
    expect(screen.getByText('Rule pass %')).toBeInTheDocument()
    expect(screen.getByText('Rule status')).toBeInTheDocument()
  })
})
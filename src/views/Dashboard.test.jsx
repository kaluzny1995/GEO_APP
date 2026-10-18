import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from './Dashboard.jsx'

const mockOnDatasetChange = vi.fn()

describe('Dashboard', () => {
  it('renders dataset name and overall score', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('GEO Places')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('overall'))).toBeInTheDocument()
  })

  it('renders dataset selector', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByText('GEO Places')).toBeInTheDocument()
    expect(screen.getByText('GEO Rivers (NWIS)')).toBeInTheDocument()
    expect(screen.getByText('GEO Volcanoes (GVP)')).toBeInTheDocument()
  })

  it('calls onDatasetChange when selecting different dataset', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'geo-rivers' } })
    expect(mockOnDatasetChange).toHaveBeenCalledWith('geo-rivers')
  })

  it('renders all 4 KPI cards', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Rows scanned')).toBeInTheDocument()
    expect(screen.getByText('Rules evaluated')).toBeInTheDocument()
    expect(screen.getByText('Fail rate')).toBeInTheDocument()
    expect(screen.getByText('Datasets')).toBeInTheDocument()
  })

  it('renders QualityCharts', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Quality trend')).toBeInTheDocument()
    expect(screen.getByText('Rule pass %')).toBeInTheDocument()
    expect(screen.getByText('Rule status')).toBeInTheDocument()
  })

  it('renders quality gauges', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Quality gauges')).toBeInTheDocument()
    expect(screen.getByText('Completeness')).toBeInTheDocument()
    expect(screen.getByText('Validity')).toBeInTheDocument()
    expect(screen.getByText('Uniqueness')).toBeInTheDocument()
    expect(screen.getByText('Consistency')).toBeInTheDocument()
  })

  it('renders data quality table', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    expect(screen.getByText('Data-quality table')).toBeInTheDocument()
    expect(screen.getByText('R-101')).toBeInTheDocument()
  })

  it('shows correct overall score badge', () => {
    render(<Dashboard datasetId="geo-places" onDatasetChange={mockOnDatasetChange} />)
    // geo-places: (92+88+97+81)/4 = 89.5 -> 90 -> Healthy
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })
})